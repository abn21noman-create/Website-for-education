import { getSupabase } from './supabase';
import {
  clearSyncQueueForUser,
  pauseSyncUser,
  resumeSyncUser,
  syncWrite,
} from './sync';

/**
 * ক্লাউড ভল্ট (Cloud Vault) — Supabase-backed mirror of *every* local key.
 *
 * আগে মাত্র কয়েকটা টেবিল (প্রোফাইল, সিলেবাস, প্ল্যানার, হাব) ক্লাউডে যেত।
 * নতুন ফিচারগুলো (মাস্টার রুটিন, নিশ্চয়তা-ক্যালিব্রেশন, মক-প্ল্যান, ভুলের
 * খাতা, সাপ্তাহিক টার্গেট) শুধু `localStorage`-এ থাকত — ফোন বদলালে বা
 * ব্রাউজার ডেটা মুছলে সব হারিয়ে যেত।
 *
 * এই মডিউল `hsc28_*` দিয়ে শুরু হওয়া **প্রতিটি** কি-কে `public.hsc28_kv`
 * টেবিলে (user_id, key, value, updated_at) আপসert করে, এবং লগইন করার সময়
 * ফিরিয়ে আনে। ফলে এক ফোনে পড়ে অন্য ফোনে লগইন করলেই পুরো অগ্রগতি ফিরে আসে।
 *
 * নকশার সিদ্ধান্ত:
 *  - `Storage.prototype.setItem` একবার হুক করা হয়, তাই ৩৩টি কি-এর কোনোটাই
 *    আলাদা করে কোড বদলাতে হয় না — ভবিষ্যতের ফিচারও নিজে থেকেই সিঙ্ক হবে।
 *  - লেখা `sync.ts`-এর কিউয়ের ভেতর দিয়ে যায়, অর্থাৎ অফলাইন হলে জমা থাকে ও
 *    ইন্টারনেট ফিরলে নিজে থেকেই যায় (নেভবারে অবস্থা দেখা যায়)।
 *  - আকার ৪০০ কিলো-অক্ষরের বেশি হলে ছেড়ে দেওয়া হয়, যাতে ফোনের স্টোরেজ
 *    বা ব্যান্ডউইথ নষ্ট না হয়।
 *  - দ্বিমুখী দ্বন্দ্বে নিয়ম: **লোকাল ডেটা কখনো নিঃশব্দে মুছে যায় না**।
 *    যে কি লোকালে নেই কেবল সেটাই ক্লাউড থেকে বসানো হয়; আর যে কি অন্য
 *    ডিভাইসে আমাদের শেষ পাঠানোর পরে বদলেছে, সেটাই জেতে।
 */

const PREFIX = 'hsc28_';
/** এই কি-গুলো নিজেরাই সিঙ্কের হিসাব রাখে, তাই এদের কখনো পাঠানো হয় না। */
const META_KEY = 'hsc28_vault_meta';
const NOTICE_KEY = 'hsc28_vault_notice';
const RELOAD_KEY = 'hsc28_vault_reloaded';
const RESET_MARKER_KEY = 'hsc28_vault_reset_marker';
const RESET_META_KEY = '__cloud_reset_token__';
const RESET_BOOT_PREFIX = 'nokkhotro_cloud_reset_boot_v1_';
const RESET_PENDING_PREFIX = 'nokkhotro_cloud_reset_pending_v1_';
const LOCAL_SPACE_PREFIX = 'nokkhotro_local_space_v1_';
const GUEST_PENDING_PREFIX = 'nokkhotro_guest_pending_v1_';
const SYNC_QUEUE_KEY = 'hsc28_sync_queue';
const SKIPPED = new Set([
  META_KEY,
  NOTICE_KEY,
  RELOAD_KEY,
  RESET_MARKER_KEY,
  SYNC_QUEUE_KEY,
]);

