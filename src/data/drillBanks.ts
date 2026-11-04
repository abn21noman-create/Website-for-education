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
 * Two very different subjects share one engine: GK practice for one part of
 * the medical paper's 15-mark GK/aptitude/human-qualities section, and English
 * grammar for both the HSC paper and the medical test. Adding
 * a third bank is data-only — the screen is generated from this array.
 */
export const DRILL_BANKS: DrillBankConfig[] = [
  {
    key: 'gk',
    tabBn: 'সাধারণ জ্ঞান',
    tabEn: 'General Knowledge',
    kickerBn: 'মেডিকেল প্রস্তুতি • ১৫ নম্বর',
    kickerEn: 'MEDICAL PREP • 15 MARKS',
    titleBn: 'সাধারণ জ্ঞান ড্রিল',
    titleEn: 'General Knowledge Drill',
    subtitleBn:
      'MBBS-এর GK/aptitude/human qualities-এর ১৫ নম্বর অংশ অনুশীলনে {n}টি তথ্যভিত্তিক প্রশ্ন; পুরো অংশের বিকল্প নয়।',
    subtitleEn:
      '{n} fact-based practice questions for the 15-mark MBBS GK/aptitude/human qualities section; they do not cover the whole section.',
    categories: GK_CATEGORIES,
    questions: GK_QUESTIONS,
    roundSize: GK_RAPID_ROUND_SIZE,
    storageKey: 'hsc28_gk_last_v1',
    whyTitleBn: 'কেন আলাদা ড্রিল?',
    whyTitleEn: 'Why a separate drill?',
    whyBn:
      'HSC-র ১১টি পত্রে সাধারণ জ্ঞান নেই, কিন্তু সর্বশেষ ২০২৫–২৬ MBBS পরীক্ষায় GK/aptitude/human qualities মিলিয়ে ১৫ নম্বর ছিল। এই ড্রিলে শুধু স্থায়ী তথ্য আছে — তারিখ, প্রতিষ্ঠাতা, স্থান, ধ্রুবক — তাই এটি পুরো অংশের বিকল্প নয়।',
    whyEn:
      'No HSC paper covers GK, while the latest published 2025–26 MBBS test assigned 15 marks to GK, aptitude and human qualities. This drill covers durable facts only — dates, founders, places and constants — so it is not a substitute for the whole section.',
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
