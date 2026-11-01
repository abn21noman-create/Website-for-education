import React, { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Minus,
  Plus,
  Target,
} from 'lucide-react';
import { ChapterProgressState, Lang, Theme } from '../types';
import { formatNum } from '../lib/i18n';
import {
  CLASS_TASKS,
  HSC_EXAM_START,
  REVISION_TASKS,
  TOTAL_PLAN_DAYS,
  WEEKDAYS_BN,
  WEEKDAYS_EN,
  WEEKLY_HOUR_TARGET,
  availableStudyMinutes,
  buildStudyDay,
  weekPacing,
  classSlotsForDay,
  EVIDENCE,
  revisionQueue,
  dateForDayNumber,
  dayNumberForDate,
  daysToHsc,
  isRevisionDay,
  phaseForDay,
  toDateKey,
  weekdayIndexForDay,
} from '../lib/masterRoutine';
import {
  ADMISSION_TRACKS,
  allTrackReadiness,
  tracksByPriority,
  trackTimeSplit,
} from '../lib/trackProgress';
import { mainBlockSuggestion, mistakeReport } from '../lib/mistakeLoop';
import { requestChapterDrill } from '../lib/chapterDrill';
import type { TrackKey } from '../lib/trackProgress';
import {
  FINAL_REVISION_FROM_DAY,
  MOCK_TRACKS,
  mockCounts,
  mockTestsBetween,
  upcomingMocks,
} from '../lib/mockPlan';
import { loadAllMcq } from '../data/mcqBank';
import { getSubjectByKey } from '../data/syllabusData';
import type { Chronotype } from '../lib/studyScience';
import type { McqQuestion, SubjectKey } from '../types';
import { sleepFeedback } from '../lib/studyScience';
import {
  completedTasksForDate,
  dueTaskKey,
  learnedChapters,
  loadRoutineState,
  setChronotype,
  setPrimaryTrack,
  logStudyMinutes,
  revisionTaskKey,
  setStartDate,
  setTimeSettings,
  taskKey,
  toggleRoutineTask,
} from '../lib/routineStore';
import type { RoutineState } from '../lib/routineStore';

interface MasterRoutineViewProps {
  lang: Lang;
  theme: Theme;
  progressMap?: Record<string, ChapterProgressState>;
  /** Marking a class chapter done writes straight into the syllabus tracker. */
  onToggleStage?: (chapterId: string, stage: keyof ChapterProgressState) => void;
  /** Jump to the mock-test screen when the student taps a scheduled test. */
  onOpenMock?: () => void;
  /** Ids of every question answered wrongly — feeds the daily main-track block. */
  mistakeIds?: string[];
  /** Open the syllabus for a paper (used by the main-track block). */
  onOpenSyllabus?: (subjectKey: SubjectKey) => void;
}

type Tab = 'today' | 'week' | 'time' | 'tracks';

const bn = (value: number) => formatNum(value, 'bn');

/**
 * The printed 391-day master routine, made checkable.
 *
 * Three tabs: today's two classes with the four tasks the PDF asks for, the
 * seven-day view, and a time planner that turns the hours a student really has
 * into a timetable. Everything is stored on the device.
 */
