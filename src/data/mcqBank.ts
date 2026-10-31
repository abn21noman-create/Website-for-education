import type { McqQuestion, SubjectKey } from '../types';

/**
 * Lightweight handle on the MCQ bank.
 *
 * The bank itself is ~185 kB of data and only the exam screen needs it, so the
 * screen paints from these counts first and pulls the questions in a separate
 * chunk afterwards. Before this, opening `/#/mcq` had to download the whole
 * bank before anything appeared.
 *
 * `MCQ_COUNTS` is checked against the real bank in `npm run smoke`, so the
 * numbers cannot silently drift when questions are added.
 */

export const MCQ_COUNTS: Record<SubjectKey, number> = {
  physics1: 16,
  physics2: 12,
  chemistry1: 14,
  chemistry2: 13,
  math1: 15,
  math2: 11,
  biology1: 13,
  biology2: 10,
  ict: 13,
  bangla: 15,
  english: 15,
};

export const MCQ_TOTAL = Object.values(MCQ_COUNTS).reduce((sum, n) => sum + n, 0);

let cache: McqQuestion[] | null = null;

/** Downloads (once) and returns the full bank. */
export async function loadMcqBank(): Promise<McqQuestion[]> {
  if (cache) return cache;
  const mod = await import('./mcqData');
  cache = mod.MCQ_QUESTIONS;
  return cache;
}

/** Test-only: lets the smoke test compare counts with the real data. */
export function __resetMcqCache(): void {
  cache = null;
}
