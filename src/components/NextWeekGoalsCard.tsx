import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarRange, Check, Circle, RotateCcw, Target } from 'lucide-react';
import type { ActiveTab, Lang, Theme } from '../types';
import { formatNum } from '../lib/i18n';
import {
  WEEKLY_GOALS_EVENT,
  WEEKLY_GOALS_STORAGE_KEY,
  loadWeeklyGoalPlan,
  normalizeWeeklyGoalPlan,
  resolveWeeklyGoalPlan,
  saveWeeklyGoalPlan,
  toggleWeeklyGoal,
  type WeeklyGoalPlan,
  type WeeklyGoalSuggestion,
} from '../lib/weeklyGoals';

interface NextWeekGoalsCardProps {
  lang: Lang;
  theme: Theme;
  suggestions: WeeklyGoalSuggestion[];
  onNavigate: (tab: ActiveTab) => void;
}

function formatRange(start: string, end: string, lang: Lang): string {
  const locale = lang === 'bn' ? 'bn-BD' : 'en-GB';
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  return `${format.format(startDate)} – ${format.format(endDate)}`;
}

/** Three small, persisted actions distilled from the full weekly review. */
export const NextWeekGoalsCard: React.FC<NextWeekGoalsCardProps> = ({
  lang,
  theme,
  suggestions,
  onNavigate,
}) => {
  const isDark = theme === 'dark';
  const bn = lang === 'bn';
  const [plan, setPlan] = useState<WeeklyGoalPlan>(() =>
    resolveWeeklyGoalPlan(loadWeeklyGoalPlan(), suggestions)
  );
  const planRef = useRef(plan);
  const [saveBlocked, setSaveBlocked] = useState(false);

  useEffect(() => {
    planRef.current = plan;
    setSaveBlocked(!saveWeeklyGoalPlan(plan));
  }, [plan]);

  useEffect(() => {
    setPlan((current) => resolveWeeklyGoalPlan(current, suggestions));
  }, [suggestions]);

  useEffect(() => {
    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      // saveWeeklyGoalPlan dispatches in this tab too. Ignore our own exact
      // object so the persistence effect cannot echo forever.
      if (detail === planRef.current) return;
      const next = normalizeWeeklyGoalPlan(detail);
      if (next) setPlan(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== WEEKLY_GOALS_STORAGE_KEY && event.key !== null) return;
      setPlan(resolveWeeklyGoalPlan(loadWeeklyGoalPlan(), suggestions));
    };
    window.addEventListener(WEEKLY_GOALS_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(WEEKLY_GOALS_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [suggestions]);

  const completed = plan.goals.filter((goal) => goal.completed).length;
  const progress = Math.round((completed / Math.max(1, plan.goals.length)) * 100);

  const resetPlan = () => {
    // Passing no stored plan discards manual completion and rebuilds from the
    // latest review snapshot. The confirmation prevents an accidental reset.
    if (
      !window.confirm(
        bn
          ? 'বর্তমান লক্ষ্যগুলোর টিক মুছে নতুন সাজেশন বসাবেন?'
          : 'Replace these goals and clear their completion ticks?'
      )
    ) return;
    setPlan(resolveWeeklyGoalPlan(null, suggestions));
  };

  return (
    <section
      data-weekly-goals="true"
      className={`rounded-2xl border p-4 sm:p-5 ${
        isDark
          ? 'bg-slate-800/60 border-slate-700/65 card-soft-dark'
          : 'bg-white/90 border-slate-200/80 card-soft-light'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
            {bn ? 'রিভিউ থেকে পরের পদক্ষেপ' : 'FROM REVIEW TO ACTION'}
          </p>
          <h3 className={`mt-1 text-sm sm:text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <Target className="w-4 h-4 text-indigo-500" />
            {bn ? 'আগামী ৭ দিনের ৩টি লক্ষ্য' : '3 goals for the next 7 days'}
          </h3>
          <p className={`mt-1 text-[10px] font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <CalendarRange className="w-3.5 h-3.5" />
            {formatRange(plan.startDate, plan.endDate, lang)}
            {plan.goals.some((goal) => goal.carryCount > 0) && (
              <span className={`ml-1 rounded-full px-2 py-0.5 ${isDark ? 'bg-amber-500/15 text-amber-200' : 'bg-amber-100 text-amber-800'}`}>
                {bn ? '১টি আগের লক্ষ্য রাখা' : '1 goal carried over'}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={resetPlan}
          className={`no-print min-h-11 inline-flex items-center gap-1.5 rounded-xl border px-3 text-[10px] font-bold ${
            isDark
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700/60'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {bn ? 'নতুন সাজেশন' : 'Refresh goals'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`h-2 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
          role="progressbar"
          aria-label={bn ? 'সাপ্তাহিক লক্ষ্য পূরণ' : 'Weekly goal completion'}
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={completed}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-[11px] font-mono font-extrabold tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {formatNum(completed, lang)}/{formatNum(plan.goals.length, lang)}
        </span>
      </div>

      <ol className="mt-4 space-y-2.5">
        {plan.goals.map((goal, index) => (
          <li
            key={goal.planGoalId}
            data-weekly-goal={goal.id}
            className={`rounded-xl border p-3 sm:p-3.5 ${
              goal.completed
                ? isDark
                  ? 'border-emerald-400/25 bg-emerald-500/8'
                  : 'border-emerald-200 bg-emerald-50/65'
                : isDark
                  ? 'border-slate-700 bg-slate-900/35'
                  : 'border-slate-200 bg-slate-50/65'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                aria-pressed={goal.completed}
                aria-label={
                  goal.completed
                    ? (bn ? `${goal.title.bn} অসম্পূর্ণ করুন` : `Mark ${goal.title.en} incomplete`)
                    : (bn ? `${goal.title.bn} সম্পন্ন করুন` : `Complete ${goal.title.en}`)
                }
                onClick={() => setPlan((current) => toggleWeeklyGoal(current, goal.planGoalId))}
                className={`w-11 h-11 shrink-0 rounded-xl border grid place-items-center ${
                  goal.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isDark
                      ? 'border-slate-600 bg-slate-800 text-slate-400 hover:border-indigo-400'
                      : 'border-slate-300 bg-white text-slate-400 hover:border-indigo-400'
                }`}
              >
                {goal.completed ? <Check className="w-5 h-5" /> : <Circle className="w-4 h-4" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 text-[10px] font-mono font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatNum(index + 1, lang)}.
                  </span>
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-extrabold leading-snug ${
                      goal.completed
                        ? isDark ? 'text-emerald-200 line-through' : 'text-emerald-800 line-through'
                        : isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {goal.title[lang]}
                    </h4>
                    <p className={`mt-1 text-[10px] sm:text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {goal.detail[lang]}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(goal.actionTab)}
                aria-label={goal.actionLabel[lang]}
                className={`no-print min-h-11 shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold ${
                  isDark
                    ? 'bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <span className="hidden sm:inline">{goal.actionLabel[lang]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <p
        className={`mt-3 min-h-4 text-[9px] leading-relaxed ${
          saveBlocked
            ? isDark ? 'text-amber-300' : 'text-amber-700'
            : isDark ? 'text-slate-500' : 'text-slate-400'
        }`}
        role="status"
        aria-live="polite"
      >
        {saveBlocked
          ? (bn
              ? 'লক্ষ্যগুলো এখন দেখা যাচ্ছে, কিন্তু ব্রাউজার স্থায়ীভাবে সেভ করতে দেয়নি।'
              : 'Goals are visible for now, but the browser blocked permanent storage.')
          : (bn
              ? 'টিকগুলো এই ডিভাইস ও Cloud Vault-এ সেভ হয়; অসম্পূর্ণ একটি লক্ষ্য একবার পরের সপ্তাহে থাকবে।'
              : 'Ticks save here and in Cloud Vault; one unfinished goal can carry over once.')}
      </p>
    </section>
  );
};

export default NextWeekGoalsCard;
