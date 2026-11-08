import type { SubjectKey } from '../types';

/**
 * One-click "10 questions from this chapter".
 *
 * The routine screen cannot start a drill itself, so it drops a small request in
 * localStorage and navigates to the MCQ screen; the exam screen picks the
 * request up on mount, clears it, and starts a timed 10-question run on that
 * chapter. Keeping it in storage means the request survives the route change.
 */

export const CHAPTER_DRILL_KEY = 'hsc28_chapter_drill_v1';

export interface ChapterDrillRequest {
  /** Omitted for a hand-picked list that spans papers. */
  subjectKey?: SubjectKey;
  chapterBn: string;
  chapterEn: string;
  chapterId?: string;
  count: number;
  createdAt: string;
  /** Set when the drill is a hand-picked list (e.g. confident-but-wrong). */
  questionIds?: string[];
  /** Optional heading override for such a list. */
  titleBn?: string;
  titleEn?: string;
}

export function requestChapterDrill(
  request: Omit<ChapterDrillRequest, 'createdAt'> & { createdAt?: string }
): void {
  try {
    const payload: ChapterDrillRequest = {
      ...request,
      createdAt: request.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(CHAPTER_DRILL_KEY, JSON.stringify(payload));
  } catch {
    /* private mode — the button then simply does nothing */
  }
}

/** Reads and clears the pending request, so it runs exactly once. */
export function takeChapterDrill(): ChapterDrillRequest | null {
  try {
    const raw = localStorage.getItem(CHAPTER_DRILL_KEY);
    if (!raw) return null;
    localStorage.removeItem(CHAPTER_DRILL_KEY);
    const parsed = JSON.parse(raw) as Partial<ChapterDrillRequest>;
    if (typeof parsed.chapterBn !== 'string') return null;
    return {
      subjectKey: (parsed.subjectKey as SubjectKey) || undefined,
      chapterBn: parsed.chapterBn,
      chapterEn: parsed.chapterEn || parsed.chapterBn,
      chapterId: parsed.chapterId,
      count: Math.max(1, Math.min(30, Number(parsed.count) || 10)),
      createdAt: parsed.createdAt || new Date().toISOString(),
      questionIds: Array.isArray(parsed.questionIds)
        ? parsed.questionIds.filter((id): id is string => typeof id === 'string')
        : undefined,
      titleBn: parsed.titleBn,
      titleEn: parsed.titleEn,
    };
  } catch {
    return null;
  }
}
