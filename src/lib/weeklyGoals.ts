import type { ActiveTab, SubjectKey } from '../types';
import { formatNum } from './i18n';

export const WEEKLY_GOALS_STORAGE_KEY = 'hsc28_weekly_goals_v1';
export const WEEKLY_GOALS_EVENT = 'hsc28:weekly-goals-changed';

export type WeeklyGoalCategory =
  | 'deadline'
  | 'attendance'
  | 'study'
  | 'practice'
  | 'wellbeing'
  | 'review';

export interface WeeklyGoalSuggestion {
  id: string;
  category: WeeklyGoalCategory;
  priority: number;
  title: { bn: string; en: string };
  detail: { bn: string; en: string };
  actionLabel: { bn: string; en: string };
  actionTab: ActiveTab;
}

export interface WeeklyGoal extends WeeklyGoalSuggestion {
  planGoalId: string;
  completed: boolean;
  completedAt: string | null;
  carryCount: number;
}

export interface WeeklyGoalPlan {
  version: 1;
  startDate: string;
  endDate: string;
  goals: WeeklyGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyGoalSnapshot {
  weekMinutes: number;
  previousWeekMinutes: number;
  quizCount: number;
  averageAccuracy: number;
  habitDays: number;
  attendanceMarked: number;
  attendancePercent: number;
  upcoming: { title: string; daysAway: number } | null;
  weakest: {
    subjectKey: SubjectKey;
    nameBn: string;
    nameEn: string;
    average: number;
  } | null;
}

function localDateKey(date = new Date()): string {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 10);
}

function parseDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00`);
  if (!Number.isFinite(parsed.getTime()) || localDateKey(parsed) !== value) return null;
  return parsed;
}

export function addDaysToDateKey(value: string, days: number): string {
  const parsed = parseDateKey(value);
  if (!parsed) return value;
  parsed.setDate(parsed.getDate() + days);
  return localDateKey(parsed);
}

function safeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function safePercent(value: number): number {
  return Math.min(100, safeCount(value));
}

const fallbackSuggestions: WeeklyGoalSuggestion[] = [
  {
    id: 'fallback-review',
    category: 'review',
    priority: 30,
    title: { bn: '৩ দিন স্পেসড রিভিউ করো', en: 'Complete spaced reviews on 3 days' },
    detail: {
      bn: '১–৩–৭–২১ দিনের কিউ থেকে অল্প করে রিভিউ শেষ করো।',
      en: 'Clear a small part of the 1–3–7–21-day review queue each time.',
    },
    actionLabel: { bn: 'রিভিউ খোলো', en: 'Open reviews' },
    actionTab: 'routine',
  },
  {
    id: 'fallback-formulas',
    category: 'study',
    priority: 20,
    title: { bn: '৩ দিনে ১৫টি সূত্র রিভিশন', en: 'Review 15 formulas across 3 days' },
    detail: {
      bn: 'প্রতিদিন ৫টি করে সূত্র active recall-এ মনে করার চেষ্টা করো।',
      en: 'Use active recall on 5 formulas per day instead of only rereading.',
    },
    actionLabel: { bn: 'সূত্র ভল্ট', en: 'Formula vault' },
    actionTab: 'formulas',
  },
  {
    id: 'fallback-plan',
    category: 'study',
    priority: 10,
    title: { bn: 'আগামী ৭ দিনের পড়া আগে থেকে সাজাও', en: 'Plan the next 7 study days' },
    detail: {
      bn: 'অন্তত ৩টি ছোট, বাস্তবসম্মত টাস্ক প্ল্যানারে রাখো।',
      en: 'Put at least 3 small, realistic tasks in the planner.',
    },
    actionLabel: { bn: 'প্ল্যানার', en: 'Planner' },
    actionTab: 'planner',
  },
];

/** Produce a ranked, explainable goal pool from the student's real last-7-day data. */
export function suggestWeeklyGoals(snapshot: WeeklyGoalSnapshot): WeeklyGoalSuggestion[] {
  const weekMinutes = safeCount(snapshot.weekMinutes);
  const previousWeekMinutes = safeCount(snapshot.previousWeekMinutes);
  const quizCount = safeCount(snapshot.quizCount);
  const averageAccuracy = safePercent(snapshot.averageAccuracy);
  const habitDays = Math.min(7, safeCount(snapshot.habitDays));
  const attendanceMarked = safeCount(snapshot.attendanceMarked);
  const attendancePercent = safePercent(snapshot.attendancePercent);
  const candidates: WeeklyGoalSuggestion[] = [];

  if (
    snapshot.upcoming &&
    Number.isFinite(snapshot.upcoming.daysAway) &&
    snapshot.upcoming.daysAway >= 0 &&
    snapshot.upcoming.daysAway <= 14
  ) {
    const daysAway = safeCount(snapshot.upcoming.daysAway);
    const upcomingTitle = snapshot.upcoming.title.trim().slice(0, 120);
    candidates.push({
      id: 'nearest-date',
      category: 'deadline',
      priority: daysAway <= 3 ? 110 : daysAway <= 7 ? 92 : 68,
      title: {
        bn: `“${upcomingTitle || 'সামনের তারিখ'}” আগে শেষ করো`,
        en: `Finish “${upcomingTitle || 'upcoming date'}” early`,
      },
      detail: {
        bn: daysAway === 0
          ? 'তারিখটি আজ—প্রথম কাজ হিসেবে প্রস্তুতি ও প্রয়োজনীয় কাগজ যাচাই করো।'
          : `${formatNum(daysAway, 'bn')} দিন বাকি—শেষ দিনের জন্য না রেখে অন্তত ১ দিন আগে প্রস্তুত হও।`,
        en: daysAway === 0
          ? 'It is due today—check the preparation and required documents first.'
          : `${daysAway} day(s) remain; aim to be ready at least one day early.`,
      },
      actionLabel: { bn: 'তারিখ দেখো', en: 'View date' },
      actionTab: 'life',
    });
  }

  if (attendanceMarked >= 5 && attendancePercent < 75) {
    candidates.push({
      id: 'attendance-recovery',
      category: 'attendance',
      priority: 105,
      title: { bn: 'পরের ৫টি কলেজ ক্লাসে উপস্থিত থাকো', en: 'Attend the next 5 college classes' },
      detail: {
        bn: `উপস্থিতি এখন ${formatNum(attendancePercent, 'bn')}%—প্রতিদিন চিহ্নিত করলে ঝুঁকিটা পরিষ্কার থাকবে।`,
        en: `Attendance is ${attendancePercent}%; mark it daily so the recovery stays visible.`,
      },
      actionLabel: { bn: 'উপস্থিতি খোলো', en: 'Open attendance' },
      actionTab: 'life',
    });
  }

  if (quizCount === 0) {
    candidates.push({
      id: 'mcq-start',
      category: 'practice',
      priority: 100,
      title: { bn: '২টি টাইমড MCQ সেট দাও', en: 'Complete 2 timed MCQ sets' },
      detail: {
        bn: 'একটি সপ্তাহের শুরুতে, আরেকটি শেষে—ভুলের খাতায় কী বদলেছে দেখো।',
        en: 'Take one early and one late in the week, then compare the mistake bank.',
      },
      actionLabel: { bn: 'MCQ শুরু', en: 'Start MCQ' },
      actionTab: 'mcq',
    });
  } else if (averageAccuracy < 60) {
    candidates.push({
      id: 'mistake-repair',
      category: 'practice',
      priority: 98,
      title: { bn: 'ভুলের খাতা থেকে ২টি ড্রিল', en: 'Run 2 Mistake Bank drills' },
      detail: {
        bn: `নির্ভুলতা ${formatNum(averageAccuracy, 'bn')}%—নতুন প্রশ্নের আগে পুরোনো ভুল ঠিক করো।`,
        en: `Accuracy is ${averageAccuracy}%; repair old mistakes before adding new questions.`,
      },
      actionLabel: { bn: 'ভুলের খাতা', en: 'Mistake Bank' },
      actionTab: 'mcq',
    });
  } else {
    candidates.push({
      id: 'mcq-maintain',
      category: 'practice',
      priority: averageAccuracy < 75 ? 82 : 64,
      title: { bn: '৩টি টাইমড MCQ সেট দাও', en: 'Complete 3 timed MCQ sets' },
      detail: {
        bn: `বর্তমান নির্ভুলতা ${formatNum(averageAccuracy, 'bn')}%—সময় ধরে রেখে ধারাবাহিকতা বাড়াও।`,
        en: `Current accuracy is ${averageAccuracy}%; build consistency without dropping pace.`,
      },
      actionLabel: { bn: 'MCQ শুরু', en: 'Start MCQ' },
      actionTab: 'mcq',
    });
  }

  if (weekMinutes < 180) {
    candidates.push({
      id: 'study-restart',
      category: 'study',
      priority: 96,
      title: { bn: '৫ দিনে ২৫ মিনিট করে পড়ো', en: 'Study 25 minutes on 5 days' },
      detail: {
        bn: 'বড় লক্ষ্য নয়—একটি পমোডোরো শেষ করাই এই সপ্তাহের ধারাবাহিকতা।',
        en: 'Keep it small: one finished Pomodoro is enough to rebuild consistency.',
      },
      actionLabel: { bn: 'টাইমার খোলো', en: 'Open timer' },
      actionTab: 'planner',
    });
  } else {
    const improvement = weekMinutes <= previousWeekMinutes ? 60 : 30;
    const target = Math.min(900, Math.max(300, weekMinutes + improvement));
    const hours = (target / 60).toFixed(target % 60 === 0 ? 0 : 1);
    candidates.push({
      id: 'study-build',
      category: 'study',
      priority: weekMinutes < 600 ? 78 : 52,
      title: {
        bn: `আগামী ৭ দিনে ${formatNum(hours, 'bn')} ঘণ্টা পড়ো`,
        en: `Study ${hours} hours over the next 7 days`,
      },
      detail: {
        bn: `গত ৭ দিনে ${formatNum(Math.round(weekMinutes / 60), 'bn')} ঘণ্টা—একবারে নয়, ছোট ব্লকে ভাগ করো।`,
        en: `The last 7 days totalled ${Math.round(weekMinutes / 60)} hour(s); spread the target across short blocks.`,
      },
      actionLabel: { bn: 'প্ল্যানার', en: 'Planner' },
      actionTab: 'planner',
    });
  }

  if (habitDays < 4) {
    candidates.push({
      id: 'habit-reset',
      category: 'wellbeing',
      priority: 90,
      title: { bn: '৫ দিন ঘুম ও রিভিশন অভ্যাস টিক দাও', en: 'Track sleep and revision on 5 days' },
      detail: {
        bn: `গত ৭ দিনে ${formatNum(habitDays, 'bn')} দিন টার্গেট পূরণ হয়েছে—প্রথমে এই দুই অভ্যাস ঠিক করো।`,
        en: `Only ${habitDays} of 7 days met the habit target; stabilise sleep and revision first.`,
      },
      actionLabel: { bn: 'অভ্যাস খোলো', en: 'Open habits' },
      actionTab: 'life',
    });
  } else {
    candidates.push({
      id: 'habit-maintain',
      category: 'wellbeing',
      priority: 58,
      title: { bn: 'অন্তত ৫ দিন অভ্যাসের টার্গেট রাখো', en: 'Keep the habit target on at least 5 days' },
      detail: {
        bn: 'ঘুম, পানি, রিভিশন ও পরিকল্পনার ধারাবাহিকতাই পড়ার শক্তি ধরে রাখে।',
        en: 'Consistent sleep, water, revision and planning protect study energy.',
      },
      actionLabel: { bn: 'অভ্যাস খোলো', en: 'Open habits' },
      actionTab: 'life',
    });
  }

  if (snapshot.weakest && snapshot.weakest.average < 75) {
    candidates.push({
      id: `weak-${snapshot.weakest.subjectKey}`,
      category: 'review',
      priority: snapshot.weakest.average < 50 ? 94 : 84,
      title: {
        bn: `${snapshot.weakest.nameBn}-এ ২টি ছোট ড্রিল`,
        en: `Run 2 short ${snapshot.weakest.nameEn} drills`,
      },
      detail: {
        bn: `সংরক্ষিত ফলে গড় ${formatNum(snapshot.weakest.average, 'bn')}%—১০টি প্রশ্ন করে দুর্বল জায়গা ধরো।`,
        en: `Saved-result average is ${snapshot.weakest.average}%; use 10-question drills to isolate the gap.`,
      },
      actionLabel: { bn: 'অনুশীলন', en: 'Practise' },
      actionTab: 'mcq',
    });
  }

  const seen = new Set<string>();
  return [...candidates, ...fallbackSuggestions]
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
    .filter((suggestion) => {
      if (seen.has(suggestion.id)) return false;
      seen.add(suggestion.id);
      return true;
    });
}

function isTextPair(value: unknown): value is { bn: string; en: string } {
  if (!value || typeof value !== 'object') return false;
  const pair = value as Record<string, unknown>;
  return typeof pair.bn === 'string' && typeof pair.en === 'string';
}

function normalizeGoal(value: unknown): WeeklyGoal | null {
  if (!value || typeof value !== 'object') return null;
  const goal = value as Partial<WeeklyGoal>;
  const tabs: ActiveTab[] = [
    'dashboard', 'syllabus', 'formulas', 'cq', 'mcq', 'gk', 'routine', 'lab',
    'planner', 'analytics', 'hub', 'admission', 'practical', 'gpa', 'leaderboard', 'life',
  ];
  const categories: WeeklyGoalCategory[] = [
    'deadline', 'attendance', 'study', 'practice', 'wellbeing', 'review',
  ];
  if (
    typeof goal.id !== 'string' ||
    !goal.id.trim() ||
    typeof goal.planGoalId !== 'string' ||
    !goal.planGoalId.trim() ||
    !categories.includes(goal.category as WeeklyGoalCategory) ||
    !isTextPair(goal.title) ||
    !goal.title.bn.trim() ||
    !goal.title.en.trim() ||
    !isTextPair(goal.detail) ||
    !isTextPair(goal.actionLabel) ||
    !goal.actionLabel.bn.trim() ||
    !goal.actionLabel.en.trim() ||
    !tabs.includes(goal.actionTab as ActiveTab)
  ) return null;

  return {
    id: goal.id.trim().slice(0, 120),
    planGoalId: goal.planGoalId.trim().slice(0, 180),
    category: goal.category as WeeklyGoalCategory,
    priority: Math.min(1000, safeCount(goal.priority ?? 0)),
    title: { bn: goal.title.bn.slice(0, 220), en: goal.title.en.slice(0, 220) },
    detail: { bn: goal.detail.bn.slice(0, 500), en: goal.detail.en.slice(0, 500) },
    actionLabel: {
      bn: goal.actionLabel.bn.slice(0, 80),
      en: goal.actionLabel.en.slice(0, 80),
    },
    actionTab: goal.actionTab as ActiveTab,
    completed: goal.completed === true,
    completedAt: typeof goal.completedAt === 'string' ? goal.completedAt.slice(0, 40) : null,
    carryCount: Math.min(1, safeCount(goal.carryCount ?? 0)),
  };
}

export function normalizeWeeklyGoalPlan(value: unknown): WeeklyGoalPlan | null {
  if (!value || typeof value !== 'object') return null;
  const plan = value as Partial<WeeklyGoalPlan>;
  if (
    plan.version !== 1 ||
    typeof plan.startDate !== 'string' ||
    typeof plan.endDate !== 'string' ||
    !parseDateKey(plan.startDate) ||
    !parseDateKey(plan.endDate) ||
    addDaysToDateKey(plan.startDate, 6) !== plan.endDate ||
    !Array.isArray(plan.goals)
  ) return null;
  const goals = plan.goals
    .map(normalizeGoal)
    .filter((goal): goal is WeeklyGoal => Boolean(goal))
    .filter((goal, index, all) =>
      all.findIndex((item) =>
        item.planGoalId === goal.planGoalId || item.id === goal.id
      ) === index
    )
    .slice(0, 3);
  if (goals.length === 0) return null;
  return {
    version: 1,
    startDate: plan.startDate,
    endDate: plan.endDate,
    goals,
    createdAt: typeof plan.createdAt === 'string' ? plan.createdAt.slice(0, 40) : '',
    updatedAt: typeof plan.updatedAt === 'string' ? plan.updatedAt.slice(0, 40) : '',
  };
}

export function loadWeeklyGoalPlan(): WeeklyGoalPlan | null {
  try {
    const raw = localStorage.getItem(WEEKLY_GOALS_STORAGE_KEY);
    return raw ? normalizeWeeklyGoalPlan(JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function saveWeeklyGoalPlan(plan: WeeklyGoalPlan): boolean {
  let saved = true;
  let changed = false;
  try {
    const serialized = JSON.stringify(plan);
    if (localStorage.getItem(WEEKLY_GOALS_STORAGE_KEY) !== serialized) {
      localStorage.setItem(WEEKLY_GOALS_STORAGE_KEY, serialized);
      changed = true;
    }
  } catch {
    saved = false;
  }
  if (changed && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<WeeklyGoalPlan>(WEEKLY_GOALS_EVENT, { detail: plan }));
  }
  return saved;
}

function goalFromSuggestion(
  suggestion: WeeklyGoalSuggestion,
  startDate: string,
  index: number
): WeeklyGoal {
  return {
    ...suggestion,
    planGoalId: `${startDate}:${index}:${suggestion.id}`,
    completed: false,
    completedAt: null,
    carryCount: 0,
  };
}

function planIsCurrent(plan: WeeklyGoalPlan, today: string): boolean {
  return today >= plan.startDate && today <= plan.endDate;
}

export function isWeeklyGoalPlanCurrent(
  plan: WeeklyGoalPlan,
  now = new Date()
): boolean {
  return planIsCurrent(plan, localDateKey(now));
}

/**
 * Keep an active plan stable. On rollover, carry at most one unfinished goal
 * once, then fill with fresh recommendations so old work cannot pile up forever.
 */
export function resolveWeeklyGoalPlan(
  stored: WeeklyGoalPlan | null,
  suggestions: WeeklyGoalSuggestion[],
  now = new Date()
): WeeklyGoalPlan {
  const today = localDateKey(now);
  const pool = [...suggestions, ...fallbackSuggestions].filter(
    (suggestion, index, all) => all.findIndex((item) => item.id === suggestion.id) === index
  );
  const nowIso = now.toISOString();

  if (stored && planIsCurrent(stored, today)) {
    if (stored.goals.length >= 3) return stored;
    const used = new Set(stored.goals.map((goal) => goal.id));
    const fill = pool
      .filter((suggestion) => !used.has(suggestion.id))
      .slice(0, 3 - stored.goals.length)
      .map((suggestion, index) => goalFromSuggestion(suggestion, stored.startDate, stored.goals.length + index));
    return { ...stored, goals: [...stored.goals, ...fill], updatedAt: nowIso };
  }

  const carryEligible = Boolean(
    stored &&
    today > stored.endDate &&
    today <= addDaysToDateKey(stored.endDate, 7)
  );
  const carried = carryEligible
    ? (stored?.goals ?? [])
        .filter((goal) => !goal.completed && goal.carryCount < 1)
        .slice(0, 1)
        .map((goal) => ({
          ...goal,
          planGoalId: `${today}:carry:${goal.id}`,
          carryCount: goal.carryCount + 1,
          completed: false,
          completedAt: null,
        }))
    : [];
  const used = new Set(carried.map((goal) => goal.id));
  const fresh = pool
    .filter((suggestion) => !used.has(suggestion.id))
    .slice(0, 3 - carried.length)
    .map((suggestion, index) => goalFromSuggestion(suggestion, today, carried.length + index));

  // A custom/corrupt caller might supply fewer than three suggestions. The
  // built-in fallbacks guarantee the product UI still receives exactly three.
  const fallbackFill = fallbackSuggestions
    .filter((suggestion) => !used.has(suggestion.id) && !fresh.some((goal) => goal.id === suggestion.id))
    .slice(0, 3 - carried.length - fresh.length)
    .map((suggestion, index) => goalFromSuggestion(suggestion, today, carried.length + fresh.length + index));

  return {
    version: 1,
    startDate: today,
    endDate: addDaysToDateKey(today, 6),
    goals: [...carried, ...fresh, ...fallbackFill].slice(0, 3),
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function toggleWeeklyGoal(
  plan: WeeklyGoalPlan,
  planGoalId: string,
  now = new Date()
): WeeklyGoalPlan {
  const nowIso = now.toISOString();
  return {
    ...plan,
    goals: plan.goals.map((goal) =>
      goal.planGoalId === planGoalId
        ? {
            ...goal,
            completed: !goal.completed,
            completedAt: goal.completed ? null : nowIso,
          }
        : goal
    ),
    updatedAt: nowIso,
  };
}
