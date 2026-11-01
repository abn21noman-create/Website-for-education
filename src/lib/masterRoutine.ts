import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
import { buildStudyDay } from './studyScience';
import type { Chronotype } from './studyScience';
import type { BilingualText, SubjectKey } from '../types';

/**
 * The 391-day master plan from the printed routine.
 *
 * Structure taken from the PDF: three phases, two classes every day, Friday as
 * rest + revision + exam day. The PDF lists a specific chapter per day; here the
 * chapters are generated from the app's own syllabus (same subject, same order)
 * so the plan stays consistent with everything else in the app and still walks
 * the whole book before the exam.
 */

import { TOTAL_PLAN_DAYS, HSC_EXAM_START, WEEKDAYS_BN, WEEKDAYS_EN } from './planConstants';
export { TOTAL_PLAN_DAYS, HSC_EXAM_START, WEEKDAYS_BN, WEEKDAYS_EN } from './planConstants';

export type PhaseKey = 'academic' | 'preAdmission' | 'fullAdmission';

export interface RoutinePhase {
  key: PhaseKey;
  name: BilingualText;
  from: number;
  to: number;
  focus: BilingualText;
}

export const PHASES: RoutinePhase[] = [
  {
    key: 'academic',
    name: { bn: 'Phase 1 — Academic', en: 'Phase 1 — Academic' },
    from: 1,
    to: 239,
    focus: {
      bn: 'HSC বোর্ড পরীক্ষার সম্পূর্ণ প্রস্তুতি — ১ম পত্র দিয়ে শুরু, ২য় পত্রে গিয়ে শেষ। প্রতিদিন ২টা ক্লাস।',
      en: 'Full HSC board preparation — first papers first, then second papers. Two classes a day.',
    },
  },
  {
    key: 'preAdmission',
    name: { bn: 'Phase 2 — Pre Admission', en: 'Phase 2 — Pre Admission' },
    from: 240,
    to: 340,
    focus: {
      bn: 'ভর্তি প্রশ্নব্যাংক সলভিং — DU A Unit, Engineering ও Medical-এর প্রস্তুতি একসাথে। প্রতিদিন ২টা ক্লাস + সলভিং।',
      en: 'Admission question banks — DU A Unit, engineering and medical together. Two classes plus solving daily.',
    },
  },
  {
    key: 'fullAdmission',
    name: { bn: 'Phase 3 — Full Admission', en: 'Phase 3 — Full Admission' },
    from: 341,
    to: 391,
    focus: {
      bn: 'তিনটি ট্র্যাক আলাদাভাবে — Engineering, Medical, Varsity A Unit। মক টেস্ট ও ফাইনাল রিভিশন।',
      en: 'Three separate tracks — engineering, medical and varsity A unit. Mock tests and final revision.',
    },
  },
];

/** Two papers per class day, cycled in order; Friday is always revision. */
const ACADEMIC_FIRST: SubjectKey[][] = [
  ['math1', 'chemistry1'],
  ['physics1', 'biology1'],
  ['bangla', 'english'],
];

const ACADEMIC_SECOND: SubjectKey[][] = [
  ['math2', 'chemistry2'],
  ['physics2', 'biology2'],
  ['bangla', 'english'],
];

const PRE_ADMISSION: SubjectKey[][] = [
  ['math2', 'physics2'],
  ['chemistry2', 'biology2'],
  ['english', 'bangla'],
];

const FULL_ADMISSION: SubjectKey[][] = [
  ['math2', 'physics2'],
  ['chemistry2', 'biology2'],
  ['english', 'bangla'],
];

/** Day 1 of Phase 1 is first-paper work; the second papers start at this day. */
const SECOND_PAPER_START_DAY = 120;

function pairsForDay(dayNumber: number): SubjectKey[][] {
  if (dayNumber >= 341) return FULL_ADMISSION;
  if (dayNumber >= 240) return PRE_ADMISSION;
  return dayNumber < SECOND_PAPER_START_DAY ? ACADEMIC_FIRST : ACADEMIC_SECOND;
}