/** ফোনের স্টোরেজ ও নেটওয়ার্ক বাঁচাতে একটা কি-এর সর্বোচ্চ আকার। */
const MAX_VALUE_CHARS = 400_000;
/** ডেবাউন্স: টাইপ করার সময় প্রতি অক্ষরে নেটওয়ার্ক কল যাবে না। */
const DEBOUNCE_MS = 1200;

type VaultMeta = Record<string, string>;

/** হুক বসানোর আগেই আসল ফাংশন ধরে রাখি, নাহলে নিজের হুকেই লুপ হবে। */
const rawSetItem =
  typeof Storage !== 'undefined' ? Storage.prototype.setItem : null;
const rawRemoveItem =
  typeof Storage !== 'undefined' ? Storage.prototype.removeItem : null;

function readMeta(): VaultMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as VaultMeta) : {};
  } catch {
    return {};
  }
}

function writeMeta(meta: VaultMeta): void {
  if (!rawSetItem) return;
  try {
    rawSetItem.call(localStorage, META_KEY, JSON.stringify(meta));
  } catch {
    // স্টোরেজ ভরে গেলে মেটা বাদ; সিঙ্ক তবু চলবে।
  }
}

/** সরাসরি (হুক-বাইপাস করে) লোকাল স্টোরেজে লেখে। */
function setLocalRaw(key: string, value: string): void {
  if (!rawSetItem) return;
  try {
    rawSetItem.call(localStorage, key, value);
  } catch {
    /* স্টোরেজ ভরা */
  }
}

function isVaultKey(key: string): boolean {
  return key.startsWith(PREFIX) && !SKIPPED.has(key);
}

function listLocalKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && isVaultKey(key)) keys.push(key);
    }
  } catch {
    /* স্টোরেজ বন্ধ */
  }
  return keys;
}

let activeUser: string | null = null;
let vaultGeneration = 0;
let reconciled = false;
let hooked = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let vaultFlush: Promise<void> | null = null;
const dirty = new Set<string>();
const initialised = new Set<string>();
const resetInProgress = new Set<string>();
const pendingResetTabs = new Map<string, string | null>();
let initialSyncPromise: Promise<void> | null = null;
let initialSyncError: unknown = null;

/** Apply a server-authoritative clear to this browser before it can sync stale data. */
export function applyCloudResetLocally(userId: string, token: string): boolean {
  let alreadyBootedClean = false;
  try {
    alreadyBootedClean =
      localStorage.getItem(RESET_BOOT_PREFIX + userId) === token;
  } catch {
    /* private browsing may deny local storage */
  }

  pauseSyncUser(userId, true);
  dirty.clear();
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      // The sync queue can hold work for other accounts; clearSyncQueueForUser
      // has already removed only this account's queued operations.
      if (key?.startsWith(PREFIX) && key !== SYNC_QUEUE_KEY) keys.push(key);
    }
  } catch {
    /* storage disabled */
  }
  for (const key of keys) {
    try {
      if (rawRemoveItem) rawRemoveItem.call(localStorage, key);
      else localStorage.removeItem(key);
    } catch {
      /* continue clearing the remaining keys */
    }
  }

  writeMeta({ [RESET_META_KEY]: token });
  setLocalRaw(RESET_BOOT_PREFIX + userId, token);
  for (const key of [
    LOCAL_SPACE_PREFIX + userId,
    'nokkhotro_pre_import_' + userId,
    GUEST_PENDING_PREFIX + userId,
    RESET_PENDING_PREFIX + userId,
  ]) {
    try {
      if (rawRemoveItem) rawRemoveItem.call(localStorage, key);
      else localStorage.removeItem(key);
    } catch {
      /* continue */
    }
  }
  return alreadyBootedClean;
}

/** Read the reset marker (or its absence) from the authenticated cloud vault. */
export async function readCloudResetMarker(userId: string): Promise<string | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('hsc28_kv')
    .select('value')
    .eq('user_id', userId)
    .eq('key', RESET_MARKER_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (typeof data.value !== 'string' || !data.value) {
    throw new Error('Cloud reset marker is invalid');
  }
  return data.value;
}

