import type { BilingualText, McqQuestion, SubjectKey } from '../types';

/**
 * Exam patterns.
 *
 * The exam engine used to be a generic "pick N questions, 60 seconds each" quiz.
 * Real HSC and admission papers are not generic: HSC science papers are
 * 25 MCQ + 50 creative + 25 practical, BUET/MBBS/DU each have their own
 * duration, negative marking and subject weight. This module holds those
 * rules in one place so the UI and the question picker cannot drift apart.
 *
 * Numbers follow the published 2026 circulars. They are a study simulation,
 * not the official paper — the UI says so.
 */

export type PatternKind = 'custom' | 'hsc' | 'admission' | 'mixed';

export interface ExamPattern {
  id: string;
  kind: PatternKind;
  name: BilingualText;
  /** What the real paper looks like, in one line. */
  breakdown: BilingualText;
  /** Full-paper question count (may exceed what our bank currently holds). */
  paperQuestions: number;
  /** Full-paper time for the MCQ section, in minutes. */
  paperMinutes: number;
  negativeMarking: boolean;
  /** Marks per correct answer in the real paper. */
  markPerQuestion: number;
  subjectMode: 'single' | 'weighted' | 'interleaved';
  /** Relative question weight per paper (only for `subjectMode: 'weighted'`). */
  weights?: Partial<Record<SubjectKey, number>>;
  /** Shown under the pattern name when a rule needs a caveat. */
  note?: BilingualText;
  verifiedOn?: string;
  officialUrl?: string;
}

const scienceWeights: Partial<Record<SubjectKey, number>> = {
  math1: 17,
  math2: 17,
  physics1: 16.5,
  physics2: 16.5,
  chemistry1: 16.5,
  chemistry2: 16.5,
};