export function phaseForDay(dayNumber: number): RoutinePhase {
  const clamped = Math.min(Math.max(dayNumber, 1), TOTAL_PLAN_DAYS);
  return PHASES.find((phase) => clamped >= phase.from && clamped <= phase.to) ?? PHASES[0];
}

/** 0 = Saturday … 6 = Friday, matching the printed routine. */
export function weekdayIndexForDay(dayNumber: number): number {
  return (dayNumber - 1) % 7;
}

export function isRevisionDay(dayNumber: number): boolean {
  return weekdayIndexForDay(dayNumber) === 6;
}

/**
 * Subjects for every day of the plan, built once in a single pass.
 *
 * The dashboard asks for today's classes on first paint, so this must never be
 * an O(n²) walk: one loop over 391 days fills the whole table.
 */
const DAY_SUBJECTS: SubjectKey[][] = (() => {
  const table: SubjectKey[][] = [];
  let classDayIndex = 0;
  for (let day = 1; day <= TOTAL_PLAN_DAYS; day += 1) {
    if (isRevisionDay(day)) {
      table.push([]);
      continue;
    }
    const pairs = pairsForDay(day);
    table.push(pairs[classDayIndex % pairs.length]);
    classDayIndex += 1;
  }
  return table;
})();

/** Subjects scheduled on a day; empty array means a Friday revision day. */
export function subjectsForDay(dayNumber: number): SubjectKey[] {
  if (dayNumber < 1 || dayNumber > TOTAL_PLAN_DAYS) return [];
  return DAY_SUBJECTS[dayNumber - 1];
}

const chaptersBySubject = new Map<SubjectKey, { id: string; bn: string; en: string }[]>();
CHAPTERS.forEach((chapter) => {
  const list = chaptersBySubject.get(chapter.subjectKey) ?? [];
  list.push({ id: chapter.id, bn: chapter.title.bn, en: chapter.title.en });
  chaptersBySubject.set(chapter.subjectKey, list);
});

/** Every day a given subject appears, in order — used to walk chapters. */
const occurrenceDays = new Map<SubjectKey, number[]>();
for (let day = 1; day <= TOTAL_PLAN_DAYS; day += 1) {
  subjectsForDay(day).forEach((subject) => {
    const list = occurrenceDays.get(subject) ?? [];
    list.push(day);
    occurrenceDays.set(subject, list);
  });
}

export interface ClassSlot {
  subjectKey: SubjectKey;
  chapterId: string;
  subjectBn: string;
  subjectEn: string;
  chapterBn: string;
  chapterEn: string;
  /** 1-based position of this slot inside the subject's chapter list. */
  chapterNumber: number;
}

export function classSlotsForDay(dayNumber: number): ClassSlot[] {
  return subjectsForDay(dayNumber).map((subject) => {
    const chapters = chaptersBySubject.get(subject) ?? [];
    const days = occurrenceDays.get(subject) ?? [];
    const occurrence = Math.max(0, days.indexOf(dayNumber));
    const chapter = chapters.length ? chapters[occurrence % chapters.length] : null;
    const subjectInfo = getSubjectByKey(subject);
    const index = chapter ? chapters.findIndex((item) => item.id === chapter.id) : 0;
    return {
      subjectKey: subject,
      chapterId: chapter?.id ?? '',
      subjectBn: subjectInfo?.name.bn ?? subject,
      subjectEn: subjectInfo?.name.en ?? subject,
      chapterBn: chapter?.bn ?? '—',
      chapterEn: chapter?.en ?? '—',
      chapterNumber: index + 1,
    };
  });
}

