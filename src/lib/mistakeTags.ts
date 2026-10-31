import type { BilingualText } from '../types';

/**
 * Why did the answer go wrong?
 *
 * Error analysis is only useful if the *reason* is stored, not just the
 * question id. A student who lost marks to a calculation slip needs different
 * practice from one who never read the chapter. Kept local (per device) and
 * deliberately tiny — one reason per question, last answer wins.
 */

export type MistakeReason = 'concept' | 'calculation' | 'notStudied' | 'rushed';

export interface MistakeReasonMeta {
  id: MistakeReason;
  label: BilingualText;
  advice: BilingualText;
}

export const MISTAKE_REASONS: MistakeReasonMeta[] = [
  {
    id: 'concept',
    label: { bn: 'ধারণা ভুল', en: 'Concept unclear' },
    advice: {
      bn: 'ধারণা আগে পরিষ্কার করুন — ওই অধ্যায়ের ব্যাখ্যা ও সূত্র দেখে নিন, তারপর ৫টি সহজ প্রশ্ন দিন।',
      en: 'Clear the concept first — re-read that chapter’s explanation and formulas, then do 5 easy questions.',
    },
  },
  {
    id: 'calculation',
    label: { bn: 'হিসাব ভুল', en: 'Calculation slip' },
    advice: {
      bn: 'হিসাবের গতি বাড়ান — ক্যালকুলেটর ছাড়া ১০টি সংখ্যাভিত্তিক সমস্যা ধাপে ধাপে লিখুন।',
      en: 'Build calculation speed — solve 10 numerical problems step by step without a calculator.',
    },
  },
  {
    id: 'notStudied',
    label: { bn: 'পড়া হয়নি', en: 'Not studied yet' },
    advice: {
      bn: 'অধ্যায়টি এখনো পড়া হয়নি — সিলেবাস ট্র্যাকারে চিহ্নিত করুন, আজ ১০ মিনিট দিয়ে শুরু করুন।',
      en: 'That chapter is still unread — mark it in the syllabus tracker and start with 10 minutes today.',
    },
  },
  {
    id: 'rushed',
    label: { bn: 'তাড়াহুড়া', en: 'Rushed' },
    advice: {
      bn: 'সময় ভাগ করুন — প্রতি প্রশ্নে ১ মিনিট, আটকে গেলে ফ্ল্যাগ দিয়ে পরে ফিরুন।',
      en: 'Budget the clock — about a minute per question, flag and come back when stuck.',
    },
  },
];

export const MISTAKE_TAG_KEY = 'hsc28_mistake_reasons_v1';

const VALID: MistakeReason[] = ['concept', 'calculation', 'notStudied', 'rushed'];

export function loadMistakeReasons(): Record<string, MistakeReason> {
  try {
    const raw = localStorage.getItem(MISTAKE_TAG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, MistakeReason> = {};
    Object.entries(parsed).forEach(([id, value]) => {
      if (typeof value === 'string' && VALID.includes(value as MistakeReason)) {
        out[id] = value as MistakeReason;
      }
    });
    return out;
  } catch {
    return {};
  }
}

/** Sets (or clears) the reason for one question and returns the new store. */
export function saveMistakeReason(
  questionId: string,
  reason: MistakeReason | null
): Record<string, MistakeReason> {
  const next = { ...loadMistakeReasons() };
  if (reason) next[questionId] = reason;
  else delete next[questionId];
  try {
    localStorage.setItem(MISTAKE_TAG_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked — the in-memory copy still renders */
  }
  return next;
}

export interface MistakeSummary {
  total: number;
  counts: Record<MistakeReason, number>;
  top: MistakeReason | null;
  advice: BilingualText | null;
}

/** Summarises the reasons tagged for the questions just answered. */
export function mistakeSummary(
  questionIds: string[],
  store: Record<string, MistakeReason>
): MistakeSummary {
  const counts: Record<MistakeReason, number> = {
    concept: 0,
    calculation: 0,
    notStudied: 0,
    rushed: 0,
  };
  let total = 0;

  questionIds.forEach((id) => {
    const reason = store[id];
    if (reason) {
      counts[reason] += 1;
      total += 1;
    }
  });

  // Order is deliberate: study a gap beats a slip, a slip beats an unread
  // chapter, and rushing is the last thing to fix.
  const priority: MistakeReason[] = ['concept', 'calculation', 'notStudied', 'rushed'];
  let top: MistakeReason | null = null;
  priority.forEach((reason) => {
    if (counts[reason] > 0 && (top === null || counts[reason] > counts[top])) {
      top = reason;
    }
  });

  return {
    total,
    counts,
    top,
    advice: top ? MISTAKE_REASONS.find((r) => r.id === top)!.advice : null,
  };
}
