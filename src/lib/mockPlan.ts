import { classSlotsForDay, dateForDayNumber, isRevisionDay, TOTAL_PLAN_DAYS } from './masterRoutine';
import type { PhaseKey } from './masterRoutine';

/**
 * Mock-test calendar for the 391-day plan.
 *
 * One test per week, on Friday (the plan's revision day), and the test changes
 * character with the phase:
 *   • Academic (1–239)      — a weekly model test on that week's two papers.
 *   • Pre-Admission (240–340) — admission papers, rotating varsity → engineering
 *                              → medical, because all three are still open.
 *   • Full Admission (341–391) — one combined 3-section mock, then the last two
 *                              weeks are pure revision with no new test.
 *
 * Everything is derived from the day number, so it works whatever Day-1 date the
 * student picks, and every test points at a real pattern in `examPatterns.ts`.
 */

export type MockKind = 'weekly' | 'varsity' | 'engineering' | 'medical' | 'combined';

export interface MockTrack {
  key: MockKind;
  nameBn: string;
  nameEn: string;
  /** A real pattern id from `examPatterns.ts`. */
  patternId: string;
  minutes: number;
  marks: number;
  negative: boolean;
  noteBn: string;
  noteEn: string;
}

export const MOCK_TRACKS: Record<MockKind, MockTrack> = {
  weekly: {
    key: 'weekly',
    nameBn: 'সাপ্তাহিক মডেল টেস্ট',
    nameEn: 'Weekly model test',
    patternId: 'hsc-board',
    minutes: 60,
    marks: 50,
    negative: false,
    noteBn: 'এই সপ্তাহের দুই পত্র মিলিয়ে ৫০ নম্বর — বোর্ডের মতো, নেগেটিভ নেই।',
    noteEn: 'This week’s two papers, 50 marks, board style, no negative marking.',
  },
  varsity: {
    key: 'varsity',
    nameBn: 'ভর্তি মক — ঢাবি ‘ক’ ইউনিট',
    nameEn: 'Admission mock — DU Ka unit',
    patternId: 'du-ka',
    minutes: 45,
    marks: 60,
    negative: true,
    noteBn: '৬০ MCQ, ৪৫ মিনিট, প্রতি ভুলে ০.২৫ কাটা — গতি ও নির্ভুলতা একসাথে।',
    noteEn: '60 MCQs in 45 minutes with −0.25 per wrong answer — speed and accuracy together.',
  },
  engineering: {
    key: 'engineering',
    nameBn: 'ভর্তি মক — BUET প্রিলি',
    nameEn: 'Admission mock — BUET preliminary',
    patternId: 'buet-preli',
    minutes: 60,
    marks: 100,
    negative: true,
    noteBn: '১০০ MCQ, ৬০ মিনিট — গণিত ও পদার্থের গতি ধরা হয় এখানেই।',
    noteEn: '100 MCQs in 60 minutes — this is where maths and physics speed shows.',
  },
  medical: {
    key: 'medical',
    nameBn: 'ভর্তি মক — মেডিকেল',
    nameEn: 'Admission mock — medical',
    patternId: 'medical-mbbs',
    minutes: 60,
    marks: 100,
    negative: true,
    noteBn: '১০০ MCQ, ৬০ মিনিট — জীববিজ্ঞান ও রসায়নের ওপর ভর, প্রতি ভুলে ০.২৫ কাটা।',
    noteEn: '100 MCQs in 60 minutes, weighted to biology and chemistry, −0.25 per wrong answer.',
  },
  combined: {
    key: 'combined',
    nameBn: 'ফুল মক — তিন ট্র্যাক একসাথে',
    nameEn: 'Full mock — all three tracks',
    patternId: 'full-mock',
    minutes: 150,
    marks: 200,
    negative: true,
    noteBn: 'এক বসায় তিন ট্র্যাকের অংশ — আসল ভর্তি পরীক্ষার stamina তৈরি করার জন্য।',
    noteEn: 'All three tracks in one sitting — this builds the stamina a real admission test needs.',
  },
};

export interface MockTest {
  id: string;
  dayNumber: number;
  phase: PhaseKey;
  track: MockTrack;
  papersBn: string[];
  papersEn: string[];
  titleBn: string;
  titleEn: string;
}

/** No new mock is scheduled inside the last two weeks — that time is revision. */
export const FINAL_REVISION_FROM_DAY = TOTAL_PLAN_DAYS - 13;

