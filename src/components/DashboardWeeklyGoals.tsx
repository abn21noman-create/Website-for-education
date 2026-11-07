import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Circle, Target } from 'lucide-react';
import type { ActiveTab, Lang, Theme } from '../types';
import { formatNum } from '../lib/i18n';
import {
  WEEKLY_GOALS_EVENT,
  WEEKLY_GOALS_STORAGE_KEY,
  isWeeklyGoalPlanCurrent,
  loadWeeklyGoalPlan,
  normalizeWeeklyGoalPlan,
  saveWeeklyGoalPlan,
  toggleWeeklyGoal,
  type WeeklyGoalPlan,
} from '../lib/weeklyGoals';

interface DashboardWeeklyGoalsProps {
  lang: Lang;
  theme: Theme;
  onNavigate: (tab: ActiveTab) => void;
}

/** Compact daily reminder for a plan created in the full weekly review. */
export const DashboardWeeklyGoals: React.FC<DashboardWeeklyGoalsProps> = ({
  lang,
  theme,
  onNavigate,
}) => {
  const isDark = theme === 'dark';
  const bn = lang === 'bn';
  const [plan, setPlan] = useState<WeeklyGoalPlan | null>(() => loadWeeklyGoalPlan());
  const [saveBlocked, setSaveBlocked] = useState(false);

  useEffect(() => {
    const onChanged = (event: Event) => {
      const next = normalizeWeeklyGoalPlan((event as CustomEvent<unknown>).detail);
      if (next) setPlan(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== WEEKLY_GOALS_STORAGE_KEY && event.key !== null) return;
      setPlan(loadWeeklyGoalPlan());
    };
    window.addEventListener(WEEKLY_GOALS_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(WEEKLY_GOALS_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!plan) return null;

  const current = isWeeklyGoalPlanCurrent(plan);
  const completed = plan.goals.filter((goal) => goal.completed).length;
  const nextGoal = plan.goals.find((goal) => !goal.completed) ?? null;

  const toggle = () => {
    if (!nextGoal) return;
    const next = toggleWeeklyGoal(plan, nextGoal.planGoalId);
    setPlan(next);
    setSaveBlocked(!saveWeeklyGoalPlan(next));
  };

  return (
    <section
      data-dashboard-weekly-goals="true"
      className={`rounded-2xl border p-4 sm:p-5 ${
        isDark ? 'bg-slate-800/65 border-slate-700/65' : 'bg-white/95 border-slate-200/80'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-extrabold">
            {bn ? 'আগামী ৭ দিনের লক্ষ্য' : 'Your next-7-day goals'}
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
            completed === 3
              ? isDark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
              : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {formatNum(completed, lang)}/{formatNum(plan.goals.length, lang)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="min-h-11 inline-flex items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 hover:underline"
        >
          {bn ? 'সব ৩টি দেখো' : 'View all 3'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {!current ? (
        <div className={`mt-3 rounded-xl border border-dashed p-3 ${isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700'}`}>
          <p className="text-xs font-bold">
            {bn ? 'পুরোনো ৭ দিনের সময় শেষ হয়েছে।' : 'That seven-day window has ended.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('analytics')}
            className="mt-2 min-h-11 rounded-lg bg-indigo-600 px-3 text-[10px] font-bold text-white"
          >
            {bn ? 'নতুন ৩টি লক্ষ্য বানাও' : 'Build 3 fresh goals'}
          </button>
        </div>
      ) : nextGoal ? (
        <div className={`mt-3 flex items-start gap-3 rounded-xl border p-3 ${
          isDark ? 'border-slate-700 bg-slate-900/35' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <button
            type="button"
            onClick={toggle}
            aria-label={bn ? `${nextGoal.title.bn} সম্পন্ন করুন` : `Complete ${nextGoal.title.en}`}
            className={`w-11 h-11 shrink-0 grid place-items-center rounded-xl border ${
              isDark
                ? 'border-slate-600 bg-slate-800 text-slate-400 hover:border-emerald-400'
                : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-500'
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-extrabold leading-snug">{nextGoal.title[lang]}</p>
            <p className={`mt-1 text-[10px] sm:text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {nextGoal.detail[lang]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(nextGoal.actionTab)}
            aria-label={nextGoal.actionLabel[lang]}
            className={`min-h-11 shrink-0 rounded-lg px-2.5 text-[10px] font-bold ${
              isDark ? 'bg-indigo-500/15 text-indigo-200' : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            <span className="hidden sm:inline">{nextGoal.actionLabel[lang]}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:hidden" />
          </button>
        </div>
      ) : (
        <div className={`mt-3 flex items-center gap-2 rounded-xl border p-3 ${
          isDark ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}>
          <span className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center shrink-0">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold">{bn ? 'তিনটি লক্ষ্যই সম্পন্ন!' : 'All three goals complete!'}</p>
            <p className="text-[10px] mt-0.5">{bn ? 'এই গতি ধরে রাখো—পরের window-তে নতুন লক্ষ্য আসবে।' : 'Keep the rhythm; the next window will bring fresh goals.'}</p>
          </div>
        </div>
      )}

      {saveBlocked && (
        <p className={`mt-2 text-[9px] ${isDark ? 'text-amber-300' : 'text-amber-700'}`} role="status">
          {bn ? 'টিকটি এখন দেখা যাচ্ছে, তবে ব্রাউজার সেভ করতে দেয়নি।' : 'The tick is visible, but the browser blocked storage.'}
        </p>
      )}
    </section>
  );
};

export default DashboardWeeklyGoals;
