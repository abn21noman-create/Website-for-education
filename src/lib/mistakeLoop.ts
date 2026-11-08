import { CHAPTERS } from '../data/syllabusData';
import { dailyFocus } from './trackProgress';
import type { DailyFocus, TrackKey } from './trackProgress';
import { mcqChapter } from './mcqChapters';
import type { ChapterProgressState, McqQuestion } from '../types';

/**
 * From a wrong or skipped MCQ to "this is tomorrow's main block".
 *
 * The mistake bank keeps ids for questions answered incorrectly or skipped. This module
 * turns those ids into chapters, so the daily main-track block can start with the
 * chapter the student is missing most often instead of a generic suggestion.
 * When a track has no mistakes yet, the block falls back to the chapter furthest
 * behind in the tracker.
 */

export interface ChapterMistake {
  /** Null when the question's chapter title has no match in the HSC syllabus. */
  chapterId: string | null;
  /** HSC paper key or an admission-only section such as `medical-gk`. */
  subjectKey: string;
  chapterBn: string;
  chapterEn: string;
  /** IDs support a targeted review when an admission section has no HSC chapter. */
  questionIds: string[];
  /** Count of questions answered wrongly or left blank in the mistake bank. */
  missedCount: number;
}

const normalise = (text: string) =>
  text
    .replace(/[\s\u200c\u200d.,;:!?'"‘’“”()\-–—/]/g, '')
    .toLowerCase();

/** Looks up the stable syllabus chapter, including historical label aliases. */
export function chapterIdForQuestion(question: McqQuestion): string | null {
  return mcqChapter(question)?.id ?? null;
}

/** Groups wrong and skipped questions by chapter, highest miss count first. */
export function mistakesByChapter(
  questionIds: string[],
  questions: McqQuestion[]
): ChapterMistake[] {
  if (questionIds.length === 0 || questions.length === 0) return [];
  const wanted = new Set(questionIds);
  const buckets = new Map<string, ChapterMistake>();

  for (const question of questions) {
    if (!wanted.has(question.id)) continue;
    const canonicalChapter = mcqChapter(question);
    const chapterId = canonicalChapter?.id ?? null;
    const key = chapterId || `${question.subjectKey}::${normalise(question.chapter.bn)}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.missedCount += 1;
      existing.questionIds.push(question.id);
    } else {
      buckets.set(key, {
        chapterId,
        subjectKey: question.subjectKey,
        chapterBn: canonicalChapter?.title.bn ?? question.chapter.bn,
        chapterEn: canonicalChapter?.title.en ?? question.chapter.en,
        questionIds: [question.id],
        missedCount: 1,
      });
    }
  }

  return [...buckets.values()].sort(
    (a, b) => b.missedCount - a.missedCount || a.chapterBn.localeCompare(b.chapterBn)
  );
}

export interface MainBlockSuggestion extends DailyFocus {
  /** Why this chapter: it has the most wrong/skipped MCQs, or is furthest behind. */
  reason: 'mistakes' | 'gap';
  missedCount: number;
  chapterId?: string;
  chapterBn?: string;
  chapterEn?: string;
  subtitleBn: string;
  subtitleEn: string;
}

const STAGES: (keyof ChapterProgressState)[] = ['theoryDone', 'notesDone', 'mcqDone', 'cqDone'];

function stagesDone(state?: ChapterProgressState): number {
  if (!state) return 0;
  return STAGES.reduce((sum, stage) => sum + (state[stage] ? 1 : 0), 0);
}

/** The chapter of this paper that has the least done in the tracker. */
function furthestBehind(subjectKey: string, progressMap: Record<string, ChapterProgressState>) {
  const chapters = CHAPTERS.filter((chapter) => chapter.subjectKey === subjectKey).sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );
  if (chapters.length === 0) return null;
  let best = chapters[0];
  let bestDone = stagesDone(progressMap[best.id]);
  for (const chapter of chapters) {
    const done = stagesDone(progressMap[chapter.id]);
    if (done < bestDone) {
      best = chapter;
      bestDone = done;
    }
  }
  return best;
}

export function mainBlockSuggestion(
  primary: TrackKey,
  progressMap: Record<string, ChapterProgressState>,
  questionIds: string[],
  questions: McqQuestion[],
  minutes?: number
): MainBlockSuggestion {
  const base = dailyFocus(primary, progressMap, minutes);
  const paperMistakes = mistakesByChapter(questionIds, questions).filter(
    (mistake) => mistake.subjectKey === base.subjectKey
  );

  if (paperMistakes.length > 0) {
    const worst = paperMistakes[0];
    return {
      ...base,
      reason: 'mistakes',
      missedCount: worst.missedCount,
      chapterId: worst.chapterId ?? undefined,
      chapterBn: worst.chapterBn,
      chapterEn: worst.chapterEn,
      titleBn: `মূল ট্র্যাক ব্লক — ${worst.chapterBn}`,
      titleEn: `Main-track block — ${worst.chapterEn}`,
      subtitleBn: `মকে ${worst.missedCount}টি ভুল/ছেড়ে আসা MCQ এই অধ্যায়ে — তাই এটাই আজকের প্রথম ব্লক।`,
      subtitleEn: `${worst.missedCount} missed MCQ${worst.missedCount === 1 ? '' : 's'} here in mocks — so this chapter opens the day.`,
      whyBn: `${base.whyBn} ভুলের জায়গাটা আগে ঠিক না করলে একই ভুল পরের মকেও ফিরে আসে।`,
      whyEn: `${base.whyEn} Fixing the exact place you slip is what stops the same mistake returning in the next mock.`,
    };
  }

  const gap = furthestBehind(base.subjectKey, progressMap);
  if (!gap) return { ...base, reason: 'gap', missedCount: 0, subtitleBn: '', subtitleEn: '' };

  return {
    ...base,
    reason: 'gap',
    missedCount: 0,
    chapterId: gap.id,
    chapterBn: gap.title.bn,
    chapterEn: gap.title.en,
    titleBn: `মূল ট্র্যাক ব্লক — ${gap.title.bn}`,
    titleEn: `Main-track block — ${gap.title.en}`,
    subtitleBn: 'এখনো সবচেয়ে পিছিয়ে থাকা অধ্যায় — আজ এখানেই শুরু।',
    subtitleEn: 'The chapter furthest behind in your tracker — start the day here.',
  };
}

export interface MistakeReportRow extends ChapterMistake {
  /** Two or more missed MCQs in the same chapter — it keeps coming back. */
  repeated: boolean;
  /** How many of the four syllabus stages are already done. */
  stagesDone: number;
}

export interface MistakeReport {
  totalMissed: number;
  chapters: MistakeReportRow[];
  papers: { subjectKey: string; count: number }[];
  repeatedChapters: number;
  adviceBn: string;
  adviceEn: string;
}

/**
 * The weekly picture of the mistake bank: which chapters are carrying the
 * damage, which papers they come from, and whether a chapter keeps repeating.
 */
export function mistakeReport(
  questionIds: string[],
  questions: McqQuestion[],
  progressMap: Record<string, ChapterProgressState>
): MistakeReport {
  const chapters = mistakesByChapter(questionIds, questions).map((row) => ({
    ...row,
    repeated: row.missedCount >= 2,
    stagesDone: row.chapterId ? stagesDone(progressMap[row.chapterId]) : 0,
  }));

  const perPaper = new Map<string, number>();
  for (const row of chapters) {
    perPaper.set(row.subjectKey, (perPaper.get(row.subjectKey) || 0) + row.missedCount);
  }
  const papers = [...perPaper.entries()]
    .map(([subjectKey, count]) => ({ subjectKey, count }))
    .sort((a, b) => b.count - a.count);

  const totalMissed = chapters.reduce((sum, row) => sum + row.missedCount, 0);
  const repeatedChapters = chapters.filter((row) => row.repeated).length;
  const worst = chapters[0];

  let adviceBn = 'ভুল/ছেড়ে আসা প্রশ্নের ব্যাংক খালি — আবার অনুশীলনের কিছু নেই। মক দিয়ে শুরু করো।';
  let adviceEn = 'The mistake bank is empty — no MCQs to revisit. Start with a mock.';
  if (worst) {
    adviceBn = `সবচেয়ে বেশি মিস “${worst.chapterBn}” (${worst.missedCount}টি ভুল/ছেড়ে আসা MCQ)${
      repeatedChapters > 0 ? `; ${repeatedChapters}টি অধ্যায়ে ভুল ফিরে আসছে` : ''
    }। ১০টি প্রশ্নের ড্রিল দিয়ে ওটাই আগে সারাও।`;
    adviceEn = `Most missed MCQs are in “${worst.chapterEn}” (${worst.missedCount})${
      repeatedChapters > 0 ? `; ${repeatedChapters} chapter(s) keep repeating` : ''
    }. Clear it with a 10-question drill first.`;
  }

  return { totalMissed, chapters, papers, repeatedChapters, adviceBn, adviceEn };
}
