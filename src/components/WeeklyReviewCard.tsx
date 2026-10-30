import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  Clock,
  FileCheck2,
  HeartPulse,
  CalendarCheck2,
  Printer,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import type { ActiveTab, Lang, QuizAttemptRecord, StudySessionRecord, Theme } from '../types';
import { formatNum } from '../lib/i18n';
import {
  LIFE_DATA_EVENT,
  HABIT_TARGET,
  attendanceForMonth,
  daysUntil,
  lastNDays,
  loadLifeData,
  localDateKey,
  type LifeData,
} from '../lib/lifeStore';

interface WeeklyReviewCardProps {
  lang: Lang;
  theme: Theme;
  quizHistory: QuizAttemptRecord[];
  sessions: StudySessionRecord[];
  onNavigate: (tab: ActiveTab) => void;
}

const DAY_LABELS = {
  bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

/**
 * "এই সপ্তাহে কী হলো" — one honest summary that pulls the whole app together:
 * study minutes, MCQ practice, habits, college attendance and what is coming up.
 * It reads the Life Hub document straight from storage so the two screens never
 * disagree.
 */
export const WeeklyReviewCard: React.FC<WeeklyReviewCardProps> = ({
  lang,
  theme,
  quizHistory,
  sessions,
  onNavigate,
}) => {
  const bn = lang === 'bn';
  const isDark = theme === 'dark';
  const [life, setLife] = useState<LifeData>(() => loadLifeData());

  useEffect(() => {
    const reload = () => setLife(loadLifeData());
    window.addEventListener(LIFE_DATA_EVENT, reload);
    // Another tab may have written the document.
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(LIFE_DATA_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const prevStart = new Date(today);
    prevStart.setDate(prevStart.getDate() - 13);

    const within = (iso: string, from: Date, to?: Date) => {
      const t = new Date(iso).getTime();
      return t >= from.getTime() && (!to || t < to.getTime());
    };

    const weekSessions = sessions.filter((s) => within(s.createdAt, weekStart));
    const prevSessions = sessions.filter((s) => within(s.createdAt, prevStart, weekStart));
    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const prevMinutes = prevSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const weekQuizzes = quizHistory.filter((q) => within(q.createdAt, weekStart));
    const prevQuizzes = quizHistory.filter((q) => within(q.createdAt, prevStart, weekStart));
    const avgAcc = weekQuizzes.length
      ? Math.round(weekQuizzes.reduce((sum, q) => sum + q.accuracy, 0) / weekQuizzes.length)
      : 0;
    const prevAcc = prevQuizzes.length
      ? Math.round(prevQuizzes.reduce((sum, q) => sum + q.accuracy, 0) / prevQuizzes.length)
      : 0;

    const days = lastNDays(7);
    const minutesByDay = days.map((day) =>
      sessions
        .filter((s) => localDateKey(new Date(s.createdAt)) === day)
        .reduce((sum, s) => sum + s.durationMinutes, 0)
    );
    const habitDays = days.filter((day) => (life.habits[day] ?? []).length >= HABIT_TARGET).length;
    const habitsTicked = days.reduce((sum, day) => sum + (life.habits[day] ?? []).length, 0);

    const attendance = attendanceForMonth(life.attendance);

    const upcoming = [
      ...life.deadlines
        .filter((d) => !d.done)
        .map((d) => ({ id: d.id, title: d.title, date: d.date, kind: 'deadline' as const })),
      ...life.exams.map((e) => ({ id: e.id, title: e.title, date: e.date, kind: 'exam' as const })),
    ]
      .filter((item) => {
        const left = daysUntil(item.date);
        return left >= 0 && left <= 14;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    const nextClassToday = [...life.routine]
      .filter((slot) => slot.day === new Date().getDay())
      .sort((a, b) => a.start.localeCompare(b.start))[0];

    return {
      days,
      minutesByDay,
      weekMinutes,
      prevMinutes,
      weekQuizzes,
      avgAcc,
      prevAcc,
      habitDays,
      habitsTicked,
      attendance,
      upcoming,
      nextClassToday,
    };
  }, [sessions, quizHistory, life]);

  const tips = useMemo(() => {
    const out: { tone: 'good' | 'warn' | 'info'; text: string }[] = [];

    if (stats.weekMinutes < 180) {
      out.push({
        tone: 'warn',
        text: bn
          ? 'এই সপ্তাহে পড়ার সময় কম। প্রতিদিন একটি ২৫ মিনিটের পমোডোরো দিয়ে শুরু করুন — প্ল্যানারে টাইমার আছে।'
          : 'Study time is low this week. Start with one 25-minute Pomodoro a day — the Planner has a timer.',
      });
    } else if (stats.weekMinutes >= 600) {
      out.push({
        tone: 'good',
        text: bn
          ? 'দুর্দান্ত ধারাবাহিকতা — এই সপ্তাহে ১০ ঘণ্টার বেশি পড়েছেন। এই গতি ধরে রাখুন, কিন্তু একদিন পুরো বিশ্রামও নিন।'
          : 'Great consistency — over 10 hours this week. Keep it up, but take one full rest day.',
      });
    }

    if (stats.weekQuizzes.length === 0) {
      out.push({
        tone: 'info',
        text: bn
          ? 'এই সপ্তাহে কোনো MCQ পরীক্ষা দেওয়া হয়নি। সপ্তাহে অন্তত ২টি টাইমড সেট দিলে ভুলগুলো ধরা পড়ে।'
          : 'No MCQ test this week. Two timed sets a week is enough to surface mistakes early.',
      });
    } else if (stats.avgAcc < 60) {
      out.push({
        tone: 'warn',
        text: bn
          ? `MCQ নির্ভুলতা ${stats.avgAcc}% — ৬০%-এর নিচে। মিস্টেক ব্যাংক থেকে ভুল প্রশ্নগুলো আবার দিন, নতুন প্রশ্ন নয়।`
          : `MCQ accuracy is ${stats.avgAcc}% — below 60. Revise the Mistake Bank before attempting new questions.`,
      });
    }

    if (stats.habitDays < 4) {
      out.push({
        tone: 'warn',
        text: bn
          ? `৭ দিনের মধ্যে ${stats.habitDays} দিনই অভ্যাসের টার্গেট পূরণ হয়েছে। ঘুম ও রিভিশন — এই দুটি আগে ঠিক করুন।`
          : `Habit target met on only ${stats.habitDays} of 7 days. Fix sleep and revision first.`,
      });
    }

    if (stats.attendance.marked >= 5 && stats.attendance.pct < 75) {
      out.push({
        tone: 'warn',
        text: bn
          ? `কলেজে উপস্থিতি ${stats.attendance.pct}% — বোর্ড ফর্মের জন্য ঝুঁকি। লাইফ হাবে প্রতিদিনের উপস্থিতি লিখে রাখুন।`
          : `College attendance is ${stats.attendance.pct}% — a risk for board eligibility. Track it daily in the Life Hub.`,
      });
    }

    if (stats.upcoming.length > 0) {
      const first = stats.upcoming[0];
      out.push({
        tone: 'info',
        text: bn
          ? `সামনে ${stats.upcoming.length}টি তারিখ আছে; সবচেয়ে কাছেরটি "${first.title}" — ${daysUntil(first.date)} দিন বাকি।`
          : `${stats.upcoming.length} date(s) coming up; nearest is "${first.title}" in ${daysUntil(first.date)} day(s).`,
      });
    }

    if (out.length === 0) {
      out.push({
        tone: 'good',
        text: bn
          ? 'সব ঠিক আছে — পড়া, অভ্যাস ও উপস্থিতি তিনটেই স্বাভাবিক গতিতে চলছে।'
          : 'All good — study, habits and attendance are all on track.',
      });
    }

    return out.slice(0, 4);
  }, [stats, bn]);

  const card = `rounded-2xl border ${
    isDark ? 'bg-slate-800/60 border-slate-700/65' : 'bg-white/90 border-slate-200/80 card-soft-light'
  }`;
  const sub = isDark ? 'text-slate-400' : 'text-slate-500';
  const head = isDark ? 'text-slate-100' : 'text-slate-900';

  const delta = (now: number, before: number) => now - before;
  const studyDelta = delta(stats.weekMinutes, stats.prevMinutes);
  const accDelta = delta(stats.avgAcc, stats.prevAcc);

  const tile = (
    icon: React.ReactNode,
    label: string,
    value: string,
    hint?: { value: number; suffix?: string }
  ) => (
    <div className={`${card} p-3.5`}>
      <div className="flex items-center gap-1.5">
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center ${
            isDark ? 'bg-indigo-500/12 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {icon}
        </span>
        <span className={`text-[10px] font-bold leading-tight ${sub}`}>{label}</span>
      </div>
      <p className={`text-lg font-extrabold tabular-nums mt-1.5 ${head}`}>{value}</p>
      {hint && (
        <p
          className={`text-[10px] font-bold flex items-center gap-0.5 ${
            hint.value > 0
              ? isDark
                ? 'text-emerald-300'
                : 'text-emerald-600'
              : hint.value < 0
              ? isDark
                ? 'text-rose-300'
                : 'text-rose-600'
              : sub
          }`}
        >
          {hint.value > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : hint.value < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {hint.value > 0 ? '+' : ''}
          {formatNum(hint.value, lang)}
          {hint.suffix ?? ''} {bn ? 'গত সপ্তাহের তুলনায়' : 'vs last week'}
        </p>
      )}
    </div>
  );

  const maxMinutes = Math.max(25, ...stats.minutesByDay);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={`text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2 ${head}`}>
            <CalendarRange className="w-4 h-4 text-indigo-500" />
            {bn ? 'এই সপ্তাহের রিভিউ' : "This week's review"}
          </h2>
          <p className={`text-[11px] mt-0.5 ${sub}`}>
            {bn ? 'শেষ ৭ দিন — পড়া, MCQ, অভ্যাস ও উপস্থিতি একসাথে' : 'Last 7 days — study, MCQ, habits and attendance together'}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className={`no-print inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold ${
            isDark
              ? 'border-slate-700 bg-slate-800/60 text-slate-200'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          {bn ? 'প্রিন্ট / PDF' : 'Print / PDF'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tile(
          <Clock className="w-3.5 h-3.5" />,
          bn ? 'পড়ার সময়' : 'Study time',
          `${formatNum(Math.floor(stats.weekMinutes / 60), lang)}${bn ? 'ঘ' : 'h'} ${formatNum(stats.weekMinutes % 60, lang)}${bn ? 'মি' : 'm'}`,
          { value: studyDelta, suffix: bn ? ' মিনিট' : 'm' }
        )}
        {tile(
          <FileCheck2 className="w-3.5 h-3.5" />,
          bn ? 'MCQ অনুশীলন' : 'MCQ practice',
          `${formatNum(stats.weekQuizzes.length, lang)} ${bn ? 'টি' : 'sets'}`,
          { value: accDelta, suffix: '%' }
        )}
        {tile(
          <HeartPulse className="w-3.5 h-3.5" />,
          bn ? 'অভ্যাস পূরণ' : 'Habit days',
          `${formatNum(stats.habitDays, lang)}/7`,
          undefined
        )}
        {tile(
          <CalendarCheck2 className="w-3.5 h-3.5" />,
          bn ? 'কলেজ উপস্থিতি' : 'Attendance',
          `${formatNum(stats.attendance.pct, lang)}%`,
          undefined
        )}
      </div>

      <div className={`${card} p-4 sm:p-5`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className={`text-xs font-extrabold ${head}`}>
            {bn ? 'দিনভিত্তিক পড়ার সময়' : 'Study minutes by day'}
          </h3>
          <span className={`text-[10px] font-bold ${sub}`}>
            {bn ? 'সর্বোচ্চ' : 'Peak'} {formatNum(maxMinutes, lang)} {bn ? 'মিনিট' : 'min'}
          </span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2 h-20">
          {stats.minutesByDay.map((mins, i) => {
            const pct = Math.round((mins / maxMinutes) * 100);
            const dayKey = stats.days[i];
            const isToday = dayKey === localDateKey();
            return (
              <div key={dayKey} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-md relative overflow-hidden ${
                    isDark ? 'bg-slate-700/40' : 'bg-slate-100'
                  }`}
                  style={{ height: 62 }}
                >
                  <div
                    className={`absolute bottom-0 inset-x-0 rounded-md ${
                      isToday ? 'bg-indigo-500' : isDark ? 'bg-indigo-400/60' : 'bg-indigo-300'
                    }`}
                    style={{ height: `${Math.max(mins > 0 ? 6 : 0, pct)}%` }}
                  />
                </div>
                <span className={`text-[9px] font-bold ${isToday ? 'text-indigo-500' : sub}`}>
                  {DAY_LABELS[bn ? 'bn' : 'en'][new Date(`${dayKey}T00:00:00`).getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${card} p-4 sm:p-5`}>
        <h3 className={`text-xs font-extrabold mb-2 flex items-center gap-1.5 ${head}`}>
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          {bn ? 'এই সপ্তাহের পরামর্শ' : "This week's coaching"}
        </h3>
        <ul className="space-y-1.5">
          {tips.map((tip, i) => (
            <li key={i} className={`flex gap-2 text-[11px] leading-relaxed ${sub}`}>
              {tip.tone === 'warn' ? (
                <AlertTriangle
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-500'}`}
                />
              ) : tip.tone === 'good' ? (
                <TrendingUp
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}
                />
              ) : (
                <Lightbulb
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-500'}`}
                />
              )}
              {tip.text}
            </li>
          ))}
        </ul>

        <button
          onClick={() => onNavigate('life')}
          className={`no-print mt-3 inline-flex items-center gap-1 text-[11px] font-bold ${
            isDark ? 'text-indigo-300' : 'text-indigo-600'
          }`}
        >
          {bn ? 'লাইফ হাবে বিস্তারিত দেখুন' : 'Open the full Life Hub'}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </section>
  );
};

export default WeeklyReviewCard;