export const MasterRoutineView: React.FC<MasterRoutineViewProps> = ({
  lang,
  theme,
  progressMap = {},
  onToggleStage,
  onOpenMock,
  mistakeIds = [],
  onOpenSyllabus,
}) => {
  const isDark = theme === 'dark';
  const useBn = lang === 'bn';

  const [state, setState] = useState<RoutineState>(() => loadRoutineState());
  const [tab, setTab] = useState<Tab>('today');
  const [dateKey, setDateKey] = useState<string>(() => toDateKey(new Date()));

  const dayNumber = dayNumberForDate(state.startDate, dateKey);
  const dateObj = new Date(`${dateKey}T00:00:00`);
  const weekday = (dateObj.getDay() + 1) % 7; // JS Sunday=0 → plan Saturday=0

  const slots = useMemo(() => (dayNumber ? classSlotsForDay(dayNumber) : []), [dayNumber, state.startDate]);
  const revisionDay = dayNumber ? isRevisionDay(dayNumber) : weekday === 6;
  const phase = dayNumber ? phaseForDay(dayNumber) : null;
  // Wrong answers from mocks: only the main track's papers are loaded, and only
  // when there is actually something in the mistake bank.
  const [mistakeQuestions, setMistakeQuestions] = useState<McqQuestion[]>([]);
  const mistakeSignature = mistakeIds.join('|');
  useEffect(() => {
    if (!mistakeSignature) {
      setMistakeQuestions([]);
      return;
    }
    // The weekly report spans every paper, so the whole bank is loaded once
    // (session-cached) — only when the mistake bank actually holds something.
    let cancelled = false;
    loadAllMcq()
      .then((list) => {
        if (!cancelled) setMistakeQuestions(list);
      })
      .catch(() => {
        if (!cancelled) setMistakeQuestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [mistakeSignature]);

  // The main track (Medical by default) gets a named block in the timetable,
  // opening on the chapter the mock answers say is weak.
  const focus = useMemo(
    () => mainBlockSuggestion(state.primaryTrack, progressMap, mistakeIds, mistakeQuestions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.primaryTrack, progressMap, mistakeSignature, mistakeQuestions]
  );
  const mistakeStats = useMemo(
    () => mistakeReport(mistakeIds, mistakeQuestions, progressMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mistakeSignature, mistakeQuestions, progressMap]
  );
  const studyDay = useMemo(
    () => buildStudyDay(state.settings, state.chronotype, focus),
    [state.settings, state.chronotype, focus]
  );
  const plan = studyDay.blocks;
  const studyMinutes = studyDay.studyMinutes;
  const available = availableStudyMinutes(state.settings);
  const sleep = useMemo(() => sleepFeedback(state.settings), [state.settings]);

  // Papers of the main track jump the revision queue (Medical = biology + chemistry).
  const prioritySubjectKeys = useMemo(() => {
    const primary = ADMISSION_TRACKS.find((track) => track.key === state.primaryTrack);
    return primary ? primary.subjects.map((subject) => subject.subjectKey as string) : [];
  }, [state.primaryTrack]);
  // Chapters studied earlier that are due for a 1/3/7/21-day review today.
  const dueReviews = useMemo(
    () => revisionQueue(learnedChapters(state), dateKey, state.tasks, prioritySubjectKeys),
    [state, dateKey, prioritySubjectKeys]
  );
  const minutesToday = state.minutes[dateKey] || 0;

  // Weekly target vs what was actually logged (Sat→Fri plan week).
  const pacing = useMemo(
    () => weekPacing(state.startDate, dateKey, state.minutes),
    [state.startDate, dateKey, state.minutes]
  );
  const nextMocks = useMemo(
    () => (dayNumber ? upcomingMocks(dayNumber, 3, state.startDate) : []),
    [dayNumber, state.startDate]
  );
  const weekMocks = useMemo(() => {
    if (!dayNumber) return [];
    const base = new Date(`${dateKey}T00:00:00`);
    const weekdayIdx = (base.getDay() + 1) % 7;
    const saturday = new Date(base.getTime());
    saturday.setDate(saturday.getDate() - weekdayIdx);
    const friday = new Date(saturday.getTime());
    friday.setDate(friday.getDate() + 6);
    const from = dayNumberForDate(state.startDate, toDateKey(saturday));
    const to = dayNumberForDate(state.startDate, toDateKey(friday));
    if (!from || !to) return [];
    return mockTestsBetween(from, to);
  }, [dayNumber, dateKey, state.startDate]);
  const mockTotals = useMemo(() => mockCounts(), []);
  const todayTarget = studyMinutes + (pacing ? pacing.perDayExtra : 0);
  // Main track first — Medical unless the student switched it.
  const trackReadiness = useMemo(() => {
    const byKey = new Map(allTrackReadiness(progressMap).map((track) => [track.track.key, track]));
    return tracksByPriority(state.primaryTrack)
      .map((track) => byKey.get(track.key))
      .filter((track): track is NonNullable<typeof track> => Boolean(track));
  }, [progressMap, state.primaryTrack]);
  const trackSplit = useMemo(
    () => trackTimeSplit(state.primaryTrack, WEEKLY_HOUR_TARGET * 60),
    [state.primaryTrack]
  );
  const tickedToday = completedTasksForDate(state, dateKey);

  // Last seven days of logged minutes, oldest first.
  const weekLog = useMemo(() => {
    const out: { key: string; minutes: number; label: string }[] = [];
    const base = new Date(`${dateKey}T00:00:00`);
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(base.getTime());
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      out.push({
        key,
        minutes: state.minutes[key] || 0,
        label: WEEKDAYS_BN[(d.getDay() + 1) % 7].slice(0, 3),
      });
    }
    return out;
  }, [dateKey, state.minutes]);

  /** Hand a chapter to the MCQ screen and jump there. */
  const startChapterDrill = (row: { subjectKey: string; chapterBn: string; chapterEn: string; chapterId?: string | null }) => {
    requestChapterDrill({
      subjectKey: row.subjectKey as SubjectKey,
      chapterBn: row.chapterBn,
      chapterEn: row.chapterEn,
      chapterId: row.chapterId ?? undefined,
      count: 10,
    });
    onOpenMock?.();
  };

  const shiftDate = (days: number) => {
    const d = new Date(`${dateKey}T00:00:00`);
    d.setDate(d.getDate() + days);
    setDateKey(toDateKey(d));
  };

  const card = isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200/80';
  const muted = isDark ? 'text-slate-400' : 'text-slate-600';
  const chip = isDark
    ? 'bg-slate-800/70 border-slate-700 text-slate-200'
    : 'bg-slate-100 border-slate-200 text-slate-700';

  const toggleTask = (key: string) => setState((prev) => toggleRoutineTask(prev, key));
  const addMinutes = (delta: number) => setState((prev) => logStudyMinutes(prev, dateKey, delta));

  const hscDays = daysToHsc(toDateKey(new Date()));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {useBn ? 'মাস্টার প্ল্যান • ৩৯১ দিন' : 'MASTER PLAN • 391 DAYS'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {useBn ? 'রুটিন ও পড়ার সময়' : 'Routine & Study Time'}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${muted}`}>
            {useBn
              ? 'প্রিন্ট করা রুটিনের কাঠামো — প্রতিদিন ২টা ক্লাস, শুক্রবার রিভিশন ও এক্সাম, সাথে ঘণ্টা হিসাব।'
              : 'The printed routine, structured: two classes a day, Friday revision and exam, plus hour tracking.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${
              isDark
                ? 'bg-emerald-500/12 border-emerald-400/25 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {useBn
              ? `HSC: ${bn(Math.max(0, hscDays))} দিন বাকি`
              : `HSC in ${Math.max(0, hscDays)} days`}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${chip}`}>
            <CalendarDays className="w-3.5 h-3.5" />
            {dayNumber
              ? useBn
                ? `Day ${bn(dayNumber)} / ${bn(TOTAL_PLAN_DAYS)}`
                : `Day ${dayNumber} / ${TOTAL_PLAN_DAYS}`
              : useBn
                ? 'প্ল্যানের বাইরে'
                : 'Outside the plan'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={`inline-flex p-1 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
        {(
          [
            { key: 'today', bn: 'আজ', en: 'Today' },
            { key: 'week', bn: 'এই সপ্তাহ', en: 'This week' },
            { key: 'time', bn: 'পড়ার সময়', en: 'Study time' },
            { key: 'tracks', bn: 'ভর্তি ট্র্যাক', en: 'Admission tracks' },
          ] as { key: Tab; bn: string; en: string }[]
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === item.key
                ? isDark
                  ? 'bg-indigo-500/20 text-indigo-200'
                  : 'bg-white text-indigo-800 shadow-sm'
                : muted
            }`}
          >
            {useBn ? item.bn : item.en}
          </button>
        ))}
      </div>

      {/* Date strip */}
      <div className={`flex items-center justify-between gap-2 rounded-2xl border p-3 ${card}`}>
        <button
          onClick={() => shiftDate(-1)}
          className={`p-2 rounded-lg border ${isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-400'}`}
          aria-label={useBn ? 'আগের দিন' : 'Previous day'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-extrabold">
            {useBn ? WEEKDAYS_BN[weekday] : WEEKDAYS_EN[weekday]}
          </p>
          <p className={`text-[11px] font-mono ${muted}`}>{dateKey}</p>
        </div>
        <button
          onClick={() => shiftDate(1)}
          className={`p-2 rounded-lg border ${isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-400'}`}
          aria-label={useBn ? 'পরের দিন' : 'Next day'}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDateKey(toDateKey(new Date()))}
          className={`ml-1 px-3 py-2 rounded-lg text-[11px] font-bold border ${
            isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-400'
          }`}
        >
          {useBn ? 'আজ' : 'Today'}
        </button>
      </div>

      {/* ── Today ─────────────────────────────────────────────────────── */}
      {tab === 'today' && (
        <div className="space-y-4">
          {phase && (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {useBn ? phase.name.bn : phase.name.en}
              </p>
              <p className={`text-[11px] mt-1 leading-relaxed ${muted}`}>
                {useBn ? phase.focus.bn : phase.focus.en}
              </p>
            </div>
          )}

          {revisionDay ? (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <p className="text-sm font-extrabold">
                {useBn ? 'শুক্রবার — বিশ্রাম, রিভিশন ও এক্সাম' : 'Friday — rest, revision and exam'}
              </p>
              <ul className="mt-3 space-y-2">
                {REVISION_TASKS.map((task, index) => {
                  const key = revisionTaskKey(dateKey, index);
                  const done = Boolean(state.tasks[key]);
                  return (
                    <li key={key}>
                      <button
                        onClick={() => toggleTask(key)}
                        className={`w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                          done
                            ? isDark
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : isDark
                              ? 'border-slate-800 hover:border-slate-600'
                              : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-500' : 'opacity-40'}`} />
                        <span className={done ? 'line-through opacity-80' : ''}>
                          {useBn ? task.bn : task.en}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : slots.length === 0 ? (
            <div className={`rounded-2xl border p-5 text-sm ${card}`}>
              <p className="font-bold">
                {useBn ? 'এই তারিখ প্ল্যানের বাইরে' : 'This date is outside the plan'}
              </p>
              <p className={`text-xs mt-1 ${muted}`}>
                {useBn
                  ? 'নিচে Day 1-এর তারিখ বসিয়ে দাও, তারপর পুরো ৩৯১ দিনের রুটিন হিসাব হবে।'
                  : 'Pick the Day 1 date below and the whole 391-day plan fills in.'}
              </p>
            </div>
          ) : (
            slots.map((slot, slotIndex) => (
              <div key={`${slot.subjectKey}-${slotIndex}`} className={`rounded-2xl border p-4 ${card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {useBn ? `ক্লাস ${bn(slotIndex + 1)}` : `Class ${slotIndex + 1}`}
                    </p>
                    <p className="text-sm font-extrabold mt-0.5">
                      {useBn ? slot.subjectBn : slot.subjectEn}
                    </p>
                    <p className={`text-xs mt-0.5 ${muted}`}>
                      {useBn ? slot.chapterBn : slot.chapterEn}
                      <span className="opacity-70"> · {useBn ? `চ্যাপ্টার ${bn(slot.chapterNumber)}` : `chapter ${slot.chapterNumber}`}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded-lg border ${chip}`}>
                      {useBn ? '২ ঘণ্টা' : '2 h'}
                    </span>
                    {onToggleStage && slot.chapterId && (
                      <button
                        onClick={() => onToggleStage(slot.chapterId, 'theoryDone')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                          progressMap[slot.chapterId]?.theoryDone
                            ? isDark
                              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : isDark
                              ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                              : 'border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {progressMap[slot.chapterId]?.theoryDone
                          ? useBn
                            ? '✓ সিলেবাসে সম্পন্ন'
                            : '✓ Done in syllabus'
                          : useBn
                            ? 'সিলেবাসে টিক দাও'
                            : 'Mark in syllabus'}
                      </button>
                    )}
                  </div>
                </div>

                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CLASS_TASKS.map((task, taskIndex) => {
                    const key = taskKey(dateKey, slotIndex, taskIndex);
                    const done = Boolean(state.tasks[key]);
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggleTask(key)}
                          className={`w-full flex items-start gap-2 text-left px-3 py-2 rounded-lg border text-[11px] transition-colors ${
                            done
                              ? isDark
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : isDark
                                ? 'border-slate-800 hover:border-slate-600'
                                : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${done ? 'text-emerald-500' : 'opacity-40'}`} />
                          <span className={done ? 'line-through opacity-80' : ''}>
                            {useBn ? task.bn : task.en}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          {/* Spaced reviews due today */}
          {dueReviews.length > 0 && (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold">
                  {useBn ? 'আজকের স্পেসড রিভিউ' : 'Spaced reviews due today'}
                </p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${chip}`}>
                  {bn(dueReviews.length)}
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${muted}`}>
                {useBn
                  ? '১, ৩, ৭ ও ২১ দিন আগে পড়া অধ্যায়গুলো আজ ফিরে আসছে — এটাই ভুলে যাওয়া ঠেকানোর প্রধান উপায়।'
                  : 'Chapters from 1, 3, 7 and 21 days ago come back today — the main defence against forgetting.'}
              </p>
              <ul className="mt-3 space-y-2">
                {dueReviews.map((item) => {
                  const key = dueTaskKey(dateKey, item.chapterId, item.interval);
                  const done = Boolean(state.tasks[key]);
                  return (
                    <li key={key}>
                      <button
                        onClick={() => toggleTask(key)}
                        className={`w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                          done
                            ? isDark
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : isDark
                              ? 'border-slate-800 hover:border-slate-600'
                              : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-500' : 'opacity-40'}`} />
                        <span className="flex-1">
                          <span className={done ? 'line-through opacity-80' : 'font-bold'}>
                            {useBn ? item.chapterBn : item.chapterEn}
                          </span>
                          <span className={`block text-[10px] ${muted}`}>
                            {useBn ? item.subjectBn : item.subjectEn} · D+{item.interval}
                            {item.daysOverdue > 0
                              ? useBn
                                ? ` · ${bn(item.daysOverdue)} দিন দেরি`
                                : ` · ${item.daysOverdue}d late`
                              : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Target for today, nudged by this week's pacing */}
          {pacing && (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold">
                  {useBn ? 'আজকের পড়ার লক্ষ্য' : 'Today’s study target'}
                </p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${chip}`}>
                  {useBn ? `${bn(todayTarget)} মিনিট` : `${todayTarget} min`}
                </span>
              </div>
              <div className={`mt-2 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className={`h-full ${
                    pacing.verdict === 'ahead' || pacing.verdict === 'onTrack'
                      ? 'bg-emerald-500'
                      : pacing.verdict === 'behind'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((pacing.doneMinutes / Math.max(1, pacing.expectedMinutes)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <p className={`text-[11px] mt-2 leading-relaxed ${muted}`}>
                {useBn ? pacing.messageBn : pacing.messageEn}
              </p>
              <div
                className={`mt-2 flex items-start gap-2 rounded-lg px-2.5 py-2 ${
                  isDark ? 'bg-rose-500/10 text-rose-200' : 'bg-rose-50 text-rose-900'
                }`}
              >
                <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20">
                  {useBn ? 'মূল ট্র্যাক' : 'MAIN'}
                </span>
                <span className="flex-1">
                  <span className="text-[11px] font-semibold leading-relaxed block">
                    {useBn ? focus.titleBn : focus.titleEn}
                    {' · '}
                    {useBn ? `${bn(focus.minutes)} মিনিট` : `${focus.minutes} min`}
                  </span>
                  <span className="block text-[10px] mt-0.5 opacity-90">
                    {useBn ? focus.subtitleBn : focus.subtitleEn}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        focus.reason === 'mistakes'
                          ? isDark
                            ? 'bg-amber-500/25 text-amber-200'
                            : 'bg-amber-200 text-amber-900'
                          : isDark
                            ? 'bg-slate-600/50 text-slate-200'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {focus.reason === 'mistakes'
                        ? useBn
                          ? `মক-এর ভুল ${bn(focus.wrongCount)}`
                          : `${focus.wrongCount} mock mistakes`
                        : useBn
                          ? 'ট্র্যাকারে পিছিয়ে'
                          : 'behind in tracker'}
                    </span>
                    {onOpenSyllabus && (
                      <button
                        onClick={() => onOpenSyllabus(focus.subjectKey)}
                        className="text-[10px] font-bold underline decoration-dotted"
                      >
                        {useBn ? 'সিলেবাসে খোলো' : 'Open in syllabus'}
                      </button>
                    )}
                    {onOpenMock && focus.chapterBn && (
                      <button
                        onClick={() =>
                          startChapterDrill({
                            subjectKey: focus.subjectKey,
                            chapterBn: focus.chapterBn as string,
                            chapterEn: focus.chapterEn || (focus.chapterBn as string),
                            chapterId: focus.chapterId,
                          })
                        }
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isDark ? 'bg-rose-500/25 text-rose-100' : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {useBn ? '১০টি প্রশ্ন' : '10 questions'}
                      </button>
                    )}
                  </span>
                </span>
              </div>
              {pacing.perDayExtra > 0 && (
                <p className="text-[11px] mt-1 font-bold text-amber-600 dark:text-amber-300">
                  {useBn
                    ? `আজকের ব্লকে +${bn(pacing.perDayExtra)} মিনিট যোগ হয়েছে`
                    : `Today’s blocks carry +${pacing.perDayExtra} min`}
                </p>
              )}
            </div>
          )}

          {/* Upcoming mock tests */}
          {nextMocks.length > 0 && (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold">
                  {useBn ? 'পরের মক টেস্ট' : 'Next mock tests'}
                </p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${chip}`}>
                  {useBn
                    ? `প্ল্যানে ${bn(
                        mockTotals.weekly +
                          mockTotals.varsity +
                          mockTotals.engineering +
                          mockTotals.medical +
                          mockTotals.combined
                      )}টি`
                    : `${mockTotals.weekly +
                        mockTotals.varsity +
                        mockTotals.engineering +
                        mockTotals.medical +
                        mockTotals.combined} in plan`}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {nextMocks.map((test) => (
                  <li key={test.id}>
                    <button
                      onClick={() => (onOpenMock ? onOpenMock() : undefined)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                        test.daysAway === 0
                          ? isDark
                            ? 'border-rose-400/40 bg-rose-500/10'
                            : 'border-rose-300 bg-rose-50'
                          : isDark
                            ? 'border-slate-800 hover:border-slate-600'
                            : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold">{useBn ? test.titleBn : test.titleEn}</span>
                        <span className="shrink-0 font-mono text-[10px] opacity-80">
                          Day {bn(test.dayNumber)}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${muted}`}>
                        {test.dateKey} ·{' '}
                        {useBn
                          ? `${bn(test.track.minutes)} মিনিট · ${bn(test.track.marks)} নম্বর`
                          : `${test.track.minutes} min · ${test.track.marks} marks`}
                        {test.track.negative ? (useBn ? ' · নেগেটিভ আছে' : ' · negative marking') : ''}
                        {' · '}
                        {test.daysAway === 0
                          ? useBn
                            ? 'আজ'
                            : 'today'
                          : useBn
                            ? `${bn(test.daysAway)} দিন পরে`
                            : `in ${test.daysAway} d`}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mistake bank report */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold">
                {useBn ? 'ভুলের খাতা' : 'Mistake bank'}
              </p>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  mistakeStats.totalWrong > 0
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'bg-amber-100 text-amber-800'
                    : chip
                }`}
              >
                {useBn
                  ? `${bn(mistakeStats.totalWrong)}টি ভুল`
                  : `${mistakeStats.totalWrong} wrong`}
              </span>
            </div>
            <p className={`text-[11px] mt-1 leading-relaxed ${muted}`}>
              {useBn ? mistakeStats.adviceBn : mistakeStats.adviceEn}
            </p>

            {mistakeStats.chapters.length > 0 && (
              <ul className="mt-3 space-y-2">
                {mistakeStats.chapters.slice(0, 5).map((row) => (
                  <li
                    key={`${row.subjectKey}-${row.chapterBn}`}
                    className={`flex items-start justify-between gap-2 rounded-xl border px-2.5 py-2 ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">
                        {useBn ? row.chapterBn : row.chapterEn}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${muted}`}>
                        {useBn
                          ? getSubjectByKey(row.subjectKey as SubjectKey).shortName.bn
                          : getSubjectByKey(row.subjectKey as SubjectKey).shortName.en}
                        {' · '}
                        {useBn
                          ? `${bn(row.wrongCount)}টি ভুল · ${bn(row.stagesDone)}/৪ ধাপ`
                          : `${row.wrongCount} wrong · ${row.stagesDone}/4 stages`}
                        {row.repeated && (
                          <span className="ml-1 font-bold text-amber-600 dark:text-amber-400">
                            {useBn ? '· বারবার ফিরছে' : '· repeating'}
                          </span>
                        )}
                      </p>
                    </div>
                    {onOpenMock && (
                      <button
                        onClick={() => startChapterDrill(row)}
                        className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border ${
                          isDark
                            ? 'border-slate-700 hover:border-slate-500'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {useBn ? '১০ প্রশ্ন' : '10 Q'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {mistakeStats.papers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mistakeStats.papers.map((paper) => (
                  <span
                    key={paper.subjectKey}
                    className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {useBn
                      ? getSubjectByKey(paper.subjectKey as SubjectKey).shortName.bn
                      : getSubjectByKey(paper.subjectKey as SubjectKey).shortName.en}
                    {' '}
                    {bn(paper.count)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hours log */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold">{useBn ? 'আজকের পড়ার সময়' : 'Study time today'}</p>
                <p className={`text-[11px] ${muted}`}>
                  {useBn
                    ? `${bn(tickedToday)}টি কাজ টিক পড়েছে · লক্ষ্য ${bn(Math.round(studyMinutes / 60))} ঘণ্টা`
                    : `${tickedToday} tasks ticked · target ${Math.round(studyMinutes / 60)} h`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addMinutes(-30)}
                  className={`p-2 rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                  aria-label={useBn ? '৩০ মিনিট কমাও' : 'Subtract 30 minutes'}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-extrabold tabular-nums min-w-[3.5rem] text-center">
                  {bn(Math.round((minutesToday / 60) * 10) / 10)}
                  <span className="text-[11px] font-bold opacity-70"> {useBn ? 'ঘণ্টা' : 'h'}</span>
                </span>
                <button
                  onClick={() => addMinutes(30)}
                  className={`p-2 rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                  aria-label={useBn ? '৩০ মিনিট যোগ করো' : 'Add 30 minutes'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`mt-3 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, (minutesToday / Math.max(1, studyMinutes)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Week ──────────────────────────────────────────────────────── */}
      {tab === 'week' && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-4 py-3 text-xs font-extrabold border-b ${isDark ? 'border-slate-800' : 'border-slate-200/80'}`}>
            {useBn ? 'সাপ্তাহিক ছক — ২ ক্লাস + শুক্রবার রিভিশন' : 'Weekly grid — 2 classes + Friday revision'}
          </div>
          <ul className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200/80'}`}>
            {Array.from({ length: 7 }).map((_, offset) => {
              const base = new Date(`${dateKey}T00:00:00`);
              const currentWeekday = (base.getDay() + 1) % 7;
              const d = new Date(base.getTime());
              d.setDate(d.getDate() - currentWeekday + offset);
              const key = toDateKey(d);
              const dn = dayNumberForDate(state.startDate, key);
              const isToday = key === toDateKey(new Date());
              const isSel = key === dateKey;
              const daySlots = dn ? classSlotsForDay(dn) : [];
              const doneCount = completedTasksForDate(state, key);
              const mins = state.minutes[key] || 0;
              return (
                <li
                  key={key}
                  className={`px-4 py-3 flex items-center gap-3 text-xs ${
                    isSel ? (isDark ? 'bg-indigo-500/10' : 'bg-indigo-50/70') : ''
                  }`}
                >
                  <button onClick={() => setDateKey(key)} className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold">{useBn ? WEEKDAYS_BN[offset] : WEEKDAYS_EN[offset]}</span>
                      {isToday && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                          {useBn ? 'আজ' : 'TODAY'}
                        </span>
                      )}
                      {dn && <span className={`text-[10px] font-mono ${muted}`}>Day {dn}</span>}
                    </div>
                    <p className={`mt-0.5 ${muted}`}>
                      {daySlots.length === 0
                        ? useBn
                          ? 'বিশ্রাম · রিভিশন · এক্সাম'
                          : 'Rest · revision · exam'
                        : daySlots.map((slot) => (useBn ? slot.subjectBn : slot.subjectEn)).join('  +  ')}
                    </p>
                    {daySlots.length > 0 && (
                      <p className={`text-[10px] mt-0.5 ${muted}`}>
                        {daySlots.map((slot) => (useBn ? slot.chapterBn : slot.chapterEn)).join(' · ')}
                      </p>
                    )}
                  </button>
                  <div className="text-right shrink-0">
                    <p className="font-bold tabular-nums">
                      {bn(Math.round((mins / 60) * 10) / 10)} {useBn ? 'ঘ' : 'h'}
                    </p>
                    <p className={`text-[10px] ${muted}`}>{doneCount} ✓</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {tab === 'week' && (
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold">
              {useBn ? 'এই সপ্তাহের মক টেস্ট' : 'Mock tests this week'}
            </p>
            {dayNumber && dayNumber >= FINAL_REVISION_FROM_DAY && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                {useBn ? 'ফাইনাল রিভিশন' : 'Final revision'}
              </span>
            )}
          </div>
          {weekMocks.length === 0 ? (
            <p className={`text-[11px] mt-2 ${muted}`}>
              {useBn
                ? dayNumber && dayNumber >= FINAL_REVISION_FROM_DAY
                  ? 'শেষ দুই সপ্তাহে নতুন মক নেই — পুরোটা ফাইনাল রিভিশনের জন্য।'
                  : 'এই সপ্তাহে কোনো মক নেই — ক্লাস ও রিভিশন চালাও।'
                : dayNumber && dayNumber >= FINAL_REVISION_FROM_DAY
                  ? 'No new mock in the last two weeks — that time is pure final revision.'
                  : 'No mock this week — keep the classes and revision going.'}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weekMocks.map((test) => (
                <li key={test.id} className="flex items-start justify-between gap-2 text-xs">
                  <span>
                    <span className="font-bold">{useBn ? test.titleBn : test.titleEn}</span>
                    <span className={`block text-[10px] mt-0.5 ${muted}`}>
                      Day {bn(test.dayNumber)} · {dateForDayNumber(state.startDate, test.dayNumber)} ·{' '}
                      {useBn
                        ? `${bn(test.track.minutes)} মিনিট · ${bn(test.track.marks)} নম্বর`
                        : `${test.track.minutes} min · ${test.track.marks} marks`}
                      {test.track.negative ? (useBn ? ' · নেগেটিভ' : ' · negative') : ''}
                    </span>
                  </span>
                  {onOpenMock && (
                    <button
                      onClick={onOpenMock}
                      className="shrink-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {useBn ? 'শুরু' : 'Start'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className={`text-[10px] mt-3 ${muted}`}>
            {weekMocks.length > 0
              ? useBn
                ? weekMocks[0].track.noteBn
                : weekMocks[0].track.noteEn
              : useBn
                ? MOCK_TRACKS.weekly.noteBn
                : MOCK_TRACKS.weekly.noteEn}
          </p>
        </div>
      )}

      {/* ── Time ──────────────────────────────────────────────────────── */}
      {tab === 'time' && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className="text-sm font-extrabold">{useBn ? 'তোমার দিনে কত সময় আছে?' : 'How much time do you have?'}</p>
            <p className={`text-[11px] mt-1 ${muted}`}>
              {useBn
                ? 'ঘুম, স্কুল/কোচিং, যাতায়াত আর সংসারের সময় বাদ দিয়ে যা থাকে, সেটাই পড়ার সময়।'
                : 'Sleep, school, commute and life are subtracted — whatever is left is study time.'}
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'wake' as const, labelBn: 'ওঠার সময়', labelEn: 'Wake', type: 'time' },
                { key: 'sleep' as const, labelBn: 'ঘুমানোর সময়', labelEn: 'Sleep', type: 'time' },
                { key: 'instituteHours' as const, labelBn: 'স্কুল/কোচিং (ঘণ্টা)', labelEn: 'School (h)', type: 'number' },
                { key: 'commuteHours' as const, labelBn: 'যাতায়াত (ঘণ্টা)', labelEn: 'Commute (h)', type: 'number' },
                { key: 'lifeHours' as const, labelBn: 'খাওয়া/নামাজ/বিশ্রাম (ঘণ্টা)', labelEn: 'Life (h)', type: 'number' },
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>
                    {useBn ? field.labelBn : field.labelEn}
                  </span>
                  <input
                    type={field.type}
                    step={field.type === 'number' ? 0.5 : undefined}
                    min={field.type === 'number' ? 0 : undefined}
                    max={field.type === 'number' ? 12 : undefined}
                    value={String(state.settings[field.key])}
                    onChange={(event) => {
                      const raw = event.target.value;
                      const next =
                        field.type === 'number'
                          ? { ...state.settings, [field.key]: Math.max(0, Math.min(12, Number(raw) || 0)) }
                          : { ...state.settings, [field.key]: raw };
                      setState((prev) => setTimeSettings(prev, next));
                    }}
                    className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs font-bold tabular-nums ${
                      isDark
                        ? 'bg-slate-950/60 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${chip}`}>
                <Clock3 className="w-3.5 h-3.5" />
                {useBn
                  ? `পড়ার জন্য ${bn(Math.round((available / 60) * 10) / 10)} ঘণ্টা`
                  : `${Math.round((available / 60) * 10) / 10} h available`}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
                  isDark
                    ? 'bg-emerald-500/12 border-emerald-400/25 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                {useBn
                  ? `প্ল্যানে ${bn(Math.round((studyMinutes / 60) * 10) / 10)} ঘণ্টা`
                  : `${Math.round((studyMinutes / 60) * 10) / 10} h planned`}
              </span>
            </div>
          </div>

          {/* This week: target vs logged minutes */}
          {pacing && (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold">
                  {useBn ? 'এই সপ্তাহের হিসাব' : 'This week’s score'}
                </p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${chip}`}>
                  {useBn
                    ? `${bn(Math.round((pacing.doneMinutes / 60) * 10) / 10)} / ${bn(WEEKLY_HOUR_TARGET)} ঘণ্টা`
                    : `${Math.round((pacing.doneMinutes / 60) * 10) / 10} / ${WEEKLY_HOUR_TARGET} h`}
                </span>
              </div>
              <div className={`mt-2 h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className={`h-full transition-all ${
                    pacing.verdict === 'ahead' || pacing.verdict === 'onTrack'
                      ? 'bg-emerald-500'
                      : pacing.verdict === 'behind'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((pacing.doneMinutes / pacing.targetMinutes) * 100))}%` }}
                />
              </div>
              <p className={`text-[11px] mt-2 leading-relaxed ${muted}`}>
                {useBn ? pacing.messageBn : pacing.messageEn}
              </p>
              <div className={`mt-3 grid grid-cols-3 gap-2 text-center text-[10px]`}>
                <div className={`rounded-lg py-2 ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                  <p className="font-bold tabular-nums">{bn(Math.round((pacing.doneMinutes / 60) * 10) / 10)} ঘ</p>
                  <p className={muted}>{useBn ? 'হয়েছে' : 'done'}</p>
                </div>
                <div className={`rounded-lg py-2 ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                  <p className="font-bold tabular-nums">{bn(Math.round((pacing.expectedMinutes / 60) * 10) / 10)} ঘ</p>
                  <p className={muted}>{useBn ? 'এখন পর্যন্ত উচিত' : 'expected so far'}</p>
                </div>
                <div className={`rounded-lg py-2 ${isDark ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                  <p className="font-bold tabular-nums">{bn(pacing.daysLeft)}</p>
                  <p className={muted}>{useBn ? 'দিন বাকি' : 'days left'}</p>
                </div>
              </div>
              {pacing.perDayExtra > 0 && (
                <p className="text-[11px] mt-2 font-bold text-amber-600 dark:text-amber-300">
                  {useBn
                    ? `সাজেশন: বাকি দিনগুলোতে দিনে +${bn(pacing.perDayExtra)} মিনিট`
                    : `Suggested: +${pacing.perDayExtra} min on each remaining day`}
                </p>
              )}
            </div>
          )}

          {/* Chronotype + sleep check */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className="text-sm font-extrabold">
              {useBn ? 'তোমার মাথা কখন সবচেয়ে ভালো কাজ করে?' : 'When is your head sharpest?'}
            </p>
            <p className={`text-[11px] mt-1 ${muted}`}>
              {useBn
                ? 'যে সময়ে মনোযোগ সবচেয়ে ভালো, নতুন অধ্যায় সেখানে বসবে — বাকিটা সলভিং ও রিভিশন।'
                : 'New chapters go where your attention peaks; the rest becomes solving and revision.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { key: 'morning' as Chronotype, bn: 'সকালে', en: 'Morning' },
                  { key: 'neutral' as Chronotype, bn: 'মাঝারি', en: 'Midday' },
                  { key: 'evening' as Chronotype, bn: 'রাতে', en: 'Evening' },
                ] as { key: Chronotype; bn: string; en: string }[]
              ).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setState((prev) => setChronotype(prev, item.key))}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    state.chronotype === item.key
                      ? isDark
                        ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200'
                        : 'border-indigo-300 bg-indigo-50 text-indigo-800'
                      : isDark
                        ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {useBn ? item.bn : item.en}
                </button>
              ))}
            </div>

            <div
              className={`mt-4 rounded-xl border p-3 text-xs ${
                sleep.verdict === 'good'
                  ? isDark
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : sleep.verdict === 'short'
                    ? isDark
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : 'border-rose-300 bg-rose-50 text-rose-900'
                    : isDark
                      ? 'border-slate-700 bg-slate-800/50 text-slate-200'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <p className="font-bold">
                {useBn
                  ? `ঘুম: ${bn(Math.round(sleep.hours * 10) / 10)} ঘণ্টা`
                  : `Sleep: ${Math.round(sleep.hours * 10) / 10} h`}
              </p>
              <p className="mt-1 leading-relaxed">{useBn ? sleep.messageBn : sleep.messageEn}</p>
            </div>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className={`px-4 py-3 text-xs font-extrabold border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200/80'}`}>
              <AlarmClock className="w-3.5 h-3.5" />
              {useBn ? 'প্রস্তাবিত দৈনিক টাইম-টেবিল' : 'Suggested daily timetable'}
            </div>
            {plan.length === 0 ? (
              <p className={`px-4 py-5 text-xs ${muted}`}>
                {useBn
                  ? 'ঘুম ও ব্যস্ততার সময় মিলিয়ে দেখো — পড়ার সময় শূন্য হয়ে গেছে।'
                  : 'Sleep and commitments leave no study time — adjust the inputs.'}
              </p>
            ) : (
              <ul className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200/80'}`}>
                {plan.map((block) => {
                  const isStudy =
                    block.kind === 'class' ||
                    block.kind === 'practice' ||
                    block.kind === 'revision' ||
                    block.kind === 'focus';
                  const isFocus = block.kind === 'focus';
                  return (
                    <li key={block.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                      <span className={`font-mono font-bold tabular-nums ${isFocus ? 'text-rose-600 dark:text-rose-400' : isStudy ? 'text-emerald-600 dark:text-emerald-400' : muted}`}>
                        {block.start}
                      </span>
                      <span className={`flex-1 ${isStudy ? 'font-bold' : muted}`}>
                        {isFocus && (
                          <span
                            className={`mr-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded align-middle ${
                              isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {useBn ? 'মূল ট্র্যাক' : 'MAIN'}
                          </span>
                        )}
                        {useBn ? block.titleBn : block.titleEn}
                        {(useBn ? block.whyBn : block.whyEn) && (
                          <span className={`block text-[10px] font-normal mt-0.5 ${muted}`}>
                            {useBn ? block.whyBn : block.whyEn}
                          </span>
                        )}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${chip}`}>
                        {bn(block.minutes)} {useBn ? 'মিনিট' : 'min'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold">{useBn ? 'শেষ ৭ দিনের পড়া' : 'Last 7 days'}</p>
              <p className={`text-[11px] font-mono ${muted}`}>
                {useBn
                  ? `লক্ষ্য ${bn(WEEKLY_HOUR_TARGET)} ঘণ্টা/সপ্তাহ`
                  : `target ${WEEKLY_HOUR_TARGET} h/week`}
              </p>
            </div>
            <div className="mt-3 flex items-end gap-1.5 h-24">
              {weekLog.map((entry) => {
                const height = Math.min(100, (entry.minutes / (4 * 60)) * 100);
                return (
                  <div key={entry.key} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t ${isDark ? 'bg-slate-800' : 'bg-slate-200'} relative h-full`}>
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t bg-emerald-500"
                        style={{ height: `${Math.max(2, height)}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-mono ${muted}`}>{entry.label}</span>
                  </div>
                );
              })}
            </div>
            <p className={`mt-3 text-[11px] ${muted}`}>
              {useBn
                ? 'প্রতিটি দিনে “আজ” ট্যাব থেকে ঘণ্টা যোগ করলে এই ছবিটা ভরবে।'
                : 'Log hours from the Today tab and this chart fills in.'}
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className="text-sm font-extrabold">{useBn ? 'Day 1 কবে?' : 'When is Day 1?'}</p>
            <p className={`text-[11px] mt-1 ${muted}`}>
              {useBn
                ? 'ক্লাস শুরুর দিন বসাও — পুরো ৩৯১ দিনের রুটিন ও তারিখ এখান থেকেই হিসাব হবে।'
                : 'Set the first class day; the whole 391-day plan and its dates follow from it.'}
            </p>
            <input
              type="date"
              value={state.startDate}
              onChange={(event) => setState((prev) => setStartDate(prev, event.target.value))}
              className={`mt-2 px-3 py-2 rounded-xl border text-xs font-bold ${
                isDark ? 'bg-slate-950/60 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
            <p className={`mt-2 text-[11px] ${muted}`}>
              {useBn
                ? `Day ১ = ${dateForDayNumber(state.startDate, 1)} · Day ৩৯১ = ${dateForDayNumber(state.startDate, TOTAL_PLAN_DAYS)} · HSC শুরু ${HSC_EXAM_START}`
                : `Day 1 = ${dateForDayNumber(state.startDate, 1)} · Day 391 = ${dateForDayNumber(state.startDate, TOTAL_PLAN_DAYS)} · HSC starts ${HSC_EXAM_START}`}
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className="text-sm font-extrabold">
              {useBn ? 'এই রুটিনের পেছনের প্রমাণ' : 'The evidence behind this routine'}
            </p>
            <ul className="mt-3 space-y-3">
              {EVIDENCE.map((note) => (
                <li key={note.id} className="text-xs">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        note.strength === 'strong'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : note.strength === 'moderate'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {note.strength === 'strong' ? 'STRONG' : note.strength === 'moderate' ? 'MODERATE' : 'HEURISTIC'}
                    </span>
                    <div>
                      <p className="font-bold leading-relaxed">{useBn ? note.claimBn : note.claimEn}</p>
                      <p className={`text-[10px] mt-0.5 ${muted}`}>{useBn ? note.sourceBn : note.sourceEn}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Admission tracks ──────────────────────────────────────────── */}
      {tab === 'tracks' && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className="text-sm font-extrabold">
              {useBn ? 'কোন ট্র্যাকে কতটা এগিয়েছ?' : 'How far along each track?'}
            </p>
            <p className={`text-[11px] mt-1 leading-relaxed ${muted}`}>
              {useBn
                ? 'নিচের শতকরা হিসাব তোমার নিজের সিলেবাস ট্র্যাকার থেকে — প্রতিটি অধ্যায়ের চারটি ধাপ (তত্ত্ব, নোট, MCQ, CQ) গড়ে। ওজন পরীক্ষার নম্বর-বণ্টনের আনুমানিক রূপ, অফিসিয়াল নয়।'
                : 'These percentages come from your own syllabus tracker — the four stages of every chapter, averaged. The weights approximate each exam’s marks distribution; they are a guide, not official.'}
            </p>

            <p className="text-[11px] font-extrabold mt-3">
              {useBn ? 'মূল ট্র্যাক (সবচেয়ে বেশি সময় এখানে)' : 'Main track (most time here)'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  { key: 'medical' as TrackKey, bn: 'মেডিকেল', en: 'Medical' },
                  { key: 'engineering' as TrackKey, bn: 'ইঞ্জিনিয়ারিং', en: 'Engineering' },
                  { key: 'varsity' as TrackKey, bn: 'ভার্সিটি ‘ক’', en: 'Varsity Ka' },
                ] as { key: TrackKey; bn: string; en: string }[]
              ).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setState((prev) => setPrimaryTrack(prev, item.key))}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
                    state.primaryTrack === item.key
                      ? isDark
                        ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                        : 'border-rose-300 bg-rose-50 text-rose-800'
                      : isDark
                        ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {state.primaryTrack === item.key ? '★ ' : ''}
                  {useBn ? item.bn : item.en}
                </button>
              ))}
            </div>

            <div className={`mt-3 pt-3 border-t space-y-1.5 ${isDark ? 'border-slate-700/60' : 'border-slate-200/80'}`}>
              <p className="text-[10px] font-bold">
                {useBn
                  ? `সপ্তাহে ${bn(WEEKLY_HOUR_TARGET)} ঘণ্টার সময় ভাগ`
                  : `Weekly ${WEEKLY_HOUR_TARGET} h split`}
              </p>
              {trackSplit.map((item) => (
                <div key={item.track.key} className="flex items-center gap-2 text-[10px]">
                  <span className={`w-24 shrink-0 truncate ${item.isPrimary ? 'font-extrabold' : ''}`}>
                    {useBn ? item.track.nameBn : item.track.nameEn}
                  </span>
                  <span className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <span
                      className={`block h-full ${item.isPrimary ? 'bg-rose-500' : 'bg-slate-400 dark:bg-slate-500'}`}
                      style={{ width: `${Math.round(item.share * 100)}%` }}
                    />
                  </span>
                  <span className={`w-16 text-right shrink-0 tabular-nums ${muted}`}>
                    {bn(Math.round((item.minutes / 60) * 10) / 10)} {useBn ? 'ঘ' : 'h'}
                  </span>
                </div>
              ))}
              <p className={`text-[10px] ${muted}`}>
                {useBn
                  ? 'মূল ট্র্যাক পায় অর্ধেক সময়, বাকি দুই ট্র্যাক ভাগ করে নেয়। জীববিজ্ঞান-রসায়নে বেশি ব্লক সেখান থেকেই আসে।'
                  : 'The main track takes half the week; the other two split the rest. That is where the extra biology and chemistry blocks come from.'}
              </p>
            </div>
          </div>

          {trackReadiness.map((track) => (
            <div key={track.track.key} className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold flex items-center gap-1.5">
                    {useBn ? track.track.nameBn : track.track.nameEn}
                    {track.track.key === state.primaryTrack && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {useBn ? 'প্রধান ট্র্যাক' : 'MAIN'}
                      </span>
                    )}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${muted}`}>
                    {useBn ? track.track.examBn : track.track.examEn}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-extrabold font-mono px-2 py-1 rounded-lg ${
                    track.verdict === 'ready'
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800'
                      : track.verdict === 'almost'
                        ? isDark
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-sky-100 text-sky-800'
                        : track.verdict === 'building'
                          ? isDark
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-amber-100 text-amber-800'
                          : isDark
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {bn(track.percent)}%
                </span>
              </div>

              <div className={`mt-2 h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className={`h-full transition-all ${
                    track.verdict === 'ready'
                      ? 'bg-emerald-500'
                      : track.verdict === 'almost'
                        ? 'bg-sky-500'
                        : track.verdict === 'building'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                  }`}
                  style={{ width: `${track.percent}%` }}
                />
              </div>

              <p className={`text-[11px] mt-2 leading-relaxed ${muted}`}>
                {useBn ? track.messageBn : track.messageEn}
              </p>
              <p className={`text-[10px] mt-1 ${muted}`}>
                {useBn
                  ? `${bn(track.finishedChapters)} / ${bn(track.totalChapters)} অধ্যায় পুরো শেষ`
                  : `${track.finishedChapters} / ${track.totalChapters} chapters fully done`}
              </p>

              <ul className="mt-3 space-y-1.5">
                {track.subjects.map((subject) => (
                  <li key={subject.subjectKey} className="flex items-center gap-2 text-[10px]">
                    <span className="w-24 shrink-0 truncate font-semibold">
                      {useBn ? subject.shortBn : subject.shortEn}
                    </span>
                    <span className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <span
                        className={`block h-full ${
                          subject.percent >= 65
                            ? 'bg-emerald-500'
                            : subject.percent >= 35
                              ? 'bg-amber-500'
                              : 'bg-rose-400'
                        }`}
                        style={{ width: `${subject.percent}%` }}
                      />
                    </span>
                    <span className={`w-16 text-right shrink-0 tabular-nums ${muted}`}>
                      {bn(subject.percent)}% · {bn(subject.finishedChapters)}/{bn(subject.totalChapters)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={`mt-3 pt-3 border-t text-[10px] space-y-1 ${isDark ? 'border-slate-700/60' : 'border-slate-200/80'}`}>
                <p className={muted}>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {useBn ? 'টিপস: ' : 'Tip: '}
                  </span>
                  {useBn ? track.track.tipBn : track.track.tipEn}
                </p>
                <p className={muted}>
                  <span className="font-bold">{useBn ? 'যোগ্যতা: ' : 'Eligibility: '}</span>
                  {useBn ? track.track.requiresBn : track.track.requiresEn}
                </p>
              </div>

              {onOpenMock && (
                <button
                  onClick={onOpenMock}
                  className={`mt-3 w-full py-2 rounded-xl border text-[11px] font-bold transition-colors ${
                    isDark
                      ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  {useBn
                    ? `${MOCK_TRACKS[track.track.mockKind].nameBn} — এখনই দাও`
                    : `${MOCK_TRACKS[track.track.mockKind].nameEn} — start now`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
