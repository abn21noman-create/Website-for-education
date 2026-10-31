import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  Clock,
  Trophy,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  Calendar,
  Target,
  Zap,
  BarChart3,
  FileSpreadsheet,
  Calculator,
  FlaskConical,
  MessageSquareText,
  HeartPulse,
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
import { CHAPTERS, SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { formatNum, getBoardLabel } from '../lib/i18n';
import { SubjectIcon } from './SubjectIcon';

interface DashboardViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  isAuthenticated: boolean;
  progressMap: Record<string, ChapterProgressState>;
  quizHistory: QuizAttemptRecord[];
  tasks: StudyTask[];
  onNavigate: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
  onOpenAuth: () => void;
}

const HSC_2028_TARGET_DATE = new Date('2028-05-10T10:00:00+06:00').getTime();

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  theme,
  profile,
  isAuthenticated,
  progressMap,
  quizHistory,
  tasks,
  onNavigate,
  onOpenAuth,
}) => {
  const isDark = theme === 'dark';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const diffMs = Math.max(0, HSC_2028_TARGET_DATE - now);
  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minsLeft = Math.floor((diffMs / (1000 * 60)) % 60);

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
  const pendingTasks = tasks.filter((t) => !t.completed);
  const avgAccuracy =
    quizHistory.length > 0
      ? Math.round(
          quizHistory.reduce((acc, q) => acc + q.accuracy, 0) / quizHistory.length
        )
      : Math.round(profile.bestAccuracy);

  return (
    <div className="space-y-7">
      {/* Eye-Comfort Soft Pastel Hero Section */}
      <section
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 lg:p-10 transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-slate-800/85 via-slate-800/75 to-indigo-950/35 border-slate-700/70 text-slate-100 bg-soft-dots-dark card-soft-dark'
            : 'bg-gradient-to-br from-white via-indigo-50/40 to-teal-50/35 border-slate-200/85 text-slate-800 bg-soft-dots-light card-soft-light'
        }`}
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${
                  isDark
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/25'
                    : 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80'
                }`}
              >
                {lang === 'bn'
                  ? 'HSC 2028 • বিজ্ঞান বিভাগ (একাদশ শ্রেণি)'
                  : 'HSC 2028 • SCIENCE DIVISION (YEAR 1)'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  isDark
                    ? 'bg-teal-500/12 text-teal-300 border-teal-400/20'
                    : 'bg-teal-50/90 text-teal-700 border-teal-200/80'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                {profile.targetGoal}
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              {lang === 'bn'
                ? `${profile.fullName} — সুশৃঙ্খল পরিকল্পনা ও নিয়মিত অনুশীলনেই নির্মিত হয় শীর্ষ সাফল্য।`
                : `${profile.fullName} — Structured Preparation Built for Board & Admission Excellence.`}
            </h1>

            <p
              className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
                isDark ? 'text-slate-300/90' : 'text-slate-600'
              }`}
            >
              {lang === 'bn'
                ? 'একাদশ শ্রেণি থেকেই ১ম পত্রের পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞানের প্রতিটি অধ্যায় ধাপে ধাপে সম্পন্ন করুন, বোর্ড মানের MCQ পরীক্ষা দিন এবং নিজের একাডেমিক অগ্রগতি পরিমাপ করুন।'
                : 'Master NCTB 1st & 2nd Paper curricula systematically with 4-stage chapter tracking, curated formula references, timed MCQ assessments, and focused study analytics.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('mcq')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  {lang === 'bn' ? 'মডেল টেস্ট শুরু করুন' : 'Launch MCQ Assessment'}
                </span>
              </button>

              <button
                onClick={() => onNavigate('syllabus')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/70 text-slate-100'
                    : 'bg-white/95 hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                }`}
              >
                <span>
                  {lang === 'bn' ? 'সিলেবাস ট্র্যাকার' : 'Syllabus Tracker'}
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-500" />
              </button>

              <button
                onClick={() => onNavigate('admission')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'bg-teal-500/15 hover:bg-teal-500/25 border-teal-400/30 text-teal-200'
                    : 'bg-teal-50 hover:bg-teal-100/80 border-teal-200 text-teal-800 shadow-2xs'
                }`}
              >
                <Target className="w-4 h-4 text-teal-500" />
                <span>
                  {lang === 'bn'
                    ? 'অ্যাডমিশন হাব (BUET • Med • DU)'
                    : 'Admission Hub (BUET • Med • DU)'}
                </span>
              </button>

              {!isAuthenticated && (
                <button
                  onClick={onOpenAuth}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all duration-200 cursor-pointer ${
                    isDark
                      ? 'border-amber-400/25 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'
                      : 'border-amber-200/80 bg-amber-50/80 text-amber-800 hover:bg-amber-100/70'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>
                    {lang === 'bn' ? 'মেধাতালিকায় নিবন্ধন' : 'Join Merit List'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Smooth Countdown & Syllabus Telemetry Box */}
          <div className="lg:col-span-5">
            <div
              className={`rounded-2xl p-5 sm:p-6 border backdrop-blur-sm ${
                isDark
                  ? 'bg-slate-900/65 border-slate-700/70 text-slate-100'
                  : 'bg-white/85 border-slate-200/85 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300">
                  <Calendar className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'HSC ২০২৮ কাউন্টডাউন' : 'HSC 2028 COUNTDOWN'}
                </span>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {lang === 'bn' ? 'লক্ষ্য: মে ২০২৮' : 'EST. MAY 2028'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center my-3">
                {[
                  { val: daysLeft, bn: 'দিন বাকি', en: 'DAYS' },
                  { val: hoursLeft, bn: 'ঘণ্টা', en: 'HOURS' },
                  { val: minsLeft, bn: 'মিনিট', en: 'MINUTES' },
                ].map((unit, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      isDark
                        ? 'bg-slate-800/75 border-slate-700/70'
                        : 'bg-slate-50/90 border-slate-200/75'
                    }`}
                  >
                    <div
                      className={`text-2xl sm:text-3xl font-extrabold font-formula tabular-nums ${
                        isDark ? 'text-indigo-200' : 'text-indigo-950'
                      }`}
                    >
                      {formatNum(unit.val, lang)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider mt-1 opacity-60">
                      {lang === 'bn' ? unit.bn : unit.en}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`mt-5 pt-4 border-t ${
                  isDark ? 'border-slate-700/60' : 'border-slate-200/70'
                }`}
              >
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>
                    {lang === 'bn'
                      ? 'সামগ্রিক সিলেবাস সম্পন্নতা'
                      : 'Overall Syllabus Completion'}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-teal-600 dark:text-teal-300">
                    {formatNum(overallPercent, lang)}%
                  </span>
                </div>
                <div
                  className={`h-2 w-full rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-teal-500"
                    style={{ width: `${Math.max(overallPercent, 3)}%` }}
                  />
                </div>
                <p className="text-[11px] mt-2.5 opacity-65">
                  {lang === 'bn'
                    ? `${getBoardLabel(profile.board, lang)} • ${formatNum(
                        CHAPTERS.length,
                        lang
                      )}টি অধ্যায়ের মধ্যে ${formatNum(
                        fullyMasteredChapters,
                        lang
                      )}টি পূর্ণাঙ্গভাবে সম্পন্ন`
                    : `${getBoardLabel(profile.board, lang)} • ${fullyMasteredChapters} of ${
                        CHAPTERS.length
                      } chapters 100% mastered`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Soft Pastel KPI Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-65">
              {lang === 'bn' ? 'মোট একাডেমিক পয়েন্ট' : 'Academic Score (XP)'}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">
            {formatNum(profile.xp, lang)}{' '}
            <span className="text-xs font-mono uppercase text-amber-600 dark:text-amber-300">
              XP
            </span>
          </div>
          <div className="text-xs mt-1.5 opacity-60">
            {lang === 'bn'
              ? `ধারাবাহিকতা: ${formatNum(profile.streakDays, lang)} দিন`
              : `Active streak: ${profile.streakDays} day(s)`}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-65">
              {lang === 'bn' ? 'সম্পন্ন অধ্যয়ন ধাপ' : 'Completed Stages'}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">
            {formatNum(checkedCount, lang)}{' '}
            <span className="text-sm font-normal opacity-50">
              / {formatNum(totalCheckboxes, lang)}
            </span>
          </div>
          <div className="text-xs mt-1.5 opacity-60">
            {lang === 'bn'
              ? `${formatNum(fullyMasteredChapters, lang)}টি অধ্যায় ৪-ধাপে সম্পন্ন`
              : `${fullyMasteredChapters} chapters fully completed`}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-65">
              {lang === 'bn' ? 'গড় MCQ নির্ভুলতা' : 'MCQ Accuracy'}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">
            {formatNum(avgAccuracy, lang)}%
          </div>
          <div className="text-xs mt-1.5 opacity-60">
            {lang === 'bn'
              ? `${formatNum(
                  Math.max(quizHistory.length, profile.quizzesTaken),
                  lang
                )}টি পরীক্ষা সম্পন্ন`
              : `${Math.max(quizHistory.length, profile.quizzesTaken)} exams evaluated`}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold opacity-65">
              {lang === 'bn' ? 'মোট ফোকাস অধ্যয়ন' : 'Logged Study Hours'}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-sky-50 text-sky-600'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">
            {formatNum((profile.studyMinutes / 60).toFixed(1), lang)}{' '}
            <span className="text-xs font-semibold opacity-60">
              {lang === 'bn' ? 'ঘণ্টা' : 'hrs'}
            </span>
          </div>
          <div className="text-xs mt-1.5 opacity-60">
            {lang === 'bn'
              ? `মোট ${formatNum(profile.studyMinutes, lang)} মিনিট রেকর্ডকৃত`
              : `${profile.studyMinutes} total minutes logged`}
          </div>
        </div>
      </section>

      {/* Specialized Academic Modules Strip (6 Student Modules) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('lab')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-cyan-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-cyan-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20'
                  : 'bg-cyan-50 text-cyan-600 border-cyan-100'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'বিজ্ঞান ও ICT ভার্চুয়াল ল্যাব'
              : 'Science & ICT Virtual Lab'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? '২-এর পরিপূরক, লজিক গেইট ট্রুথ টেবিল, ভেক্টর ও প্রাসের গতিপথ এবং বাফার pH সিমুলেটর।'
              : '2’s Complement, Logic Gate Truth Table, Vector/Projectile & Buffer pH simulator.'}
          </p>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-violet-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-violet-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-violet-500/15 text-violet-300 border-violet-400/20'
                  : 'bg-violet-50 text-violet-600 border-violet-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-violet-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'ডায়াগনস্টিক বিশ্লেষণ ও দুর্বলতা রাডার'
              : 'Diagnostic Analytics & Weakness Radar'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? `MCQ গতি, স্বয়ংক্রিয় মিস্টেক ব্যাংক (${formatNum(profile.mistakeIds?.length ?? 0, lang)}) ও ১১ পত্রের দুর্বলতা শনাক্তকরণ।`
              : `MCQ speed telemetry, Mistake Bank (${profile.mistakeIds?.length ?? 0}), and 11-paper weakness diagnosis.`}
          </p>
        </button>

        <button
          onClick={() => onNavigate('hub')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-emerald-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-emerald-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'HSC ’28 স্টুডেন্ট হাব ও সহপাঠী ফোরাম'
              : 'HSC ’28 Student Hub & Peer Forum'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? 'কনসেপ্ট এক্সপ্লেইনার, ব্যাচমেট প্রশ্নোত্তর (Q&A) এবং ২০২৬–২০২৮ একাডেমিক রোডম্যাপ।'
              : 'Instant concept solver, Batch ’28 peer Q&A forum, and 2-year academic roadmap.'}
          </p>
        </button>

        <button
          onClick={() => onNavigate('cq')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-indigo-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-indigo-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/20'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-indigo-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'বোর্ড সৃজনশীল প্রশ্নব্যাংক (CQ)'
              : 'Board Creative Question (CQ) Bank'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? 'উদ্দীপক ও ক, খ, গ, ঘ (১০ নম্বর) আদর্শ সমাধানসহ বোর্ড স্ট্যান্ডার্ড সৃজনশীল অনুশীলন।'
              : 'Full stems with structured ক, খ, গ, ঘ (10-mark) step-by-step model solutions.'}
          </p>
        </button>

        <button
          onClick={() => onNavigate('gpa')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-teal-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-teal-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-teal-500/15 text-teal-300 border-teal-400/20'
                  : 'bg-teal-50 text-teal-600 border-teal-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-teal-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'GPA ও ভর্তি যোগ্যতা ক্যালকুলেটর'
              : 'GPA & Admission Eligibility Tool'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? '৪র্থ বিষয়ের বোনাস পয়েন্টসহ NCTB GPA এবং BUET, মেডিকেল ও ঢাবি ভর্তি যোগ্যতা বিশ্লেষণ।'
              : 'Official NCTB 4th-subject bonus calculation + BUET, Medical & DU eligibility check.'}
          </p>
        </button>

        <button
          onClick={() => onNavigate('formulas')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-amber-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-amber-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-amber-500/15 text-amber-300 border-amber-400/20'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}
            >
              <BookMarked className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-amber-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'সূত্র ভল্ট ও অ্যাক্টিভ ফ্ল্যাশকার্ড'
              : 'Formula Vault & Active Flashcards'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? 'পদার্থ, রসায়ন, গণিত ও ICT-এর মূল সমীকরণ এবং ব্যক্তিগত রিভিশন নোট সংরক্ষণ।'
              : 'Key equations, flip-card active recall, and personal cloud-synced study notes.'}
          </p>
        </button>

        <button
          onClick={() => onNavigate('life')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/65 hover:border-rose-400/40 hover:bg-slate-800/90 card-soft-dark'
              : 'bg-white/90 border-slate-200/80 hover:border-rose-300 hover:bg-white card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isDark
                  ? 'bg-rose-500/15 text-rose-300 border-rose-400/20'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-45 group-hover:opacity-100 group-hover:text-rose-500 transition-all" />
          </div>
          <h3 className="font-bold text-sm">
            {lang === 'bn'
              ? 'লাইফ হাব — অভ্যাস, ডেডলাইন ও ক্যারিয়ার'
              : 'Life Hub — Habits, Deadlines & Careers'}
          </h3>
          <p className="text-xs opacity-65 mt-1 leading-relaxed">
            {lang === 'bn'
              ? 'দৈনিক অভ্যাস স্ট্রিক, ভর্তি-বৃত্তির ডেডলাইন কাউন্টডাউন, পরীক্ষার রুটিন ও ক্যারিয়ার রোডম্যাপ।'
              : 'Daily habit streaks, admission/scholarship countdowns, exam routine and career roadmaps.'}
          </p>
        </button>
      </section>

      {/* All 11 Subject Papers Soft Pastel Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {lang === 'bn'
                ? 'পত্রভিত্তিক পাঠ্যক্রম ও অগ্রগতি (NCTB বিজ্ঞান ও আবশ্যিক)'
                : 'Curriculum Overview (All 11 Science & Compulsory Papers)'}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'bn'
                ? 'যেকোনো পত্রে ক্লিক করে অধ্যায়ভিত্তিক চেকলিস্ট ও টপিকসমূহ দেখুন'
                : 'Select any paper to inspect chapter-level milestones and topics'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('formulas')}
            className={`text-xs font-semibold inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800/60 hover:border-indigo-400/40 text-slate-200'
                : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700 shadow-2xs'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {lang === 'bn' ? 'সূত্র সংকলন দেখুন' : 'Open Formula Reference'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
              <div
                key={subj.key}
                onClick={() => onNavigate('syllabus', subj.key)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/65 border-slate-700/65 hover:border-slate-500 hover:bg-slate-800/95 card-soft-dark'
                    : 'bg-white/95 border-slate-200/80 hover:border-indigo-200 hover:shadow-md card-soft-light'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isDark ? subj.bgDark : subj.bgLight
                      }`}
                    >
                      <SubjectIcon name={subj.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">
                        {subj.name[lang]}
                      </h3>
                      <p className="text-[11px] font-mono opacity-55 mt-0.5">
                        CODE {formatNum(subj.code, lang)} •{' '}
                        {formatNum(subChapters.length, lang)}{' '}
                        {lang === 'bn' ? 'অধ্যায়' : 'CH'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-mono font-bold tabular-nums opacity-85">
                      {formatNum(pct, lang)}%
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div
                  className={`h-1.5 w-full rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-700/60' : 'bg-slate-100'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: subj.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Split: Daily Study Plan + Recent Exam Records */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className={`p-5 sm:p-6 rounded-2xl border ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>
                {lang === 'bn' ? 'দৈনিক অধ্যয়ন কার্যসূচি' : 'Active Study Schedule'}
              </span>
            </h3>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {lang === 'bn' ? 'প্ল্যানার খুলুন' : 'Manage Schedule'}
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div
              className={`p-6 rounded-xl border border-dashed text-center ${
                isDark
                  ? 'border-slate-700 text-slate-400'
                  : 'border-slate-200 text-slate-500 bg-slate-50/50'
              }`}
            >
              <p className="text-xs sm:text-sm mb-3">
                {lang === 'bn'
                  ? 'আজকের নির্ধারিত সকল টাস্ক সম্পন্ন হয়েছে।'
                  : 'All scheduled tasks are complete.'}
              </p>
              <button
                onClick={() => onNavigate('planner')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
              >
                {lang === 'bn'
                  ? 'নতুন টার্গেট যুক্ত করুন'
                  : 'Add New Study Target'}
              </button>
            </div>
          ) : (
            <div
              className={`divide-y ${
                isDark ? 'divide-slate-700/50' : 'divide-slate-100'
              }`}
            >
              {pendingTasks.slice(0, 4).map((t) => {
                const s = getSubjectByKey(t.subjectKey);
                return (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('planner')}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {t.title}
                      </p>
                      <span className="text-[11px] opacity-60">
                        {s.shortName[lang]}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        t.priority === 'high'
                          ? isDark
                            ? 'bg-amber-500/12 text-amber-300 border-amber-400/25'
                            : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          : isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-400'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {t.priority === 'high'
                        ? lang === 'bn'
                          ? 'অগ্রাধিকার'
                          : 'PRIORITY'
                        : lang === 'bn'
                        ? 'নিয়মিত'
                        : 'STANDARD'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Exam Attempts */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-500" />
              <span>
                {lang === 'bn' ? 'সাম্প্রতিক মূল্যায়ন রেকর্ড' : 'Recent Assessment Log'}
              </span>
            </h3>
            <button
              onClick={() => onNavigate('mcq')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {lang === 'bn' ? 'নতুন পরীক্ষা' : 'New Exam'}
            </button>
          </div>

          {quizHistory.length === 0 ? (
            <div
              className={`p-6 rounded-xl border border-dashed text-center ${
                isDark
                  ? 'border-slate-700 text-slate-400'
                  : 'border-slate-200 text-slate-500 bg-slate-50/50'
              }`}
            >
              <p className="text-xs sm:text-sm mb-3">
                {lang === 'bn'
                  ? 'এখনো কোনো মডেল টেস্ট প্রদান করা হয়নি।'
                  : 'No assessment records found yet.'}
              </p>
              <button
                onClick={() => onNavigate('mcq')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 cursor-pointer"
              >
                {lang === 'bn' ? 'প্রথম মডেল টেস্ট দিন' : 'Take First Assessment'}
              </button>
            </div>
          ) : (
            <div
              className={`divide-y ${
                isDark ? 'divide-slate-700/50' : 'divide-slate-100'
              }`}
            >
              {quizHistory.slice(0, 4).map((q) => (
                <div
                  key={q.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{q.examTitle}</p>
                    <p className="text-[11px] opacity-60">
                      {lang === 'bn' ? 'সঠিক:' : 'Correct:'}{' '}
                      {formatNum(q.correctAnswers, lang)}/
                      {formatNum(q.totalQuestions, lang)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatNum(Math.round(q.accuracy), lang)}%
                    </div>
                    <div className="text-[11px] font-mono opacity-60">
                      {formatNum(q.score, lang)} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
