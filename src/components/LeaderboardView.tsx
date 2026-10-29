import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  RefreshCw,
  UserPlus,
  Building2,
} from 'lucide-react';
import { Lang, StudentProfile, Theme } from '../types';
import { EDUCATION_BOARDS, formatNum, getBoardLabel } from '../lib/i18n';
import { supabase } from '../lib/supabase';

interface LeaderboardViewProps {
  lang: Lang;
  theme: Theme;
  currentProfile: StudentProfile;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

const FALLBACK_PEERS: StudentProfile[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    fullName: 'তানভীর আহমেদ (Tanvir Ahmed)',
    collegeName: 'নটর ডেম কলেজ, ঢাকা',
    board: 'Dhaka',
    targetGoal: 'BUET CSE',
    avatarColor: '#4f46e5',
    xp: 1420,
    chaptersMastered: 14,
    quizzesTaken: 18,
    bestAccuracy: 95,
    studyMinutes: 840,
    streakDays: 12,
    bookmarks: [],
    isDemo: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    fullName: 'নুসরাত জাহান (Nusrat Jahan)',
    collegeName: 'সরকারি এম. এম. সিটি কলেজ, খুলনা',
    board: 'Jashore',
    targetGoal: 'DMC (Medical)',
    avatarColor: '#0d9488',
    xp: 1290,
    chaptersMastered: 12,
    quizzesTaken: 16,
    bestAccuracy: 92.5,
    studyMinutes: 760,
    streakDays: 9,
    bookmarks: [],
    isDemo: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    fullName: 'ফারহান সাদিক (Farhan Sadik)',
    collegeName: 'রাজশাহী কলেজ, রাজশাহী',
    board: 'Rajshahi',
    targetGoal: 'BUET EEE',
    avatarColor: '#0284c7',
    xp: 1150,
    chaptersMastered: 11,
    quizzesTaken: 14,
    bestAccuracy: 90,
    studyMinutes: 680,
    streakDays: 8,
    bookmarks: [],
    isDemo: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000104',
    fullName: 'মালিহা তাবাসসুম (Maliha Tabassum)',
    collegeName: 'হলি ক্রস কলেজ, ঢাকা',
    board: 'Dhaka',
    targetGoal: 'DMC (Medical)',
    avatarColor: '#059669',
    xp: 980,
    chaptersMastered: 9,
    quizzesTaken: 12,
    bestAccuracy: 88,
    studyMinutes: 590,
    streakDays: 7,
    bookmarks: [],
    isDemo: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000105',
    fullName: 'রাহাতুল ইসলাম (Rahatul Islam)',
    collegeName: 'সরকারি বি. এল. কলেজ, খুলনা',
    board: 'Jashore',
    targetGoal: 'KUET / BUET',
    avatarColor: '#6366f1',
    xp: 860,
    chaptersMastered: 8,
    quizzesTaken: 11,
    bestAccuracy: 86.5,
    studyMinutes: 510,
    streakDays: 6,
    bookmarks: [],
    isDemo: true,
  },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  lang,
  theme,
  currentProfile,
  isAuthenticated,
  onOpenAuth,
}) => {
  const isDark = theme === 'dark';
  const [entries, setEntries] = useState<StudentProfile[]>(FALLBACK_PEERS);
  const [boardFilter, setBoardFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadLeaderboard = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hsc28_profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const mapped: StudentProfile[] = data.map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          collegeName: row.college_name || '',
          board: row.board || 'Jashore',
          targetGoal: row.target_goal || 'HSC Golden A+',
          avatarColor: row.avatar_color || '#4f46e5',
          xp: Number(row.xp || 0),
          chaptersMastered: Number(row.chapters_mastered || 0),
          quizzesTaken: Number(row.quizzes_taken || 0),
          bestAccuracy: Number(row.best_accuracy || 0),
          studyMinutes: Number(row.study_minutes || 0),
          streakDays: Number(row.streak_days || 1),
          bookmarks: row.bookmarks || [],
          isDemo: !!row.is_demo,
        }));
        setEntries(mapped);
      }
    } catch {
      // Keep fallback peers if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, currentProfile.xp]);

  const combinedList = React.useMemo(() => {
    const map = new Map<string, StudentProfile>();
    entries.forEach((e) => map.set(e.id, e));
    map.set(currentProfile.id, {
      ...currentProfile,
      fullName: isAuthenticated
        ? currentProfile.fullName
        : lang === 'bn'
        ? `${currentProfile.fullName} (আপনি)`
        : `${currentProfile.fullName} (You)`,
    });

    let arr = Array.from(map.values());
    if (boardFilter !== 'all') {
      arr = arr.filter(
        (x) => x.board.toLowerCase() === boardFilter.toLowerCase()
      );
    }
    arr.sort((a, b) => b.xp - a.xp);
    return arr;
  }, [entries, currentProfile, isAuthenticated, boardFilter, lang]);

  const myRank =
    combinedList.findIndex((x) => x.id === currentProfile.id) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {lang === 'bn' ? 'জাতীয় মেধাক্রম • HSC 2028' : 'NATIONAL MERIT STANDINGS'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>
              {lang === 'bn'
                ? 'HSC ২০২৮ বিজ্ঞান মেধাতালিকা'
                : 'HSC 2028 Science Merit Leaderboard'}
            </span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'সকল শিক্ষা বোর্ডের HSC ’28 শিক্ষার্থীদের অর্জিত XP, অধ্যায় সম্পন্নতা ও নির্ভুলতার র‍্যাঙ্কিং।'
              : 'Live academic rankings across Bangladesh education boards powered by Supabase.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={boardFilter}
            onChange={(e) => setBoardFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
              isDark
                ? 'bg-slate-800/75 border-slate-700 text-slate-200'
                : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
            }`}
          >
            <option value="all">
              {lang === 'bn' ? 'সকল শিক্ষা বোর্ড' : 'All Education Boards'}
            </option>
            {EDUCATION_BOARDS.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === 'bn' ? b.bn : b.en}
              </option>
            ))}
          </select>

          <button
            onClick={loadLeaderboard}
            className={`p-2 rounded-xl border cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-800/75 border-slate-700 hover:border-slate-500'
                : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
            }`}
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

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
                ? 'জাতীয় মেধাতালিকায় আপনার নাম ও কলেজ স্থায়ীভাবে নিবন্ধন করুন'
                : 'Register Your Name & Institution on the National Merit List'}
            </h3>
            <p className="text-xs opacity-70 mt-0.5">
              {lang === 'bn'
                ? 'শিক্ষার্থী অ্যাকাউন্ট তৈরি করলে আপনার বর্তমান অর্জিত পয়েন্ট স্বয়ংক্রিয়ভাবে ক্লাউড মেধাতালিকায় যুক্ত হবে।'
                : 'Sign up in seconds to permanently sync your current XP and rank nationwide.'}
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {lang === 'bn' ? 'অ্যাকাউন্ট নিবন্ধন করুন' : 'Register Account'}
            </span>
          </button>
        </div>
      )}

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
                    RANK #{formatNum(rank, lang)}
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
      <div
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
              ? `আপনার অবস্থান: #${formatNum(myRank || 1, lang)}`
              : `YOUR STANDING: #${myRank || 1}`}
          </span>
          <span className="tabular-nums">
            {formatNum(currentProfile.xp, lang)} XP
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
      </div>
    </div>
  );
};
