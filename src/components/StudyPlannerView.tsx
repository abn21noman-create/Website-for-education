import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Timer,
  ListTodo,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ChapterProgressState,
  Lang,
  StudySessionRecord,
  StudyTask,
  SubjectKey,
  Theme,
} from '../types';
import { CHAPTERS, SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';

interface StudyPlannerViewProps {
  lang: Lang;
  theme: Theme;
  tasks: StudyTask[];
  sessions: StudySessionRecord[];
  progressMap: Record<string, ChapterProgressState>;
  onAddTask: (title: string, subjectKey: SubjectKey, priority: 'high' | 'medium') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onLogSession: (subjectKey: SubjectKey, durationMinutes: number, note: string) => void;
}

function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.5);
    });
  } catch {
    // Ignore audio context blocks
  }
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  lang,
  theme,
  tasks,
  sessions,
  progressMap,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onLogSession,
}) => {
  const isDark = theme === 'dark';

  const [presetMinutes, setPresetMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [focusSubject, setFocusSubject] = useState<SubjectKey>('physics1');
  const [sessionNote, setSessionNote] = useState<string>('');

  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskSubject, setTaskSubject] = useState<SubjectKey>('physics1');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium'>('high');

  // Ticking effect. Deliberately depends on `isRunning` only: the previous
  // version listed `secondsLeft` and `sessionNote` here, so the interval was
  // destroyed and recreated on every tick and on every keystroke in the
  // session-note box — typing faster than 1 char/sec froze the Pomodoro.
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Completion effect: runs once the clock reaches zero.
  useEffect(() => {
    if (!isRunning || secondsLeft > 0) return;
    setIsRunning(false);
    playCompletionChime();
    onLogSession(
      focusSubject,
      presetMinutes,
      sessionNote ||
        (lang === 'bn' ? 'পমোডোরো ফোকাস সেশন সম্পন্ন' : 'Completed Pomodoro Session')
    );
    setSecondsLeft(presetMinutes * 60);
    setSessionNote('');
  }, [isRunning, secondsLeft, focusSubject, presetMinutes, sessionNote, lang, onLogSession]);

  const selectPreset = (mins: number) => {
    setIsRunning(false);
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const totalSeconds = presetMinutes * 60;
  const progressRatio = (totalSeconds - secondsLeft) / totalSeconds;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask(taskTitle.trim(), taskSubject, taskPriority);
    setTaskTitle('');
  };

  const handleGenerateAutoRoutine = () => {
    const firstYearPapers: SubjectKey[] = [
      'physics1',
      'chemistry1',
      'math1',
      'biology1',
      'ict',
    ];
    let added = 0;
    for (const sKey of firstYearPapers) {
      if (added >= 3) break;
      const incompleteCh = CHAPTERS.find((c) => {
        if (c.subjectKey !== sKey) return false;
        const p = progressMap[c.id];
        return !(p && p.theoryDone && p.notesDone && p.mcqDone && p.cqDone);
      });
      if (incompleteCh) {
        const sInfo = getSubjectByKey(sKey);
        const title =
          lang === 'bn'
            ? `${sInfo.shortName.bn}: ${incompleteCh.title.bn} — মূল বই ও ১৫টি বোর্ড MCQ অনুশীলন`
            : `${sInfo.shortName.en}: ${incompleteCh.title.en} — Textbook + 15 Board MCQs`;
        if (!tasks.some((t) => !t.completed && t.title === title)) {
          onAddTask(title, sKey, incompleteCh.highYield ? 'high' : 'medium');
          added++;
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {lang === 'bn' ? 'সময় ব্যবস্থাপনা • HSC 2028' : 'TIME & ROUTINE MANAGEMENT'}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
          {lang === 'bn'
            ? 'ফোকাস টাইমার ও দৈনিক অধ্যয়ন পরিকল্পনা'
            : 'Focus Timer & Daily Study Planner'}
        </h1>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {lang === 'bn'
            ? 'নিরবচ্ছিন্ন অধ্যয়ন সেশন এবং দৈনিক লক্ষ্যমাত্রা সম্পন্ন করে নিয়মিত অগ্রগতি ধরে রাখুন।'
            : 'Maintain deep-work study blocks and daily curricular milestones.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: SMOOTH POMODORO DIAL */}
        <div
          className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col justify-between space-y-5 ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Timer className="w-4 h-4 text-indigo-500" />
                <span>
                  {lang === 'bn' ? 'পমোডোরো ফোকাস সেশন' : 'Pomodoro Focus Block'}
                </span>
              </h2>
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-amber-500/12 border-amber-400/25 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                +20 XP
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { m: 25, bn: '২৫ মি.', en: '25m' },
                { m: 50, bn: '৫০ মি.', en: '50m' },
                { m: 15, bn: '১৫ মি.', en: '15m' },
                { m: 5, bn: '৫ মি.', en: '5m' },
              ].map((p) => (
                <button
                  key={p.m}
                  onClick={() => selectPreset(p.m)}
                  className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    presetMinutes === p.m
                      ? isDark
                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'bn' ? p.bn : p.en}
                </button>
              ))}
            </div>

            {/* Soft Calm Indigo Circular Timer Ring */}
            <div className="flex justify-center py-3">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    strokeWidth="7"
                    fill="transparent"
                    className={isDark ? 'stroke-slate-700/60' : 'stroke-indigo-100/80'}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="transparent"
                    className={`transition-all duration-500 ${
                      isDark ? 'stroke-indigo-400' : 'stroke-indigo-600'
                    }`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl font-extrabold font-formula tabular-nums tracking-tight text-indigo-950 dark:text-indigo-100">
                    {formatNum(`${mm}:${ss}`, lang)}
                  </div>
                  <div className="text-[11px] font-mono uppercase opacity-65 mt-1">
                    {getSubjectByKey(focusSubject).shortName[lang]}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject & Topic Input */}
            <div className="space-y-2.5">
              <select
                value={focusSubject}
                onChange={(e) => setFocusSubject(e.target.value as SubjectKey)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold outline-none ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700 text-slate-100 focus:border-indigo-400'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800 focus:border-indigo-400'
                }`}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name[lang]}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'অধ্যয়নের বিষয়বস্তু (যেমন: ভেক্টর গাণিতিক সমস্যা)'
                    : 'Session topic (e.g. Vector problem set)'
                }
                className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm outline-none ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400'
                }`}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'বিরতি (Pause)' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{lang === 'bn' ? 'সেশন শুরু করুন' : 'Start Session'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft(presetMinutes * 60);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  isDark
                    ? 'border-slate-700 hover:border-slate-500'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const studiedMins = Math.max(
                  5,
                  Math.round((totalSeconds - secondsLeft) / 60) || presetMinutes
                );
                onLogSession(
                  focusSubject,
                  studiedMins,
                  sessionNote ||
                    (lang === 'bn' ? 'স্ব-অধ্যয়ন সেশন' : 'Self-study block')
                );
                setSessionNote('');
                setIsRunning(false);
                setSecondsLeft(presetMinutes * 60);
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                isDark
                  ? 'border-teal-400/25 bg-teal-500/10 text-teal-300 hover:bg-teal-500/18'
                  : 'border-teal-200 bg-teal-50/75 text-teal-800 hover:bg-teal-100/70'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn'
                  ? 'সেশনটি স্টাডি লগে সংরক্ষণ করুন (+২০ XP)'
                  : 'Record Focus Session to Log (+20 XP)'}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT: DAILY STUDY ROUTINE & RECENT SESSIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-4 ${
              isDark
                ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                : 'bg-white/95 border-slate-200/80 card-soft-light'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-base flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-teal-500" />
                <span>
                  {lang === 'bn'
                    ? 'দৈনিক অধ্যয়ন চেকলিস্ট'
                    : 'Daily Curricular Checklist'}
                </span>
              </h2>

              <button
                type="button"
                onClick={handleGenerateAutoRoutine}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  isDark
                    ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200 hover:bg-indigo-500/25'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn'
                    ? 'HSC ’28 অটো রুটিন তৈরি করুন'
                    : 'Auto-Generate HSC ’28 Routine'}
                </span>
              </button>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleCreateTask} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'নতুন অধ্যয়ন লক্ষ্য লিখুন (যেমন: ভেক্টর অধ্যায়ের ২০টি গাণিতিক সমস্যা)...'
                      : 'Enter study target (e.g. Solve 20 Vector problems)...'
                  }
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'যুক্ত করুন' : 'Add Target'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value as SubjectKey)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold outline-none ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.shortName[lang]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setTaskPriority(taskPriority === 'high' ? 'medium' : 'high')
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                    taskPriority === 'high'
                      ? isDark
                        ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                      : isDark
                      ? 'bg-slate-900/60 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {taskPriority === 'high'
                    ? lang === 'bn'
                      ? 'অগ্রাধিকার: উচ্চ'
                      : 'PRIORITY: HIGH'
                    : lang === 'bn'
                    ? 'অগ্রাধিকার: সাধারণ'
                    : 'PRIORITY: STANDARD'}
                </button>
              </div>
            </form>

            {/* Task List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {tasks.map((t) => {
                const s = getSubjectByKey(t.subjectKey);
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      t.completed
                        ? isDark
                          ? 'bg-slate-900/35 border-slate-800 opacity-55'
                          : 'bg-slate-50 border-slate-200/70 opacity-60'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-700/80'
                        : 'bg-slate-50/50 border-slate-200/85 hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(t.id)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          t.completed
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : isDark
                            ? 'border-slate-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            t.completed ? 'line-through' : ''
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono opacity-65">
                            {s.shortName[lang]}
                          </span>
                          {t.priority === 'high' && (
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400">
                              {lang === 'bn' ? '• অগ্রাধিকার' : '• HIGH'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(t.id)}
                      className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:text-rose-500 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logged Study Sessions */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDark
                ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                : 'bg-white/95 border-slate-200/80 card-soft-light'
            }`}
          >
            <h3 className="font-bold text-sm">
              {lang === 'bn'
                ? 'সংরক্ষিত অধ্যয়ন লগ'
                : 'Recorded Study Sessions'}
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs opacity-60">
                {lang === 'bn'
                  ? 'এখনো কোনো অধ্যয়ন সেশন রেকর্ড করা হয়নি।'
                  : 'No study sessions recorded yet.'}
              </p>
            ) : (
              <div
                className={`divide-y max-h-[180px] overflow-y-auto ${
                  isDark ? 'divide-slate-700/50' : 'divide-slate-100'
                }`}
              >
                {sessions.slice(0, 6).map((sec) => {
                  const subj = getSubjectByKey(sec.subjectKey);
                  return (
                    <div
                      key={sec.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                          {subj.shortName[lang]}
                        </span>
                        {sec.note ? ` — ${sec.note}` : ''}
                      </div>
                      <span className="font-mono font-bold tabular-nums shrink-0 ml-2 text-emerald-600 dark:text-emerald-400">
                        +{formatNum(sec.durationMinutes, lang)}{' '}
                        {lang === 'bn' ? 'মিনিট' : 'm'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
