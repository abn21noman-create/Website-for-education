/**
 * Per-account local vote hints for the peer-doubt forum.
 *
 * The server vote ledger is authoritative for signed-in students; this local
 * mirror keeps the button responsive/offline. Older versions stored one global
 * map, which incorrectly prevented a second account on the same device from
 * voting. Legacy entries are migrated to the guest bucket only.
 */
export type StudentHubVoteMap = Record<string, boolean>;
export type StudentHubVoteLedger = Record<string, StudentHubVoteMap>;

export const STUDENT_HUB_VOTES_KEY = 'hsc28_upvoted_by_owner_v1';
export const LEGACY_STUDENT_HUB_VOTES_KEY = 'hsc28_upvoted';

export function studentHubVoteOwner(userId: string | null): string {
  return userId ? `user:${userId}` : 'guest';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanVoteMap(value: unknown): StudentHubVoteMap {
  if (!isRecord(value)) return {};
  const votes: StudentHubVoteMap = {};
  Object.entries(value).forEach(([id, voted]) => {
    if (voted === true) votes[id] = true;
  });
  return votes;
}

/** Parse the new account-scoped format, migrating the old global map as guest. */
export function parseStudentHubVoteLedger(
  currentRaw: string | null,
  legacyRaw: string | null = null
): StudentHubVoteLedger {
  if (currentRaw) {
    try {
      const parsed: unknown = JSON.parse(currentRaw);
      if (isRecord(parsed)) {
        const ledger: StudentHubVoteLedger = {};
        Object.entries(parsed).forEach(([owner, votes]) => {
          if (owner === 'guest' || owner.startsWith('user:')) {
            ledger[owner] = cleanVoteMap(votes);
          }
        });
        return ledger;
      }
    } catch {
      // Recover from malformed current data using the one-time legacy migration.
    }
  }

  if (legacyRaw) {
    try {
      const parsed: unknown = JSON.parse(legacyRaw);
      const guestVotes = cleanVoteMap(parsed);
      if (Object.keys(guestVotes).length > 0) return { guest: guestVotes };
    } catch {
      // Invalid legacy data is ignored.
    }
  }
  return {};
}

export function loadStudentHubVoteLedger(): StudentHubVoteLedger {
  try {
    if (typeof localStorage === 'undefined') return {};
    return parseStudentHubVoteLedger(
      localStorage.getItem(STUDENT_HUB_VOTES_KEY),
      localStorage.getItem(LEGACY_STUDENT_HUB_VOTES_KEY)
    );
  } catch {
    return {};
  }
}

export function updateStudentHubVoteLedger(
  ledger: StudentHubVoteLedger,
  owner: string,
  update: (previous: StudentHubVoteMap) => StudentHubVoteMap
): StudentHubVoteLedger {
  return {
    ...ledger,
    [owner]: cleanVoteMap(update({ ...(ledger[owner] || {}) })),
  };
}
