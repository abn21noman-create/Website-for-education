import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  Calendar,
  Target,
  Zap,
  BarChart3,
  FlaskConical,
  HeartPulse,
  CalendarClock,
  BookOpen,
} from 'lucide-react';
import {
  ActiveTab,
  ChapterProgressState,
  Lang,
  QuizAttemptRecord,
  StudentProfile,
  SubjectKey,
  StudyTask,
  Theme,
} from '../types';
import { CHAPTERS, SUBJECTS } from '../data/syllabusData';
import { confidenceSummary, loadConfidence, loadPredictions, predictionSummary } from '../lib/calibration';
import { requestChapterDrill } from '../lib/chapterDrill';
import { focusPlanForSlot, type StudyFocusPlan } from '../lib/focusSession';
import { classSlotsForDay, dayNumberForDate, toDateKey } from '../lib/masterRoutine';
import { loadRoutineState, startFreshRoutine, taskKey } from '../lib/routineStore';
import { formatNum } from '../lib/i18n';
import { SubjectIcon } from './SubjectIcon';
import { DashboardTodayFocus } from './DashboardTodayFocus';

const LazyDashboardWeeklyGoals = React.lazy(async () => {
  const mod = await import('./DashboardWeeklyGoals');
  return { default: mod.DashboardWeeklyGoals };
});