/** Read the reset token just written by hsc28_clear_my_study_data(). */
export async function readCloudResetToken(userId: string): Promise<string> {
  const token = await readCloudResetMarker(userId);
  if (!token) throw new Error('Cloud reset marker is missing');
  return token;
}

interface PendingCloudReset {
  version: 1;
  previousToken: string | null;
}

function readPendingCloudReset(userId: string): PendingCloudReset | null | false {
  try {
    const raw = localStorage.getItem(RESET_PENDING_PREFIX + userId);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as Partial<PendingCloudReset>;
    if (
      parsed?.version !== 1 ||
      !(parsed.previousToken === null || typeof parsed.previousToken === 'string')
    ) return false;
    return { version: 1, previousToken: parsed.previousToken };
  } catch {
    return false;
  }
}

/** Persist an in-flight reset fence before its RPC can race sibling tabs. */
export function beginCloudResetAttempt(userId: string): string | null {
  const key = RESET_PENDING_PREFIX + userId;
  if (!rawSetItem) throw new Error('Browser storage is unavailable for a safe reset.');
  try {
    if (localStorage.getItem(key) !== null) {
      throw new Error('A previous reset is still being checked. Reload and try again.');
    }
    const previousToken = localStorage.getItem(RESET_BOOT_PREFIX + userId);
    const value = JSON.stringify({ version: 1, previousToken } satisfies PendingCloudReset);
    rawSetItem.call(localStorage, key, value);
    if (localStorage.getItem(key) !== value) {
      throw new Error('Could not persist the cross-tab reset fence.');
    }
    return previousToken;
  } catch (error) {
    if (error instanceof Error && /previous reset|persist the cross-tab/i.test(error.message)) throw error;
    throw new Error('Browser storage is unavailable for a safe reset.');
  }
}

/** Clear a reset fence only after the server confirms the reset did not commit. */
export function clearCloudResetAttempt(userId: string): void {
  try {
    if (rawRemoveItem) rawRemoveItem.call(localStorage, RESET_PENDING_PREFIX + userId);
    else localStorage.removeItem(RESET_PENDING_PREFIX + userId);
  } catch {
    // Leaving the fence in place is safer than reopening stale writes.
  }
}

function reloadAfterCloudReset(): void {
  try {
    if (typeof window !== 'undefined') window.location.reload();
  } catch {
    /* the clean marker is stored; a manual reload will finish the reset */
  }
}

function schedule(key: string): void {
  if (!activeUser || !isVaultKey(key)) return;
  dirty.add(key);
  if (!reconciled) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flushVault().catch(() => { /* kept dirty for a later retry */ });
  }, DEBOUNCE_MS);
}

/** জমে থাকা বদল ক্লাউডে পাঠায় (আপসert / ডিলিট)। */
export async function flushVault(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  if (vaultFlush) await vaultFlush;
  vaultFlush = flushVaultNow();
  try { await vaultFlush; } finally { vaultFlush = null; }
}

async function flushVaultNow(): Promise<void> {
  const userId = activeUser;
  if (!userId || !reconciled || dirty.size === 0) return;

  const keys = Array.from(dirty);
  dirty.clear();

  const meta = readMeta();
  const now = new Date().toISOString();

  let oversized = false;
  for (const key of keys) {
    if (activeUser !== userId) return;
    let value: string | null = null;
    try {
      value = localStorage.getItem(key);
    } catch {
      continue;
    }

    if (value === null) {
      const saved = await syncWrite(
        { op: 'delete', table: 'hsc28_kv', eq: { user_id: userId, key } },
        userId
      );
      if (saved) delete meta[key];
      else dirty.add(key);
      continue;
    }

    if (value.length > MAX_VALUE_CHARS) {
      dirty.add(key);
      oversized = true;
      continue;
    }

    const saved = await syncWrite(
      {
        op: 'upsert',
        table: 'hsc28_kv',
        onConflict: 'user_id,key',
        payload: { user_id: userId, key, value, updated_at: now },
      },
      userId
    );
    if (saved) meta[key] = now;
    else dirty.add(key);
  }

  writeMeta(meta);
  if (oversized) throw new Error("Some local data is too large to sync");
}

