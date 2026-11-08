import { CHAPTERS } from '../data/syllabusData';
import type { ChapterItem, McqQuestion, SubjectKey } from '../types';

/**
 * Stable chapter identity for MCQs.
 *
 * The question bank grew in several batches, so a few otherwise-correct labels
 * use shorter spellings (for example "মহাকর্ষ" instead of the syllabus title
 * "মহাকর্ষ ও অভিকর্ষ"). UI filters and routine deep links must not depend on
 * those display strings being byte-for-byte identical. This module resolves
 * both canonical titles and known historical aliases to the chapter IDs used
 * by the syllabus tracker.
 */

const compact = (value: string): string =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[\s&:(),’‘'".\/–—-]+/g, '');

type AliasEntries = Partial<Record<SubjectKey, Array<[label: string, chapterId: string]>>>;

const ALIAS_ENTRIES: AliasEntries = {
  physics1: [['মহাকর্ষ', 'phy1-ch6']],
  physics2: [
    ['স্থির তড়িৎ', 'phy2-ch2'],
    ['নিউক্লিয়ার পদার্থবিজ্ঞান', 'phy2-ch9'],
    ['তড়িৎ প্রবাহের ক্রিয়া', 'phy2-ch4'],
    ['আধুনিক পদার্থবিজ্ঞান', 'phy2-ch8'],
    ['ধারকত্ব', 'phy2-ch2'],
    ['তড়িৎ চৌম্বকীয় আবেশ', 'phy2-ch5'],
  ],
  chemistry1: [
    ['মৌলের পর্যায়বৃত্ত ধর্ম', 'chem1-ch3'],
    ['রাসায়নিক বন্ধন', 'chem1-ch3'],
    ['মৌলের শ্রেণিবিন্যাস', 'chem1-ch3'],
    ['মোল ও অ্যাভোগাড্রো সংখ্যা', 'chem1-ch4'],
    ['মোল ও রসায়নিক গণনা', 'chem1-ch4'],
  ],
  chemistry2: [
    ['জৈব রসায়ন: হাইড্রোকার্বন', 'chem2-ch2'],
    ['জৈব রসায়ন: আইইউপিএসি নামকরণ', 'chem2-ch2'],
    ['জৈব রসায়ন: সম্পৃক্ততা', 'chem2-ch2'],
    ['জৈব রসায়ন: এস্টার', 'chem2-ch2'],
    ['পরিমাণগত রসায়ন: pH', 'chem2-ch3'],
    ['পরিমাণগত রসায়ন: pH', 'chem2-ch3'],
    ['জারণ-বিজারণ', 'chem2-ch4'],
  ],
  math1: [['ত্রিকোণমিতি', 'math1-ch6']],
  math2: [
    ['বহুপদী সমীকরণ', 'math2-ch4'],
    ['সম্ভাবনা', 'math2-ch10'],
  ],
  biology1: [['সালোকসংশ্লেষণ', 'bio1-ch9']],
  biology2: [
    ['প্রাণীর পরিচিতি', 'bio2-ch2'],
    ['মানব শারীরতত্ত্ব: রক্ত ও সংবহন', 'bio2-ch4'],
    ['রক্ত ও সঞ্চালন', 'bio2-ch4'],
    ['রেচন ও নিষ্কাশন', 'bio2-ch6'],
    ['সমন্বয় ও নিয়ন্ত্রণ', 'bio2-ch8'],
    ['সমন্বয় ও নিয়ন্ত্রণ', 'bio2-ch8'],
    ['শ্বসন ও রেচন', 'bio2-ch5'],
  ],
  ict: [
    ['ডিজিটাল ডিভাইস', 'ict-ch3'],
    ['সংখ্যা পদ্ধতি', 'ict-ch3'],
    ['Number Systems', 'ict-ch3'],
    ['ডিজিটাল ডিভাইস ও লজিক গেট', 'ict-ch3'],
    ['কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং', 'ict-ch2'],
    ['ডেটাবেস ম্যানেজমেন্ট', 'ict-ch6'],
    ['HTML', 'ict-ch4'],
    ['Input & Output Devices', 'ict-ch1'],
  ],
  bangla: [
    ['গদ্য: অপরিচিতা', 'ban-ch1'],
    ['পদ্য: সোনার তরী ও বিদ্রোহী', 'ban-ch2'],
    ['বাংলা ২য় পত্র: বানান শুদ্ধিকরণ', 'ban-ch4'],
    ['বানান শুদ্ধিকরণ', 'ban-ch4'],
    ['ণত্ব বিধান', 'ban-ch4'],
    ['বাংলা ২য় পত্র: সমাস ও উপসর্গ', 'ban-ch5'],
    ['সন্ধি: গুণ ও স্বরসন্ধি', 'ban-ch5'],
    ['কারক ও বিভক্তি', 'ban-ch5'],
    ['সমাস', 'ban-ch5'],
    ['উপসর্গ', 'ban-ch5'],
    ['প্রকৃতি ও প্রত্যয়', 'ban-ch5'],
    ['ক্রিয়ার কাল', 'ban-ch5'],
    ['বচন', 'ban-ch5'],
    ['সমার্থক শব্দ', 'ban-ch5'],
    ['ভাষা: সমার্থক শব্দ', 'ban-ch5'],
  ],
  english: [
    ['Right Form of Verbs', 'eng-ch4'],
    ['Completing Sentences', 'eng-ch3'],
    ['Conditionals', 'eng-ch3'],
    ['Correlative Conjunctions', 'eng-ch3'],
    ['Subject-Verb Agreement', 'eng-ch4'],
    ['Grammar: Subject-Verb Agreement', 'eng-ch4'],
    ['Subjunctive Mood', 'eng-ch3'],
    ['Hardly / Scarcely', 'eng-ch3'],
    ['Voice Change', 'eng-ch4'],
    ['Grammar: Passive Voice', 'eng-ch4'],
    ['Preposition', 'eng-ch3'],
    ['Articles', 'eng-ch3'],
    ['Grammar: Gerund', 'eng-ch3'],
    ['Synonyms & Antonyms', 'eng-ch5'],
    ['Vocabulary: Synonyms', 'eng-ch5'],
  ],
};

const aliasMaps = new Map<SubjectKey, Map<string, string>>();
for (const [subjectKey, entries] of Object.entries(ALIAS_ENTRIES) as Array<
  [SubjectKey, Array<[string, string]>]
>) {
  aliasMaps.set(
    subjectKey,
    new Map(entries.map(([label, chapterId]) => [compact(label), chapterId]))
  );
}

const chaptersBySubject = new Map<SubjectKey, ChapterItem[]>();
for (const chapter of CHAPTERS) {
  const list = chaptersBySubject.get(chapter.subjectKey) ?? [];
  list.push(chapter);
  chaptersBySubject.set(chapter.subjectKey, list);
}

/** Resolve one bank question to the canonical syllabus chapter, when possible. */
export function mcqChapter(question: McqQuestion): ChapterItem | null {
  if (question.subjectKey === 'medical-gk') return null;

  const aliases = aliasMaps.get(question.subjectKey);
  const aliasId =
    aliases?.get(compact(question.chapter.bn)) ?? aliases?.get(compact(question.chapter.en));
  if (aliasId) return CHAPTERS.find((chapter) => chapter.id === aliasId) ?? null;

  const subjectChapters = chaptersBySubject.get(question.subjectKey) ?? [];
  const bn = compact(question.chapter.bn);
  const en = compact(question.chapter.en);
  return (
    subjectChapters.find(
      (chapter) => compact(chapter.title.bn) === bn || compact(chapter.title.en) === en
    ) ?? null
  );
}

/** True when a question belongs to the selected canonical syllabus chapter. */
export function mcqMatchesChapter(question: McqQuestion, chapterId: string): boolean {
  return mcqChapter(question)?.id === chapterId;
}

export interface McqChapterInventoryItem {
  chapter: ChapterItem;
  count: number;
}

/** Ordered chapter counts for one paper; empty chapters stay out of the drill picker. */
export function mcqChapterInventory(
  questions: McqQuestion[],
  subjectKey: SubjectKey
): McqChapterInventoryItem[] {
  const counts = new Map<string, number>();
  for (const question of questions) {
    if (question.subjectKey !== subjectKey) continue;
    const chapter = mcqChapter(question);
    if (!chapter) continue;
    counts.set(chapter.id, (counts.get(chapter.id) ?? 0) + 1);
  }

  return (chaptersBySubject.get(subjectKey) ?? [])
    .map((chapter) => ({ chapter, count: counts.get(chapter.id) ?? 0 }))
    .filter((item) => item.count > 0);
}

/** Number of syllabus chapters in one paper, used for honest coverage copy. */
export function syllabusChapterCount(subjectKey: SubjectKey): number {
  return chaptersBySubject.get(subjectKey)?.length ?? 0;
}