const ADMISSION_ROTATION: MockKind[] = ['varsity', 'engineering', 'medical'];

function phaseOf(dayNumber: number): PhaseKey {
  if (dayNumber <= 239) return 'academic';
  if (dayNumber <= 340) return 'preAdmission';
  return 'fullAdmission';
}

/** Which track a given day runs, or null when that day carries no test. */
export function mockTrackKindForDay(dayNumber: number): MockKind | null {
  if (dayNumber < 1 || dayNumber > TOTAL_PLAN_DAYS) return null;
  if (dayNumber >= FINAL_REVISION_FROM_DAY) return null;
  if (!isRevisionDay(dayNumber)) return null;
  const phase = phaseOf(dayNumber);
  if (phase === 'academic') return 'weekly';
  if (phase === 'preAdmission') {
    const week = Math.floor((dayNumber - 1) / 7);
    return ADMISSION_ROTATION[week % ADMISSION_ROTATION.length];
  }
  return 'combined';
}

function papersForDay(dayNumber: number): { bn: string[]; en: string[] } {
  const slots = classSlotsForDay(dayNumber);
  if (slots.length === 0) {
    // Friday has no class, so name the papers from the last class day of the week.
    for (let back = 1; back <= 6; back += 1) {
      const found = classSlotsForDay(dayNumber - back);
      if (found.length > 0) {
        return { bn: found.map((s) => s.subjectBn), en: found.map((s) => s.subjectEn) };
      }
    }
    return { bn: [], en: [] };
  }
  return { bn: slots.map((s) => s.subjectBn), en: slots.map((s) => s.subjectEn) };
}

export function mockTestForDay(dayNumber: number): MockTest | null {
  const kind = mockTrackKindForDay(dayNumber);
  if (!kind) return null;
  const track = MOCK_TRACKS[kind];
  const phase = phaseOf(dayNumber);
  const papers = kind === 'weekly' ? papersForDay(dayNumber) : { bn: [], en: [] };
  const paperJoinBn = papers.bn.join(' + ');
  return {
    id: `mock-${dayNumber}`,
    dayNumber,
    phase,
    track,
    papersBn: papers.bn,
    papersEn: papers.en,
    titleBn:
      kind === 'weekly' && paperJoinBn ? `${track.nameBn} — ${paperJoinBn}` : track.nameBn,
    titleEn:
      kind === 'weekly' && papers.en.length
        ? `${track.nameEn} — ${papers.en.join(' + ')}`
        : track.nameEn,
  };
}

/** Every test between two day numbers (inclusive), in order. */
export function mockTestsBetween(fromDay: number, toDay: number): MockTest[] {
  const from = Math.max(1, Math.min(fromDay, toDay));
  const to = Math.min(TOTAL_PLAN_DAYS, Math.max(fromDay, toDay));
  const out: MockTest[] = [];
  for (let day = from; day <= to; day += 1) {
    const test = mockTestForDay(day);
    if (test) out.push(test);
  }
  return out;
}

export interface UpcomingMock extends MockTest {
  daysAway: number;
  dateKey: string;
}

/** The next `count` tests from today's plan day onwards (fridays only, so cheap). */
export function upcomingMocks(
  dayNumber: number,
  count: number,
  startDate: string
): UpcomingMock[] {
  const out: UpcomingMock[] = [];
  if (dayNumber < 1) return out;
  for (let day = Math.max(1, dayNumber); day <= TOTAL_PLAN_DAYS && out.length < count; day += 1) {
    if (!isRevisionDay(day)) continue;
    const test = mockTestForDay(day);
    if (!test) continue;
    out.push({
      ...test,
      daysAway: day - dayNumber,
      dateKey: dateForDayNumber(startDate, day),
    });
  }
  return out;
}

/** How many of each track the whole plan holds — used for the overview line. */
export function mockCounts(): Record<MockKind, number> {
  const counts: Record<MockKind, number> = {
    weekly: 0,
    varsity: 0,
    engineering: 0,
    medical: 0,
    combined: 0,
  };
  for (let day = 1; day <= TOTAL_PLAN_DAYS; day += 1) {
    if (!isRevisionDay(day)) continue;
    const kind = mockTrackKindForDay(day);
    if (kind) counts[kind] += 1;
  }
  return counts;
}
