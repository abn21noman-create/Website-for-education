import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Sparkles, Target, Trophy, X } from 'lucide-react';
import { Lang, Theme } from '../types';
import type { DrillBankConfig, DrillItem } from '../data/drillBanks';
import { formatNum } from '../lib/i18n';

interface LastRound {
  score: number;
  total: number;
  date: string;
}

function readLastRound(key: string): LastRound | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastRound;
    if (typeof parsed.score !== 'number' || typeof parsed.total !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLastRound(key: string, round: LastRound) {
  try {
    localStorage.setItem(key, JSON.stringify(round));
  } catch {
    /* storage can be full or blocked in private mode — the round still works */
  }
}

function shuffle<T>(items: T[], size: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(size, copy.length));
}

interface DrillViewProps {
  lang: Lang;
  theme: Theme;
  banks: DrillBankConfig[];
}

/**
 * One engine for every quick drill (GK, English grammar, …).
 *
 * A drill is deliberately short: 10 questions, explanation after each tap, no
 * timer, no login. Score is kept per bank on the device so a later visit can say
 * how the last round went. Adding a new subject means adding one entry to
 * `DRILL_BANKS` — this component never needs to change.
 */
export const DrillView: React.FC<DrillViewProps> = ({ lang, theme, banks }) => {
  const isDark = theme === 'dark';
  const bn = lang === 'bn';

  const [bankKey, setBankKey] = useState(banks[0]?.key ?? '');
  const bank = banks.find((item) => item.key === bankKey) ?? banks[0];

  const [category, setCategory] = useState<string>('all');
  const [round, setRound] = useState<DrillItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [lastRound, setLastRound] = useState<LastRound | null>(() =>
    bank ? readLastRound(bank.storageKey) : null
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    bank?.categories.forEach((cat) => {
      map[cat.key] = 0;
    });
    bank?.questions.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + 1;
    });
    return map;
  }, [bank]);

  if (!bank) return null;

  const switchBank = (key: string) => {
    const next = banks.find((item) => item.key === key);
    if (!next) return;
    setBankKey(key);
    setCategory('all');
    setRound(null);
    setPicked(null);
    setAnswers([]);
    setIndex(0);
    setLastRound(readLastRound(next.storageKey));
  };

  const start = (nextCategory: string = category) => {
    setCategory(nextCategory);
    const pool =
      nextCategory === 'all'
        ? bank.questions
        : bank.questions.filter((item) => item.category === nextCategory);
    setRound(shuffle(pool, bank.roundSize));
    setIndex(0);
    setPicked(null);
    setAnswers([]);
  };

  const finish = (finalAnswers: number[], finalRound: DrillItem[]) => {
    const score = finalAnswers.reduce(
      (sum, choice, i) => sum + (choice === finalRound[i].correctIndex ? 1 : 0),
      0
    );
    const result: LastRound = {
      score,
      total: finalAnswers.length,
      date: new Date().toISOString().slice(0, 10),
    };
    writeLastRound(bank.storageKey, result);
    setLastRound(result);
    setAnswers(finalAnswers);
    setPicked(-1); // -1 means "round finished"
  };

  const current = round && picked !== -1 ? round[index] : null;
  const isFinished = round !== null && picked === -1;
  const score = round
    ? answers.reduce((sum, choice, i) => sum + (choice === round[i].correctIndex ? 1 : 0), 0)
    : 0;

  const card = isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200/80';
  const muted = isDark ? 'text-slate-400' : 'text-slate-600';
  const subtitle = (bn ? bank.subtitleBn : bank.subtitleEn).replace(
    '{n}',
    bn ? formatNum(bank.questions.length, 'bn') : String(bank.questions.length)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {bn ? bank.kickerBn : bank.kickerEn}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {bn ? bank.titleBn : bank.titleEn}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${muted}`}>{subtitle}</p>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold self-start sm:self-auto ${
            isDark
              ? 'bg-emerald-500/12 border-emerald-400/25 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200/85 text-emerald-800'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          {bn ? `${formatNum(bank.roundSize, 'bn')} প্রশ্ন / রাউন্ড` : `${bank.roundSize} per round`}
        </div>
      </div>

      {/* Bank switcher — only rendered when there is more than one bank. */}
      {banks.length > 1 && !round && (
        <div
          className={`inline-flex p-1 rounded-xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100/80 border-slate-200'
          }`}
        >
          {banks.map((item) => {
            const active = item.key === bank.key;
            return (
              <button
                key={item.key}
                onClick={() => switchBank(item.key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                  active
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : 'bg-white text-emerald-800 shadow-sm'
                    : muted
                }`}
              >
                {bn ? item.tabBn : item.tabEn}
              </button>
            );
          })}
        </div>
      )}

      {/* Home */}
      {!round && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bank.categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => start(cat.key)}
                className={`text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800 hover:border-emerald-400/40'
                    : 'bg-white border-slate-200/80 hover:border-emerald-400/60 shadow-sm'
                }`}
              >
                <div className="text-2xl font-extrabold tabular-nums">
                  {formatNum(counts[cat.key] || 0, 'bn')}
                </div>
                <div className="text-xs font-bold mt-0.5">{bn ? cat.bn : cat.en}</div>
                <div className={`text-[11px] mt-1 ${muted}`}>{bn ? 'প্রশ্ন আছে' : 'questions'}</div>
              </button>
            ))}
          </div>

          <div className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">{bn ? bank.whyTitleBn : bank.whyTitleEn}</p>
                <p className={`text-xs mt-1 leading-relaxed ${muted}`}>
                  {bn ? bank.whyBn : bank.whyEn}
                </p>
              </div>
            </div>

            <button
              onClick={() => start('all')}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
            >
              {bn ? 'মিশ্র রাউন্ড শুরু করো' : 'Start a mixed round'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {lastRound && (
              <p className={`mt-3 text-xs ${muted}`}>
                {bn
                  ? `শেষ রাউন্ড: ${formatNum(lastRound.score, 'bn')}/${formatNum(lastRound.total, 'bn')}`
                  : `Last round: ${lastRound.score}/${lastRound.total}`}
                {` · ${lastRound.date}`}
              </p>
            )}
          </div>
        </>
      )}

      {/* Playing */}
      {current && round && (
        <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
          <div className="flex items-center justify-between text-xs font-mono mb-3">
            <span className={muted}>
              {bn
                ? `প্রশ্ন ${formatNum(index + 1, 'bn')} / ${formatNum(round.length, 'bn')}`
                : `Question ${index + 1} / ${round.length}`}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {bn ? `সঠিক ${formatNum(score, 'bn')}` : `Correct ${score}`}
            </span>
          </div>

          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((index + 1) / round.length) * 100}%` }}
            />
          </div>

          <h2 className="text-base sm:text-lg font-bold leading-relaxed mt-4">
            {bn ? current.question.bn : current.question.en}
          </h2>

          <div className="mt-4 space-y-2">
            {current.options.map((option, optionIndex) => {
              const chosen = picked === optionIndex;
              const isCorrect = optionIndex === current.correctIndex;
              const revealed = picked !== null;
              const tone = !revealed
                ? isDark
                  ? 'border-slate-800 hover:border-emerald-400/40'
                  : 'border-slate-200/80 hover:border-emerald-400/60'
                : isCorrect
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : chosen
                    ? 'border-rose-500 bg-rose-500/10'
                    : isDark
                      ? 'border-slate-800 opacity-60'
                      : 'border-slate-200/80 opacity-60';
              return (
                <button
                  key={optionIndex}
                  disabled={revealed}
                  onClick={() => setPicked(optionIndex)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-colors ${tone}`}
                >
                  <span className="text-[11px] font-mono font-bold opacity-60">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="flex-1 font-medium">{bn ? option.bn : option.en}</span>
                  {revealed && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {revealed && chosen && !isCorrect && <X className="w-4 h-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {picked !== null && picked >= 0 && (
            <div
              className={`mt-4 rounded-xl border p-3 text-xs leading-relaxed ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <p className="font-bold mb-1">{bn ? 'ব্যাখ্যা' : 'Explanation'}</p>
              <p className={muted}>{bn ? current.explanation.bn : current.explanation.en}</p>
            </div>
          )}

          {picked !== null && picked >= 0 && (
            <button
              onClick={() => {
                const nextAnswers = [...answers, picked];
                if (index + 1 >= round.length) {
                  finish(nextAnswers, round);
                } else {
                  setAnswers(nextAnswers);
                  setIndex(index + 1);
                  setPicked(null);
                }
              }}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-bold transition-colors"
            >
              {index + 1 >= round.length
                ? bn
                  ? 'ফলাফল দেখো'
                  : 'See result'
                : bn
                  ? 'পরের প্রশ্ন'
                  : 'Next question'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {isFinished && round && (
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <p className="text-lg font-extrabold">
                {bn
                  ? `${formatNum(score, 'bn')} / ${formatNum(answers.length, 'bn')} সঠিক`
                  : `${score} / ${answers.length} correct`}
              </p>
              <p className={`text-xs ${muted}`}>
                {score === answers.length
                  ? bn
                    ? 'নিখুঁত! এই রাউন্ডে কোনো ভুল নেই।'
                    : 'Perfect round — no mistakes.'
                  : bn
                    ? 'ভুলগুলো নিচে দেখে নাও, তারপর আবার চেষ্টা করো।'
                    : 'Review the misses below, then try again.'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {round.map((item, i) => {
              const choice = answers[i];
              if (choice === item.correctIndex) return null;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 text-xs ${
                    isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className="font-bold">{bn ? item.question.bn : item.question.en}</p>
                  <p className="mt-1">
                    <span className="text-rose-500 font-semibold">
                      {bn ? 'তোমার উত্তর: ' : 'You chose: '}
                    </span>
                    {bn ? item.options[choice].bn : item.options[choice].en}
                  </p>
                  <p className="mt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {bn ? 'সঠিক: ' : 'Correct: '}
                    </span>
                    {bn ? item.options[item.correctIndex].bn : item.options[item.correctIndex].en}
                  </p>
                  <p className={`mt-1 ${muted}`}>{bn ? item.explanation.bn : item.explanation.en}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => start(category)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {bn ? 'আবার রাউন্ড' : 'Another round'}
            </button>
            <button
              onClick={() => setRound(null)}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-colors ${
                isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {bn ? 'বিভাগ বদলাও' : 'Change category'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
