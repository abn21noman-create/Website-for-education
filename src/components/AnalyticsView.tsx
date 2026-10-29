import React from 'react';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';
import {
  ActiveTab,
  ChapterProgressState,
  Lang,
  QuizAttemptRecord,
  StudentProfile,
  StudySessionRecord,
  SubjectKey,
  Theme,
} from '../types';
import { CHAPTERS, SUBJECTS } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';
import { SubjectIcon } from './SubjectIcon';

interface AnalyticsViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  progressMap: Record<string, ChapterProgressState>;
  quizHistory: QuizAttemptRecord[];
  sessions: StudySessionRecord[];
  onNavigate: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
  onStartMistakeExam?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  lang,
  theme,
  profile,
  progressMap,
  quizHistory,
  sessions,
  onNavigate,
  onStartMistakeExam,
  onExportBackup,
  onImportBackup,
}) => {
  const isDark = theme === 'dark';

  // Compute subject-by-subject analytics
  const subjectStats = SUBJECTS.map((subj) => {
    const chs = CHAPTERS.filter((c) => c.subjectKey === subj.key);
    const totalStages = chs.length * 4;
    let completedStages = 0;
    chs.forEach((c) => {
      const p = progressMap[c.id];
      if (p) {
        completedStages +=
          (p.theoryDone ? 1 : 0) +
          (p.notesDone ? 1 : 0) +
          (p.mcqDone ? 1 : 0) +
          (p.cqDone ? 1 : 0);
      }
    });
    const syllabusPct =
      totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    const attempts = quizHistory.filter((q) => q.subjectKey === subj.key);
    const avgAcc =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length
          )
        : null;

    const mins = sessions
      .filter((s) => s.subjectKey === subj.key)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      subj,
      syllabusPct,
      avgAcc,
      attemptsCount: attempts.length,
      studyMins: mins,
    };
  });

  // Overall Time per MCQ
  const totalQuestionsAnswered = quizHistory.reduce(
    (s, q) => s + q.totalQuestions,
    0
  );
  const totalQuizSeconds = quizHistory.reduce(
    (s, q) => s + q.durationSeconds,
    0
  );
  const avgSecPerQuestion =
    totalQuestionsAnswered > 0
      ? Math.round(totalQuizSeconds / totalQuestionsAnswered)
      : 0;

  // Weakness Radar: prioritize Year-1 (1st paper + ICT) subjects with low completion or accuracy < 70%
  const priorityWeakAreas = subjectStats
    .filter(
      (st) =>
        (st.avgAcc !== null && st.avgAcc < 75) ||
        (['physics1', 'chemistry1', 'math1', 'biology1', 'ict'].includes(
          st.subj.key
        ) &&
          st.syllabusPct < 35)
    )
    .slice(0, 4);

  const mistakeCount = profile.mistakeIds?.length || 0;
  const srsCount = profile.srsMasteredIds?.length || 0;

  const cardClass = `p-5 sm:p-6 rounded-2xl border ${
    isDark
      ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
      : 'bg-white/95 border-slate-200/80 card-soft-light'
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {lang === 'bn'
            ? 'শিক্ষার্থী ডায়াগনস্টিক রিপোর্ট • HSC 2028'
            : 'STUDENT DIAGNOSTIC TELEMETRY • HSC 2028'}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <span>
            {lang === 'bn'
              ? 'পারফরম্যান্স অ্যানালিটিক্স ও দুর্বলতা রাডার'
              : 'Performance Analytics & Weakness Radar'}
          </span>
        </h1>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {lang === 'bn'
            ? 'কোন পত্রে আপনার দখল ভালো এবং কোন অধ্যায়ে বাড়তি অনুশীলন প্রয়োজন—তার ব্যক্তিগত ডেটা বিশ্লেষণ।'
            : 'Personal diagnostic breakdown of syllabus mastery, MCQ speed, mistake bank, and priority focus papers.'}
        </p>
      </div>

      {/* Top 4 Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="text-xs opacity-65 font-semibold">
            {lang === 'bn' ? 'প্রশ্নপ্রতি গড় সময়' : 'Avg Speed / MCQ'}
          </div>
          <div className="text-2xl font-extrabold font-formula tabular-nums mt-2 text-indigo-600 dark:text-indigo-300">
            {avgSecPerQuestion > 0
              ? `${formatNum(avgSecPerQuestion, lang)}s`
              : lang === 'bn'
              ? 'পরীক্ষা দিন'
              : 'N/A'}
          </div>
          <div className="text-[11px] opacity-60 mt-1">
            {lang === 'bn'
              ? 'বোর্ড আদর্শ মান: ≤ ৫৫ সেকেন্ড'
              : 'Board target: ≤ 55 sec/question'}
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-xs opacity-65 font-semibold">
            {lang === 'bn' ? 'ভুল সংশোধন ব্যাংক (Mistakes)' : 'Pending Mistakes'}
          </div>
          <div className="text-2xl font-extrabold font-formula tabular-nums mt-2 text-amber-600 dark:text-amber-300">
            {formatNum(mistakeCount, lang)}
          </div>
          <div className="text-[11px] opacity-60 mt-1">
            {lang === 'bn'
              ? 'সঠিক উত্তর দিলেই তালিকা থেকে কমবে'
              : 'Cleared automatically on re-test'}
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-xs opacity-65 font-semibold">
            {lang === 'bn' ? 'আয়ত্তকৃত সূত্র (SRS Mastered)' : 'SRS Formulas Mastered'}
          </div>
          <div className="text-2xl font-extrabold font-formula tabular-nums mt-2 text-emerald-600 dark:text-emerald-300">
            {formatNum(srsCount, lang)}
          </div>
          <div className="text-[11px] opacity-60 mt-1">
            {lang === 'bn'
              ? 'ফ্ল্যাশকার্ড অ্যাক্টিভ রিকল'
              : 'Verified via active recall'}
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-xs opacity-65 font-semibold">
            {lang === 'bn' ? 'সমাধানকৃত বোর্ড CQ' : 'Solved Board CQs'}
          </div>
          <div className="text-2xl font-extrabold font-formula tabular-nums mt-2 text-teal-600 dark:text-teal-300">
            {formatNum(profile.solvedCqs?.length || 0, lang)}
          </div>
          <div className="text-[11px] opacity-60 mt-1">
            {lang === 'bn' ? '১০ নম্বরের পূর্ণাঙ্গ অনুশীলন' : '10-mark written practice'}
          </div>
        </div>
      </div>

      {/* Weakness Radar & Immediate Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-5 ${cardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>
                {lang === 'bn'
                  ? 'অগ্রাধিকার ফোকাস রাডার (HSC ’28 ১ম বর্ষ)'
                  : 'Priority Weakness & Focus Radar'}
              </span>
            </h2>
          </div>

          {mistakeCount > 0 && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                isDark
                  ? 'bg-amber-500/12 border-amber-400/30 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div>
                <div className="text-xs font-bold">
                  {lang === 'bn'
                    ? `আপনার Mistake Bank-এ ${formatNum(mistakeCount, lang)}টি ভুল প্রশ্ন জমা আছে`
                    : `${mistakeCount} missed MCQs waiting in Mistake Bank`}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  {lang === 'bn'
                    ? 'ভুল প্রশ্নগুলো রিভিশন দিলে পরীক্ষায় একই ভুল আর হবে না।'
                    : 'Retake your missed questions now to lock in concepts.'}
                </div>
              </div>
              <button
                onClick={() =>
                  onStartMistakeExam ? onStartMistakeExam() : onNavigate('mcq')
                }
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                {lang === 'bn' ? 'সংশোধন' : 'Fix'}
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            {priorityWeakAreas.map((item) => (
              <div
                key={item.subj.key}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark
                    ? 'bg-slate-900/55 border-slate-700/80'
                    : 'bg-slate-50/80 border-slate-200/85'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                      isDark ? item.subj.bgDark : item.subj.bgLight
                    }`}
                  >
                    <SubjectIcon name={item.subj.iconName} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">
                      {item.subj.name[lang]}
                    </div>
                    <div className="text-[11px] opacity-65">
                      {lang === 'bn' ? 'সিলেবাস:' : 'Syllabus:'}{' '}
                      {formatNum(item.syllabusPct, lang)}% •{' '}
                      {item.avgAcc !== null
                        ? `${lang === 'bn' ? 'MCQ নির্ভুলতা:' : 'Acc:'} ${formatNum(
                            item.avgAcc,
                            lang
                          )}%`
                        : lang === 'bn'
                        ? 'এখনো MCQ দেওয়া হয়নি'
                        : 'No MCQ taken yet'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('syllabus', item.subj.key)}
                  className="p-2 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer shrink-0"
                  title="Go to syllabus"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}

            {priorityWeakAreas.length === 0 && (
              <div className="p-5 rounded-xl border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-500/10 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'চমৎকার! আপনার ১ম বর্ষের সকল বিষয়ে সুষম অগ্রগতি বজায় আছে।'
                    : 'Great job! All Year-1 subjects are progressing evenly.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 11-Subject Mastery & Accuracy Bars */}
        <div className={`lg:col-span-7 ${cardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-500" />
              <span>
                {lang === 'bn'
                  ? '১১টি পত্রের সিলেবাস বনাম পরীক্ষা নির্ভুলতা ম্যাট্রিক্স'
                  : '11-Paper Syllabus Completion vs. Exam Accuracy'}
              </span>
            </h2>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {subjectStats.map((st) => (
              <div key={st.subj.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{st.subj.name[lang]}</span>
                  <span className="font-mono opacity-75 tabular-nums">
                    {lang === 'bn' ? 'সিলেবাস ' : 'Syl '}
                    {formatNum(st.syllabusPct, lang)}%
                    {st.avgAcc !== null
                      ? ` | MCQ ${formatNum(st.avgAcc, lang)}%`
                      : ''}{' '}
                    {st.studyMins > 0
                      ? `| ${formatNum(st.studyMins, lang)}m`
                      : ''}
                  </span>
                </div>
                <div
                  className={`h-2 w-full rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-700/60' : 'bg-slate-100'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(st.syllabusPct, 2)}%`,
                      backgroundColor: st.subj.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className={`pt-3 border-t flex items-center justify-between text-xs opacity-70 ${
              isDark ? 'border-slate-700/60' : 'border-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {lang === 'bn'
                ? `সর্বমোট ফোকাস অধ্যয়ন: ${formatNum(profile.studyMinutes, lang)} মিনিট`
                : `Total Focus Study Logged: ${profile.studyMinutes} mins`}
            </span>
            <span>HSC 2028 Science</span>
          </div>
        </div>
      </div>

      {/* Offline PWA & Portable Study Backup Card */}
      <div
        className={`${cardClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div>
          <h3 className="font-bold text-sm sm:text-base">
            {lang === 'bn'
              ? 'অফলাইন ব্যাকআপ ও ডেটা এক্সপোর্ট / রিস্টোর (PWA Ready)'
              : 'Portable Study Backup & Restore (Offline PWA Ready)'}
          </h3>
          <p className="text-xs opacity-70 mt-1">
            {lang === 'bn'
              ? 'তোমার সিলেবাস অগ্রগতি, ব্যক্তিগত নোটস, মিস্টেক ব্যাংক ও রুটিন JSON ফাইলে ব্যাকআপ রাখো বা অন্য ডিভাইস/Dropbox থেকে রিস্টোর করো।'
              : 'Export your syllabus progress, personal notes, Mistake Bank, and routine as a JSON backup file for local or Dropbox storage.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onExportBackup && (
            <button
              type="button"
              onClick={onExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn' ? 'ব্যাকআপ ডাউনলোড (.json)' : 'Export Backup'}
              </span>
            </button>
          )}

          {onImportBackup && (
            <label
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-teal-300 hover:border-teal-400'
                  : 'bg-white border-slate-200 text-teal-700 hover:border-teal-300 shadow-2xs'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn' ? 'ব্যাকআপ রিস্টোর' : 'Restore Backup'}
              </span>
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportBackup(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
