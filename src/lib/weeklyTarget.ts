import { CHAPTERS } from '../data/syllabusData';
import {
  classSlotsForDay,
  dateForDayNumber,
  dayNumberForDate,
  phaseForDay,
  TOTAL_PLAN_DAYS,
} from './masterRoutine';
import type { PhaseKey } from './masterRoutine';
import { mockTestsBetween } from './mockPlan';
import type { ChapterProgressState, QuizAttemptRecord, SubjectKey } from '../types';

/**
 * HSC weekly target and the automatic week report.
 *
 * The plan already says which two papers run each class day; this module turns
 * one calendar week of that plan into something a student can hold in their
 * head: these chapters, this many MCQs, this many CQs — and then reports back
 * honestly on what actually happened.
 *
 * The same code covers the admission phase: the papers simply become the
 * admission rotation, so nothing has to be re-learned once HSC is over.
 */

/** Weekly study budget the report is measured against. */
export const WEEKLY_HOURS = 25;

/** The app's per-paper weekly question quota — matches a paper's bank size. */
export const WEEKLY_MCQ_QUOTA = 15;
export const WEEKLY_CQ_QUOTA = 2;

export interface WeekChapterTarget {
  chapterId: string;
  chapterBn: string;
  chapterEn: string;
  /** 0–4 of the syllabus stages ticked. */
  stagesDone: number;
  done: boolean;
}

export interface WeekPaperTarget {
  subjectKey: SubjectKey;
  subjectBn: string;
  subjectEn: string;
  chapters: WeekChapterTarget[];
  doneChapters: number;
}

export interface WeekTarget {
  weekNumber: number;
  fromDay: number;
  toDay: number;
  fromKey: string;
  toKey: string;
  phase: PhaseKey | null;
  papers: WeekPaperTarget[];
  chaptersTotal: number;
  chaptersDone: number;
  mcqQuota: number;
  cqQuota: number;
  percent: number;
  noteBn: string;
  noteEn: string;
}

const STAGES: (keyof ChapterProgressState)[] = ['theoryDone', 'notesDone', 'mcqDone', 'cqDone'];

const stagesDone = (state?: ChapterProgressState) =>
  state ? STAGES.reduce((sum, stage) => sum + (state[stage] ? 1 : 0), 0) : 0;

/** Saturday→Friday window that holds the given day. */
export function weekWindowForDay(dayNumber: number): { fromDay: number; toDay: number } {
  const weekIndex = Math.floor((dayNumber - 1) / 7);
  const fromDay = weekIndex * 7 + 1;
  return { fromDay, toDay: Math.min(TOTAL_PLAN_DAYS, fromDay + 6) };
}

export function weekTarget(
  startDate: string,
  dateKey: string,
  progressMap: Record<string, ChapterProgressState>
): WeekTarget | null {
  const day = dayNumberForDate(startDate, dateKey);
  if (day === null) return null;
  const { fromDay, toDay } = weekWindowForDay(day);
  const phase = phaseForDay(day)?.key ?? null;

  const papers = new Map<SubjectKey, WeekPaperTarget>();
  for (let d = fromDay; d <= toDay; d += 1) {
    for (const slot of classSlotsForDay(d)) {
      if (!papers.has(slot.subjectKey)) {
        papers.set(slot.subjectKey, {
          subjectKey: slot.subjectKey,
          subjectBn: slot.subjectBn,
          subjectEn: slot.subjectEn,
          chapters: [],
          doneChapters: 0,
        });
      }
      const paper = papers.get(slot.subjectKey)!;
      if (!slot.chapterId) continue;
      if (paper.chapters.some((chapter) => chapter.chapterId === slot.chapterId)) continue;
      const chapter = CHAPTERS.find((item) => item.id === slot.chapterId);
      const stages = stagesDone(progressMap[slot.chapterId]);
      paper.chapters.push({
        chapterId: slot.chapterId,
        chapterBn: chapter ? chapter.title.bn : slot.chapterBn,
        chapterEn: chapter ? chapter.title.en : slot.chapterEn,
        stagesDone: stages,
        done: stages === STAGES.length,
      });
    }
  }

  const paperList = [...papers.values()];
  for (const paper of paperList) {
    paper.doneChapters = paper.chapters.filter((chapter) => chapter.done).length;
  }

  const chaptersTotal = paperList.reduce((sum, paper) => sum + paper.chapters.length, 0);
  const chaptersDone = paperList.reduce((sum, paper) => sum + paper.doneChapters, 0);
  const isRevisionWeek = classSlotsForDay(fromDay + 6).length === 0 && paperList.length === 0;

  const noteBn = isRevisionWeek
    ? 'এই সপ্তাহে নতুন ক্লাস নেই — শুক্রবারের রিভিশন আর মক টেস্টই কাজ।'
    : phase === 'academic'
      ? 'HSC সপ্তাহ: নিচের অধ্যায়গুলো এই সপ্তাহের দুই পত্র, সাথে প্রতি পত্রে ১৫টি MCQ আর ২টি CQ।'
      : 'ভর্তি সপ্তাহ: এই পত্রগুলো এখন সলভিং ও মক দিয়ে ধারালো করার সময়।';
  const noteEn = isRevisionWeek
    ? 'No new classes this week — Friday’s revision and the mock test are the work.'
    : phase === 'academic'
      ? 'HSC week: these are the papers for the week, with 15 MCQs and 2 CQs per paper.'
      : 'Admission week: these papers are now sharpened through solving and mocks.';

  return {
    weekNumber: Math.floor((day - 1) / 7) + 1,
    fromDay,
    toDay,
    fromKey: dateForDayNumber(startDate, fromDay),
    toKey: dateForDayNumber(startDate, toDay),
    phase,
    papers: paperList,
    chaptersTotal,
    chaptersDone,
    mcqQuota: WEEKLY_MCQ_QUOTA * paperList.length,
    cqQuota: WEEKLY_CQ_QUOTA * paperList.length,
    percent: chaptersTotal === 0 ? 0 : Math.round((chaptersDone / chaptersTotal) * 100),
    noteBn,
    noteEn,
  };
}