export const EXAM_PATTERNS: ExamPattern[] = [
  {
    id: 'custom',
    kind: 'custom',
    name: { bn: 'নিজের মতো সেট', en: 'Custom Set' },
    breakdown: {
      bn: 'বিষয়, সংখ্যা ও সময় নিজে বাছুন',
      en: 'Choose subject, count and mode yourself',
    },
    paperQuestions: 0,
    paperMinutes: 0,
    negativeMarking: false,
    markPerQuestion: 1,
    subjectMode: 'single',
  },
  {
    id: 'hsc-board',
    kind: 'hsc',
    name: { bn: 'HSC বোর্ড প্যাটার্ন (৭০+৩০)', en: 'HSC Board Pattern (70+30)' },
    breakdown: {
      bn: 'সৃজনশীল ৭০ + MCQ ৩০ • MCQ ৩০ মিনিট (১ নম্বর/প্রশ্ন, নেগেটিভ নেই)',
      en: 'Creative 70 + MCQ 30 • 30-minute MCQ (1 mark each, no negative)',
    },
    paperQuestions: 30,
    paperMinutes: 30,
    negativeMarking: false,
    markPerQuestion: 1,
    subjectMode: 'single',
    note: {
      bn: 'একটি বিষয় বেছে নিন — বোর্ডে প্রতি পত্রের MCQ আলাদা হয়।',
      en: 'Pick one paper — in the real board each paper has its own MCQ section.',
    },
    verifiedOn: '2026-10-30',
  },
  {
    id: 'hsc-practical',
    kind: 'hsc',
    name: {
      bn: 'ব্যবহারিকসহ বিজ্ঞান পত্র (৫০+২৫+২৫)',
      en: 'Science Paper with Practical (50+25+25)',
    },
    breakdown: {
      bn: 'সৃজনশীল ৫০ + MCQ ২৫ + ব্যবহারিক ২৫ • MCQ ২৫ মিনিট',
      en: 'Creative 50 + MCQ 25 + Practical 25 • 25-minute MCQ',
    },
    paperQuestions: 25,
    paperMinutes: 25,
    negativeMarking: false,
    markPerQuestion: 1,
    subjectMode: 'single',
    note: {
      bn: 'ব্যবহারিকের ২৫ নম্বরের প্রস্তুতি নিতে ব্যবহারিক মডিউলও দেখুন।',
      en: 'Pair this with the Practical module for the 25 practical marks.',
    },
    verifiedOn: '2026-10-30',
  },
  {
    id: 'buet-preli',
    kind: 'admission',
    name: { bn: 'BUET প্রিলি (১০০ MCQ)', en: 'BUET Preliminary (100 MCQ)' },
    breakdown: {
      bn: 'গণিত ৩৪ + পদার্থ ৩৩ + রসায়ন ৩৩ • ৬০ মিনিট • −০.২৫',
      en: 'Math 34 + Physics 33 + Chemistry 33 • 60 min • −0.25',
    },
    paperQuestions: 100,
    paperMinutes: 60,
    negativeMarking: true,
    markPerQuestion: 1,
    subjectMode: 'weighted',
    weights: scienceWeights,
    note: {
      bn: 'প্রিলি পাস করলে ৪০০ নম্বরের লিখিত পরীক্ষা — এখানে সেটি নেই।',
      en: 'Qualifying leads to the 400-mark written test, which is not simulated here.',
    },
    verifiedOn: '2026-10-30',
    officialUrl: 'https://www.buet.ac.bd/',
  },
  {
    id: 'medical-mbbs',
    kind: 'admission',
    name: { bn: 'মেডিকেল (১০০ MCQ)', en: 'Medical MBBS (100 MCQ)' },
    breakdown: {
      bn: 'জীব ৩০ + রসায়ন ২৫ + পদার্থ ২০ + ইংরেজি ১৫ + GK ১০ • ৬০ মিনিট • −০.২৫ • পাস ৪০',
      en: 'Bio 30 + Chem 25 + Phys 20 + Eng 15 + GK 10 • 60 min • −0.25 • pass 40',
    },
    paperQuestions: 100,
    paperMinutes: 60,
    negativeMarking: true,
    markPerQuestion: 1,
    subjectMode: 'weighted',
    weights: {
      biology1: 15,
      biology2: 15,
      chemistry1: 12.5,
      chemistry2: 12.5,
      physics1: 10,
      physics2: 10,
      english: 15,
      ict: 10,
    },
    note: {
      bn: 'GK ১০ নম্বরের জন্য আলাদা “GK ড্রিল” স্ক্রিন আছে (৩০টি প্রশ্ন); এই মকে মোট ১০০ নম্বরের জন্য ওই জায়গায় ICT থেকে ১০টি প্রশ্ন আসছে।',
      en: 'The 10 GK marks have their own “GK drill” screen (30 questions); inside this 100-mark mock, ICT still fills that slot.',
    },
    verifiedOn: '2026-10-30',
    officialUrl: 'https://dgme.gov.bd/',
  },
  {
    id: 'du-ka',
    kind: 'admission',
    name: { bn: 'ঢাবি ‘ক’ ইউনিট (৬০ MCQ)', en: 'DU Ka-Unit (60 MCQ)' },
    breakdown: {
      bn: 'MCQ ৬০ • ৪৫ মিনিট • −০.২৫ • এরপর ৪০ নম্বরের লিখিত',
      en: 'MCQ 60 • 45 min • −0.25 • then a 40-mark written paper',
    },
    paperQuestions: 60,
    paperMinutes: 45,
    negativeMarking: true,
    markPerQuestion: 1,
    subjectMode: 'weighted',
    weights: {
      physics1: 7.5,
      physics2: 7.5,
      chemistry1: 7.5,
      chemistry2: 7.5,
      biology1: 7.5,
      biology2: 7.5,
      math1: 7.5,
      math2: 7.5,
    },
    note: {
      bn: 'লিখিত ৪০ + SSC/HSC GPA ২০ এখানে নেই — শুধু MCQ অংশ।',
      en: 'The 40-mark written and 20 GPA marks are not part of this simulation.',
    },
    verifiedOn: '2026-10-30',
    officialUrl: 'https://admission.eis.du.ac.bd/',
  },
  {
    id: 'full-mock',
    kind: 'mixed',
    name: { bn: 'সমন্বিত মডেল টেস্ট (৩০ প্রশ্ন)', en: 'Combined Model Test (30 questions)' },
    breakdown: {
      bn: 'সব পত্র থেকে ৩০ প্রশ্ন • ৩০ মিনিট • নেগেটিভ নেই',
      en: '30 questions across all papers • 30 minutes • no negative marking',
    },
    paperQuestions: 30,
    paperMinutes: 30,
    negativeMarking: false,
    markPerQuestion: 1,
    subjectMode: 'interleaved',
    note: {
      bn: 'এটি বোর্ডের হুবহু কাগজ নয় — পুরো সিলেবাসের সমন্বিত রিভিশন টেস্ট।',
      en: 'Not an exact board paper — a combined revision test across the whole syllabus.',
    },
  },
  {
    id: 'mixed-interleaved',
    kind: 'mixed',
    name: { bn: 'মিশ্র প্র্যাকটিস (Interleaved)', en: 'Mixed Practice (Interleaved)' },
    breakdown: {
      bn: 'ভিন্ন ভিন্ন অধ্যায় থেকে প্রশ্ন • ১৫ মিনিট • নেগেটিভ নেই',
      en: 'Questions from different chapters • 15 min • no negative marking',
    },
    paperQuestions: 20,
    paperMinutes: 15,
    negativeMarking: false,
    markPerQuestion: 1,
    subjectMode: 'interleaved',
    note: {
      bn: 'গবেষণায় দেখা গেছে অধ্যায় মিশিয়ে অনুশীলন করলে মনে থাকে বেশি।',
      en: 'Interleaving chapters is one of the better-evidenced study techniques.',
    },
  },
];

