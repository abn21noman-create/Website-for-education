/** Isolate legacy localStorage between accounts before mounting the app. */
const OWNER = 'nokkhotro_local_owner_v1';
const SPACE = 'nokkhotro_local_space_v1_';
const QUEUE = 'hsc28_sync_queue';
const PENDING = 'nokkhotro_guest_pending_v1_';

type Values = Record<string, string>;
function capture(): Values {
  const values: Values = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('hsc28_') && key !== QUEUE) {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    }
  }
  return values;
}
function legacyOwner(): string | null {
  try {
    const profile = JSON.parse(localStorage.getItem('hsc28_profile') || '{}');
    return typeof profile.id === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(profile.id) ? profile.id : null;
  } catch { return null; }
}
function parseSpace(raw: string | null): Values {
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.entries(parsed).some(([k,v]) => !k.startsWith('hsc28_') || k === QUEUE || typeof v !== 'string')) throw new Error('Invalid local account backup');
  return parsed as Values;
}

/** Changes accounts only after saving the outgoing space; rollback on errors. */
export function selectAccountSpace(userId: string): { guestData: Values | null } {
  const oldOwner = localStorage.getItem(OWNER) || legacyOwner();
  if (oldOwner === userId) { localStorage.setItem(OWNER, userId); const pending = localStorage.getItem(PENDING + userId); return { guestData: pending ? parseSpace(pending) : null }; }
  const current = capture();
  const targetRaw = localStorage.getItem(SPACE + userId);
  const target = targetRaw ? parseSpace(targetRaw) : oldOwner ? {} : current;
  if (!oldOwner && !targetRaw && Object.keys(current).length) localStorage.setItem(PENDING + userId, JSON.stringify(current));
  // Store the old account (or a guest safety copy) before removing anything.
  const oldSpace = SPACE + (oldOwner || 'guest');
  localStorage.setItem(oldSpace, JSON.stringify(current));
  try {
    for (const key of Object.keys(current)) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(target)) localStorage.setItem(key, value);
    localStorage.setItem(OWNER, userId);
  } catch (error) {
    for (const key of Object.keys(capture())) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(current)) localStorage.setItem(key, value);
    if (oldOwner) localStorage.setItem(OWNER, oldOwner); else localStorage.removeItem(OWNER);
    throw error;
  }
  return { guestData: !oldOwner && !targetRaw && Object.keys(current).length ? current : null };
}

export function finishGuestMigration(userId: string): void { localStorage.removeItem(PENDING + userId); }