export interface WeekReport {
  weekNumber: number;
  minutesDone: number;
  minutesTarget: number;
  tasksTicked: number;
  reviewsTicked: number;
  chaptersDone: number;
  chaptersTotal: number;
  mcqQuota: number;
  cqQuota: number;
  mocksScheduled: number;
  mocksPassed: number;
  verdict: 'onTrack' | 'behind' | 'empty';
  linesBn: string[];
  linesEn: string[];
}

/**
 * What the week actually looked like. Takes the stored maps so it stays a pure
 * function and can be tested without a browser.
 */
export function weekReport(
  target: WeekTarget | null,
  minutes: Record<string, number>,
  tasks: Record<string, boolean>,
  startDate: string,
  todayKey: string
): WeekReport | null {
  if (!target) return null;

  let minutesDone = 0;
  let tasksTicked = 0;
  let reviewsTicked = 0;
  for (const key of Object.keys(tasks)) {
    if (!tasks[key]) continue;
    const [dateKey, slotRaw] = key.split('|');
    if (!dateKey || dateKey < target.fromKey || dateKey > target.toKey) continue;
    tasksTicked += 1;
    if (slotRaw === 'due' || slotRaw === 'rev') reviewsTicked += 1;
  }
  for (const dateKey of Object.keys(minutes)) {
    if (dateKey < target.fromKey || dateKey > target.toKey) continue;
    minutesDone += minutes[dateKey] || 0;
  }

  // 25 h a week, spread over the days that have already happened.
  const todayDay = dayNumberForDate(startDate, todayKey);
  const weekLength = target.toDay - target.fromDay + 1;
  const elapsed = Math.max(
    1,
    Math.min(weekLength, todayDay === null ? weekLength : todayDay - target.fromDay + 1)
  );
  const minutesTarget = Math.round(((WEEKLY_HOURS * 60) / 7) * elapsed);

  const mocks = mockTestsBetween(target.fromDay, target.toDay);
  const mocksPassed = mocks.filter(
    (mock) => dateForDayNumber(startDate, mock.dayNumber) <= todayKey
  ).length;

  const verdict: WeekReport['verdict'] =
    minutesDone === 0 && tasksTicked === 0
      ? 'empty'
      : minutesDone >= minutesTarget * 0.85
        ? 'onTrack'
        : 'behind';

  const hours = Math.round((minutesDone / 60) * 10) / 10;
  const percent = Math.round((minutesDone / Math.max(1, minutesTarget)) * 100);
  const linesBn = [
    `পড়া: ${hours} ঘণ্টা (লক্ষ্যের ${percent}%)`,
    `টিক: ${tasksTicked}টি কাজ, তার মধ্যে ${reviewsTicked}টি রিভিশন ও স্পেসড রিভিউ`,
    `অধ্যায়: ${target.chaptersDone}/${target.chaptersTotal} পুরো শেষ · এই সপ্তাহের কোটা ${target.mcqQuota}টি MCQ, ${target.cqQuota}টি CQ`,
    mocks.length > 0
      ? `মক: ${mocks.length}টি নির্ধারিত, ${mocksPassed}টির দিন পার হয়েছে`
      : 'মক: এই সপ্তাহে নির্ধারিত কিছু নেই',
  ];
  const linesEn = [
    `Study: ${hours} h (${percent}% of target)`,
    `Ticked: ${tasksTicked} tasks, ${reviewsTicked} of them revision or spaced reviews`,
    `Chapters: ${target.chaptersDone}/${target.chaptersTotal} fully done · quota ${target.mcqQuota} MCQs, ${target.cqQuota} CQs`,
    mocks.length > 0
      ? `Mocks: ${mocks.length} scheduled, ${mocksPassed} already past their date`
      : 'Mocks: nothing scheduled this week',
  ];

  return {
    weekNumber: target.weekNumber,
    minutesDone,
    minutesTarget,
    tasksTicked,
    reviewsTicked,
    chaptersDone: target.chaptersDone,
    chaptersTotal: target.chaptersTotal,
    mcqQuota: target.mcqQuota,
    cqQuota: target.cqQuota,
    mocksScheduled: mocks.length,
    mocksPassed,
    verdict,
    linesBn,
    linesEn,
  };
}

