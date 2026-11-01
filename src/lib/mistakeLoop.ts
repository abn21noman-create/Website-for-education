import { CHAPTERS } from '../data/syllabusData';
import { dailyFocus } from './trackProgress';
import type { DailyFocus, TrackKey } from './trackProgress';
import type { ChapterProgressState, McqQuestion } from '../types';

/**
 * From "wrong in a mock" to "this is tomorrow's main block".
 *
 * The mistake bank keeps the ids of every question answered wrongly. This module
 * turns those ids into chapters, so the daily main-track block can start with the
 * chapter the student is actually getting wrong instead of a generic suggestion.
 * When a track has no mistakes yet, the block falls back to the chapter furthest
 * behind in the tracker.
 */

export interface ChapterMistake {
  /** Null when the question's chapter title has no match in the syllabus. */
  chapterId: string | null;
  subjectKey: string;
  chapterBn: string;
  chapterEn: string;
  wrongCount: number;
}

const normalise = (text: string) =>
  text
    .replace(/[\s\u200c\u200d.,;:!?'"‘’“”()\-–—/]/g, '')
    .toLowerCase();

/** Looks up the syllabus chapter for a question, by exact title then by name. */
export function chapterIdForQuestion(question: McqQuestion): string | null {
  const bn = normalise(question.chapter.bn);
  const en = normalise(question.chapter.en);
  const match = CHAPTERS.find(
    (chapter) =>
      chapter.subjectKey === question.subjectKey &&
      (normalise(chapter.title.bn) === bn || normalise(chapter.title.en) === en)
  );
  return match ? match.id : null;
}

/** Groups wrongly answered questions by chapter, worst chapter first. */
export function mistakesByChapter(
  questionIds: string[],
  questions: McqQuestion[]
): ChapterMistake[] {
  if (questionIds.length === 0 || questions.length === 0) return [];
  const wanted = new Set(questionIds);
  const buckets = new Map<string, ChapterMistake>();

  for (const question of questions) {
    if (!wanted.has(question.id)) continue;
    const chapterId = chapterIdForQuestion(question);
    const key = chapterId || `${question.subjectKey}::${normalise(question.chapter.bn)}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.wrongCount += 1;
    } else {
      buckets.set(key, {
        chapterId,
        subjectKey: question.subjectKey,
        chapterBn: question.chapter.bn,
        chapterEn: question.chapter.en,
        wrongCount: 1,
      });
    }
  }

  return [...buckets.values()].sort(
    (a, b) => b.wrongCount - a.wrongCount || a.chapterBn.localeCompare(b.chapterBn)
  );
}

export interface MainBlockSuggestion extends DailyFocus {
  /** Why this chapter: it is being answered wrongly, or it is simply furthest behind. */
  reason: 'mistakes' | 'gap';
  wrongCount: number;
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
      wrongCount: worst.wrongCount,
      chapterId: worst.chapterId ?? undefined,
      chapterBn: worst.chapterBn,
      chapterEn: worst.chapterEn,
      titleBn: `মূল ট্র্যাক ব্লক — ${worst.chapterBn}`,
      titleEn: `Main-track block — ${worst.chapterEn}`,
      subtitleBn: `মক-এ ${worst.wrongCount}টি ভুল এই অধ্যায়ে — তাই এটাই আজকের প্রথম ব্লক।`,
      subtitleEn: `${worst.wrongCount} wrong answer${worst.wrongCount === 1 ? '' : 's'} here in mocks — so this chapter opens the day.`,
      whyBn: `${base.whyBn} ভুলের জায়গাটা আগে ঠিক না করলে একই ভুল পরের মকেও ফিরে আসে।`,
      whyEn: `${base.whyEn} Fixing the exact place you slip is what stops the same mistake returning in the next mock.`,
    };
  }

  const gap = furthestBehind(base.subjectKey, progressMap);
  if (!gap) return { ...base, reason: 'gap', wrongCount: 0, subtitleBn: '', subtitleEn: '' };

  return {
    ...base,
    reason: 'gap',
    wrongCount: 0,
    chapterId: gap.id,
    chapterBn: gap.title.bn,
    chapterEn: gap.title.en,
    titleBn: `মূল ট্র্যাক ব্লক — ${gap.title.bn}`,
    titleEn: `Main-track block — ${gap.title.en}`,
    subtitleBn: 'এখনো সবচেয়ে পিছিয়ে থাকা অধ্যায় — আজ এখানেই শুরু।',
    subtitleEn: 'The chapter furthest behind in your tracker — start the day here.',
  };
}
