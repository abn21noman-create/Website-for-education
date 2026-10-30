import type { SubjectKey } from '../types';

/**
 * Life Hub persistence.
 *
 * Kept in its own module (rather than inside `LifeHubView`) so other screens —
 * the weekly review, the backup exporter — can read the same document without
 * pulling the whole Life Hub chunk into their bundle.
 */

export const LIFE_STORAGE_KEY = 'hsc28_life_v1';
export const LIFE_DATA_EVENT = 'hsc28:life-data-changed';

export type DeadlineCategory = 'admission' | 'scholarship' | 'exam' | 'fee' | 'other';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  category: DeadlineCategory;
  note: string;
  done: boolean;
}

export interface ExamItem {
  id: string;
  title: string;
  date: string;
  time: string;
  subjectKey: SubjectKey | 'all';
}

export interface RoutineSlot {
  id: string;
  /** JavaScript day index: 0 = Sunday … 6 = Saturday. */
  day: number;
  start: string;
  end: string;
  subject: string;
  room: string;
}

export interface ExamResult {
  id: string;
  title: string;
  /** Free-text label kept for display and older records. */
  subject: string;
  /** Set when the student picked one of the 11 papers from the dropdown. */
  subjectKey?: SubjectKey | 'all';
  obtained: number;
  total: number;
  date: string;
}

export interface LifeData {
  /** ISO date (local) → ids of habits completed that day. */
  habits: Record<string, string[]>;
  /** ISO date (local) → college attendance for that day. */
  attendance: Record<string, AttendanceStatus>;
  deadlines: DeadlineItem[];
  exams: ExamItem[];
  results: ExamResult[];
  examChecklist: string[];
  xpAwardedOn: string[];
  /** Weekly class timetable. */
  routine: RoutineSlot[];
  /** Last local edit — used to decide which copy wins on sign-in. */
  updatedAt: string;
}

export const EMPTY_LIFE_DATA: LifeData = {
  habits: {},
  attendance: {},
  deadlines: [],
  exams: [],
  results: [],
  examChecklist: [],
  xpAwardedOn: [],
  routine: [],
  updatedAt: '',
};

/** Coerces anything read from storage or the cloud into a valid LifeData. */
export function normalizeLifeData(input: unknown): LifeData {
  const parsed = (input ?? {}) as Partial<LifeData>;

  const attendance: Record<string, AttendanceStatus> = {};
  if (parsed.attendance && typeof parsed.attendance === 'object') {
    (Object.entries(parsed.attendance) as [string, AttendanceStatus][]).forEach(([day, status]) => {
      if (['present', 'late', 'absent', 'leave'].includes(status)) attendance[day] = status;
    });
  }

  return {
    habits: parsed.habits && typeof parsed.habits === 'object' ? parsed.habits : {},
    attendance,
    deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
    exams: Array.isArray(parsed.exams) ? parsed.exams : [],
    results: Array.isArray(parsed.results) ? parsed.results : [],
    examChecklist: Array.isArray(parsed.examChecklist) ? parsed.examChecklist : [],
    xpAwardedOn: Array.isArray(parsed.xpAwardedOn) ? parsed.xpAwardedOn : [],
    routine: Array.isArray(parsed.routine) ? parsed.routine : [],
    updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
  };
}

export function loadLifeData(): LifeData {
  try {
    const raw = localStorage.getItem(LIFE_STORAGE_KEY);
    if (!raw) return EMPTY_LIFE_DATA;
    return normalizeLifeData(JSON.parse(raw));
  } catch {
    return EMPTY_LIFE_DATA;
  }
}

export function saveLifeData(data: LifeData): void {
  try {
    localStorage.setItem(LIFE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* Storage full or blocked — the session still works in memory. */
  }
}

/** Local (not UTC) ISO date key, so "today" is correct after midnight locally. */
export function localDateKey(date = new Date()): string {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
}

/** Whole days from today until `dateStr`; negative when in the past. */
export function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(localDateKey(d));
  }
  return out;
}

/** Habits needed for a day to count toward the streak. */
export const HABIT_TARGET = 4;

export interface AttendanceSummary {
  monthPrefix: string;
  daysInMonth: number;
  /** 0 = Sunday, used to offset the first calendar cell. */
  firstWeekday: number;
  counts: Record<AttendanceStatus, number>;
  marked: number;
  attended: number;
  pct: number;
}

/**
 * Consecutive days that met the habit target. Today only counts once it is
 * complete; until then the streak is measured up to yesterday so opening the
 * app in the morning never shows "0 days".
 */
export function habitStreak(
  habits: Record<string, string[]>,
  target = HABIT_TARGET
): number {
  const start = (habits[localDateKey()] ?? []).length >= target ? 0 : 1;
  let count = 0;
  for (let i = start; i < 400; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if ((habits[localDateKey(d)] ?? []).length >= target) count += 1;
    else break;
  }
  return count;
}

export interface SubjectResultAverage {
  subjectKey: SubjectKey;
  avg: number;
  count: number;
}

/**
 * Average mark per paper, weakest first. Only results with a real subject key
 * are counted, so a free-text "অন্যান্য" entry never skews the ranking.
 */
export function subjectResultAverages(results: ExamResult[]): SubjectResultAverage[] {
  const buckets = new Map<SubjectKey, number[]>();
  results.forEach((r) => {
    if (!r.subjectKey || r.subjectKey === 'all' || !(r.total > 0)) return;
    const pct = (r.obtained / r.total) * 100;
    const list = buckets.get(r.subjectKey) ?? [];
    list.push(pct);
    buckets.set(r.subjectKey, list);
  });

  return Array.from(buckets.entries())
    .map(([subjectKey, list]) => ({
      subjectKey,
      avg: Math.round(list.reduce((sum, p) => sum + p, 0) / list.length),
      count: list.length,
    }))
    .sort((a, b) => a.avg - b.avg);
}

/**
 * College attendance for a calendar month. `leave` is excluded from the
 * denominator, matching how colleges treat approved leave.
 */
export function attendanceForMonth(
  attendance: Record<string, AttendanceStatus>,
  monthDate = new Date()
): AttendanceSummary {
  const monthPrefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

  const counts: Record<AttendanceStatus, number> = { present: 0, late: 0, absent: 0, leave: 0 };
  Object.entries(attendance).forEach(([day, status]) => {
    if (day.startsWith(monthPrefix) && counts[status] !== undefined) counts[status] += 1;
  });

  const marked = counts.present + counts.late + counts.absent;
  const attended = counts.present + counts.late;

  return {
    monthPrefix,
    daysInMonth: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate(),
    firstWeekday: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay(),
    counts,
    marked,
    attended,
    pct: marked > 0 ? Math.round((attended / marked) * 100) : 0,
  };
}