// ── Board-style result → next week's quota ────────────────────────────────

export interface PaperScore {
  subjectKey: SubjectKey;
  accuracy: number;
  attempts: number;
  lastAt: string;
}

/**
 * The latest accuracy per paper, from real attempts (weekly board-style mocks,
 * drills, admission mocks). 'all' attempts are skipped because they cannot be
 * blamed on one paper.
 */
export function paperScores(history: QuizAttemptRecord[]): PaperScore[] {
  const byPaper = new Map<SubjectKey, PaperScore>();
  for (const attempt of history) {
    if (attempt.subjectKey === 'all') continue;
    const key = attempt.subjectKey;
    const existing = byPaper.get(key);
    if (!existing) {
      byPaper.set(key, {
        subjectKey: key,
        accuracy: attempt.accuracy,
        attempts: 1,
        lastAt: attempt.createdAt,
      });
      continue;
    }
    if (attempt.createdAt > existing.lastAt) {
      existing.accuracy = attempt.accuracy;
      existing.lastAt = attempt.createdAt;
    }
    existing.attempts += 1;
  }
  return [...byPaper.values()].sort((a, b) => a.accuracy - b.accuracy);
}

export type PaperPriority = 'urgent' | 'watch' | 'steady' | 'strong';

export interface AdjustedPaper extends WeekPaperTarget {
  score: PaperScore | null;
  /** 1 = the normal quota; above 1 means "this paper needs more this week". */
  weight: number;
  mcqQuota: number;
  cqQuota: number;
  extraMinutes: number;
  priority: PaperPriority;
}

export interface WeekAdjustment {
  papers: AdjustedPaper[];
  /** Papers that scored below the pass line — they lead the week. */
  urgent: AdjustedPaper[];
  hasResults: boolean;
  noteBn: string;
  noteEn: string;
}

const weightFor = (accuracy: number): number => {
  if (accuracy < 50) return 1.6;
  if (accuracy < 65) return 1.35;
  if (accuracy < 80) return 1.1;
  return 0.9;
};

const priorityFor = (accuracy: number): PaperPriority => {
  if (accuracy < 50) return 'urgent';
  if (accuracy < 65) return 'watch';
  if (accuracy < 80) return 'steady';
  return 'strong';
};

/**
 * Reweights this week's papers by last week's results: a paper scored below 50%
 * gets a 1.6× quota and leads the list, a paper above 80% gets a little less so
 * the weak papers have room. The 15 MCQ / 2 CQ base stays fixed.
 */
export function adjustWeekTarget(target: WeekTarget, scores: PaperScore[]): WeekAdjustment {
  const scoreOf = new Map(scores.map((score) => [score.subjectKey, score]));

  const papers: AdjustedPaper[] = target.papers.map((paper) => {
    const score = scoreOf.get(paper.subjectKey) ?? null;
    const weight = score ? weightFor(score.accuracy) : 1;
    return {
      ...paper,
      score,
      weight,
      mcqQuota: Math.max(5, Math.round(WEEKLY_MCQ_QUOTA * weight)),
      cqQuota: Math.max(1, Math.round(WEEKLY_CQ_QUOTA * weight)),
      extraMinutes: Math.max(0, Math.round((weight - 1) * 30)),
      priority: score ? priorityFor(score.accuracy) : 'steady',
    };
  });

  // Weakest papers lead, untouched papers keep the plan's order.
  const rank: Record<PaperPriority, number> = { urgent: 0, watch: 1, steady: 2, strong: 3 };
  papers.sort((a, b) => rank[a.priority] - rank[b.priority] || b.weight - a.weight);

  const urgent = papers.filter((paper) => paper.priority === 'urgent');
  const hasResults = scores.length > 0;
  const worst = urgent[0] || papers.find((paper) => paper.priority === 'watch');

  const noteBn = !hasResults
    ? 'এখনো কোনো মক/প্র্যাকটিসের ফল নেই — ফ্রাইডের মক দিলে পরের সপ্তাহের কোটা নিজে থেকেই বদলাবে।'
    : worst
      ? `${worst.subjectBn}-এ শেষ ফল ${Math.round(worst.score?.accuracy ?? 0)}% — তাই এই সপ্তাহে এর কোটা বাড়ানো হয়েছে (${worst.mcqQuota} MCQ, ${worst.cqQuota} CQ, +${worst.extraMinutes} মিনিট)।`
      : 'সব পত্রে ফল ভালো — কোটা স্বাভাবিক রাখা হয়েছে, শুধু ধরে রাখো।';
  const noteEn = !hasResults
    ? 'No results yet — finish Friday’s mock and next week’s quotas adjust themselves.'
    : worst
      ? `${worst.subjectEn} last scored ${Math.round(worst.score?.accuracy ?? 0)}%, so its quota is raised this week (${worst.mcqQuota} MCQs, ${worst.cqQuota} CQs, +${worst.extraMinutes} min).`
      : 'Every paper is scoring well — quotas stay normal; just hold the line.';

  return { papers, urgent, hasResults, noteBn, noteEn };
}
