import { getSupabase } from './supabase';
import { syncWrite } from './sync';

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
const SKIPPED = new Set([META_KEY, NOTICE_KEY, RELOAD_KEY, 'hsc28_sync_queue']);

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
let hooked = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const dirty = new Set<string>();
const initialised = new Set<string>();

function schedule(key: string): void {
  if (!activeUser || !isVaultKey(key)) return;
  dirty.add(key);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flushVault();
  }, DEBOUNCE_MS);
}

/** জমে থাকা বদল ক্লাউডে পাঠায় (আপসert / ডিলিট)। */
export async function flushVault(): Promise<void> {
  const userId = activeUser;
  if (!userId || dirty.size === 0) return;

  const keys = Array.from(dirty);
  dirty.clear();

  const meta = readMeta();
  const now = new Date().toISOString();

  for (const key of keys) {
    let value: string | null = null;
    try {
      value = localStorage.getItem(key);
    } catch {
      continue;
    }

    if (value === null) {
      void syncWrite(
        { op: 'delete', table: 'hsc28_kv', eq: { user_id: userId, key } },
        userId
      );
      delete meta[key];
      continue;
    }

    if (value.length > MAX_VALUE_CHARS) continue;

    void syncWrite(
      {
        op: 'upsert',
        table: 'hsc28_kv',
        onConflict: 'user_id,key',
        payload: { user_id: userId, key, value, updated_at: now },
      },
      userId
    );
    meta[key] = now;
  }

  writeMeta(meta);
}

/**
 * ক্লাউড থেকে ফিরিয়ে আনে। ফেরত দেয় কোন কোন কি বদলাতে হয়েছে তার তালিকা।
 * নিয়ম: লোকালে না থাকলে বসাও; অন্য ডিভাইসে নতুন করে লেখা হলে সেটাই জেতে।
 */
export async function pullFromCloud(userId: string): Promise<string[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('hsc28_kv')
      .select('key,value,updated_at')
      .eq('user_id', userId);

    if (error || !Array.isArray(data)) return [];

    const meta = readMeta();
    const restored: string[] = [];

    for (const row of data as { key: string; value: string; updated_at: string }[]) {
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

      const remoteTime = Date.parse(row.updated_at || '') || 0;
      const pushedAt = meta[row.key];
      const localTime = pushedAt ? Date.parse(pushedAt) || 0 : 0;

      const missingHere = local === null;
      const remoteIsNewer = pushedAt ? remoteTime > localTime + 1000 : false;
      if (!missingHere && !remoteIsNewer) continue;

      if (local !== row.value) {
        setLocalRaw(row.key, row.value);
        restored.push(row.key);
      }
    }

    return restored;
  } catch {
    return [];
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
    void flushVault();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushVault();
  });
  window.addEventListener('online', () => {
    void flushVault();
  });
}

async function initialSync(userId: string): Promise<void> {
  if (initialised.has(userId)) return;
  initialised.add(userId);

  const restored = await pullFromCloud(userId);

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
  activeUser = userId;
  if (!userId) return;
  installHooks();
  void initialSync(userId);
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
