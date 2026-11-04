/**
 * The destructive part of a study-data reset, separated from React so its
 * ordering and in-flight behavior can be regression-tested without a live
 * Supabase project.
 */

export interface StudyDataResetDependencies {
  ensureVaultReady: () => Promise<void>;
  flushVault: () => Promise<void>;
  ensureSyncSaved: () => Promise<boolean>;
  pauseSyncUser: (userId: string, discardQueued?: boolean) => void;
  startCloudVault: (userId: string | null) => void;
  setSyncUser: (userId: string | null) => void;
  clearSyncQueueForUser: (userId: string) => void;
  resetOnServer: () => Promise<void>;
  readCloudResetToken: (userId: string) => Promise<string>;
  applyCloudResetLocally: (userId: string, token: string) => boolean;
  reload: () => void;
  syncIncompleteMessage: string;
  now?: () => number;
}

const resetsInProgress = new Set<string>();

/**
 * Save the last writes, close the local write gate, then clear the server.
 * Once the RPC starts, new writes for this user are discarded rather than
 * queued behind the reset. An uncertain RPC failure reconciles the server
 * marker before reopening writes, because the server may have committed even
 * when its response was lost.
 */
export async function performStudyDataReset(
  userId: string,
  deps: StudyDataResetDependencies
): Promise<void> {
  if (resetsInProgress.has(userId)) {
    throw new Error('Study-data reset is already in progress');
  }
  resetsInProgress.add(userId);

  try {
    await deps.ensureVaultReady();
    await deps.flushVault();
    if (!(await deps.ensureSyncSaved())) {
      throw new Error(deps.syncIncompleteMessage);
    }

    // There must be no await between the final queue check and this gate.
    // Otherwise a UI action could enqueue another write in that small window.
    deps.pauseSyncUser(userId, true);
    deps.startCloudVault(null);
    deps.setSyncUser(null);

    try {
      await deps.resetOnServer();
    } catch (error) {
      // A network error is ambiguous: the SQL transaction may have committed
      // before the response was lost. Restore writes only after a fresh marker
      // read has decided whether to resume or clear and reload this device.
      deps.startCloudVault(userId);
      try {
        await deps.ensureVaultReady();
        deps.setSyncUser(userId);
      } catch {
        // Stay paused if reconciliation is unavailable. A later retry/reload
        // will inspect the server marker before any queued mutation is replayed.
      }
      throw error;
    }

    let token: string;
    try {
      token = await deps.readCloudResetToken(userId);
    } catch {
      // The RPC succeeded, so never restore cached data just because the
      // immediate follow-up read failed. The next vault pull adopts the real
      // marker and replaces this placeholder before writes are resumed.
      token = `pending-${(deps.now || Date.now)()}`;
    }

    deps.clearSyncQueueForUser(userId);
    deps.applyCloudResetLocally(userId, token);
    deps.reload();
  } finally {
    resetsInProgress.delete(userId);
  }
}