export interface RestoreDecision {
  localValue: string | null;
  remoteValue: string;
  remoteUpdatedAt: string;
  lastPushedAt: string | null;
  freshDevice: boolean;
}

/**
 * কোন কী ক্লাউড থেকে ফিরিয়ে আনব — এই সিদ্ধান্তটা আলাদা করে রাখা, যাতে
 * নেটওয়ার্ক ছাড়াই যাচাই করা যায়। নিয়ম:
 *  ১. লোকাল না থাকলে → আনো।
 *  ২. দুটো একই হলে → কিছু করার নেই।
 *  ৩. এই ডিভাইস আগে কখনো সিঙ্ক করেনি → ক্লাউডই সত্যি (নতুন ফোনের ডিফল্ট
 *     ভ্যালু যেন আসল ডেটা ঢেকে না দেয়)।
 *  ৪. নইলে: অন্য ডিভাইসে আমাদের শেষ পাঠানোর পরে বদলালে → আনো; নাহলে
 *     লোকালেই থাক। অর্থাৎ যা এখনো ক্লাউডে ওঠেনি, তা কখনো হারায় না।
 */
export function shouldRestore(input: RestoreDecision): boolean {
  const { localValue, remoteValue, remoteUpdatedAt, lastPushedAt, freshDevice } =
    input;
  if (localValue === remoteValue) return false;
  if (localValue === null) return true;
  if (freshDevice) return true;
  if (!lastPushedAt) return true;
  const remoteTime = Date.parse(remoteUpdatedAt) || 0;
  const localTime = Date.parse(lastPushedAt) || 0;
  return remoteTime > localTime + 1000;
}

/**
 * ক্লাউড থেকে ফিরিয়ে আনে। ফেরত দেয় কোন কোন কি বদলাতে হয়েছে তার তালিকা।
 * নিয়ম: লোকালে না থাকলে বসাও; অন্য ডিভাইসে নতুন করে লেখা হলে সেটাই জেতে।
 */
export async function pullFromCloud(
  userId: string,
  generation = vaultGeneration
): Promise<string[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('hsc28_kv')
      .select('key,value,updated_at')
      .eq('user_id', userId);

    if (error || !Array.isArray(data)) throw error || new Error("Cloud vault returned invalid data");
    if (activeUser !== userId || generation !== vaultGeneration) return [];

    const meta = readMeta();
    const rows = data as { key: string; value: string; updated_at: string }[];
    const resetMarker = rows.find(
      (row) => row?.key === RESET_MARKER_KEY && typeof row.value === 'string' && row.value
    );
    const remoteResetToken = resetMarker?.value || null;
    const pendingReset = readPendingCloudReset(userId);
    if (pendingReset === false) {
      throw new Error('The pending cloud reset could not be validated; keeping sync paused.');
    }
    if (pendingReset) {
      if (remoteResetToken !== pendingReset.previousToken) {
        if (!remoteResetToken) {
          throw new Error('The pending cloud reset marker is missing; keeping sync paused.');
        }
        // The RPC committed even if its caller lost the response. Apply its
        // marker before any queued writes can be resumed in this tab.
        const alreadyBootedClean = applyCloudResetLocally(userId, remoteResetToken);
        resetInProgress.add(userId);
        if (!alreadyBootedClean) reloadAfterCloudReset();
        return [];
      }
      // The server marker is unchanged, so the interrupted reset did not
      // commit. It is now safe to keep the student's existing data and resume.
      clearCloudResetAttempt(userId);
    }
    if (resetMarker && meta[RESET_META_KEY] !== resetMarker.value) {
      // A deleted cloud key is otherwise indistinguishable from a never-synced
      // key; a reset marker makes the clear win over every stale device copy.
      const alreadyBootedClean = applyCloudResetLocally(userId, resetMarker.value);
      resetInProgress.add(userId);
      if (!alreadyBootedClean) reloadAfterCloudReset();
      return [];
    }

    // The reset token alone does not mean this device has synced any study keys.
    // A clean cloud reset should still count as a fresh device for restore rules.
    const freshDevice = Object.keys(meta).filter((key) => key !== RESET_META_KEY).length === 0;
    const restored: string[] = [];

    for (const row of rows) {
      if (!row || typeof row.key !== 'string' || typeof row.value !== 'string') {
        continue;
      }
      if (!isVaultKey(row.key)) continue;

      let local: string | null = null;
      try {
        local = localStorage.getItem(row.key);
      } catch {
        local = null;
      }

      const apply = shouldRestore({
        localValue: local,
        remoteValue: row.value,
        remoteUpdatedAt: row.updated_at,
        lastPushedAt: meta[row.key] ?? null,
        freshDevice: freshDevice,
      });

      if (apply) {
        setLocalRaw(row.key, row.value);
        restored.push(row.key);
      }
    }

    return restored;
  } catch (error) {
    throw error;
  }
}