const WEEKLY_GOALS_STORAGE_KEY = 'hsc28_weekly_goals_v1';
const WEEKLY_GOALS_EVENT_NAME = 'hsc28:weekly-goals-changed';
const hasSavedWeeklyGoalPlan = (): boolean => {
  try {
    return localStorage.getItem(WEEKLY_GOALS_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

interface DashboardViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  progressMap: Record<string, ChapterProgressState>;
  quizHistory: QuizAttemptRecord[];
  tasks: StudyTask[];
  onNavigate: (tab: ActiveTab, filterSubject?: SubjectKey) => void;
  onStartFocus: (plan: StudyFocusPlan) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

const HSC_2028_TARGET_DATE = new Date('2028-05-10T10:00:00+06:00').getTime();

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  theme,
  profile,
  progressMap,
  quizHistory,
  onNavigate,
  onStartFocus,
  isAuthenticated,
  onOpenAuth,
}) => {
  const isDark = theme === 'dark';
  const [now, setNow] = useState(Date.now());
  const [hasWeeklyGoalPlan, setHasWeeklyGoalPlan] = useState<boolean>(() =>
    hasSavedWeeklyGoalPlan()
  );

  const calibration = React.useMemo(
    () => ({
      prediction: predictionSummary(loadPredictions()),
      confidence: confidenceSummary(loadConfidence()),
    }),
    [quizHistory.length]
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const readPlan = () => setHasWeeklyGoalPlan(hasSavedWeeklyGoalPlan());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === WEEKLY_GOALS_STORAGE_KEY) {
        readPlan();
      }
    };
    window.addEventListener(WEEKLY_GOALS_EVENT_NAME, readPlan);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(WEEKLY_GOALS_EVENT_NAME, readPlan);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const diffMs = Math.max(0, HSC_2028_TARGET_DATE - now);
  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const totalCheckboxes = CHAPTERS.length * 4;
  let checkedCount = 0;
  let fullyMasteredChapters = 0;

  CHAPTERS.forEach((ch) => {
    const st = progressMap[ch.id];
    if (st) {
      const done =
        (st.theoryDone ? 1 : 0) +
        (st.notesDone ? 1 : 0) +
        (st.mcqDone ? 1 : 0) +
        (st.cqDone ? 1 : 0);
      checkedCount += done;
      if (done === 4) fullyMasteredChapters += 1;
    }
  });

  const overallPercent = Math.round((checkedCount / totalCheckboxes) * 100);

  const startTodayFocus = () => {
    let routine = loadRoutineState();
    const todayKey = toDateKey(new Date());
    if (!routine.journeyStarted) {
      routine = startFreshRoutine(routine, todayKey, routine.paceMode || 'steady');
    }
    const dayNumber = dayNumberForDate(routine.startDate, todayKey);
    if (dayNumber) {
      const slots = classSlotsForDay(dayNumber);
      const slotIndex = slots.findIndex(
        (_slot, index) => !routine.tasks[taskKey(todayKey, index, 2)]
      );
      if (slotIndex >= 0) {
        onStartFocus(focusPlanForSlot(slots[slotIndex], todayKey, slotIndex, lang));
        return;
      }
    }
    onNavigate('routine');
  };

  return (
    <div className="space-y-6">
      {/* Minimal Calm Header */}
      <div className="dashboard-welcome">
        <div>
          <div className="dashboard-eyebrow">
            <span /> {lang === 'bn' ? 'নক্ষত্র স্টাডি স্পেস · HSC ২০২৮' : 'NOKKHOTRO STUDY SPACE · HSC 2028'}
          </div>
          <h1>
            {lang === 'bn'
              ? `স্বাগতম, ${profile.fullName.split(' ')[0]}`
              : `Welcome, ${profile.fullName.split(' ')[0]}`}{' '}
            <span>✦</span>
          </h1>
          <p>
            {lang === 'bn'
              ? 'শান্ত মনে আজকের ছোট্ট লক্ষ্যটুকু শেষ করো—বাকিটা নিজেই গুছিয়ে যাবে।'
              : 'Focus calmly on today’s two chapters—consistency builds everything else.'}
          </p>
        </div>
        <div className="dashboard-date">
          <Calendar size={15} />
          <span>
            {new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date(now))}
          </span>
        </div>
      </div>

      {/* Primary Priority: Today's Routine & Immediate Focus */}
      <DashboardTodayFocus
        lang={lang}
        theme={theme}
        progressMap={progressMap}
        onNavigate={onNavigate}
        onStartFocus={onStartFocus}
      />

      {/* Minimal Orbit Banner + Syllabus Ring */}
      <div className="dashboard-hero-grid">
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <span className="hero-kicker">
              <span>✦</span> {lang === 'bn' ? 'নতুন করে শুরু · বিজ্ঞান বিভাগ' : 'FRESH START · SCIENCE'}
            </span>
            <h2>
              {lang === 'bn' ? (
                <>
                  নিজের গতিতে শুরু করো,<br />
                  <em>প্রতিদিন একটু এগিয়ে যাও।</em>
                </>
              ) : (
                <>
                  Start at your own pace,<br />
                  <em>grow one day at a time.</em>
                </>
              )}
            </h2>
            <p>
              {lang === 'bn'
                ? 'কোনো জটিলতা নেই—রুটিন খুলে Day 1 শুরু করো, বই পড়ো এবং ছোট কুইজে নিজেকে যাচাই করো।'
                : 'Zero clutter—launch Day 1 when ready, read your chapter, and test your recall.'}
            </p>
            <div className="hero-actions">
              <button onClick={startTodayFocus} className="hero-primary">
                {lang === 'bn' ? 'আজকের পড়া শুরু করো' : 'Start studying'} <ArrowRight size={16} />
              </button>
              <button onClick={() => onNavigate('routine')} className="hero-secondary">
                {lang === 'bn' ? 'রুটিন সাজাও' : 'Customize routine'} <ArrowUpRight size={15} />
              </button>
            </div>
            {!isAuthenticated && (
              <button className="hero-login" onClick={onOpenAuth}>
                {lang === 'bn' ? 'ক্লাউডে অগ্রগতি সেভ করতে লগইন করো' : 'Sign in to sync your progress'} →
              </button>
            )}
          </div>
          <div className="hero-orbit-art" aria-hidden="true">
            <div className="orbit-ring orbit-ring-outer" />
            <div className="orbit-ring orbit-ring-inner" />
            <div className="orbit-star">✦</div>
          </div>
        </section>

        <section className={`dashboard-progress-card ${isDark ? 'is-dark' : ''}`}>
          <div className="progress-card-heading">
            <div>
              <span className="card-kicker">{lang === 'bn' ? 'সামগ্রিক সিলেবাস' : 'OVERALL SYLLABUS'}</span>
              <h2>{lang === 'bn' ? 'প্রস্তুতির এক নজর' : 'Your preparation'}</h2>
            </div>
            <span className="progress-icon">
              <Target size={18} />
            </span>
          </div>
          <div className="progress-ring-wrap">
            <div
              className="progress-ring"
              style={{
                background: `conic-gradient(#0d9488 ${overallPercent}%, ${
                  isDark ? '#1e293b' : '#e2e8f0'
                } 0)`,
              }}
            >
              <div>
                <strong>
                  {formatNum(overallPercent, lang)}
                  <small>%</small>
                </strong>
                <span>{lang === 'bn' ? 'সম্পন্ন' : 'complete'}</span>
              </div>
            </div>
            <div className="progress-side">
              <span className="progress-side-dot" />
              <p>
                {lang === 'bn' ? 'অধ্যায় ধাপ সম্পন্ন' : 'Completed steps'}
                <strong>
                  {formatNum(checkedCount, lang)} / {formatNum(totalCheckboxes, lang)}
                </strong>
              </p>
            </div>
          </div>
          <div className="progress-card-footer">
            <span>
              {lang === 'bn'
                ? `${formatNum(fullyMasteredChapters, lang)}টি অধ্যায় সম্পূর্ণ`
                : `${fullyMasteredChapters} chapters mastered`}
            </span>
            <button onClick={() => onNavigate('syllabus')}>
              {lang === 'bn' ? 'সিলেবাস খুলুন' : 'Open syllabus'} <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>

      {/* Compact 4-Stat Strip */}
      <div className="dashboard-glance">
        <div>
          <span className="glance-icon lavender">
            <Zap size={17} />
          </span>
          <span>
            <small>{lang === 'bn' ? 'মোট পয়েন্ট' : 'TOTAL POINTS'}</small>
            <strong>
              {formatNum(profile.xp, lang)} <em>XP</em>
            </strong>
          </span>
        </div>
        <div>
          <span className="glance-icon mint">
            <BookOpen size={17} />
          </span>
          <span>
            <small>{lang === 'bn' ? 'সম্পন্ন অধ্যায়' : 'CHAPTERS MASTERED'}</small>
            <strong>
              {formatNum(fullyMasteredChapters, lang)} <em>/ {formatNum(CHAPTERS.length, lang)}</em>
            </strong>
          </span>
        </div>
        <div>
          <span className="glance-icon peach">
            <FileCheck2 size={17} />
          </span>
          <span>
            <small>{lang === 'bn' ? 'মডেল টেস্ট' : 'TESTS TAKEN'}</small>
            <strong>
              {formatNum(quizHistory.length, lang)} <em>{lang === 'bn' ? 'টি পরীক্ষা' : 'tests'}</em>
            </strong>
          </span>
        </div>
        <div>
          <span className="glance-icon blue">
            <CalendarClock size={17} />
          </span>
          <span>
            <small>{lang === 'bn' ? 'HSC ২০২৮ লক্ষ্য' : 'HSC 2028 TARGET'}</small>
            <strong>
              {formatNum(daysLeft, lang)} <em>{lang === 'bn' ? 'দিন বাকি' : 'days left'}</em>
            </strong>
          </span>
        </div>
      </div>

      {/* Clean Unified Workspace Launcher */}
      <section className="dashboard-sectors" aria-label={lang === 'bn' ? 'পড়াশোনার সেকশন' : 'Study sections'}>
        <div className="dashboard-section-heading">
          <div>
            <span>{lang === 'bn' ? 'সহজ নেভিগেশন' : 'QUICK WORKSPACE'}</span>
            <h2>{lang === 'bn' ? 'প্রয়োজনীয় টুলস' : 'Essential study tools'}</h2>
          </div>
          <span className="sector-hint">{lang === 'bn' ? 'যেকোনো একটি বেছে নাও' : 'Pick one to dive in'}</span>
        </div>
        <div className="sector-grid">
          {[
            { tab: 'routine' as const, icon: CalendarClock, bn: 'দৈনিক রুটিন', en: 'Daily routine', subBn: 'নিজের দিন থেকে শুরু', subEn: 'Start on your schedule', tone: 'blue' },
            { tab: 'syllabus' as const, icon: BookOpen, bn: 'সিলেবাস ট্র্যাকার', en: 'Syllabus tracker', subBn: '১১ পত্রের অগ্রগতি', subEn: 'All 11 papers', tone: 'purple' },
            { tab: 'mcq' as const, icon: FileCheck2, bn: 'পরীক্ষা কেন্দ্র', en: 'Exam centre', subBn: 'MCQ ও মডেল টেস্ট', subEn: 'MCQs & mock tests', tone: 'peach' },
            { tab: 'formulas' as const, icon: BookMarked, bn: 'সূত্র ও নোটস', en: 'Formula vault', subBn: 'দ্রুত রিভিশন শিট', subEn: 'Quick revision sheets', tone: 'mint' },
            { tab: 'lab' as const, icon: FlaskConical, bn: 'ভার্চুয়াল ল্যাব', en: 'Virtual lab', subBn: 'বিজ্ঞান ও ICT সিমুলেটর', subEn: 'Interactive science lab', tone: 'gold' },
            { tab: 'life' as const, icon: HeartPulse, bn: 'লাইফ হাব ও অভ্যাস', en: 'Life & habits', subBn: 'অভ্যাস ও ডেডলাইন', subEn: 'Habits & deadlines', tone: 'rose' },
          ].map((item) => (
            <button key={item.tab} className="sector-card" onClick={() => onNavigate(item.tab)}>
              <span className={`sector-card-icon ${item.tone}`}>
                <item.icon size={18} strokeWidth={1.8} />
              </span>
              <span className="sector-card-copy">
                <strong>{lang === 'bn' ? item.bn : item.en}</strong>
                <small>{lang === 'bn' ? item.subBn : item.subEn}</small>
              </span>
              <ArrowUpRight className="sector-card-arrow" size={15} />
            </button>
          ))}
        </div>
      </section>

      {/* Compact 11-Paper Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
            {lang === 'bn' ? '১১টি পত্র এক নজরে' : 'All 11 Papers at a Glance'}
          </h2>
          <button
            onClick={() => onNavigate('analytics')}
            className={`text-xs font-semibold inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border cursor-pointer transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-600'
                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{lang === 'bn' ? 'বিশ্লেষণ' : 'Analytics'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SUBJECTS.map((subj) => {
            const subChapters = CHAPTERS.filter((c) => c.subjectKey === subj.key);
            const subTotal = subChapters.length * 4;
            let subDone = 0;
            subChapters.forEach((c) => {
              const st = progressMap[c.id];
              if (st) {
                subDone +=
                  (st.theoryDone ? 1 : 0) +
                  (st.notesDone ? 1 : 0) +
                  (st.mcqDone ? 1 : 0) +
                  (st.cqDone ? 1 : 0);
              }
            });
            const pct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

            return (
              <button
                key={subj.key}
                type="button"
                onClick={() => onNavigate('syllabus', subj.key)}
                className={`group p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/65 border-slate-800 hover:border-slate-600'
                    : 'bg-white border-slate-200/80 hover:border-teal-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                        isDark ? subj.bgDark : subj.bgLight
                      }`}
                    >
                      <SubjectIcon name={subj.iconName} className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs truncate">{subj.shortName[lang]}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold tabular-nums opacity-75">
                    {formatNum(pct, lang)}%
                  </span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: subj.color }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {hasWeeklyGoalPlan && (
        <React.Suspense
          fallback={
            <section
              className={`min-h-24 rounded-2xl border animate-pulse ${
                isDark ? 'bg-slate-900/65 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
              aria-label={lang === 'bn' ? 'সাপ্তাহিক লক্ষ্য লোড হচ্ছে' : 'Loading weekly goals'}
            />
          }
        >
          <LazyDashboardWeeklyGoals lang={lang} theme={theme} onNavigate={onNavigate} />
        </React.Suspense>
      )}

      {/* Compact Self-Calibration Check */}
      <section
        className={`rounded-2xl border p-4 sm:p-5 ${
          isDark ? 'bg-slate-900/65 border-slate-800' : 'bg-white border-slate-200/80'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold flex items-center gap-2">
            <span>🎯</span>
            {lang === 'bn' ? 'নিশ্চয়তা বনাম বাস্তবতা' : 'Confidence vs reality'}
          </h2>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {lang === 'bn'
              ? `${formatNum(calibration.prediction.attempts, lang)}টি অনুমান · ${formatNum(calibration.confidence.total, lang)}টি ট্যাগ`
              : `${calibration.prediction.attempts} predictions · ${calibration.confidence.total} tags`}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div
            className={`rounded-xl border p-2.5 ${
              isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200/80 bg-slate-50/70'
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-wide opacity-60">
              {lang === 'bn' ? 'গড় অনুমান' : 'avg predicted'}
            </p>
            <p className="text-base sm:text-lg font-extrabold font-mono tabular-nums">
              {formatNum(calibration.prediction.averagePredicted, lang)}%
            </p>
          </div>
          <div
            className={`rounded-xl border p-2.5 ${
              isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200/80 bg-slate-50/70'
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-wide opacity-60">
              {lang === 'bn' ? 'গড় ফল' : 'avg actual'}
            </p>
            <p className="text-base sm:text-lg font-extrabold font-mono tabular-nums">
              {formatNum(calibration.prediction.averageActual, lang)}%
            </p>
          </div>
          <div
            className={`rounded-xl border p-2.5 ${
              isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200/80 bg-slate-50/70'
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-wide opacity-60">
              {lang === 'bn' ? 'নিশ্চিত হয়ে ভুল' : 'sure & wrong'}
            </p>
            <p
              className={`text-base sm:text-lg font-extrabold font-mono tabular-nums ${
                calibration.confidence.blindSpots > 0 ? 'text-rose-600 dark:text-rose-400' : ''
              }`}
            >
              {formatNum(calibration.confidence.blindSpots, lang)}
            </p>
          </div>
        </div>

        <p className={`mt-2.5 text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span className="font-bold">{lang === 'bn' ? 'স্কোর অনুমান: ' : 'Score prediction: '}</span>
          {lang === 'bn' ? calibration.prediction.messageBn : calibration.prediction.messageEn}
        </p>

        {calibration.confidence.blindSpotIds.length > 0 && (
          <button
            onClick={() => {
              requestChapterDrill({
                chapterBn: lang === 'bn' ? 'নিশ্চিত-ভুল' : 'Confidently wrong',
                chapterEn: 'Confidently wrong',
                titleBn: lang === 'bn' ? 'নিশ্চিত-ভুল' : 'Confidently wrong',
                titleEn: 'Confidently wrong',
                count: Math.min(20, calibration.confidence.blindSpotIds.length),
                questionIds: calibration.confidence.blindSpotIds,
              });
              onNavigate('mcq');
            }}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
          >
            {lang === 'bn'
              ? `নিশ্চিত-ভুল ${formatNum(calibration.confidence.blindSpots, lang)}টি ড্রিল করো`
              : `Drill the ${calibration.confidence.blindSpots} confidently wrong`}
          </button>
        )}
      </section>
    </div>
  );
};
