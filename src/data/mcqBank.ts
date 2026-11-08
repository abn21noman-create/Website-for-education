import type { McqQuestion, SubjectKey } from '../types';
import { GK_CATEGORIES, GK_QUESTIONS } from './gkBank';

/**
 * MCQ bank, split per paper.
 *
 * Every paper is its own module so a single-paper drill downloads only that
 * paper's questions instead of the whole bank. Weighted patterns
 * (BUET / medical / DU) and mixed practice need several papers, so they ask
 * for more loaders at once — the cache means each paper is fetched only once
 * per session.
 *
 * `MCQ_COUNTS` mirrors the real files; `npm run smoke` fails if the two drift.
 */

export const ALL_SUBJECT_KEYS: SubjectKey[] = [
  'physics1',
  'physics2',
  'chemistry1',
  'chemistry2',
  'math1',
  'math2',
  'biology1',
  'biology2',
  'ict',
  'bangla',
  'english',
];

export const MCQ_COUNTS: Record<SubjectKey, number> = {
  physics1: 30,
  physics2: 16,
  chemistry1: 16,
  chemistry2: 17,
  math1: 16,
  math2: 15,
  biology1: 16,
  biology2: 14,
  ict: 16,
  bangla: 17,
  english: 19,
};

export const MCQ_TOTAL = Object.values(MCQ_COUNTS).reduce((sum, n) => sum + n, 0);

/**
 * Map the separate medical GK practice bank into the common exam-question
 * shape. It stays an admission section rather than borrowing ICT's subject key.
 */
export const MEDICAL_GK_MCQ: McqQuestion[] = GK_QUESTIONS.map((question) => {
  const category = GK_CATEGORIES.find((item) => item.key === question.category)!;
  return {
    id: question.id,
    subjectKey: 'medical-gk',
    chapter: { bn: category.bn, en: category.en },
    question: question.question,
    options: [
      question.options[0],
      question.options[1],
      question.options[2],
      question.options[3],
    ],
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    boardTag: { bn: 'মেডিকেল ভর্তি অনুশীলন', en: 'Medical admission practice' },
    difficulty: 'medium',
  };
});

type SubjectModule = { default: McqQuestion[] };

const LOADERS: Record<SubjectKey, () => Promise<SubjectModule>> = {
  physics1: () => import('./mcq/physics1'),
  physics2: () => import('./mcq/physics2'),
  chemistry1: () => import('./mcq/chemistry1'),
  chemistry2: () => import('./mcq/chemistry2'),
  math1: () => import('./mcq/math1'),
  math2: () => import('./mcq/math2'),
  biology1: () => import('./mcq/biology1'),
  biology2: () => import('./mcq/biology2'),
  ict: () => import('./mcq/ict'),
  bangla: () => import('./mcq/bangla'),
  english: () => import('./mcq/english'),
};

const cache = new Map<SubjectKey, McqQuestion[]>();

/** Loads one paper (cached for the session). */
export async function loadMcqSubject(key: SubjectKey): Promise<McqQuestion[]> {
  const cached = cache.get(key);
  if (cached) return cached;
  const mod = await LOADERS[key]();
  cache.set(key, mod.default);
  return mod.default;
}

/** Loads the papers named, in parallel, and returns them combined. */
export async function loadMcqSubjects(keys: SubjectKey[]): Promise<McqQuestion[]> {
  const unique = [...new Set(keys)];
  const lists = await Promise.all(unique.map(loadMcqSubject));
  return lists.flat();
}

/** The whole bank — only used when a paper genuinely spans every subject. */
export async function loadAllMcq(): Promise<McqQuestion[]> {
  return loadMcqSubjects(ALL_SUBJECT_KEYS);
}

/** Whole practice bank, including the separate medical-admission GK section. */
export async function loadAllExamQuestions(): Promise<McqQuestion[]> {
  return [...(await loadAllMcq()), ...MEDICAL_GK_MCQ];
}

/** Test-only cache reset. */
export function __resetMcqCache(): void {
  cache.clear();
}