function installHooks(): void {
  if (hooked || typeof window === 'undefined' || !rawSetItem) return;
  hooked = true;

  const setItem = rawSetItem;
  Storage.prototype.setItem = function patchedSetItem(key: string, value: string) {
    setItem.call(this, key, value);
    if (this === window.localStorage && typeof key === 'string') schedule(key);
  };

  if (rawRemoveItem) {
    const removeItem = rawRemoveItem;
    Storage.prototype.removeItem = function patchedRemoveItem(key: string) {
      removeItem.call(this, key);
      if (this === window.localStorage && typeof key === 'string') schedule(key);
    };
  }

  // অ্যাপ বন্ধ/লুকানো হওয়ার আগে জমে থাকা বদল পাঠিয়ে দিই।
  window.addEventListener('pagehide', () => {
    void flushVault().catch(() => { /* kept dirty for a later retry */ });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushVault().catch(() => {});
  });
  window.addEventListener('online', () => {
    if (activeUser) void ensureVaultReady().catch(() => { /* retry on the next connection */ });
    void flushVault().catch(() => { /* kept dirty for a later retry */ });
  });
  window.addEventListener('storage', (event) => {
    const key = event.key || '';
    if (key.startsWith(RESET_PENDING_PREFIX)) {
      const userId = key.slice(RESET_PENDING_PREFIX.length);
      if (event.newValue !== null) {
        const pending = readPendingCloudReset(userId);
        if (pending) pendingResetTabs.set(userId, pending.previousToken);
        if (activeUser === userId) pauseSyncUser(userId, true);
        return;
      }

      if (!pendingResetTabs.has(userId)) return;
      const previousToken = pendingResetTabs.get(userId) ?? null;
      pendingResetTabs.delete(userId);
      if (activeUser !== userId) return;

      let currentToken: string | null = null;
      let tokenReadable = false;
      try {
        currentToken = localStorage.getItem(RESET_BOOT_PREFIX + userId);
        tokenReadable = true;
      } catch { /* stay paused */ }
      if (!tokenReadable) return;
      if (currentToken !== previousToken) {
        if (currentToken) {
          startCloudVault(null);
          applyCloudResetLocally(userId, currentToken);
          reloadAfterCloudReset();
        }
        return;
      }

      // The reset was confirmed not to have committed. Keep local edits and
      // let the vault send any dirty values once its write gate is reopened.
      resumeSyncUser(userId);
      void flushVault().catch(() => { /* kept dirty for a later retry */ });
      return;
    }

    if (!key.startsWith(RESET_BOOT_PREFIX) || !event.newValue) return;
    const userId = key.slice(RESET_BOOT_PREFIX.length);
    if (activeUser !== userId) return;

    // A sibling tab committed a reset. Invalidate any in-flight cloud pull,
    // clear this tab's local snapshot, and reload React's in-memory state too.
    startCloudVault(null);
    applyCloudResetLocally(userId, event.newValue);
    reloadAfterCloudReset();
  });
}

