import React, { useMemo, useState } from 'react';
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
  buildTimePlan,
  classSlotsForDay,
  dateForDayNumber,
  dayNumberForDate,
  daysToHsc,
  isRevisionDay,
  phaseForDay,
  plannedStudyMinutes,
  toDateKey,
  weekdayIndexForDay,
} from '../lib/masterRoutine';
import {
  completedTasksForDate,
  loadRoutineState,
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
}

type Tab = 'today' | 'week' | 'time';

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
  const plan = useMemo(() => buildTimePlan(state.settings), [state.settings]);

  const studyMinutes = plannedStudyMinutes(plan);
  const available = availableStudyMinutes(state.settings);
  const minutesToday = state.minutes[dateKey] || 0;
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
                  const isStudy = block.kind === 'class' || block.kind === 'practice' || block.kind === 'revision';
                  return (
                    <li key={block.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                      <span className={`font-mono font-bold tabular-nums ${isStudy ? 'text-emerald-600 dark:text-emerald-400' : muted}`}>
                        {block.start}
                      </span>
                      <span className={`flex-1 ${isStudy ? 'font-bold' : muted}`}>
                        {useBn ? block.titleBn : block.titleEn}
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
        </div>
      )}
    </div>
  );
};
