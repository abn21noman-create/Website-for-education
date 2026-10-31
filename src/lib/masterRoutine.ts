import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
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

export const TOTAL_PLAN_DAYS = 391;
export const HSC_EXAM_START = '2026-07-02';
export const WEEKDAYS_BN = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];
export const WEEKDAYS_EN = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

/** Subjects scheduled on a day; empty array means a Friday revision day. */
export function subjectsForDay(dayNumber: number): SubjectKey[] {
  if (isRevisionDay(dayNumber)) return [];
  const pairs = pairsForDay(dayNumber);
  // Count class days (Friday excluded) before this one to pick the pair.
  let classDaysBefore = 0;
  for (let d = 1; d < dayNumber; d += 1) {
    if (!isRevisionDay(d)) classDaysBefore += 1;
  }
  return pairs[classDaysBefore % pairs.length];
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

// ── Time plan ────────────────────────────────────────────────────────────

export interface TimeSettings {
  wake: string;
  sleep: string;
  /** School / college / coaching hours per day. */
  instituteHours: number;
  commuteHours: number;
  /** Meals, prayer, family, rest. */
  lifeHours: number;
}

export const DEFAULT_TIME_SETTINGS: TimeSettings = {
  wake: '06:00',
  sleep: '23:00',
  instituteHours: 3,
  commuteHours: 1,
  lifeHours: 3,
};

export interface TimeBlock {
  id: string;
  titleBn: string;
  titleEn: string;
  start: string;
  minutes: number;
  kind: 'class' | 'practice' | 'revision' | 'life' | 'institute';
}

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function clockText(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(2, '0')}`;
}

/** Minutes available for study once sleep, institute, commute and life are out. */
export function availableStudyMinutes(settings: TimeSettings): number {
  const awake = minutesOf(settings.sleep) - minutesOf(settings.wake);
  const span = awake > 0 ? awake : awake + 1440;
  const blocked =
    (settings.instituteHours + settings.commuteHours + settings.lifeHours) * 60;
  return Math.max(0, span - blocked);
}

/**
 * A usable day, built from the hours the student actually has.
 *
 * Two classes in the morning, one long solving block, and a short revision block
 * at night — the same shape the printed routine asks for, scaled to the hours
 * the student really has left after school and life.
 */
export function buildTimePlan(settings: TimeSettings): TimeBlock[] {
  const study = availableStudyMinutes(settings);
  if (study <= 0) return [];

  const classMinutes = Math.min(180, Math.round(study * 0.4));
  const practiceMinutes = Math.min(180, Math.round(study * 0.4));
  const revisionMinutes = Math.max(20, Math.round(study * 0.2));

  const blocks: TimeBlock[] = [];
  let cursor = minutesOf(settings.wake);

  const push = (id: string, titleBn: string, titleEn: string, minutes: number, kind: TimeBlock['kind']) => {
    blocks.push({ id, titleBn, titleEn, start: clockText(cursor), minutes, kind });
    cursor += minutes;
  };

  push('wake', 'ঘুম থেকে উঠে হালকা প্রস্তুতি', 'Wake up and get ready', 30, 'life');
  push('class-1', 'ক্লাস ১ (রুটিনের প্রথম বিষয়)', 'Class 1 (first routine subject)', Math.round(classMinutes / 2), 'class');
  push('break-1', 'নাস্তা ও বিশ্রাম', 'Breakfast and short break', 30, 'life');
  push('class-2', 'ক্লাস ২ (রুটিনের দ্বিতীয় বিষয়)', 'Class 2 (second routine subject)', Math.round(classMinutes / 2), 'class');
  push('institute', 'স্কুল / কলেজ / কোচিং', 'School, college or coaching', Math.round(settings.instituteHours * 60), 'institute');
  push('commute', 'যাতায়াত', 'Commute', Math.round(settings.commuteHours * 60), 'life');
  push('life', 'খাওয়া, নামাজ ও বিশ্রাম', 'Meals, prayer and rest', Math.round(settings.lifeHours * 60), 'life');
  push('practice', 'সলভিং ব্লক (MCQ + গাণিতিক)', 'Solving block (MCQ + maths)', practiceMinutes, 'practice');
  push('revision', 'রিভিশন ও নিজের ভাষায় ব্যাখ্যা', 'Revision and self-explanation', revisionMinutes, 'revision');

  return blocks;
}

export function plannedStudyMinutes(blocks: TimeBlock[]): number {
  return blocks
    .filter((block) => block.kind === 'class' || block.kind === 'practice' || block.kind === 'revision')
    .reduce((sum, block) => sum + block.minutes, 0);
}

/** Monday-first free weekly target, shown next to the logged hours. */
export const WEEKLY_HOUR_TARGET = 25;
