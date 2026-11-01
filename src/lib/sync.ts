import { useSyncExternalStore } from 'react';
import { getSupabase } from './supabase';

/**
 * Durable write-through sync for Supabase.
 *
 * Every mutation used to be fire-and-forget (`.then(() => {})`) with the error
 * swallowed, so a failed write still showed a "saved!" toast and the data was
 * gone on reload. This module makes persistence explicit:
 *
 *  - writes are attempted immediately and reported as saving / idle / error
 *  - transient failures (offline, timeout, 5xx) are queued in localStorage and
 *    replayed automatically when the device comes back online or on next load
 *  - permanent failures (RLS denial, missing table, bad payload) are surfaced
 *    instead of retried forever, because retrying those can never succeed
 *  - a tiny external store lets the UI show the real state of the data
 */

export type SyncPhase = 'guest' | 'idle' | 'saving' | 'offline' | 'error';

export interface SyncSnapshot {
  phase: SyncPhase;
  /** Writes currently in flight. */
  pending: number;
  /** Writes parked for a retry. */
  queued: number;
  lastSavedAt: string | null;
  lastError: string | null;
}

export type SyncOp =
  | { op: 'upsert'; table: string; payload: Record<string, unknown>; onConflict?: string }
  | { op: 'insert'; table: string; payload: Record<string, unknown>; ignoreDuplicates?: boolean }
  | { op: 'update'; table: string; payload: Record<string, unknown>; eq: Record<string, string> }
  | { op: 'delete'; table: string; eq: Record<string, string> }
  | { op: 'rpc'; fn: string; args: Record<string, unknown> };

interface QueuedOp {
  key: string;
  userId: string;
  op: SyncOp;
  attempts: number;
  queuedAt: string;
}

/** Postgres/PostgREST codes that will never succeed on retry. */
const PERMANENT_CODES = new Set([
  '42501', // insufficient privilege (RLS denied)
  '42P01', // undefined table
  '42703', // undefined column
  '23514', // check constraint
  '23503', // foreign key violation
  '22P02', // invalid text representation
  'PGRST204', // column not found in schema cache
  'PGRST301', // JWT expired / invalid
]);

const QUEUE_KEY = 'hsc28_sync_queue';

