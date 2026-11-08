import type { McqQuestion } from '../types';
import type { ChapterDrillRequest } from './chapterDrill';
import { mcqMatchesChapter } from './mcqChapters';

/**
 * Pick the requested questions inside the lazy MCQ route.
 *
 * Kept separate from `chapterDrill.ts` because Dashboard and Routine only need
 * to write a tiny route request; importing the full chapter inventory there
 * would add it to the initial application bundle.
 */
export function pickChapterQuestions<T extends McqQuestion>(
  questions: T[],
  request: ChapterDrillRequest
): T[] {
  if (request.questionIds && request.questionIds.length > 0) {
    const order = new Map(request.questionIds.map((id, index) => [id, index]));
    return questions
      .filter((question) => order.has(question.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      .slice(0, request.count);
  }

  const pool = questions.filter((question) => {
    if (request.subjectKey && question.subjectKey !== request.subjectKey) return false;
    if (request.chapterId) return mcqMatchesChapter(question, request.chapterId);

    // Legacy requests created before chapter IDs were added still work. Trim
    // whitespace so harmless label formatting cannot make a route silently fail.
    return question.chapter.bn.trim() === request.chapterBn.trim();
  });
  return pool.slice(0, request.count);
}