/** Tasks the printed routine asks for after every class. */
export const CLASS_TASKS: BilingualText[] = [
  { bn: 'ক্লাস দেখা (ভিডিও)', en: 'Watch the class' },
  { bn: 'নোট করা', en: 'Take notes' },
  { bn: 'দাগানো বই — সংশ্লিষ্ট চ্যাপ্টার পড়া', en: 'Read the marked textbook chapter' },
  { bn: 'লেকচার শিট সম্পন্ন করা', en: 'Finish the lecture sheet' },
];

export const REVISION_TASKS: BilingualText[] = [
  { bn: 'এই সপ্তাহের নোট আবার পড়া', en: 'Re-read this week’s notes' },
  { bn: 'সাজেশন থেকে গুরুত্বপূর্ণ প্রশ্ন পড়া', en: 'Read high-yield questions from the suggestion' },
  { bn: 'ভুল প্রশ্ন চিহ্নিত করে নোট করা', en: 'Mark and rewrite the questions you got wrong' },
  { bn: 'আগামী সপ্তাহের রুটিন একবার দেখা', en: 'Preview next week’s routine' },
  { bn: 'সাপ্তাহিক এক্সাম দেওয়া', en: 'Sit the weekly exam' },
];

// ── Dates ────────────────────────────────────────────────────────────────

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date | null {
  const parts = key.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (!from || !to) return 0;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/** Plan day number for a calendar date, or null when outside the 391 days. */
export function dayNumberForDate(startKey: string, dateKey: string): number | null {
  const offset = daysBetween(startKey, dateKey);
  const dayNumber = offset + 1;
  if (dayNumber < 1 || dayNumber > TOTAL_PLAN_DAYS) return null;
  return dayNumber;
}

export function dateForDayNumber(startKey: string, dayNumber: number): string {
  const start = parseDateKey(startKey) ?? new Date();
  const date = new Date(start.getTime());
  date.setDate(date.getDate() + (dayNumber - 1));
  return toDateKey(date);
}

export function daysToHsc(todayKey: string): number {
  return daysBetween(todayKey, HSC_EXAM_START);
}

// ── Time plan (research-backed, lives in studyScience) ───────────────────

export type {
  StudyBlock as TimeBlock,
  StudySettings as TimeSettings,
  Chronotype,
} from './studyScience';

export {
  buildStudyDay,
  sleepFeedback,
  revisionQueue,
  plannedStudyMinutesOf as plannedStudyMinutes,
  availableStudyMinutesOf as availableStudyMinutes,
  EVIDENCE,
  SPACED_INTERVALS,
} from './studyScience';

export type { LearnedItem, RevisionDue, EvidenceNote } from './studyScience';

export const DEFAULT_TIME_SETTINGS = {
  wake: '06:00',
  sleep: '23:00',
  instituteHours: 3,
  commuteHours: 1,
  lifeHours: 3,
};

/** Blocks only — used by the routine screen and the smoke test. */
export function buildTimePlan(settings: typeof DEFAULT_TIME_SETTINGS, chronotype: Chronotype = 'neutral') {
  return buildStudyDay(settings, chronotype).blocks;
}

/** Monday-first free weekly target, shown next to the logged hours. */
export const WEEKLY_HOUR_TARGET = 25;

/**
 * Weekly target versus what was actually logged.
 *
 * The plan week runs Saturday→Friday (day 1 is a Saturday), so the window is
 * derived from the plan day, not the calendar's Monday. The shortfall is turned
 * into a small per-day extra so a lost week can be caught up without inventing a
 * heroic 6-hour Sunday — the extra is capped at 90 minutes a day.
 */
export interface WeekPacing {
  fromDay: number;
  toDay: number;
  fromKey: string;
  toKey: string;
  targetMinutes: number;
  expectedMinutes: number;
  doneMinutes: number;
  daysLeft: number;
  deficitMinutes: number;
  perDayExtra: number;
  verdict: 'ahead' | 'onTrack' | 'behind' | 'farBehind';
  messageBn: string;
  messageEn: string;
}

const MAX_PER_DAY_EXTRA = 90;

export function weekPacing(
  startDate: string,
  todayKey: string,
  minutes: Record<string, number>
): WeekPacing | null {
  const day = dayNumberForDate(startDate, todayKey);
  if (day === null) return null;
  const weekIndex = Math.floor((day - 1) / 7);
  const fromDay = weekIndex * 7 + 1;
  const toDay = Math.min(TOTAL_PLAN_DAYS, fromDay + 6);
  const targetMinutes = WEEKLY_HOUR_TARGET * 60;
  const daysInWeek = toDay - fromDay + 1;
  const daysLeft = toDay - Math.min(day, toDay) + 1;
  const elapsed = Math.max(1, Math.min(day, toDay) - fromDay + 1);
  const expectedMinutes = Math.round((targetMinutes * elapsed) / daysInWeek);

  let doneMinutes = 0;
  for (let d = fromDay; d <= toDay; d += 1) {
    doneMinutes += minutes[dateForDayNumber(startDate, d)] || 0;
  }

  const deficitMinutes = expectedMinutes - doneMinutes;
  const perDayExtra =
    deficitMinutes > 0 && daysLeft > 0
      ? Math.min(MAX_PER_DAY_EXTRA, Math.ceil(deficitMinutes / daysLeft))
      : 0;

  const ratio = expectedMinutes > 0 ? doneMinutes / expectedMinutes : 1;
  const verdict: WeekPacing['verdict'] =
    ratio >= 1.05 ? 'ahead' : ratio >= 0.85 ? 'onTrack' : ratio >= 0.55 ? 'behind' : 'farBehind';

  const hoursDone = Math.round((doneMinutes / 60) * 10) / 10;
  const hoursTarget = WEEKLY_HOUR_TARGET;
  const messages: Record<WeekPacing['verdict'], { bn: string; en: string }> = {
    ahead: {
      bn: `${hoursDone} ঘণ্টা হয়েছে — সপ্তাহের লক্ষ্য ${hoursTarget} ঘণ্টার চেয়ে এগিয়ে। এই গতি ধরে রাখো।`,
      en: `${hoursDone} h done — ahead of this week’s ${hoursTarget} h target. Keep this pace.`,
    },
    onTrack: {
      bn: `${hoursDone} ঘণ্টা হয়েছে — ${hoursTarget} ঘণ্টার লক্ষ্যের সাথে তাল মিলছে।`,
      en: `${hoursDone} h done — on track for the ${hoursTarget} h week.`,
    },
    behind: {
      bn: `${hoursDone} ঘণ্টা হয়েছে, ${Math.max(0, Math.round(deficitMinutes / 60 * 10) / 10)} ঘণ্টা পিছিয়ে — বাকি ${daysLeft} দিনে দিনে ${perDayExtra} মিনিট বেশি পড়লে ধরা পড়ে যাবে।`,
      en: `${hoursDone} h done, ${Math.max(0, Math.round(deficitMinutes / 60 * 10) / 10)} h behind — ${perDayExtra} extra minutes on each of the ${daysLeft} remaining days catches it up.`,
    },
    farBehind: {
      bn: `${hoursDone} ঘণ্টা হয়েছে — অনেক পিছিয়ে। পুরো সপ্তাহ উড়িয়ে দিও না: আজ ${perDayExtra} মিনিট বেশি দিয়ে শুরু করো, বাকিটা পরের সপ্তাহে টেনে নাও।`,
      en: `${hoursDone} h done — well behind. Don’t write the week off: start with ${perDayExtra} extra minutes today and carry the rest into next week.`,
    },
  };

  return {
    fromDay,
    toDay,
    fromKey: dateForDayNumber(startDate, fromDay),
    toKey: dateForDayNumber(startDate, toDay),
    targetMinutes,
    expectedMinutes,
    doneMinutes,
    daysLeft,
    deficitMinutes,
    perDayExtra,
    verdict,
    messageBn: messages[verdict].bn,
    messageEn: messages[verdict].en,
  };
}
