import type { BilingualText } from '../types';
import {
  GK_CATEGORIES,
  GK_QUESTIONS,
  GK_RAPID_ROUND_SIZE,
} from './gkBank';
import {
  ENGLISH_DRILL_CATEGORIES,
  ENGLISH_DRILL_QUESTIONS,
  ENGLISH_DRILL_ROUND_SIZE,
} from './englishDrillBank';

/** One question shape shared by every quick-drill bank. */
export interface DrillItem {
  id: string;
  category: string;
  question: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

export interface DrillCategory {
  key: string;
  bn: string;
  en: string;
}

export interface DrillBankConfig {
  key: string;
  /** Tab label in the bank switcher. */
  tabBn: string;
  tabEn: string;
  kickerBn: string;
  kickerEn: string;
  titleBn: string;
  titleEn: string;
  /** Short line under the title; `{n}` is replaced with the question count. */
  subtitleBn: string;
  subtitleEn: string;
  categories: DrillCategory[];
  questions: DrillItem[];
  roundSize: number;
  /** localStorage key for the last score of this bank. */
  storageKey: string;
  whyTitleBn: string;
  whyTitleEn: string;
  whyBn: string;
  whyEn: string;
}

/**
 * The quick-drill banks.
 *
 * Two very different subjects share one engine: GK for the medical paper's 10
 * marks and English grammar for both the HSC paper and the medical test. Adding
 * a third bank is data-only — the screen is generated from this array.
 */
export const DRILL_BANKS: DrillBankConfig[] = [
  {
    key: 'gk',
    tabBn: 'সাধারণ জ্ঞান',
    tabEn: 'General Knowledge',
    kickerBn: 'মেডিকেল প্রস্তুতি • ১০ নম্বর',
    kickerEn: 'MEDICAL PREP • 10 MARKS',
    titleBn: 'সাধারণ জ্ঞান ড্রিল',
    titleEn: 'General Knowledge Drill',
    subtitleBn:
      'MBBS ভর্তি পরীক্ষার ১০টি GK প্রশ্নের জন্য — {n}টি যাচাইযোগ্য তথ্যভিত্তিক প্রশ্ন, প্রতিটির ব্যাখ্যাসহ।',
    subtitleEn:
      '{n} fact-based questions with explanations, built for the 10 GK marks in the MBBS test.',
    categories: GK_CATEGORIES,
    questions: GK_QUESTIONS,
    roundSize: GK_RAPID_ROUND_SIZE,
    storageKey: 'hsc28_gk_last_v1',
    whyTitleBn: 'কেন আলাদা ড্রিল?',
    whyTitleEn: 'Why a separate drill?',
    whyBn:
      'HSC-র ১১টি পত্রে সাধারণ জ্ঞান নেই, কিন্তু MBBS-তে ১০ নম্বর আসে এখান থেকে। এখানে তাই শুধু স্থায়ী তথ্য আছে — তারিখ, প্রতিষ্ঠাতা, স্থান, ধ্রুবক — যেগুলো প্রতিদিন বদলায় না।',
    whyEn:
      'No HSC paper covers GK, yet it carries 10 marks in the MBBS test. Only durable facts live here — dates, founders, places, constants — so they do not go stale.',
  },
  {
    key: 'english',
    tabBn: 'ইংরেজি গ্রামার',
    tabEn: 'English Grammar',
    kickerBn: 'ইংরেজি ১ম পত্র ও মেডিকেল • নিয়ম-ভিত্তিক',
    kickerEn: 'ENGLISH PAPER & MEDICAL • RULE BASED',
    titleBn: 'ইংরেজি গ্রামার ও শব্দ ড্রিল',
    titleEn: 'English Grammar & Vocabulary Drill',
    subtitleBn:
      '{n}টি নিয়ম-ভিত্তিক প্রশ্ন — tense, preposition, vocabulary ও idiom, প্রতিটির সংক্ষিপ্ত ব্যাখ্যাসহ।',
    subtitleEn:
      '{n} rule-based questions on tense, prepositions, vocabulary and idioms, each with a short explanation.',
    categories: ENGLISH_DRILL_CATEGORIES,
    questions: ENGLISH_DRILL_QUESTIONS,
    roundSize: ENGLISH_DRILL_ROUND_SIZE,
    storageKey: 'hsc28_english_drill_last_v1',
    whyTitleBn: 'কেন নিয়ম ধরে?',
    whyTitleEn: 'Why organise by rule?',
    whyBn:
      'ইংরেজির MCQ সাধারণত মনে রাখার বিষয় নয়, নিয়ম চেনার বিষয়। একই নিয়ম বারবার এলেই ভুল কমে — তাই এক রাউন্ডে একই পরিবারের প্রশ্ন বেশি থাকে।',
    whyEn:
      'English MCQs are decided by rules more than memory. Repeating the same rule family in a round is what actually reduces mistakes.',
  },
];