export function getPatternById(id: string): ExamPattern {
  return EXAM_PATTERNS.find((p) => p.id === id) ?? EXAM_PATTERNS[0];
}

/**
 * Time budget for the questions we could actually supply.
 *
 * If the bank holds 8 of a 100-question paper we still give the student the
 * real per-question pace (36s for medical) instead of a flat 60s, because pace
 * is exactly what an admission test trains. A 30s floor stops tiny sets from
 * feeling absurd.
 */
export function patternTimeFor(pattern: ExamPattern, picked: number): number {
  if (pattern.paperQuestions <= 0 || pattern.paperMinutes <= 0) {
    return picked * 60;
  }
  const secondsPerQuestion = (pattern.paperMinutes * 60) / pattern.paperQuestions;
  return Math.max(30, Math.round(picked * secondsPerQuestion));
}

/** Fisher–Yates on a copy — never mutate the imported bank. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function chapterKeyOf(q: McqQuestion): string {
  return `${q.subjectKey}::${q.chapter.bn}`;
}

/** One question per chapter first, then whatever is left, keeping the mix. */
function interleavedPick(pool: McqQuestion[], count: number): McqQuestion[] {
  const buckets = new Map<string, McqQuestion[]>();
  shuffle(pool).forEach((q) => {
    const key = chapterKeyOf(q);
    const list = buckets.get(key) ?? [];
    list.push(q);
    buckets.set(key, list);
  });

  const order = shuffle([...buckets.keys()]);
  const picked: McqQuestion[] = [];
  let round = 0;
  while (picked.length < count) {
    let added = 0;
    for (const key of order) {
      if (picked.length >= count) break;
      const bucket = buckets.get(key)!;
      if (bucket[round]) {
        picked.push(bucket[round]);
        added += 1;
      }
    }
    if (added === 0) break;
    round += 1;
  }
  return picked;
}

/**
 * Weighted pick for admission papers.
 *
 * Quotas follow the real mark distribution, then any shortfall (our bank is
 * smaller than a real paper) is topped up from unused questions so the student
 * still gets the number of questions they asked for.
 */
