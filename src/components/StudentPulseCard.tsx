import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquareHeart,
  Pencil,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import type { Lang, Theme } from '../types';
import { formatNum } from '../lib/i18n';
import {
  BIGGEST_BLOCKERS,
  buildStudentPulseResponse,
  deleteStudentPulse,
  loadStudentPulse,
  NEXT_PRIORITIES,
  PRIMARY_NEEDS,
  saveStudentPulse,
  type BiggestBlocker,
  type NextPriority,
  type PrimaryNeed,
  type PulseScore,
  type StudentPulseAnswers,
  type StudentPulseResponse,
} from '../lib/studentPulse';

interface StudentPulseCardProps {
  lang: Lang;
  theme: Theme;
  authUserId: string | null;
}

type Bilingual = { bn: string; en: string };

const primaryNeedLabels: Record<PrimaryNeed, Bilingual> = {
  daily_plan: { bn: 'আজ কী পড়ব—স্পষ্ট পরিকল্পনা', en: 'A clear plan for what to study today' },
  board_practice: { bn: 'বোর্ড MCQ ও CQ অনুশীলন', en: 'Board-style MCQ and CQ practice' },
  revision: { bn: 'রিভিশন ও ভুল ঠিক করা', en: 'Revision and fixing mistakes' },
  admission_prep: { bn: 'ভর্তি প্রস্তুতি', en: 'Admission preparation' },
};

const blockerLabels: Record<BiggestBlocker, Bilingual> = {
  know_what_next: { bn: 'পরের কাজটি বুঝতে পারি না', en: 'I do not know what to do next' },
  understand_concepts: { bn: 'কঠিন ধারণা বুঝতে সমস্যা হয়', en: 'Hard concepts are difficult to understand' },
  stay_consistent: { bn: 'নিয়মিত থাকা কঠিন', en: 'It is hard to stay consistent' },
  find_time: { bn: 'স্কুলের পর সময় বের করা কঠিন', en: 'It is hard to find time after school' },
};

const nextPriorityLabels: Record<NextPriority, Bilingual> = {
  more_mcq: { bn: 'আরও অধ্যায়ভিত্তিক MCQ', en: 'More chapter-wise MCQs' },
  more_cq_models: { bn: 'আরও CQ ও মডেল উত্তর', en: 'More CQs and model answers' },
  routine_reminders: { bn: 'আরও ভালো রুটিন ও রিমাইন্ডার', en: 'Better routines and reminders' },
  simpler_faster: { bn: 'আরও সহজ ও দ্রুত অ্যাপ', en: 'A simpler and faster app' },
};

const scoreLabels: Record<PulseScore, Bilingual> = {
  1: { bn: 'একদম নয়', en: 'Not at all' },
  2: { bn: 'সামান্য', en: 'A little' },
  3: { bn: 'মোটামুটি', en: 'Somewhat' },
  4: { bn: 'অনেকটা', en: 'Very' },
  5: { bn: 'পুরোপুরি', en: 'Completely' },
};

const questions: Bilingual[] = [
  { bn: 'এখন নক্ষত্র থেকে তোমার সবচেয়ে বেশি কী দরকার?', en: 'What do you need most from Nokkhotro right now?' },
  { bn: 'পড়াশোনায় তোমার সবচেয়ে বড় বাধা কোনটি?', en: 'What is your biggest study blocker?' },
  { bn: 'নক্ষত্র এখন পর্যন্ত তোমার পড়ায় কতটা সাহায্য করছে?', en: 'How much is Nokkhotro helping your studies so far?' },
  { bn: 'অ্যাপ খুলে আজ কী পড়বে—এটা কতটা পরিষ্কার বোঝা যায়?', en: 'How clear is what to study today when you open the app?' },
  { bn: 'পরের উন্নতিতে কোন কাজটি আগে হওয়া উচিত?', en: 'What should we improve next?' },
];

