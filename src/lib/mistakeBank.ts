import type { McqQuestion } from '../types';

export interface MistakeAttemptClassification {
  correctIds: string[];
  wrongIds: string[];
  skippedIds: string[];
  /** Wrong and skipped IDs stay in the bank until answered correctly. */
  addIds: string[];
  /** Existing bank entries are cleared only by a correct answer. */
  removeIds: string[];
}

/** Classify one submitted MCQ set, keeping skipped questions distinct from wrong answers. */
export function classifyMistakeAttempt(
  questions: Pick<McqQuestion, 'id' | 'correctIndex'>[],
  answers: Record<string, number>,
  existingIds: readonly string[]
): MistakeAttemptClassification {
  const correctIds: string[] = [];
  const wrongIds: string[] = [];
  const skippedIds: string[] = [];

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer === undefined) skippedIds.push(question.id);
    else if (answer === question.correctIndex) correctIds.push(question.id);
    else wrongIds.push(question.id);
  });

  const existing = new Set(existingIds);
  return {
    correctIds,
    wrongIds,
    skippedIds,
    addIds: [...wrongIds, ...skippedIds],
    removeIds: correctIds.filter((id) => existing.has(id)),
  };
}