function weightedPick(
  pool: McqQuestion[],
  pattern: ExamPattern,
  count: number
): McqQuestion[] {
  const weights = pattern.weights ?? {};
  const subjectKeys = Object.keys(weights) as SubjectKey[];
  const totalWeight = subjectKeys.reduce((sum, key) => sum + (weights[key] ?? 0), 0);
  if (totalWeight <= 0) return shuffle(pool).slice(0, count);

  const bySubject = new Map<SubjectKey, McqQuestion[]>();
  subjectKeys.forEach((key) => {
    bySubject.set(key, shuffle(pool.filter((q) => q.subjectKey === key)));
  });

  const quotas = subjectKeys.map((key) => {
    const exact = (count * (weights[key] ?? 0)) / totalWeight;
    return { key, base: Math.floor(exact), fraction: exact - Math.floor(exact), used: 0 };
  });

  const picked: McqQuestion[] = [];
  quotas.forEach((quota) => {
    const available = bySubject.get(quota.key)!;
    const take = Math.min(quota.base, available.length);
    picked.push(...available.slice(0, take));
    quota.used = take;
  });

  // Hand out the remainder to the subjects that lost the most to rounding.
  let remaining = count - picked.length;
  const byFraction = [...quotas].sort((a, b) => b.fraction - a.fraction);
  while (remaining > 0) {
    let progressed = false;
    for (const quota of byFraction) {
      if (remaining <= 0) break;
      const available = bySubject.get(quota.key)!;
      if (quota.used < available.length) {
        picked.push(available[quota.used]);
        quota.used += 1;
        remaining -= 1;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  if (picked.length < count) {
    const used = new Set(picked.map((q) => q.id));
    const spare = shuffle(pool.filter((q) => !used.has(q.id)));
    picked.push(...spare.slice(0, count - picked.length));
  }

  return picked;
}

/**
 * Picks the questions for a pattern.
 *
 * `pool` is already filtered by subject/difficulty in the UI. Weighted patterns
 * ignore the subject filter on purpose (a medical paper is not one subject),
 * so the caller should pass the full bank for those.
 */
export function pickPatternQuestions(
  pool: McqQuestion[],
  pattern: ExamPattern,
  count: number
): McqQuestion[] {
  if (pool.length === 0) return [];
  if (pattern.subjectMode === 'interleaved') {
    return interleavedPick(pool, Math.min(count, pool.length));
  }
  if (pattern.subjectMode === 'weighted') {
    return weightedPick(pool, pattern, Math.min(count, pool.length));
  }
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

/** Marks per the pattern, including its negative marking rule. */
export function scoreForPattern(
  pattern: ExamPattern,
  correct: number,
  wrong: number,
  answered: number
): { score: number; total: number; penalty: number } {
  const total = Number((answered * pattern.markPerQuestion).toFixed(2));
  const penalty = pattern.negativeMarking
    ? Number((wrong * 0.25 * pattern.markPerQuestion).toFixed(2))
    : 0;
  const score = Number(
    Math.max(0, correct * pattern.markPerQuestion - penalty).toFixed(2)
  );
  return { score, total, penalty };
}

/** Rough hand-written section that the MCQ engine cannot test. */
export function writtenSectionLabel(pattern: ExamPattern): BilingualText | null {
  switch (pattern.id) {
    case 'hsc-board':
      return { bn: 'সৃজনশীল ৭০ নম্বর — CQ ব্যাংকে অনুশীলন করুন', en: 'Creative 70 marks — practise in the CQ bank' };
    case 'hsc-practical':
      return {
        bn: 'সৃজনশীল ৫০ + ব্যবহারিক ২৫ — CQ ও ব্যবহারিক মডিউলে',
        en: 'Creative 50 + practical 25 — in the CQ and Practical modules',
      };
    case 'buet-preli':
      return {
        bn: 'লিখিত ৪০০ নম্বর (৪০টি প্রশ্ন) — অ্যাডমিশন হাবে লিখিত কৌশল দেখুন',
        en: 'Written 400 marks (40 questions) — see the admission hub',
      };
    case 'du-ka':
      return {
        bn: 'লিখিত ৪০ + GPA ২০ — মোট ১২০ নম্বরের হিসাব',
        en: 'Written 40 + GPA 20 — 120-mark total',
      };
    default:
      return null;
  }
}
