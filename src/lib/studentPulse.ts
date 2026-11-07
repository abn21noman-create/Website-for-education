import { syncWrite } from './sync';

/**
 * Five-question, privacy-bounded product pulse.
 *
 * The full response is saved locally first (and therefore joins Cloud Vault and
 * portable backups). A signed-in student also upserts one constrained database
 * row so administrators can see aggregate counts without names, emails, free
 * text, or per-student answers.
 */
export const STUDENT_PULSE_STORAGE_KEY = 'hsc28_student_pulse_v1';
export const STUDENT_PULSE_VERSION = 1 as const;

export const PRIMARY_NEEDS = [
  'daily_plan',
  'board_practice',
  'revision',
  'admission_prep',
] as const;

export const BIGGEST_BLOCKERS = [
  'know_what_next',
  'understand_concepts',
  'stay_consistent',
  'find_time',
] as const;

export const NEXT_PRIORITIES = [
  'more_mcq',
  'more_cq_models',
  'routine_reminders',
  'simpler_faster',
] as const;

export type PrimaryNeed = (typeof PRIMARY_NEEDS)[number];
export type BiggestBlocker = (typeof BIGGEST_BLOCKERS)[number];
export type NextPriority = (typeof NEXT_PRIORITIES)[number];
export type PulseScore = 1 | 2 | 3 | 4 | 5;

export interface StudentPulseAnswers {
  primaryNeed: PrimaryNeed;
  biggestBlocker: BiggestBlocker;
  appHelpfulness: PulseScore;
  todayPlanClarity: PulseScore;
  nextPriority: NextPriority;
}

export interface StudentPulseResponse extends StudentPulseAnswers {
  version: typeof STUDENT_PULSE_VERSION;
  submittedAt: string;
  updatedAt: string;
}

export interface StudentPulseSaveResult {
  response: StudentPulseResponse;
  localSaved: boolean;
  cloud: 'saved' | 'queued' | 'local-only';
}

export interface StudentPulseDeleteResult {
  localDeleted: boolean;
  cloud: 'deleted' | 'queued' | 'local-only';
}

const optionIs = <T extends readonly string[]>(
  options: T,
  value: unknown
): value is T[number] => typeof value === 'string' && options.includes(value as T[number]);

function scoreIs(value: unknown): value is PulseScore {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

function isoDateIs(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 20 || value.length > 40) return false;
  return Number.isFinite(Date.parse(value));
}

/** Treat local/cloud data as untrusted so malformed answers never enter the UI. */
export function normalizeStudentPulse(value: unknown): StudentPulseResponse | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    row.version !== STUDENT_PULSE_VERSION ||
    !optionIs(PRIMARY_NEEDS, row.primaryNeed) ||
    !optionIs(BIGGEST_BLOCKERS, row.biggestBlocker) ||
    !scoreIs(row.appHelpfulness) ||
    !scoreIs(row.todayPlanClarity) ||
    !optionIs(NEXT_PRIORITIES, row.nextPriority) ||
    !isoDateIs(row.submittedAt) ||
    !isoDateIs(row.updatedAt)
  ) return null;

  return {
    version: STUDENT_PULSE_VERSION,
    primaryNeed: row.primaryNeed,
    biggestBlocker: row.biggestBlocker,
    appHelpfulness: row.appHelpfulness,
    todayPlanClarity: row.todayPlanClarity,
    nextPriority: row.nextPriority,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
  };
}

export function loadStudentPulse(): StudentPulseResponse | null {
  try {
    const raw = localStorage.getItem(STUDENT_PULSE_STORAGE_KEY);
    return raw ? normalizeStudentPulse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function buildStudentPulseResponse(
  answers: StudentPulseAnswers,
  previous: StudentPulseResponse | null = null,
  now = new Date()
): StudentPulseResponse {
  const timestamp = now.toISOString();
  const response = normalizeStudentPulse({
    version: STUDENT_PULSE_VERSION,
    ...answers,
    submittedAt: previous?.submittedAt || timestamp,
    updatedAt: timestamp,
  });
  if (!response) throw new Error('Invalid student pulse answers');
  return response;
}

/**
 * Save locally before attempting the aggregate research row. `syncWrite` owns
 * offline retry/order guarantees, so a weak connection never discards an answer.
 */
export async function saveStudentPulse(
  response: StudentPulseResponse,
  userId: string | null
): Promise<StudentPulseSaveResult> {
  const normalized = normalizeStudentPulse(response);
  if (!normalized) throw new Error('Invalid student pulse response');

  let localSaved = false;
  try {
    const serialized = JSON.stringify(normalized);
    localStorage.setItem(STUDENT_PULSE_STORAGE_KEY, serialized);
    localSaved = localStorage.getItem(STUDENT_PULSE_STORAGE_KEY) === serialized;
  } catch {
    localSaved = false;
  }

  let cloud: StudentPulseSaveResult['cloud'] = 'local-only';
  if (userId) {
    const saved = await syncWrite({
      op: 'upsert',
      table: 'hsc28_student_feedback',
      onConflict: 'user_id',
      payload: {
        user_id: userId,
        survey_version: normalized.version,
        primary_need: normalized.primaryNeed,
        biggest_blocker: normalized.biggestBlocker,
        app_helpfulness: normalized.appHelpfulness,
        today_plan_clarity: normalized.todayPlanClarity,
        next_priority: normalized.nextPriority,
        submitted_at: normalized.submittedAt,
        updated_at: normalized.updatedAt,
      },
    }, userId);
    cloud = saved ? 'saved' : 'queued';
  }

  if (!localSaved && cloud !== 'saved') {
    throw new Error('The response could not be saved locally or in the cloud.');
  }

  window.dispatchEvent(new CustomEvent('hsc28:student-pulse', { detail: normalized }));
  return { response: normalized, localSaved, cloud };
}

/** Remove both the device copy and the account's dedicated research row. */
export async function deleteStudentPulse(userId: string | null): Promise<StudentPulseDeleteResult> {
  let localDeleted = false;
  try {
    localStorage.removeItem(STUDENT_PULSE_STORAGE_KEY);
    localDeleted = localStorage.getItem(STUDENT_PULSE_STORAGE_KEY) === null;
  } catch {
    localDeleted = false;
  }

  let cloud: StudentPulseDeleteResult['cloud'] = 'local-only';
  if (userId) {
    const deleted = await syncWrite({
      op: 'delete',
      table: 'hsc28_student_feedback',
      eq: { user_id: userId },
    }, userId);
    cloud = deleted ? 'deleted' : 'queued';
  }

  if (!localDeleted && cloud !== 'deleted') {
    throw new Error('The response could not be deleted locally or from the cloud.');
  }

  window.dispatchEvent(new CustomEvent('hsc28:student-pulse', { detail: null }));
  return { localDeleted, cloud };
}