async function initialSync(userId: string, generation: number): Promise<void> {
  if (generation !== vaultGeneration || initialised.has(userId)) return;
  pauseSyncUser(userId);
  initialised.add(userId);

  const restored = await pullFromCloud(userId, generation);
  if (activeUser !== userId || generation !== vaultGeneration) return;
  if (resetInProgress.delete(userId)) return;
  reconciled = true;
  // The cloud snapshot has been checked, so ordered table writes may now resume.
  resumeSyncUser(userId);

  // অতিথি অবস্থায় যা পড়া হয়েছে, বা এই ডিভাইসের সর্বশেষ অবস্থা — সবই তোলা হয়।
  for (const key of listLocalKeys()) dirty.add(key);
  if (dirty.size > 0) await flushVault();

  if (restored.length > 0) {
    let notice: string[] = [];
    try {
      const raw = localStorage.getItem(NOTICE_KEY);
      notice = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      notice = [];
    }
    const merged = Array.from(new Set([...notice, ...restored]));
    setLocalRaw(NOTICE_KEY, JSON.stringify(merged));

    // পুরোনো স্ক্রিনগুলো এখনো মেমরিতে পুরোনো অবস্থা ধরে রেখেছে — একবার
    // রিলোড করলেই নতুন ডেটা সব জায়গায় বসে। লুপ এড়াতে সেশন-ফ্ল্যাগ।
    let already = null;
    try {
      already = sessionStorage.getItem(RELOAD_KEY);
    } catch {
      already = null;
    }
    if (already !== userId && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(RELOAD_KEY, userId);
      } catch {
        /* ব্যক্তিগত মোড */
      }
      window.location.reload();
    }
  }
}

/** লগইন/লগআউটের সাথে ভল্ট বাঁধে। গেস্ট হলে কিছুই হয় না। */
export function startCloudVault(userId: string | null): void {
  if (activeUser !== userId) {
    vaultGeneration += 1;
    if (timer) clearTimeout(timer);
    timer = null;
    dirty.clear();
    initialised.clear();
    resetInProgress.clear();
    reconciled = false;
  }
  activeUser = userId;
  if (!userId) return;
  installHooks();
  // Do not replace an in-flight promise with the resolved promise returned by
  // initialSync's already-initialised fast path.
  if (initialised.has(userId) && initialSyncPromise) return;
  initialSyncError = null;
  const generation = vaultGeneration;
  initialSyncPromise = initialSync(userId, generation).catch((error) => {
    if (generation !== vaultGeneration) return;
    initialised.delete(userId);
    if (activeUser === userId) { reconciled = false; initialSyncError = error; }
  });
}

/**
 * ক্লাউড থেকে ফেরানো ডেটার সংখ্যা জানায় (একবার পড়লেই মুছে যায়), যাতে
 * নেভবারে একটা সৎ টোস্ট দেখানো যায়।
 */
export function takeRestoreNotice(): number {
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    const count = Array.isArray(parsed) ? parsed.length : 0;
    localStorage.removeItem(NOTICE_KEY);
    return count;
  } catch {
    return 0;
  }
}

/** Wait for initial cloud reconciliation; a failed pull must block safe sign-out. */
export async function ensureVaultReady(): Promise<void> {
  if (initialSyncPromise) await initialSyncPromise;
  if (initialSyncError && activeUser) {
    const userId = activeUser;
    const generation = vaultGeneration;
    initialSyncError = null;
    initialSyncPromise = initialSync(userId, generation).catch((error) => {
      if (generation !== vaultGeneration) return;
      initialised.delete(userId);
      initialSyncError = error;
    });
    await initialSyncPromise;
  }
  if (initialSyncError) throw initialSyncError;
}