function completeAnswers(value: Partial<StudentPulseAnswers>): value is StudentPulseAnswers {
  return PRIMARY_NEEDS.includes(value.primaryNeed as PrimaryNeed) &&
    BIGGEST_BLOCKERS.includes(value.biggestBlocker as BiggestBlocker) &&
    Number.isInteger(value.appHelpfulness) && Number(value.appHelpfulness) >= 1 && Number(value.appHelpfulness) <= 5 &&
    Number.isInteger(value.todayPlanClarity) && Number(value.todayPlanClarity) >= 1 && Number(value.todayPlanClarity) <= 5 &&
    NEXT_PRIORITIES.includes(value.nextPriority as NextPriority);
}

function initialAnswers(response: StudentPulseResponse | null): Partial<StudentPulseAnswers> {
  if (!response) return {};
  return {
    primaryNeed: response.primaryNeed,
    biggestBlocker: response.biggestBlocker,
    appHelpfulness: response.appHelpfulness,
    todayPlanClarity: response.todayPlanClarity,
    nextPriority: response.nextPriority,
  };
}

export const StudentPulseCard: React.FC<StudentPulseCardProps> = ({
  lang,
  theme,
  authUserId,
}) => {
  const bn = lang === 'bn';
  const isDark = theme === 'dark';
  const [savedResponse, setSavedResponse] = useState<StudentPulseResponse | null>(() => loadStudentPulse());
  const [editing, setEditing] = useState(savedResponse === null);
  const [answers, setAnswers] = useState<Partial<StudentPulseAnswers>>(() => initialAnswers(savedResponse));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState('');
  const questionRef = useRef<HTMLLegendElement>(null);

  useEffect(() => {
    if (editing) questionRef.current?.focus();
  }, [editing, step]);

  const currentAnswered = [
    Boolean(answers.primaryNeed),
    Boolean(answers.biggestBlocker),
    Boolean(answers.appHelpfulness),
    Boolean(answers.todayPlanClarity),
    Boolean(answers.nextPriority),
  ][step];

  const optionClass = (selected: boolean) => `min-h-11 w-full px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
    selected
      ? isDark
        ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-100'
        : 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-2xs'
      : isDark
        ? 'bg-slate-900/45 border-slate-700 text-slate-200 hover:border-indigo-400/60'
        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
  }`;

  const choose = <K extends keyof StudentPulseAnswers>(key: K, value: StudentPulseAnswers[K]) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setStatus('');
  };

  const submit = async () => {
    if (!completeAnswers(answers)) {
      setStatus(bn ? 'সব ৫টি প্রশ্নের উত্তর দিন।' : 'Please answer all five questions.');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      const response = buildStudentPulseResponse(answers, savedResponse);
      const result = await saveStudentPulse(response, authUserId);
      setSavedResponse(result.response);
      setEditing(false);
      if (result.cloud === 'saved') {
        setStatus(bn
          ? 'ধন্যবাদ—উত্তর সেভ হয়েছে। অ্যাডমিন গবেষণায় শুধু মোট হিসাব দেখবে।'
          : 'Thank you—your answers are saved. Admin research shows totals only.');
      } else if (result.cloud === 'queued') {
        setStatus(bn
          ? 'এই ডিভাইসে সেভ হয়েছে; সংযোগ ফিরলে মোট হিসাবে যোগ হবে।'
          : 'Saved on this device; it will join the totals when the connection returns.');
      } else {
        setStatus(bn ? 'এই ডিভাইসে উত্তর সেভ হয়েছে।' : 'Your answers are saved on this device.');
      }
    } catch {
      setStatus(bn
        ? 'উত্তর সেভ করা যায়নি। স্টোরেজ বা সংযোগ দেখে আবার চেষ্টা করুন।'
        : 'Could not save your answers. Check storage or connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeResponse = async () => {
    const confirmed = window.confirm(bn
      ? 'তোমার ৫টি উত্তর ডিভাইস ও research totals থেকে মুছবে?'
      : 'Delete your five answers from this device and the research totals?');
    if (!confirmed) return;
    setDeleting(true);
    setStatus('');
    try {
      const result = await deleteStudentPulse(authUserId);
      setSavedResponse(null);
      setAnswers({});
      setStep(0);
      setEditing(true);
      setStatus(result.cloud === 'queued'
        ? (bn ? 'ডিভাইস থেকে মুছে গেছে; সংযোগ ফিরলে cloud response-ও মুছবে।' : 'Deleted from this device; the cloud response will be removed when the connection returns.')
        : (bn ? 'তোমার উত্তর মুছে গেছে।' : 'Your response has been deleted.'));
    } catch {
      setStatus(bn ? 'উত্তর মুছতে পারিনি। আবার চেষ্টা করুন।' : 'Could not delete the response. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  const renderChoiceList = <T extends string>(
    options: readonly T[],
    value: T | undefined,
    labels: Record<T, Bilingual>,
    onChoose: (next: T) => void
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={optionClass(value === option)}
          aria-pressed={value === option}
          onClick={() => onChoose(option)}
        >
          <span className="flex items-center gap-2.5">
            <span className={`w-4 h-4 rounded-full border-2 shrink-0 grid place-items-center ${value === option ? 'border-indigo-500' : 'border-slate-400/70'}`}>
              {value === option && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
            </span>
            {labels[option][lang]}
          </span>
        </button>
      ))}
    </div>
  );

  const renderScore = (
    value: PulseScore | undefined,
    onChoose: (score: PulseScore) => void
  ) => (
    <div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5" role="group" aria-label={bn ? '১ থেকে ৫' : 'Score from 1 to 5'}>
        {([1, 2, 3, 4, 5] as PulseScore[]).map((score) => (
          <button
            key={score}
            type="button"
            className={`${optionClass(value === score)} min-w-0 text-center px-1`}
            aria-pressed={value === score}
            aria-label={`${score}: ${scoreLabels[score][lang]}`}
            onClick={() => onChoose(score)}
          >
            <span className="text-base sm:text-lg font-extrabold tabular-nums">{formatNum(score, lang)}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-4 mt-2 text-[10px] sm:text-xs opacity-70">
        <span>{scoreLabels[1][lang]}</span>
        <span>{scoreLabels[5][lang]}</span>
      </div>
    </div>
  );

  return (
    <section
      id="student-pulse"
      data-student-pulse="true"
      className={`rounded-2xl border overflow-hidden ${
        isDark
          ? 'bg-slate-800/65 border-violet-400/25 card-soft-dark'
          : 'bg-white/95 border-violet-200/90 card-soft-light'
      }`}
      aria-labelledby="student-pulse-title"
    >
      <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-slate-700/70 bg-violet-500/7' : 'border-violet-100 bg-violet-50/45'}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${isDark ? 'bg-violet-500/18 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <MessageSquareHeart size={20} />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-300">
                {bn ? '৫ প্রশ্ন · প্রায় ১ মিনিট' : '5 QUESTIONS · ABOUT 1 MINUTE'}
              </span>
              <h2 id="student-pulse-title" className="text-base sm:text-lg font-extrabold mt-0.5">
                {bn ? 'তোমার মতামতেই পরের উন্নতি' : 'Your voice shapes what comes next'}
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {bn
                  ? 'নাম, ইমেইল বা খোলা লেখা নেওয়া হয় না। কমপক্ষে ৫টি উত্তর না হলে score/choice লুকানো থাকে; তারপরও Admin শুধু মোট হিসাব দেখে।'
                  : 'No name, email, or free text is collected. Scores and choices stay hidden until five responses, then admins see totals only.'}
              </p>
            </div>
          </div>
          <span className={`inline-flex min-h-8 items-center gap-1.5 self-start px-2.5 py-1 rounded-full border text-[10px] font-bold ${isDark ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            <ShieldCheck size={13} />
            {bn ? 'প্রাইভেসি-বাউন্ডেড' : 'Privacy-bounded'}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {!editing && savedResponse ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold">{bn ? 'তোমার ৫টি উত্তর সেভ আছে' : 'Your five answers are saved'}</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {bn
                    ? 'পরিস্থিতি বদলালে উত্তর আপডেট করতে পারো—এক অ্যাকাউন্টে একটি উত্তরই মোট হিসাবে থাকবে।'
                    : 'Update them when your needs change—only one response per account counts in the totals.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                className={`min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${isDark ? 'border-slate-600 bg-slate-900/50 text-slate-100 hover:border-violet-400' : 'border-slate-200 bg-white text-slate-800 hover:border-violet-300 shadow-2xs'}`}
                onClick={() => {
                  setAnswers(initialAnswers(savedResponse));
                  setStep(0);
                  setEditing(true);
                  setStatus('');
                }}
                disabled={deleting}
              >
                <Pencil size={14} />
                {bn ? 'উত্তর আপডেট' : 'Update answers'}
              </button>
              <button
                type="button"
                className={`min-h-11 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-50 ${isDark ? 'border-rose-400/30 bg-rose-500/8 text-rose-300 hover:border-rose-400/60' : 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300'}`}
                onClick={() => void removeResponse()}
                disabled={deleting}
              >
                <Trash2 size={14} />
                {deleting ? (bn ? 'মুছছে…' : 'Deleting…') : (bn ? 'মুছুন' : 'Delete')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); if (step === 4) void submit(); }}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`h-2 flex-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                role="progressbar"
                aria-label={bn ? 'সার্ভে অগ্রগতি' : 'Survey progress'}
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={step + 1}
              >
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-300" style={{ width: `${((step + 1) / 5) * 100}%` }} />
              </div>
              <span className="text-xs font-mono font-bold tabular-nums text-violet-600 dark:text-violet-300">
                {formatNum(step + 1, lang)} / {formatNum(5, lang)}
              </span>
            </div>

            <fieldset className="min-h-48">
              <legend ref={questionRef} tabIndex={-1} className="text-sm sm:text-base font-extrabold mb-4 outline-none">
                <span className="text-violet-600 dark:text-violet-300 mr-1.5">{formatNum(step + 1, lang)}.</span>
                {questions[step][lang]}
              </legend>

              {step === 0 && renderChoiceList(PRIMARY_NEEDS, answers.primaryNeed, primaryNeedLabels, (value) => choose('primaryNeed', value))}
              {step === 1 && renderChoiceList(BIGGEST_BLOCKERS, answers.biggestBlocker, blockerLabels, (value) => choose('biggestBlocker', value))}
              {step === 2 && renderScore(answers.appHelpfulness, (value) => choose('appHelpfulness', value))}
              {step === 3 && renderScore(answers.todayPlanClarity, (value) => choose('todayPlanClarity', value))}
              {step === 4 && renderChoiceList(NEXT_PRIORITIES, answers.nextPriority, nextPriorityLabels, (value) => choose('nextPriority', value))}
            </fieldset>

            <div className={`pt-4 mt-4 border-t flex items-center justify-between gap-3 ${isDark ? 'border-slate-700/70' : 'border-slate-100'}`}>
              <button
                type="button"
                className={`min-h-11 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${isDark ? 'border-slate-600 bg-slate-900/50' : 'border-slate-200 bg-white shadow-2xs'}`}
                disabled={step === 0 || saving}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                <ChevronLeft size={15} />
                {bn ? 'আগেরটি' : 'Back'}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-extrabold cursor-pointer hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!currentAnswered || saving}
                  onClick={() => setStep((value) => Math.min(4, value + 1))}
                >
                  {bn ? 'পরেরটি' : 'Next'}
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-extrabold cursor-pointer hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!currentAnswered || saving}
                >
                  <Send size={14} />
                  {saving ? (bn ? 'সেভ হচ্ছে…' : 'Saving…') : (bn ? '৫টি উত্তর সেভ করুন' : 'Save five answers')}
                </button>
              )}
            </div>
          </form>
        )}

        {status && (
          <p className={`mt-3 text-xs font-semibold ${status.includes('যায়নি') || status.includes('পারিনি') || status.includes('Could not') ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`} role="status" aria-live="polite">
            {status}
          </p>
        )}
      </div>
    </section>
  );
};

export default StudentPulseCard;
