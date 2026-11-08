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

/**
 * Remove every browser copy owned by an account after the server confirms that
 * the Auth user has been hard-deleted. Other accounts and guest work on the
 * same browser are deliberately left alone.
 */
export function clearDeletedAccountSpace(userId: string): void {
  const oldOwner = localStorage.getItem(OWNER) || legacyOwner();

  if (oldOwner === userId) {
    for (const key of Object.keys(capture())) localStorage.removeItem(key);
    localStorage.removeItem(OWNER);
  }

  localStorage.removeItem(SPACE + userId);
  localStorage.removeItem(PENDING + userId);
  localStorage.removeItem('nokkhotro_pre_import_' + userId);
  localStorage.removeItem('nokkhotro_cloud_reset_boot_v1_' + userId);
  localStorage.removeItem('nokkhotro_cloud_reset_pending_v1_' + userId);

  // The durable queue is shared by account spaces, so remove only this user's
  // operations rather than deleting another account's offline work.
  try {
    const raw = localStorage.getItem(QUEUE);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      const remaining = parsed.filter((item) =>
        !item || typeof item !== 'object' || (item as { userId?: unknown }).userId !== userId
      );
      if (remaining.length) localStorage.setItem(QUEUE, JSON.stringify(remaining));
      else localStorage.removeItem(QUEUE);
    } else {
      localStorage.removeItem(QUEUE);
    }
  } catch {
    // A malformed queue cannot be safely replayed and may still contain the
    // deleted account's data, so fail closed by removing it.
    localStorage.removeItem(QUEUE);
  }
}
