/**
 * The destructive part of a study-data reset, separated from React so its
 * ordering and in-flight behavior can be regression-tested without a live
 * Supabase project.
 */

export interface StudyDataResetDependencies {
  ensureVaultReady: () => Promise<void>;
  flushVault: () => Promise<void>;
  ensureSyncSaved: () => Promise<boolean>;
  withExclusiveUserLock: (userId: string, operation: () => Promise<void>) => Promise<void>;
  beginCloudResetAttempt: (userId: string) => string | null;
  clearCloudResetAttempt: (userId: string) => void;
  pauseSyncUser: (userId: string, discardQueued?: boolean) => void;
  startCloudVault: (userId: string | null) => void;
  setSyncUser: (userId: string | null) => void;
  clearSyncQueueForUser: (userId: string) => void;
  resetOnServer: () => Promise<void>;
  readCloudResetMarker: (userId: string) => Promise<string | null>;
  readCloudResetToken: (userId: string) => Promise<string>;
  applyCloudResetLocally: (userId: string, token: string) => boolean;
  reload: () => void;
  syncIncompleteMessage: string;
  now?: () => number;
}

const resetsInProgress = new Set<string>();

/**
 * Save the last local writes, then take an exclusive per-account browser lock.
 * The pending marker fences sibling tabs before the reset RPC begins. Successful
 * resets publish a new generation before releasing the lock; ambiguous errors
 * keep the fence until a fresh server read can decide whether to commit or abort.
 */
export async function performStudyDataReset(
  userId: string,
  deps: StudyDataResetDependencies
): Promise<void> {
  if (resetsInProgress.has(userId)) {
    throw new Error('Study-data reset is already in progress');
  }
  resetsInProgress.add(userId);

  let resetAttemptStarted = false;
  let resetCompleted = false;
  try {
    await deps.ensureVaultReady();
    await deps.flushVault();
    if (!(await deps.ensureSyncSaved())) {
      throw new Error(deps.syncIncompleteMessage);
    }

    await deps.withExclusiveUserLock(userId, async () => {
      const previousToken = deps.beginCloudResetAttempt(userId);
      resetAttemptStarted = true;

      // The exclusive lock has waited for writes already in flight in other
      // tabs. The local gate now rejects any later writes from this tab.
      deps.pauseSyncUser(userId, true);
      deps.startCloudVault(null);
      deps.setSyncUser(null);

      try {
        await deps.resetOnServer();
      } catch (error) {
        // A lost RPC response is ambiguous. Still holding the exclusive lock,
        // check the server marker before allowing any queued tab write through.
        try {
          const currentToken = await deps.readCloudResetMarker(userId);
          if (currentToken !== previousToken) {
            if (currentToken) {
              deps.clearSyncQueueForUser(userId);
              deps.applyCloudResetLocally(userId, currentToken);
              resetCompleted = true;
              deps.reload();
              return;
            }
            // A previously present marker disappearing is not proof that the
            // reset failed; retain the pending fence and fail closed.
          } else {
            deps.clearCloudResetAttempt(userId);
          }
        } catch {
          // Keep the persisted fence. A later vault read will settle the marker.
        }
        throw error;
      }

      let token: string;
      try {
        token = await deps.readCloudResetToken(userId);
      } catch {
        // The RPC succeeded, so never restore cached data just because the
        // immediate follow-up read failed. A placeholder generation still
        // blocks stale sibling-tab writes until the next vault pull adopts the
        // actual server marker.
        token = `pending-${(deps.now || Date.now)()}`;
      }

      deps.clearSyncQueueForUser(userId);
      deps.applyCloudResetLocally(userId, token);
      resetCompleted = true;
      deps.reload();
    });
  } catch (error) {
    if (resetAttemptStarted && !resetCompleted) {
      // Reconcile only after releasing the exclusive lock: the vault uses the
      // shared form of that same lock when it resumes normal writes.
      deps.startCloudVault(userId);
      try {
        await deps.ensureVaultReady();
        deps.setSyncUser(userId);
      } catch {
        // Stay paused if the marker is still unavailable. The persisted fence
        // prevents sibling tabs from replaying pre-reset work in the meantime.
      }
    }
    throw error;
  } finally {
    resetsInProgress.delete(userId);
  }
}