function loadQueue(): QueuedOp[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

let queue: QueuedOp[] = typeof window === 'undefined' ? [] : loadQueue();
let currentUserId: string | null = null;
let pending = 0;
let lastSavedAt: string | null = null;
let lastError: string | null = null;
let flushing = false;

const listeners = new Set<() => void>();
let snapshot: SyncSnapshot = {
  phase: 'guest',
  pending: 0,
  queued: 0,
  lastSavedAt: null,
  lastError: null,
};

function computePhase(): SyncPhase {
  if (!currentUserId) return 'guest';
  if (pending > 0) return 'saving';
  if (lastError) return 'error';
  if (queue.some((q) => q.userId === currentUserId)) return 'offline';
  return 'idle';
}

function publish(): void {
  const next: SyncSnapshot = {
    phase: computePhase(),
    pending,
    queued: queue.filter((q) => q.userId === currentUserId).length,
    lastSavedAt,
    lastError,
  };
  const same =
    snapshot.phase === next.phase &&
    snapshot.pending === next.pending &&
    snapshot.queued === next.queued &&
    snapshot.lastSavedAt === next.lastSavedAt &&
    snapshot.lastError === next.lastError;
  if (same) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

function persistQueue(): void {
  try {
    if (queue.length === 0) localStorage.removeItem(QUEUE_KEY);
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    lastError = "Could not save the sync queue on this device.";
    publish();
  }
}

function errorInfo(error: unknown): { permanent: boolean; message: string } {
  const err = error as { code?: string; message?: string } | null;
  const message = err?.message || String(error || 'unknown error');
  const code = err?.code || '';
  // A collision is only harmless for inserts that explicitly ignore duplicates.
  if (code === '23505') return { permanent: true, message };
  return { permanent: PERMANENT_CODES.has(code), message };
}

async function runOp(op: SyncOp): Promise<{ ok: boolean; permanent: boolean; message: string }> {
  try {
    // Pulls the Supabase client in on first write; the import resolves from
    // cache on every later call.
    const supabase = await getSupabase();

    if (op.op === 'rpc') {
      const { error } = await supabase.rpc(op.fn, op.args);
      if (!error) return { ok: true, permanent: false, message: '' };
      const info = errorInfo(error);
      return { ok: false, ...info };
    }

    if (op.op === 'upsert') {
      const { error } = await supabase
        .from(op.table)
        .upsert(op.payload, op.onConflict ? { onConflict: op.onConflict } : undefined);
      if (!error) return { ok: true, permanent: false, message: '' };
      return { ok: false, ...errorInfo(error) };
    }

    if (op.op === 'insert') {
      const { error } = await supabase.from(op.table).insert(op.payload);
      if (!error) return { ok: true, permanent: false, message: '' };
      const info = errorInfo(error);
      if (op.ignoreDuplicates && (error as { code?: string }).code === '23505') {
        return { ok: true, permanent: false, message: '' };
      }
      return { ok: false, ...info };
    }

    if (op.op === 'update') {
      let q = supabase.from(op.table).update(op.payload);
      for (const [k, v] of Object.entries(op.eq)) q = q.eq(k, v);
      const { error } = await q;
      if (!error) return { ok: true, permanent: false, message: '' };
      return { ok: false, ...errorInfo(error) };
    }

    let d = supabase.from(op.table).delete();
    for (const [k, v] of Object.entries(op.eq)) d = d.eq(k, v);
    const { error } = await d;
    if (!error) return { ok: true, permanent: false, message: '' };
    return { ok: false, ...errorInfo(error) };
  } catch (e) {
    // Thrown errors are transport-level (offline, DNS, fetch abort): retry.
    return { ok: false, permanent: false, message: String((e as Error)?.message || e) };
  }
}

function enqueue(op: SyncOp, userId: string): void {
  queue.push({
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId,
    op,
    attempts: 0,
    queuedAt: new Date().toISOString(),
  });
  persistQueue();
}

/**
 * Writes a mutation to Supabase. Guest users (no `userId`) are local-only by
 * design, so this resolves immediately without touching the network.
 */
export async function syncWrite(op: SyncOp, userId: string | null): Promise<boolean> {
  if (!userId) return false;

  // Preserve ordering: an older queued or in-flight mutation must never be
  // replayed after a newer write to the same record.
  if (pending > 0 || flushing || queue.some((item) => item.userId === userId)) {
    enqueue(op, userId);
    publish();
    if (!pending && !flushing && userId === currentUserId) void flushSyncQueue();
    return false;
  }
  pending += 1;
  publish();

  const result = await runOp(op);
  pending -= 1;

  if (result.ok) {
    lastSavedAt = new Date().toISOString();
    publish();
    if (queue.some((item) => item.userId === userId) && currentUserId === userId) void flushSyncQueue();
    return true;
  }

  // Even permanent errors must not discard the student's work.
  if (result.permanent) lastError = result.message;
  enqueue(op, userId);
  publish();
  return false;
}

/** Replays queued writes for the active user, oldest first. */
export async function flushSyncQueue(): Promise<void> {
  if (flushing || pending > 0 || !currentUserId) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  flushing = true;
  let failed = false;
  try {
    const userId = currentUserId;
    const mine = queue.filter((q) => q.userId === userId);

    for (const item of mine) {
      const result = await runOp(item.op);
      if (result.ok) {
        queue = queue.filter((q) => q.key !== item.key);
        lastSavedAt = new Date().toISOString();
        lastError = null;
      } else if (result.permanent) {
        // Keep the failed operation until it can be fixed and retried.
        lastError = result.message;
        failed = true;
        persistQueue();
        publish();
        break;
      } else {
        item.attempts += 1;
        failed = true;
        persistQueue();
        // Still offline: stop here rather than burning the whole queue.
        break;
      }
      persistQueue();
      publish();
    }
  } finally {
    flushing = false;
    publish();
    if (!failed && currentUserId && queue.some((item) => item.userId === currentUserId)) void flushSyncQueue();
  }
}

/** Binds the queue to the signed-in user and flushes anything left over. */
export function setSyncUser(userId: string | null): void {
  const changed = currentUserId !== userId;
  currentUserId = userId;
  if (changed) {
    lastError = null;
    publish();
  }
  if (userId) void flushSyncQueue();
}

/** Drops queued writes for the current user (used on explicit sign-out). */
export function clearSyncQueueForCurrentUser(): void {
  if (!currentUserId) return;
  queue = queue.filter((q) => q.userId !== currentUserId);
  persistQueue();
  publish();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSyncStatus(): SyncSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot
  );
}

let networkHooked = false;
/** Retries on reconnect. Safe to call repeatedly. */
export function initSyncNetworkWatcher(): void {
  if (networkHooked || typeof window === 'undefined') return;
  networkHooked = true;
  window.addEventListener('online', () => {
    void flushSyncQueue();
  });
  window.setInterval(() => {
    if (navigator.onLine !== false && currentUserId) void flushSyncQueue();
  }, 30000);
}

/** Wait for outstanding writes and retry queued work before a sign-out. */
export async function ensureSyncSaved(): Promise<boolean> {
  const deadline = Date.now() + 15000;
  while ((pending > 0 || flushing) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (pending > 0 || flushing) return false;
  await Promise.race([flushSyncQueue(), new Promise<void>((resolve) => setTimeout(resolve, 15000))]);
  return !flushing && pending === 0 && !lastError && !queue.some((q) => q.userId === currentUserId);
}
