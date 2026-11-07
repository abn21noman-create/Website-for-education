import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  Clock3,
  Crown,
  Flame,
  Gauge,
  Medal,
  RefreshCw,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { Lang, StudentProfile, Theme } from '../types';
import { EDUCATION_BOARDS, formatNum, getBoardLabel } from '../lib/i18n';
import { getSupabase } from '../lib/supabase';

function boundedMetric(value: unknown, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(0, Math.round(parsed))) : 0;
}

function safeLabel(value: unknown, fallback: string, max = 120): string {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, max)
    : fallback;
}

interface LeaderboardViewProps {
  lang: Lang;
  theme: Theme;
  currentProfile: StudentProfile;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onVisibilityChange?: (visible: boolean) => void;
  /** Optional dependency injection for offline and loading-state tests. */
  clientFactory?: typeof getSupabase;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  lang,
  theme,
  currentProfile,
  isAuthenticated,
  onOpenAuth,
  onVisibilityChange,
  clientFactory = getSupabase,
}) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'private' | 'community'>('private');
  const [entries, setEntries] = useState<StudentProfile[]>([]);
  const [boardFilter, setBoardFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const loadedXpRef = useRef<number | null>(null);

  const loadLeaderboard = React.useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const supabase = await clientFactory();
      const { data, error } = await supabase
        .from('hsc28_leaderboard')
        .select('id,full_name,college_name,board,target_goal,avatar_color,xp,chapters_mastered,quizzes_taken,best_accuracy,study_minutes,streak_days,is_demo')
        .order('xp', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (Array.isArray(data)) {
        const mapped: StudentProfile[] = data.slice(0, 50).map((row: any, index: number) => ({
          id: safeLabel(row?.id, `community-${index}`, 80),
          fullName: safeLabel(row?.full_name, lang === 'bn' ? 'HSC ২০২৮ শিক্ষার্থী' : 'HSC 2028 Student', 100),
          collegeName: safeLabel(row?.college_name, '', 140),
          board: EDUCATION_BOARDS.some((board) => board.id === row?.board) ? row.board : 'Jashore',
          targetGoal: safeLabel(row?.target_goal, 'HSC Golden A+', 100),
          avatarColor: /^#[0-9a-f]{6}$/i.test(row?.avatar_color || '') ? row.avatar_color : '#4f46e5',
          xp: boundedMetric(row?.xp, 100_000_000),
          chaptersMastered: boundedMetric(row?.chapters_mastered, 10_000),
          quizzesTaken: boundedMetric(row?.quizzes_taken, 1_000_000),
          bestAccuracy: boundedMetric(row?.best_accuracy, 100),
          studyMinutes: boundedMetric(row?.study_minutes, 10_000_000),
          streakDays: boundedMetric(row?.streak_days, 10_000),
          bookmarks: Array.isArray(row?.bookmarks)
            ? row.bookmarks.filter((item: unknown): item is string => typeof item === 'string').slice(0, 500)
            : [],
          isDemo: row?.is_demo === true,
        }));
        setEntries(mapped);
      }
    } catch {
      // Preserve a previous snapshot but do not present it as live.
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [clientFactory, lang]);

  useEffect(() => {
    const profileXp = boundedMetric(currentProfile.xp, 100_000_000);
    if (mode !== 'community' || loadedXpRef.current === profileXp) return;
    // Private mode deliberately performs no leaderboard request. Fetch only
    // after the student explicitly opens the community comparison.
    loadedXpRef.current = profileXp;
    void loadLeaderboard();
  }, [mode, loadLeaderboard, currentProfile.xp]);

  const combinedList = React.useMemo(() => {
    // The service returns at most the top 50 overall. Do not insert the
    // current student into this sample and then claim a nationwide rank.
    let arr = [...entries];
    if (boardFilter !== 'all') {
      arr = arr.filter(
        (x) => x.board.toLowerCase() === boardFilter.toLowerCase()
      );
    }
    arr.sort((a, b) => b.xp - a.xp);
    return arr;
  }, [entries, boardFilter]);

  const myRank =
    combinedList.findIndex((x) => x.id === currentProfile.id) + 1;
  const safeXp = boundedMetric(currentProfile.xp, 100_000_000);
  const safeStudyMinutes = boundedMetric(currentProfile.studyMinutes, 10_000_000);
  const milestoneSize = 250;
  const milestoneBase = Math.floor(safeXp / milestoneSize) * milestoneSize;
  const nextMilestone = milestoneBase + milestoneSize;
  const milestoneProgress = Math.min(100, Math.max(0, ((safeXp - milestoneBase) / milestoneSize) * 100));
  const privateStats = [
    { id: 'chapters', icon: BookOpenCheck, value: boundedMetric(currentProfile.chaptersMastered, 10_000), bn: 'আয়ত্ত অধ্যায়', en: 'Chapters mastered' },
    { id: 'quizzes', icon: ClipboardCheck, value: boundedMetric(currentProfile.quizzesTaken, 1_000_000), bn: 'MCQ সেট', en: 'Quiz sets' },
    { id: 'accuracy', icon: Gauge, value: `${boundedMetric(currentProfile.bestAccuracy, 100)}%`, bn: 'সেরা নির্ভুলতা', en: 'Best accuracy' },
    { id: 'study', icon: Clock3, value: `${(safeStudyMinutes / 60).toFixed(1)}h`, bn: 'পড়ার সময়', en: 'Study time' },
    { id: 'streak', icon: Flame, value: boundedMetric(currentProfile.streakDays, 10_000), bn: 'দিনের ধারা', en: 'Day streak' },
  ];
  const changeVisibility = (nextVisible: boolean) => {
    if (!nextVisible) {
      setEntries((current) => current.filter((entry) => entry.id !== currentProfile.id));
    }
    onVisibilityChange?.(nextVisible);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {lang === 'bn' ? 'প্রাইভেট-ফার্স্ট অগ্রগতি • HSC 2028' : 'PRIVATE-FIRST PROGRESS • HSC 2028'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>{lang === 'bn' ? 'নিজের অগ্রগতি ও কমিউনিটি XP' : 'Personal progress & community XP'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'ডিফল্টে শুধু নিজের শেখা দেখুন; চাইলে আলাদাভাবে কমিউনিটির XP তালিকা খুলুন।'
              : 'See only your own learning by default; open the community XP list only when you choose.'}
          </p>
        </div>

        <div
          className={`grid grid-cols-2 gap-1 rounded-xl border p-1 ${isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-100/80 border-slate-200'}`}
          role="group"
          aria-label={lang === 'bn' ? 'অগ্রগতি দেখার ধরন' : 'Progress view'}
        >
          <button
            type="button"
            data-leaderboard-mode="private"
            aria-pressed={mode === 'private'}
            onClick={() => setMode('private')}
            className={`min-h-11 rounded-lg px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
              mode === 'private'
                ? isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white text-emerald-800 shadow-xs'
                : isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {lang === 'bn' ? 'শুধু আমি' : 'Just me'}
          </button>
          <button
            type="button"
            data-leaderboard-mode="community"
            aria-pressed={mode === 'community'}
            onClick={() => setMode('community')}
            className={`min-h-11 rounded-lg px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
              mode === 'community'
                ? isDark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white text-indigo-800 shadow-xs'
                : isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            {lang === 'bn' ? 'কমিউনিটি' : 'Community'}
          </button>
        </div>
      </div>

      {mode === 'private' ? (
        <section
          data-private-progress="true"
          className={`rounded-2xl border p-5 sm:p-6 ${
            isDark ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark' : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {lang === 'bn' ? 'তুলনা নয়—নিজের আগের অবস্থাকে ছাড়িয়ে যান' : 'NO COMPARISON—BEAT YOUR PREVIOUS SELF'}
              </p>
              <h2 className="mt-1 text-lg sm:text-xl font-extrabold truncate">
                {safeLabel(currentProfile.fullName, lang === 'bn' ? 'HSC ২০২৮ শিক্ষার্থী' : 'HSC 2028 Student', 100)}
              </h2>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {safeLabel(currentProfile.targetGoal, lang === 'bn' ? 'HSC ২০২৮ লক্ষ্য' : 'HSC 2028 goal', 100)}
              </p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-right ${isDark ? 'bg-emerald-500/10 border-emerald-400/25' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`text-[10px] font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>XP</p>
              <p className="text-2xl font-extrabold font-mono tabular-nums">{formatNum(safeXp, lang)}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {privateStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className={`rounded-xl border p-3 ${isDark ? 'bg-slate-900/35 border-slate-700' : 'bg-slate-50/80 border-slate-200'}`}>
                  <Icon className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                  <p className="mt-2 text-lg font-extrabold font-mono tabular-nums">{formatNum(stat.value, lang)}</p>
                  <p className={`mt-0.5 text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lang === 'bn' ? stat.bn : stat.en}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={`mt-5 rounded-xl border p-4 ${isDark ? 'bg-slate-900/35 border-slate-700' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-3 text-xs font-bold">
              <span>{lang === 'bn' ? 'পরের ব্যক্তিগত মাইলফলক' : 'Next personal milestone'}</span>
              <span className="font-mono tabular-nums">{formatNum(safeXp, lang)} / {formatNum(nextMilestone, lang)} XP</span>
            </div>
            <div
              className={`mt-2 h-2.5 overflow-hidden rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
              role="progressbar"
              aria-label={lang === 'bn' ? 'পরের XP মাইলফলকের অগ্রগতি' : 'Progress to next XP milestone'}
              aria-valuemin={milestoneBase}
              aria-valuemax={nextMilestone}
              aria-valuenow={safeXp}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500" style={{ width: `${milestoneProgress}%` }} />
            </div>
            <p className={`mt-2 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'bn'
                ? `আর ${formatNum(nextMilestone - safeXp, lang)} XP—এটি অ্যাপের ব্যক্তিগত checkpoint, কোনো পরীক্ষার র‍্যাঙ্ক নয়।`
                : `${nextMilestone - safeXp} XP to go—this is a personal app checkpoint, not an exam rank.`}
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-500" aria-hidden="true" />
              {lang === 'bn'
                ? 'এই ভিউ অন্য শিক্ষার্থীর ডেটা লোড করে না। “XP শেয়ার” করলে নাম, কলেজ, বোর্ড, লক্ষ্য ও পড়ার সারাংশ signed-in শিক্ষার্থীরা দেখবে; যেকোনো সময় বন্ধ করা যায়।'
                : 'This view loads no other student data. “Share my XP” also shares your name, college, board, goal and study summary with signed-in students; you can turn it off anytime.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {!isAuthenticated && (
                <button type="button" onClick={onOpenAuth} className="min-h-11 px-3 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-700 dark:text-emerald-200 dark:border-emerald-400/35">
                  {lang === 'bn' ? 'ক্লাউড ব্যাকআপ চালু করুন' : 'Enable cloud backup'}
                </button>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  data-private-visibility-switch="true"
                  role="switch"
                  aria-checked={currentProfile.leaderboardVisible === true}
                  disabled={!onVisibilityChange}
                  onClick={() => changeVisibility(currentProfile.leaderboardVisible !== true)}
                  className={`min-h-11 px-3 rounded-xl border text-xs font-bold disabled:opacity-50 ${
                    currentProfile.leaderboardVisible === true
                      ? isDark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'
                      : isDark ? 'border-emerald-400/35 text-emerald-200' : 'border-emerald-300 text-emerald-800'
                  }`}
                >
                  {currentProfile.leaderboardVisible === true
                    ? (lang === 'bn' ? 'কমিউনিটি থেকে লুকান' : 'Hide from community')
                    : (lang === 'bn' ? 'আমার XP শেয়ার করুন' : 'Share my XP')}
                </button>
              )}
              <button type="button" onClick={() => setMode('community')} className="min-h-11 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
                {lang === 'bn' ? 'কমিউনিটি XP দেখুন' : 'View community XP'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div data-community-leaderboard="true" className="space-y-5">
          <div className={`rounded-xl border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'bg-indigo-500/8 border-indigo-400/20' : 'bg-indigo-50/60 border-indigo-200'}`}>
            <div>
              <h2 className="text-sm font-extrabold flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />{lang === 'bn' ? 'কমিউনিটি XP তালিকা' : 'Community XP list'}</h2>
              <p className={`mt-1 text-[10px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {lang === 'bn'
                  ? 'সর্বোচ্চ XP-এর সর্বোচ্চ ৫০টি synced প্রোফাইল; এটি জাতীয়/বোর্ড পরীক্ষার মেধাক্রম নয়।'
                  : 'Up to 50 synced profiles by XP; this is not an official national or board-exam rank.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={boardFilter}
                aria-label={lang === 'bn' ? 'শিক্ষা বোর্ড ফিল্টার' : 'Filter by education board'}
                onChange={(e) => setBoardFilter(e.target.value)}
                className={`min-h-11 max-w-[13rem] px-3 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-slate-800/75 border-slate-700 text-slate-200' : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
                }`}
              >
                <option value="all">{lang === 'bn' ? 'সকল শিক্ষা বোর্ড' : 'All Education Boards'}</option>
                {EDUCATION_BOARDS.map((board) => <option key={board.id} value={board.id}>{lang === 'bn' ? board.bn : board.en}</option>)}
              </select>
              <button
                type="button"
                onClick={() => void loadLeaderboard()}
                className={`w-11 h-11 rounded-xl border grid place-items-center ${isDark ? 'bg-slate-800/75 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'}`}
                title={lang === 'bn' ? 'তালিকা রিফ্রেশ করুন' : 'Refresh leaderboard'}
                aria-label={lang === 'bn' ? 'তালিকা রিফ্রেশ করুন' : 'Refresh leaderboard'}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            </div>
          </div>

          {isAuthenticated && (
            <section
              data-leaderboard-consent="true"
              aria-live="polite"
              className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                currentProfile.leaderboardVisible === true
                  ? isDark ? 'bg-emerald-500/10 border-emerald-400/25' : 'bg-emerald-50 border-emerald-200'
                  : isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-xs font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  {currentProfile.leaderboardVisible === true
                    ? (lang === 'bn' ? 'আপনার XP শেয়ারিং চালু' : 'Your XP sharing is enabled')
                    : (lang === 'bn' ? 'আপনার XP শেয়ারিং বন্ধ' : 'Your XP sharing is off')}
                </h3>
                <p className={`mt-1 text-[10px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lang === 'bn'
                    ? 'শেয়ার করলে নাম, কলেজ, বোর্ড, লক্ষ্য ও পড়ার সারাংশ অন্য signed-in শিক্ষার্থীরা দেখতে পারবে। উপরের ক্লাউড স্ট্যাটাসে “সেভ হয়েছে” দেখালে পরিবর্তনটি প্রযোজ্য; অফলাইনে থাকলে সিঙ্ক হওয়া পর্যন্ত আগের সেটিং থাকতে পারে।'
                    : 'Opting in shares your name, college, board, goal and study summary with signed-in students. The change applies when cloud status shows saved; while offline, the prior setting can remain until sync.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={currentProfile.leaderboardVisible === true}
                disabled={!onVisibilityChange}
                onClick={() => changeVisibility(currentProfile.leaderboardVisible !== true)}
                className={`min-h-11 shrink-0 rounded-xl px-4 text-xs font-bold disabled:opacity-50 ${
                  currentProfile.leaderboardVisible === true
                    ? isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-800'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {currentProfile.leaderboardVisible === true
                  ? (lang === 'bn' ? 'প্রোফাইল লুকান' : 'Hide my profile')
                  : (lang === 'bn' ? 'আমার XP শেয়ার করুন' : 'Share my XP')}
              </button>
            </section>
          )}

      {/* Guest Cloud Sync Prompt */}
      {!isAuthenticated && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark
              ? 'bg-indigo-950/35 border-indigo-400/25'
              : 'bg-indigo-50/70 border-indigo-200/80'
          }`}
        >
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {lang === 'bn'
                ? 'কমিউনিটি XP তালিকায় যোগ দিতে অ্যাকাউন্ট করুন'
                : 'Create an account to join the community XP list'}
            </h3>
            <p className="text-xs opacity-70 mt-0.5">
              {lang === 'bn'
                ? 'অ্যাকাউন্ট পড়ার ডেটা ব্যাকআপ করে; সাইন ইন করার পর XP শেয়ার করবেন কি না আপনি ঠিক করবেন।'
                : 'An account backs up study data; after signing in, you choose whether to share your XP.'}
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="min-h-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {lang === 'bn' ? 'অ্যাকাউন্ট নিবন্ধন করুন' : 'Register Account'}
            </span>
          </button>
        </div>
      )}

      {loading && entries.length === 0 && (
        <div className={`rounded-2xl border p-5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`} role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" aria-hidden="true" />
            {lang === 'bn' ? 'কমিউনিটি তালিকা লোড হচ্ছে…' : 'Loading the community list…'}
          </div>
          <div className="mt-4 space-y-2" aria-hidden="true">
            {[0, 1, 2].map((row) => <div key={row} className={`h-12 rounded-xl animate-pulse ${isDark ? 'bg-slate-700/70' : 'bg-slate-100'}`} />)}
          </div>
        </div>
      )}
      {loadError && <div className="leaderboard-notice" role="status">{lang === 'bn' ? 'তালিকা লোড করা যায়নি। আগের তথ্য থাকলে তা দেখানো হচ্ছে; আবার চেষ্টা করুন।' : 'Could not load the leaderboard. Any previous snapshot is shown; please try again.'}</div>}
      {!loading && !loadError && combinedList.length === 0 && <div className="sector-empty" role="status"><Trophy size={21} aria-hidden="true" /><strong>{lang === 'bn' ? 'কোনো প্রোফাইল পাওয়া যায়নি' : 'No profiles found'}</strong><span>{lang === 'bn' ? 'অন্য বোর্ড বেছে দেখো বা পরে আবার চেষ্টা করো।' : 'Try another board or check back later.'}</span></div>}

      {/* Top 3 Soft Pastel Podium */}
      {combinedList.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {combinedList.slice(0, 3).map((student, idx) => {
            const rank = idx + 1;
            const isMe = student.id === currentProfile.id;
            return (
              <div
                key={student.id}
                className={`p-5 rounded-2xl border relative transition-all ${
                  rank === 1
                    ? isDark
                      ? 'bg-gradient-to-br from-amber-500/12 to-slate-800/80 border-amber-400/35 card-soft-dark'
                      : 'bg-gradient-to-br from-amber-50/80 to-white border-amber-200/90 card-soft-light'
                    : isDark
                    ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                    : 'bg-white/95 border-slate-200/80 card-soft-light'
                } ${isMe ? 'ring-2 ring-indigo-500/35' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-extrabold border ${
                      rank === 1
                        ? isDark
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/35'
                          : 'bg-amber-100/85 text-amber-800 border-amber-200'
                        : isDark
                        ? 'bg-indigo-500/15 text-indigo-200 border-indigo-400/25'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {rank === 1 ? (
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Medal className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    {lang === 'bn' ? 'তালিকা' : 'LIST'} #{formatNum(rank, lang)}
                  </span>
                  <span className="text-[11px] font-mono opacity-60">
                    {getBoardLabel(student.board, lang)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                      rank === 1
                        ? isDark
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                        : isDark
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {student.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">
                      {student.fullName}
                    </h3>
                    <p className="text-xs opacity-65 truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span>
                        {student.collegeName ||
                          (lang === 'bn' ? 'HSC ২০২৮ বিজ্ঞান' : 'HSC 2028 Science')}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between pt-3 border-t text-xs ${
                    isDark ? 'border-slate-700/60' : 'border-slate-200/70'
                  }`}
                >
                  <div>
                    <span className="opacity-60">
                      {lang === 'bn' ? 'লক্ষ্য: ' : 'Target: '}
                    </span>
                    <span className="font-semibold">{student.targetGoal}</span>
                  </div>
                  <div className="text-base font-extrabold font-mono tabular-nums text-indigo-700 dark:text-indigo-300">
                    {formatNum(student.xp, lang)} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      {combinedList.length > 0 && <div
        className={`rounded-2xl border overflow-hidden ${
          isDark
            ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
            : 'bg-white/95 border-slate-200/80 card-soft-light'
        }`}
      >
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between text-xs font-mono font-bold ${
            isDark
              ? 'bg-slate-900/55 border-slate-700/80 text-indigo-300'
              : 'bg-indigo-50/55 border-slate-200/80 text-indigo-900'
          }`}
        >
          <span>
            {lang === 'bn'
              ? (myRank ? `দেখানো তালিকায় আপনার অবস্থান: #${formatNum(myRank, lang)}` : 'এই তালিকায় আপনার অবস্থান নেই')
              : (myRank ? `YOUR POSITION IN THIS LIST: #${myRank}` : 'NOT IN THIS DISPLAYED LIST')}
          </span>
          <span className="tabular-nums">
            {formatNum(safeXp, lang)} XP
          </span>
        </div>

        <div
          className={`divide-y ${
            isDark ? 'divide-slate-700/50' : 'divide-slate-100'
          }`}
        >
          {combinedList.map((student, idx) => {
            const rank = idx + 1;
            const isMe = student.id === currentProfile.id;
            return (
              <div
                key={student.id}
                className={`px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                  isMe
                    ? isDark
                      ? 'bg-indigo-500/12'
                      : 'bg-indigo-50/60'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-8 font-mono font-extrabold text-xs tabular-nums shrink-0 ${
                      rank <= 3
                        ? 'text-amber-600 dark:text-amber-300'
                        : 'opacity-55'
                    }`}
                  >
                    #{formatNum(rank, lang)}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isDark
                        ? 'bg-slate-900/70 text-indigo-200 border-slate-700'
                        : 'bg-slate-100 text-indigo-800 border-slate-200'
                    }`}
                  >
                    {student.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate flex items-center gap-2">
                      <span>{student.fullName}</span>
                      {isMe && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {lang === 'bn' ? 'আপনি' : 'YOU'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] opacity-60 truncate">
                      {student.collegeName
                        ? `${student.collegeName} • `
                        : ''}
                      {getBoardLabel(student.board, lang)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0 text-right">
                  <div className="hidden sm:block text-[11px] font-mono opacity-65 tabular-nums">
                    <div>
                      {formatNum(student.chaptersMastered, lang)} CH •{' '}
                      {formatNum(Math.round(student.bestAccuracy), lang)}% ACC
                    </div>
                    <div>
                      {formatNum(student.streakDays, lang)}D •{' '}
                      {formatNum(Math.round(student.studyMinutes / 60), lang)}H
                    </div>
                  </div>

                  <div className="font-extrabold font-mono text-sm tabular-nums min-w-[75px] text-indigo-700 dark:text-indigo-300">
                    {formatNum(student.xp, lang)} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>}
        </div>
      )}
    </div>
  );
};
