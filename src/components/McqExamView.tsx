import React, { useEffect, useState } from 'react';
import {
  Play,
  Clock,
  Check,
  X,
  Flag,
  RotateCcw,
  Award,
  Scale,
  BookOpenCheck,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import {
  Lang,
  McqQuestion,
  QuizAttemptRecord,
  SubjectKey,
  Theme,
} from '../types';
import {
  ALL_SUBJECT_KEYS,
  MCQ_COUNTS,
  MCQ_TOTAL,
  MEDICAL_GK_MCQ,
  loadAllExamQuestions,
  loadMcqSubjects,
} from '../data/mcqBank';
import { SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';
import {
  EXAM_PATTERNS,
  ExamPattern,
  getPatternById,
  patternTimeFor,
  pickPatternQuestions,
  scoreForPattern,
  writtenSectionLabel,
} from '../lib/examPatterns';
import { MISTAKE_REASONS, MistakeReason, loadMistakeReasons, mistakeSummary, saveMistakeReason } from '../lib/mistakeTags';
import { classifyMistakeAttempt } from '../lib/mistakeBank';
import { SelfExplainBox } from './SelfExplainBox';
import { SectorStats } from './SectorStats';
import { selfNoteCount } from '../lib/selfNotes';
import { takeChapterDrill } from '../lib/chapterDrill';
import type { ChapterDrillRequest } from '../lib/chapterDrill';
import { pickChapterQuestions } from '../lib/mcqChapterDrill';
import {
  mcqChapterInventory,
  mcqMatchesChapter,
  syllabusChapterCount,
} from '../lib/mcqChapters';
import {
  confidenceSummary,
  loadConfidence,
  recordPrediction,
  saveConfidence,
} from '../lib/calibration';
import type { ConfidenceEntry } from '../lib/calibration';

interface McqExamViewProps {
  lang: Lang;
  theme: Theme;
  quizHistory: QuizAttemptRecord[];
  mistakeIds: string[];
  onUpdateMistakeIds: (addIds: string[], removeIds: string[]) => void;
  autoStartMistakeExam?: boolean;
  onConsumedMistakeExam?: () => void;
  onCompleteQuiz: (attempt: Omit<QuizAttemptRecord, 'id' | 'createdAt'>) => void;
}

const OPTION_LABELS_BN = ['ক', 'খ', 'গ', 'ঘ'];
const OPTION_LABELS_EN = ['A', 'B', 'C', 'D'];

export const McqExamView: React.FC<McqExamViewProps> = ({
  lang,
  theme,
  quizHistory,
  mistakeIds,
  onUpdateMistakeIds,
  autoStartMistakeExam,
  onConsumedMistakeExam,
  onCompleteQuiz,
}) => {
  const isDark = theme === 'dark';

  const [stage, setStage] = useState<'setup' | 'running' | 'result'>('setup');
  // Notes written during earlier sessions; refreshed whenever the setup screen mounts.
  const [writtenNotes] = useState(() => selfNoteCount());
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | 'all'>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [patternId, setPatternId] = useState<string>('custom');
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | 'easy' | 'medium' | 'hard'
  >('all');
  const [isMistakeRun, setIsMistakeRun] = useState(false);
  // A chapter drill requested from the routine screen, consumed exactly once.
  const [chapterDrill] = useState<ChapterDrillRequest | null>(() => takeChapterDrill());
  const [isChapterRun, setIsChapterRun] = useState(false);
  // Metacognition: one prediction before the paper, one tag per wrong answer.
  const [predicted, setPredicted] = useState<number | null>(null);
  const [confidenceStore, setConfidenceStore] = useState<Record<string, ConfidenceEntry>>(
    () => loadConfidence()
  );
  const confidence = React.useMemo(
    () => confidenceSummary(confidenceStore),
    [confidenceStore]
  );
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [examMode, setExamMode] = useState<'timed' | 'practice'>('timed');
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [focusTabSwitches, setFocusTabSwitches] = useState<number>(0);

  const [examQuestions, setExamQuestions] = useState<McqQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [lastResult, setLastResult] = useState<{
    correct: number;
    wrong: number;
    skipped: number;
    score: number;
    accuracy: number;
    durationSeconds: number;
    pattern: ExamPattern;
    penalty: number;
    total: number;
  } | null>(null);
  const [reasonStore, setReasonStore] = useState<Record<string, MistakeReason>>(
    () => loadMistakeReasons()
  );
  /**
   * The bank is split per paper: the screen renders from the static counts at
   * once and only fetches the papers this session actually needs.
   */
  const [bank, setBank] = useState<McqQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(true);
  const bankCache = React.useRef<Map<SubjectKey, McqQuestion[]>>(new Map());

  const activePattern = getPatternById(patternId);
  const isWeighted = activePattern.subjectMode === 'weighted';
  const chapterOptions = React.useMemo(
    () =>
      selectedSubject === 'all'
        ? []
        : mcqChapterInventory(bank, selectedSubject),
    [bank, selectedSubject]
  );
  const selectedChapter =
    selectedChapterId === 'all'
      ? null
      : chapterOptions.find((item) => item.chapter.id === selectedChapterId)?.chapter ?? null;
  const paperQuestionCount =
    selectedSubject === 'all'
      ? bank.length
      : bank.filter((question) => question.subjectKey === selectedSubject).length;
  const mappedChapterQuestionCount = chapterOptions.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalSyllabusChapters =
    selectedSubject === 'all' ? 0 : syllabusChapterCount(selectedSubject);
  /** Custom sets honour the manual toggle; real patterns follow their own rule. */
  const scoringPattern: ExamPattern =
    activePattern.kind === 'custom'
      ? { ...activePattern, negativeMarking }
      : activePattern;

  const filteredPool = bank.filter((q) => {
    if (selectedSubject !== 'all' && q.subjectKey !== selectedSubject) return false;
    if (
      activePattern.kind === 'custom' &&
      selectedChapterId !== 'all' &&
      !mcqMatchesChapter(q, selectedChapterId)
    ) {
      return false;
    }
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  /**
   * Weighted papers (BUET/medical/DU) span several papers by design, so the
   * subject filter is skipped for them — only the difficulty filter applies.
   */
  const patternPool = isWeighted
    ? bank.filter(
        (q) => difficultyFilter === 'all' || q.difficulty === difficultyFilter
      )
    : filteredPool;

  const availablePoolCount = patternPool.length;

  const chooseSubject = (nextSubject: SubjectKey | 'all') => {
    setSelectedSubject(nextSubject);
    setSelectedChapterId('all');
  };

  /** Picking a pattern sets the clock, the marking and the question count. */
  const applyPattern = (nextId: string) => {
    const next = getPatternById(nextId);
    setPatternId(nextId);
    setSelectedChapterId('all');
    setNegativeMarking(next.negativeMarking);
    setExamMode('timed');

    if (next.subjectMode === 'single' && selectedSubject === 'all') {
      setSelectedSubject('physics1');
    }
    if (next.subjectMode !== 'single') {
      setSelectedSubject('all');
    }

    if (next.paperQuestions > 0) {
      // Counts are static, so this works before the bank has downloaded.
      const available =
        next.subjectMode === 'single' && selectedSubject !== 'all'
          ? MCQ_COUNTS[selectedSubject]
          : next.subjectMode === 'single'
          ? MCQ_COUNTS.physics1
          : MCQ_TOTAL;
      setQuestionCount(Math.max(1, Math.min(next.paperQuestions, available)));
    }
  };

  const startMistakeRemediation = React.useCallback(() => {
    const start = (questions: McqQuestion[]) => {
      const pool = questions.filter((q) => mistakeIds.includes(q.id));
      if (pool.length === 0) return;
      setExamQuestions(pool);
      setIsMistakeRun(true);
      setAnswers({});
      setFlagged({});
      setFocusTabSwitches(0);
      setSecondsLeft(pool.length * 60);
      setStartedAt(Date.now());
      setLastResult(null);
      setStage('running');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Mistake IDs may include a medical GK question from a prior run, so load
    // the complete exam bank rather than only the papers in the current setup.
    loadAllExamQuestions().then(start).catch(() => undefined);
  }, [mistakeIds]);

  useEffect(() => {
    if (autoStartMistakeExam && mistakeIds.length > 0 && bank.length > 0) {
      startMistakeRemediation();
      onConsumedMistakeExam?.();
    }
  }, [
    autoStartMistakeExam,
    mistakeIds.length,
    bank.length,
    startMistakeRemediation,
    onConsumedMistakeExam,
  ]);

  /** Deep link from the routine: a timed drill on one chapter or saved IDs. */
  useEffect(() => {
    if (!chapterDrill || stage !== 'setup') return;
    const hasExplicitIds = Boolean(chapterDrill.questionIds?.length);
    if (!hasExplicitIds && bank.length === 0) return;
    let cancelled = false;
    const source = hasExplicitIds ? loadAllExamQuestions() : Promise.resolve(bank);
    source
      .then((questions) => {
        if (cancelled) return;
        const picked = pickChapterQuestions(questions, chapterDrill);
        if (picked.length === 0) return;
        setSelectedSubject(chapterDrill.subjectKey ?? 'all');
        setExamQuestions(picked);
        setIsMistakeRun(false);
        setIsChapterRun(true);
        setAnswers({});
        setFlagged({});
        setFocusTabSwitches(0);
        setSecondsLeft(picked.length * 60);
        setStartedAt(Date.now());
        setLastResult(null);
        setStage('running');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [chapterDrill, bank, stage]);

  /**
   * Which papers this configuration needs. A single-paper drill asks for one
   * file; admission papers and mixed practice span several.
   */
  const requiredSubjects: SubjectKey[] = React.useMemo(() => {
    if (isWeighted || activePattern.subjectMode === 'interleaved') return ALL_SUBJECT_KEYS;
    if (selectedSubject === 'all') return ALL_SUBJECT_KEYS;
    return [selectedSubject];
  }, [isWeighted, activePattern.subjectMode, selectedSubject]);

  const requiredKey = requiredSubjects.join(',');

  useEffect(() => {
    let cancelled = false;
    const missing = requiredSubjects.filter((key) => !bankCache.current.has(key));
    const publish = () => {
      const hscQuestions = [...bankCache.current.values()].flat();
      setBank(
        patternId === 'medical-mbbs'
          ? [...hscQuestions, ...MEDICAL_GK_MCQ]
          : hscQuestions
      );
    };

    if (missing.length === 0) {
      publish();
      setBankLoading(false);
      return;
    }

    setBankLoading(true);
    loadMcqSubjects(missing)
      .then((questions) => {
        if (cancelled) return;
        missing.forEach((key) => {
          bankCache.current.set(key, questions.filter((q) => q.subjectKey === key));
        });
        publish();
      })
      .catch(() => {
        /* counts still render; the start button stays guarded */
      })
      .finally(() => {
        if (!cancelled) setBankLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `requiredKey` captures the subject list; `patternId` adds admission-only banks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredKey, patternId]);

  useEffect(() => {
    if (stage !== 'running' || examMode !== 'timed') return;
    const onVisChange = () => {
      if (document.hidden) {
        setFocusTabSwitches((prev) => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [stage, examMode]);

  /** Re-test only the answers that were confidently wrong (hypercorrection). */
  const startBlindSpotDrill = () => {
    const ids = new Set(confidence.blindSpotIds);
    const pool = bank.filter((question) => ids.has(question.id));
    if (pool.length === 0) return;
    setExamQuestions(pool);
    setIsMistakeRun(false);
    setIsChapterRun(false);
    setAnswers({});
    setFlagged({});
    setFocusTabSwitches(0);
    setSecondsLeft(pool.length * 60);
    setStartedAt(Date.now());
    setLastResult(null);
    setStage('running');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startExam = () => {
    if (patternPool.length === 0) return;
    const picked = pickPatternQuestions(patternPool, activePattern, questionCount);
    if (picked.length === 0) return;

    setExamQuestions(picked);
    setIsMistakeRun(false);
    setAnswers({});
    setFlagged({});
    setFocusTabSwitches(0);
    setSecondsLeft(patternTimeFor(activePattern, picked.length));
    setStartedAt(Date.now());
    setLastResult(null);
    setStage('running');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishExam = React.useCallback(() => {
    if (stage !== 'running') return;
    const classification = classifyMistakeAttempt(examQuestions, answers, mistakeIds);
    const correct = classification.correctIds.length;
    const wrong = classification.wrongIds.length;
    const skipped = classification.skippedIds.length;

    onUpdateMistakeIds(classification.addIds, classification.removeIds);

    const scored = scoreForPattern(scoringPattern, correct, wrong, examQuestions.length);
    const score = scored.score;
    const accuracy =
      examQuestions.length > 0
        ? Number(((correct / examQuestions.length) * 100).toFixed(1))
        : 0;
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );

    const subjTitle = isChapterRun && chapterDrill
      ? lang === 'bn'
        ? `${chapterDrill.titleBn || chapterDrill.chapterBn} — ১০টি প্রশ্নের ড্রিল`
        : `${chapterDrill.titleEn || chapterDrill.chapterEn} — 10-question drill`
      : isMistakeRun
      ? lang === 'bn'
        ? 'ভুল প্রশ্নের রিভিশন পরীক্ষা (Mistake Bank)'
        : 'Mistake Bank Remediation Exam'
      : activePattern.kind !== 'custom'
      ? `${activePattern.name[lang]}${
          selectedSubject === 'all'
            ? ''
            : ` • ${getSubjectByKey(selectedSubject).name[lang]}`
        }`
      : selectedChapter
      ? lang === 'bn'
        ? `${selectedChapter.title.bn} — অধ্যায় ড্রিল`
        : `${selectedChapter.title.en} — Chapter Drill`
      : selectedSubject === 'all'
      ? lang === 'bn'
        ? 'সমন্বিত HSC বিজ্ঞান মডেল টেস্ট'
        : 'Combined HSC Science Assessment'
      : `${getSubjectByKey(selectedSubject).name[lang]} Assessment`;

    if (predicted !== null) {
      recordPrediction(predicted, accuracy);
    }

    setLastResult({
      correct,
      wrong,
      skipped,
      score,
      accuracy,
      durationSeconds,
      pattern: scoringPattern,
      penalty: scored.penalty,
      total: scored.total,
    });
    setStage('result');

    onCompleteQuiz({
      subjectKey: selectedSubject,
      examTitle: subjTitle,
      totalQuestions: examQuestions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      score,
      accuracy,
      durationSeconds,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    stage,
    examQuestions,
    answers,
    isMistakeRun,
    isChapterRun,
    chapterDrill,
    predicted,
    mistakeIds,
    scoringPattern,
    startedAt,
    selectedSubject,
    selectedChapter,
    lang,
    onCompleteQuiz,
    onUpdateMistakeIds,
  ]);

  // Countdown tick. Kept free of `secondsLeft`/`finishExam` deps on purpose:
  // listing them tore the interval down and restarted it on every tick and on
  // every answer click, silently handing the student back up to a second per
  // interaction in a timed board-style exam.
  useEffect(() => {
    if (stage !== 'running' || examMode !== 'timed') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, examMode]);

  // Auto-submit when the clock runs out.
  useEffect(() => {
    if (stage !== 'running' || examMode !== 'timed') return;
    if (secondsLeft <= 0) finishExam();
  }, [stage, examMode, secondsLeft, finishExam]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return formatNum(str, lang);
  };

  // STAGE 1: SETUP LOBBY
  if (stage === 'setup') {
    return (
      <div className="space-y-6">
        <div
          className={`pb-4 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200/80'
          }`}
        >
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {lang === 'bn' ? 'মূল্যায়ন কেন্দ্র • HSC 2028' : 'ASSESSMENT PORTAL • HSC 2028'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {lang === 'bn'
              ? 'লাইভ MCQ মডেল টেস্ট ও মূল্যায়ন'
              : 'Live MCQ Examination & Practice'}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'বোর্ড পরীক্ষা এবং বিশ্ববিদ্যালয় ভর্তি মানের প্রশ্নে নিজেকে যাচাই করুন — প্রতিটি সঠিক উত্তরে +১০ XP।'
              : 'Evaluate your preparation on HSC Board and Admission-grade questions — earn +10 XP per correct answer.'}
          </p>
          {writtenNotes > 0 && (
            <p
              className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                isDark
                  ? 'bg-indigo-500/12 border-indigo-400/25 text-indigo-300'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
            >
              ✍️ {lang === 'bn'
                ? `নিজের ভাষায় লেখা ব্যাখ্যা: ${writtenNotes}টি`
                : `Self-explanations written: ${writtenNotes}`}
            </p>
          )}
        </div>

        <SectorStats label={lang === 'bn' ? 'পরীক্ষার সারসংক্ষেপ' : 'Exam overview'} items={[
          { label: lang === 'bn' ? 'প্রশ্ন ব্যাংক' : 'Question bank', value: formatNum(MCQ_TOTAL, lang), hint: lang === 'bn' ? 'মোট MCQ' : 'Total MCQs', icon: <BookOpenCheck size={19} />, tone: 'purple' },
          { label: lang === 'bn' ? 'দেওয়া পরীক্ষা' : 'Attempts', value: formatNum(quizHistory.length, lang), hint: lang === 'bn' ? 'তোমার পরীক্ষার ইতিহাস' : 'Your exam history', icon: <Award size={19} />, tone: 'mint' },
          { label: lang === 'bn' ? 'পুনরায় অনুশীলন' : 'To revisit', value: formatNum(mistakeIds.length, lang), hint: lang === 'bn' ? 'মিস্টেক ব্যাংকে' : 'In your mistake bank', icon: <RotateCcw size={19} />, tone: 'peach' },
          { label: lang === 'bn' ? 'নিজের ব্যাখ্যা' : 'Explanations', value: formatNum(writtenNotes, lang), hint: lang === 'bn' ? 'নিজের ভাষায় লেখা' : 'Written in your words', icon: <Check size={19} />, tone: 'blue' },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Exam Builder Card */}
          <div
            className={`lg:col-span-7 p-6 rounded-2xl border space-y-6 ${
              isDark
                ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                : 'bg-white/95 border-slate-200/80 card-soft-light'
            }`}
          >
            {/* Automated Mistake Bank Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                mistakeIds.length > 0
                  ? isDark
                    ? 'bg-amber-500/12 border-amber-400/30'
                    : 'bg-amber-50/85 border-amber-200'
                  : isDark
                  ? 'bg-emerald-500/10 border-emerald-400/25'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    mistakeIds.length > 0 ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                />
                <div>
                  <div className="text-xs font-extrabold">
                    {lang === 'bn'
                      ? `স্বয়ংক্রিয় মিস্টেক ব্যাংক (${formatNum(
                          mistakeIds.length,
                          lang
                        )}টি প্রশ্ন)`
                      : `Automated Mistake Bank (${mistakeIds.length} Pending)`}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {mistakeIds.length > 0
                      ? lang === 'bn'
                        ? 'আগের পরীক্ষায় ভুল বা ছেড়ে আসা প্রশ্নগুলো এখানে জমা আছে। সঠিক উত্তর দিলে তালিকা থেকে মুছে যাবে (+১৫ XP)।'
                        : 'Wrong/skipped MCQs are saved automatically. Answer right to clear them (+15 XP).'
                      : lang === 'bn'
                      ? 'দারুণ! মিস্টেক ব্যাংকে আবার অনুশীলনের জন্য কোনো প্রশ্ন নেই।'
                      : 'Awesome! No missed MCQs are waiting to be revisited.'}
                  </p>
                </div>
              </div>
              {mistakeIds.length > 0 && (
                <button
                  type="button"
                  onClick={startMistakeRemediation}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 cursor-pointer shrink-0 shadow-2xs"
                >
                  {lang === 'bn'
                    ? 'ভুলগুলোর পরীক্ষা দিন'
                    : 'Retry Mistakes'}
                </button>
              )}
            </div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-indigo-500" />
              <span>
                {lang === 'bn' ? 'পরীক্ষার প্যারামিটার নির্ধারণ করুন' : 'Configure Examination'}
              </span>
            </h2>

            {/* Real paper patterns */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider font-bold mb-2.5 opacity-65">
                {lang === 'bn' ? '০১. পরীক্ষার ধরন (প্রকৃত কাগজ)' : '01. PAPER PATTERN'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAM_PATTERNS.map((p) => {
                  const active = patternId === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => applyPattern(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? isDark
                            ? 'bg-indigo-500/22 border-indigo-400/45'
                            : 'bg-indigo-50 border-indigo-300 shadow-2xs'
                          : isDark
                          ? 'bg-slate-900/50 border-slate-700/80 hover:border-slate-500'
                          : 'bg-slate-50/70 border-slate-200/85 hover:border-indigo-200 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        {p.kind === 'admission' && (
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            {lang === 'bn' ? 'ভর্তি' : 'ADM'}
                          </span>
                        )}
                        {p.kind === 'hsc' && (
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            HSC
                          </span>
                        )}
                        <span>{p.name[lang]}</span>
                      </div>
                      <div className="text-[10px] mt-1 leading-relaxed opacity-70">
                        {p.breakdown[lang]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {activePattern.note && (
                <p className={`mt-2 text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {activePattern.note[lang]}
                </p>
              )}

              {activePattern.paperQuestions > availablePoolCount && (
                <p
                  className={`mt-2 p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-400/25 text-amber-200'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  {activePattern.simulationOnly
                    ? lang === 'bn'
                      ? `এই প্র্যাকটিস সেটে ${formatNum(activePattern.paperQuestions, lang)}টি প্রশ্নের লক্ষ্য; ব্যাংকে এখন ${formatNum(availablePoolCount, lang)}টি আছে — সবগুলো দিয়েই অনুশীলন হবে।`
                      : `This practice set targets ${activePattern.paperQuestions} questions; the bank currently holds ${availablePoolCount} — you will practise all of them.`
                    : lang === 'bn'
                      ? `প্রকৃত কাগজে ${formatNum(activePattern.paperQuestions, lang)}টি প্রশ্ন থাকে; ব্যাংকে এখন ${formatNum(availablePoolCount, lang)}টি আছে — সবগুলো দিয়েই পূর্ণ সময়ে অনুশীলন হবে।`
                      : `The real paper has ${activePattern.paperQuestions} questions; the bank currently holds ${availablePoolCount} — you will practise all of them at the real pace.`}
                </p>
              )}
            </div>

            {/* Subject Select — weighted papers choose their own mix */}
            {!isWeighted && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider font-bold mb-2.5 opacity-65">
                {lang === 'bn' ? '০২. বিষয় নির্বাচন' : '02. SELECT SUBJECT'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => chooseSubject('all')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    selectedSubject === 'all'
                      ? isDark
                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-2xs'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-700/80 text-slate-300 hover:border-slate-500'
                      : 'bg-slate-50/70 border-slate-200/85 text-slate-700 hover:border-indigo-200 hover:bg-white'
                  }`}
                >
                  <div>{lang === 'bn' ? 'সকল বিষয় সমন্বিত' : 'All Combined'}</div>
                  <div className="text-[10px] font-mono opacity-65 mt-0.5">
                    {formatNum(MCQ_TOTAL, lang)}{' '}
                    {lang === 'bn' ? 'টি প্রশ্ন' : 'MCQs'}
                  </div>
                </button>

                {SUBJECTS.map((s) => {
                  const count = MCQ_COUNTS[s.key] ?? 0;
                  const active = selectedSubject === s.key;
                  return (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => chooseSubject(s.key)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        active
                          ? isDark
                            ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-2xs'
                          : isDark
                          ? 'bg-slate-900/50 border-slate-700/80 text-slate-300 hover:border-slate-500'
                          : 'bg-slate-50/70 border-slate-200/85 text-slate-700 hover:border-indigo-200 hover:bg-white'
                      }`}
                    >
                      <div className="truncate">{s.shortName[lang]}</div>
                      <div className="text-[10px] font-mono opacity-65 mt-0.5">
                        {formatNum(count, lang)} {lang === 'bn' ? 'টি প্রশ্ন' : 'MCQs'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            )}

            {activePattern.kind === 'custom' && selectedSubject !== 'all' && (
              <div data-mcq-chapter-picker>
                <div className="flex flex-wrap items-end justify-between gap-2 mb-2.5">
                  <label className="block text-xs font-mono uppercase tracking-wider font-bold opacity-65">
                    {lang === 'bn' ? '০৩. অধ্যায় নির্বাচন' : '03. SELECT CHAPTER'}
                  </label>
                  <span className="text-[10px] font-mono opacity-60">
                    {lang === 'bn'
                      ? `${formatNum(chapterOptions.length, lang)}/${formatNum(
                          totalSyllabusChapters,
                          lang
                        )} অধ্যায়ে প্রশ্ন আছে`
                      : `${chapterOptions.length}/${totalSyllabusChapters} chapters covered`}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lang === 'bn'
                    ? 'আজ যে অধ্যায় পড়ছ, শুধু সেটির প্রশ্ন দিয়ে ছোট drill বানাও। পূর্ণ paper pattern বাছলে সব অধ্যায় স্বয়ংক্রিয়ভাবে মিশবে।'
                    : 'Build a focused drill from the chapter you are studying. Full-paper patterns mix chapters automatically.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChapterId('all')}
                    aria-pressed={selectedChapterId === 'all'}
                    className={`min-h-11 p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      selectedChapterId === 'all'
                        ? isDark
                          ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                          : 'bg-teal-50 text-teal-900 border-teal-300'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        : 'bg-slate-50/70 border-slate-200/85 text-slate-700 hover:border-teal-300 hover:bg-white'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'সব উপলভ্য অধ্যায়' : 'All available chapters'}</span>
                    <span className="block text-[10px] font-mono font-normal opacity-65 mt-0.5">
                      {formatNum(paperQuestionCount, lang)} {lang === 'bn' ? 'টি প্রশ্ন' : 'questions'}
                    </span>
                  </button>
                  {chapterOptions.map(({ chapter, count }) => {
                    const active = selectedChapterId === chapter.id;
                    return (
                      <button
                        type="button"
                        key={chapter.id}
                        onClick={() => setSelectedChapterId(chapter.id)}
                        aria-pressed={active}
                        className={`min-h-11 p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          active
                            ? isDark
                              ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                              : 'bg-teal-50 text-teal-900 border-teal-300'
                            : isDark
                            ? 'bg-slate-900/50 border-slate-700/80 text-slate-300 hover:border-slate-500'
                            : 'bg-slate-50/70 border-slate-200/85 text-slate-700 hover:border-teal-300 hover:bg-white'
                        }`}
                      >
                        <span className="block truncate">
                          {formatNum(chapter.chapterNumber, lang)}. {chapter.title[lang]}
                        </span>
                        <span className="block text-[10px] font-mono font-normal opacity-65 mt-0.5">
                          {formatNum(count, lang)} {lang === 'bn' ? 'টি প্রশ্ন' : 'questions'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {paperQuestionCount > mappedChapterQuestionCount && (
                  <p className={`text-[10px] leading-relaxed mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {lang === 'bn'
                      ? `পুরোনো label-এর ${formatNum(
                          paperQuestionCount - mappedChapterQuestionCount,
                          lang
                        )}টি প্রশ্ন “সব উপলভ্য অধ্যায়”-এ আছে; ভুল chapter-এ দেখানোর বদলে সেগুলো আলাদা রাখা হয়েছে।`
                      : `${paperQuestionCount - mappedChapterQuestionCount} legacy-labelled question(s) remain in “All available chapters” rather than being assigned to the wrong chapter.`}
                  </p>
                )}
              </div>
            )}

            {isWeighted && (
              <div
                className={`p-4 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900/55 border-slate-700/80' : 'bg-slate-50/75 border-slate-200/85'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {lang === 'bn' ? 'প্রকৃত কাগজের বিষয়/বিভাগের ওজন' : 'REAL PAPER SECTION WEIGHT'}
                  </span>
                </div>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  {lang === 'bn'
                    ? `ওজন অনুযায়ী ${formatNum(questionCount, lang)}টি প্রশ্নে প্রতিটি বিষয়/বিভাগের সম্ভাব্য সংখ্যা নিচে দেখা যাচ্ছে।`
                    : `The section weights below show the target mix for ${questionCount} questions.`}
                </p>
                {Object.entries(activePattern.weights ?? {}).map(([key, w]) => {
                  const totalWeight = Object.values(activePattern.weights ?? {}).reduce(
                    (sum, v) => sum + v,
                    0
                  );
                  const share = totalWeight > 0 ? (w / totalWeight) * 100 : 0;
                  const howMany = Math.round((w / (totalWeight || 1)) * questionCount);
                  return (
                    <div key={key} className="flex items-center gap-2 text-[11px]">
                      <span className="w-20 sm:w-24 truncate font-semibold">
                        {key === 'medical-gk'
                          ? lang === 'bn'
                            ? 'GK/অ্যাপটিটিউড'
                            : 'GK / aptitude'
                          : getSubjectByKey(key as SubjectKey).shortName[lang]}
                      </span>
                      <span
                        className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                          isDark ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className="block h-full rounded-full bg-indigo-500"
                          style={{ width: `${share}%` }}
                        />
                      </span>
                      <span className="font-mono tabular-nums opacity-70 w-8 text-right">
                        {formatNum(howMany, lang)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* How close is this paper to a full board paper? */}
            {activePattern.kind === 'hsc' && selectedSubject !== 'all' && (() => {
              const paperCount = MCQ_COUNTS[selectedSubject] ?? 0;
              const target = activePattern.id === 'hsc-practical' ? 25 : 30;
              const pct = Math.min(100, Math.round((paperCount / target) * 100));
              return (
                <div
                  className={`p-3 rounded-xl border ${
                    isDark
                      ? 'bg-slate-900/55 border-slate-700/80'
                      : 'bg-slate-50/75 border-slate-200/85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span>
                      {lang === 'bn' ? 'এই পত্রের প্রশ্ন-প্রস্তুতি' : 'Questions available for this paper'}
                    </span>
                    <span className="font-mono tabular-nums opacity-75">
                      {formatNum(paperCount, lang)}/{formatNum(target, lang)}
                    </span>
                  </div>
                  <div
                    className={`mt-1.5 h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-700' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${
                        pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-70 mt-1.5">
                    {paperCount >= target
                      ? lang === 'bn'
                        ? 'পূর্ণ বোর্ড কাগজ দেওয়া যাচ্ছে ✓'
                        : 'A full board paper is possible ✓'
                      : lang === 'bn'
                      ? `পূর্ণ ${formatNum(target, lang)}-প্রশ্নের কাগজের জন্য আরও ${formatNum(
                          target - paperCount,
                          lang
                        )}টি প্রশ্ন দরকার — ব্যাংক ধাপে ধাপে বাড়ছে।`
                      : `${target - paperCount} more questions are needed for a full ${target}-question paper — the bank grows in batches.`}
                  </p>
                </div>
              );
            })()}

            {/* Question Count & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider font-bold mb-2 opacity-65">
                  {lang === 'bn' ? '০৪. প্রশ্ন সংখ্যা' : '04. QUESTION COUNT'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[5, 10, 20, 25, 50].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`py-2.5 rounded-xl border text-xs font-bold tabular-nums cursor-pointer transition-all ${
                        questionCount === n
                          ? isDark
                            ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                            : 'bg-teal-50 text-teal-800 border-teal-300'
                          : isDark
                          ? 'bg-slate-900/50 border-slate-700/80 text-slate-300'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700'
                      }`}
                    >
                      {formatNum(Math.min(n, availablePoolCount), lang)}
                      <span className="block text-[10px] font-mono font-normal opacity-60 leading-none mt-0.5">
                        {n === 25
                          ? lang === 'bn'
                            ? 'বোর্ড'
                            : 'board'
                          : lang === 'bn'
                          ? 'টি'
                          : 'qs'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider font-bold mb-2 opacity-65">
                  {lang === 'bn' ? '০৫. মূল্যায়ন পদ্ধতি' : '05. MODE'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamMode('timed')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      examMode === 'timed'
                        ? isDark
                          ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                          : 'bg-teal-50 text-teal-800 border-teal-300'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-700/80 text-slate-300'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    {lang === 'bn' ? 'টাইমড এক্সাম' : 'Timed Exam'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamMode('practice')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      examMode === 'practice'
                        ? isDark
                          ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                          : 'bg-teal-50 text-teal-800 border-teal-300'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-700/80 text-slate-300'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    {lang === 'bn' ? 'প্র্যাকটিস মোড' : 'Practice Mode'}
                  </button>
                </div>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider font-bold mb-2 opacity-65">
                {lang === 'bn' ? '০৬. প্রশ্নের মান (Difficulty)' : '06. DIFFICULTY LEVEL'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'all', bn: 'সব স্তর', en: 'All' },
                    { id: 'easy', bn: 'সহজ', en: 'Easy' },
                    { id: 'medium', bn: 'মধ্যম', en: 'Medium' },
                    { id: 'hard', bn: 'কঠিন (BUET)', en: 'Hard' },
                  ] as const
                ).map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setDifficultyFilter(d.id)}
                    className={`py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      difficultyFilter === d.id
                        ? isDark
                          ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-700/80 text-slate-300'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    {lang === 'bn' ? d.bn : d.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Marking Option */}
            <div
              onClick={() => {
                if (activePattern.kind === 'custom') setNegativeMarking(!negativeMarking);
              }}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                activePattern.kind === 'custom' ? 'cursor-pointer' : 'cursor-default'
              } ${
                negativeMarking
                  ? isDark
                    ? 'bg-amber-500/12 border-amber-400/35'
                    : 'bg-amber-50/75 border-amber-300'
                  : isDark
                  ? 'bg-slate-900/50 border-slate-700/80'
                  : 'bg-slate-50/70 border-slate-200/85'
              }`}
            >
              <div className="flex items-center gap-3">
                <Scale className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">
                    {activePattern.kind === 'custom'
                      ? lang === 'bn'
                        ? 'ভর্তি পরীক্ষা মানদণ্ড (-০.২৫ নেগেটিভ মার্কিং)'
                        : 'Admission Standard (-0.25 Negative Marking)'
                      : activePattern.negativeMarking
                      ? lang === 'bn'
                        ? `${activePattern.name.bn}: প্রতি ভুলে −০.২৫`
                        : `${activePattern.name.en}: −0.25 per wrong answer`
                      : lang === 'bn'
                      ? `${activePattern.name.bn}: নেগেটিভ মার্কিং নেই`
                      : `${activePattern.name.en}: no negative marking`}
                  </div>
                  <div className="text-[11px] opacity-60 mt-0.5">
                    {activePattern.kind === 'custom'
                      ? lang === 'bn'
                        ? 'নিষ্ক্রিয় থাকলে HSC বোর্ড মানদণ্ড অনুযায়ী ভুল উত্তরে নম্বর কর্তন হবে না'
                        : 'Unchecked = HSC Board Standard (no deduction for wrong answers)'
                      : lang === 'bn'
                      ? 'প্যাটার্ন বদলালে নম্বর-কর্তনের নিয়মও স্বয়ংক্রিয়ভাবে বদলে যায়'
                      : 'Switch pattern and the marking rule follows the real paper'}
                  </div>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  negativeMarking
                    ? 'bg-amber-500 text-white border-amber-500'
                    : isDark
                    ? 'border-slate-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {negativeMarking && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-900/50 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/90'
              }`}
            >
              <p className="text-[11px] font-extrabold">
                {lang === 'bn' ? 'শুরুর আগে: এই মকে কত% পাবে বলে মনে হয়?' : 'Before you start: what score do you expect?'}
              </p>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {lang === 'bn'
                  ? 'অনুমান করলে ফল মিলিয়ে দেখা যায় তুমি নিজের প্রস্তুতি কতটা ঠিক বুঝতে পারছ (calibration)।'
                  : 'Predicting first shows how accurately you read your own preparation (calibration).'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[40, 50, 60, 70, 80, 90].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPredicted(predicted === value ? null : value)}
                    aria-pressed={predicted === value}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                      predicted === value
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-700 dark:text-indigo-200'
                        : isDark
                          ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {formatNum(value, lang)}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPredicted(null)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    predicted === null
                      ? isDark
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-200 text-slate-700'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {lang === 'bn' ? 'শুরু করি' : 'skip'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={startExam}
              disabled={bankLoading || availablePoolCount === 0}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs ${
                bankLoading
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-wait'
                  : availablePoolCount === 0
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {bankLoading && (
                <span className="text-[11px] font-mono opacity-80">
                  {lang === 'bn' ? 'প্রশ্ন লোড হচ্ছে…' : 'loading questions…'}
                </span>
              )}
              {availablePoolCount > 0 ? (
                <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                  <span>
                    {lang === 'bn'
                      ? `পরীক্ষা শুরু করুন (${formatNum(
                          Math.min(questionCount, availablePoolCount),
                          lang
                        )}টি প্রশ্ন)`
                      : `Begin Examination (${Math.min(
                          questionCount,
                          availablePoolCount
                        )} questions)`}
                  </span>
                  <span className="text-[11px] font-mono opacity-85">
                    {lang === 'bn'
                      ? `• ${formatNum(
                          patternTimeFor(
                            scoringPattern,
                            Math.min(questionCount, availablePoolCount)
                          ) / 60,
                          lang
                        )} মিনিট`
                      : `• ${Math.round(
                          patternTimeFor(
                            scoringPattern,
                            Math.min(questionCount, availablePoolCount)
                          ) / 60
                        )} min`}
                  </span>
                </span>
              ) : !bankLoading ? (
                <span>
                  {lang === 'bn'
                    ? 'এই অধ্যায় ও difficulty-তে এখনো প্রশ্ন নেই'
                    : 'No questions match this chapter and difficulty yet'}
                </span>
              ) : null}
            </button>
          </div>

          {/* Exam History Panel */}
          <div
            className={`lg:col-span-5 p-6 rounded-2xl border space-y-4 ${
              isDark
                ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                : 'bg-white/95 border-slate-200/80 card-soft-light'
            }`}
          >
            <h2 className="text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-500" />
              <span>
                {lang === 'bn' ? 'পূর্ববর্তী পরীক্ষার লগ' : 'Assessment History'}
              </span>
            </h2>

            {quizHistory.length === 0 ? (
              <div className="py-14 text-center text-xs sm:text-sm opacity-60">
                {lang === 'bn'
                  ? 'এখনো কোনো পরীক্ষার রেকর্ড নেই।'
                  : 'No examination records yet.'}
              </div>
            ) : (
              <div
                className={`divide-y max-h-[380px] overflow-y-auto pr-1 ${
                  isDark ? 'divide-slate-700/50' : 'divide-slate-100'
                }`}
              >
                {quizHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm truncate">
                        {item.examTitle}
                      </p>
                      <p className="text-[11px] font-mono opacity-60 mt-0.5">
                        {lang === 'bn' ? 'সঠিক' : 'OK'} {formatNum(item.correctAnswers, lang)} •{' '}
                        {lang === 'bn' ? 'ভুল' : 'ERR'} {formatNum(item.wrongAnswers, lang)} •{' '}
                        {formatNum(item.durationSeconds, lang)}s
                      </p>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatNum(item.accuracy, lang)}%
                      </div>
                      <div className="text-[11px] font-mono opacity-60">
                        {formatNum(item.score, lang)}/{formatNum(item.totalQuestions, lang)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // STAGE 2: RUNNING EXAM SHEET
  if (stage === 'running') {
    const answeredCount = Object.keys(answers).length;
    const labels = lang === 'bn' ? OPTION_LABELS_BN : OPTION_LABELS_EN;

    return (
      <div className="space-y-6">
        {/* Sticky Exam Top Bar */}
        <div
          className={`sticky top-16 z-30 p-4 rounded-2xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 ${
            isDark
              ? 'bg-slate-800/90 border-slate-700'
              : 'bg-white/95 border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            {examMode === 'timed' ? (
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-formula font-bold text-sm tabular-nums border ${
                  secondsLeft <= 60
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-400/35 animate-pulse'
                    : isDark
                    ? 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(secondsLeft)}</span>
              </div>
            ) : (
              <span
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  isDark
                    ? 'bg-teal-500/15 border-teal-400/30 text-teal-200'
                    : 'bg-teal-50 border-teal-200 text-teal-800'
                }`}
              >
                {lang === 'bn' ? 'প্র্যাকটিস মোড' : 'PRACTICE MODE'}
              </span>
            )}

            <span className="text-xs sm:text-sm font-bold tabular-nums">
              {lang === 'bn' ? 'উত্তর প্রদান:' : 'Answered:'}{' '}
              <span className="text-indigo-600 dark:text-indigo-300">
                {formatNum(answeredCount, lang)} /{' '}
                {formatNum(examQuestions.length, lang)}
              </span>
            </span>

            {examMode === 'timed' && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                  focusTabSwitches === 0
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isDark
                    ? 'bg-amber-500/15 text-amber-200 border-amber-400/35'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {focusTabSwitches === 0
                  ? lang === 'bn'
                    ? 'ফোকাস শিল্ড সক্রিয়'
                    : 'Focus Shield OK'
                  : lang === 'bn'
                  ? `ট্যাব পরিবর্তন: ${formatNum(focusTabSwitches, lang)}`
                  : `Tab Switches: ${focusTabSwitches}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStage('setup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {lang === 'bn' ? 'বাতিল' : 'Exit'}
            </button>
            <button
              onClick={finishExam}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs"
            >
              {lang === 'bn' ? 'উত্তরপত্র জমা দিন' : 'Submit Sheet'}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {examQuestions.map((q, idx) => {
            const subj =
              q.subjectKey === 'medical-gk' ? null : getSubjectByKey(q.subjectKey);
            const subjLabel =
              subj?.shortName[lang] ?? (lang === 'bn' ? 'মেডিকেল GK' : 'Medical GK');
            const subjBadge = subj
              ? isDark
                ? subj.bgDark
                : subj.bgLight
              : isDark
              ? 'bg-amber-500/12 text-amber-300 border-amber-400/20'
              : 'bg-amber-50/90 text-amber-800 border-amber-200/80';
            const selected = answers[q.id];
            const isFlagged = !!flagged[q.id];
            const showInstantFeedback =
              examMode === 'practice' && selected !== undefined;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDark
                    ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                    : 'bg-white/95 border-slate-200/80 card-soft-light'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-extrabold flex items-center justify-center ${
                        isDark
                          ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/25'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {formatNum(idx + 1, lang)}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${subjBadge}`}
                    >
                      {subjLabel} • {q.chapter[lang]}
                    </span>
                    <span className="text-[11px] opacity-55">
                      [{q.boardTag[lang]}]
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                    }
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isFlagged
                        ? isDark
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                          : 'bg-amber-50 text-amber-600 border-amber-300'
                        : isDark
                        ? 'border-slate-700 opacity-50 hover:opacity-100'
                        : 'border-slate-200 opacity-50 hover:opacity-100'
                    }`}
                    title="Flag for review"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-bold leading-relaxed">
                  {q.question[lang]}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isPicked = selected === optIdx;
                    let btnStyle = isDark
                      ? 'bg-slate-900/50 border-slate-700/80 hover:border-indigo-400/40 text-slate-200'
                      : 'bg-slate-50/75 border-slate-200/85 hover:border-indigo-300 hover:bg-white text-slate-800';

                    if (showInstantFeedback) {
                      if (optIdx === q.correctIndex) {
                        btnStyle = isDark
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/45 font-bold'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
                      } else if (isPicked && optIdx !== q.correctIndex) {
                        btnStyle = isDark
                          ? 'bg-rose-500/15 border-rose-400/35 text-rose-200'
                          : 'bg-rose-50 border-rose-200 text-rose-800';
                      }
                    } else if (isPicked) {
                      btnStyle = isDark
                        ? 'bg-indigo-500/25 text-indigo-100 border-indigo-400/50 font-bold'
                        : 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold shadow-2xs';
                    }

                    return (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => {
                          if (showInstantFeedback) return;
                          setAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                        }}
                        className={`p-3.5 rounded-xl border text-left text-sm flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                            showInstantFeedback && optIdx === q.correctIndex
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : isPicked && !showInstantFeedback
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : isDark
                              ? 'border-slate-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {labels[optIdx]}
                        </span>
                        <span className="flex-1">{opt[lang]}</span>
                      </button>
                    );
                  })}
                </div>

                {showInstantFeedback && (
                  <div
                    className={`p-3.5 rounded-xl border-l-4 text-xs sm:text-sm ${
                      isDark
                        ? 'bg-slate-900/60 border-teal-400 text-slate-300'
                        : 'bg-teal-50/60 border-teal-500 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {lang === 'bn' ? 'ব্যাখ্যা: ' : 'Explanation: '}
                    </span>
                    {q.explanation[lang]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={finishExam}
            className="px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
          >
            {lang === 'bn'
              ? 'উত্তরপত্র জমা দিন ও সমাধান দেখুন'
              : 'Submit & Inspect Answer Sheet'}
          </button>
        </div>
      </div>
    );
  }

  // STAGE 3: RESULT & DETAILED SOLUTION SHEET
  const labels = lang === 'bn' ? OPTION_LABELS_BN : OPTION_LABELS_EN;
  const wrongQuestionIds = examQuestions
    .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex)
    .map((q) => q.id);
  const reasonSummary = mistakeSummary(wrongQuestionIds, reasonStore);

  return (
    <div className="space-y-6">
      {lastResult && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border text-center space-y-5 ${
            isDark
              ? 'bg-gradient-to-br from-slate-800/90 to-indigo-950/35 border-slate-700 card-soft-dark'
              : 'bg-gradient-to-br from-white via-indigo-50/35 to-emerald-50/35 border-slate-200/85 card-soft-light'
          }`}
        >
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold ${
              isDark
                ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              {lang === 'bn'
                ? `+${formatNum(lastResult.correct * 10 + 15, lang)} XP অর্জিত`
                : `+${lastResult.correct * 10 + 15} XP EARNED`}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs sm:text-sm font-extrabold">
              {lastResult.pattern.kind === 'custom'
                ? lang === 'bn'
                  ? 'নিজের সেট'
                  : 'Custom set'
                : lastResult.pattern.name[lang]}
            </div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lastResult.pattern.breakdown[lang]}
            </div>
            {lastResult.penalty > 0 && (
              <div
                className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? 'bg-rose-500/12 border-rose-400/25 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {lang === 'bn'
                  ? `নেগেটিভ কর্তন −${formatNum(lastResult.penalty, lang)}`
                  : `Negative deduction −${lastResult.penalty}`}
              </div>
            )}
            {writtenSectionLabel(lastResult.pattern) && (
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {writtenSectionLabel(lastResult.pattern)![lang]}
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lastResult.accuracy >= 80
              ? lang === 'bn'
                ? 'উৎকৃষ্ট ফলাফল — প্রস্তুতি অত্যন্ত সন্তোষজনক'
                : 'Excellent Result — High Mastery Demonstrated'
              : lastResult.accuracy >= 50
              ? lang === 'bn'
                ? 'সন্তোষজনক প্রচেষ্টা — নিচের ব্যাখ্যাগুলো পর্যালোচনা করুন'
                : 'Solid Effort — Review Detailed Solutions Below'
              : lang === 'bn'
              ? 'অনুশীলন অব্যাহত রাখুন — নিচের সমাধানগুলো মনোযোগ দিয়ে পড়ুন'
              : 'Continue Practicing — Study the Step-by-Step Solutions'}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              {
                val: `${formatNum(lastResult.score, lang)}/${formatNum(
                  lastResult.total || examQuestions.length,
                  lang
                )}`,
                bn: 'প্রাপ্ত স্কোর',
                en: 'FINAL SCORE',
              },
              {
                val: formatNum(lastResult.correct, lang),
                bn: 'সঠিক উত্তর',
                en: 'CORRECT',
              },
              {
                val: formatNum(lastResult.wrong, lang),
                bn: 'ভুল উত্তর',
                en: 'INCORRECT',
              },
              {
                val: `${formatNum(lastResult.accuracy, lang)}%`,
                bn: 'নির্ভুলতা',
                en: 'ACCURACY',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700/80'
                    : 'bg-white/90 border-slate-200/80'
                }`}
              >
                <div className="text-2xl font-extrabold font-formula tabular-nums">
                  {stat.val}
                </div>
                <div className="text-[11px] font-mono uppercase opacity-60 mt-1">
                  {lang === 'bn' ? stat.bn : stat.en}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={startExam}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'bn' ? 'পুনরায় পরীক্ষা দিন' : 'Retake New Set'}</span>
            </button>
            <button
              onClick={() => setStage('setup')}
              className={`px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer ${
                isDark
                  ? 'border-slate-600 bg-slate-800 hover:border-slate-400'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              {lang === 'bn' ? 'বিষয় পরিবর্তন করুন' : 'Change Parameters'}
            </button>
          </div>
        </div>
      )}

      {/* Error-reason analysis — what to practise next, not just what was wrong */}
      {lastResult && wrongQuestionIds.length > 0 && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border space-y-3 ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <h2 className="text-base font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{lang === 'bn' ? 'ভুলের কারণ বিশ্লেষণ' : 'Why the answers went wrong'}</span>
          </h2>

          {reasonSummary.total === 0 ? (
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'bn'
                ? 'প্রতিটি ভুল প্রশ্নের নিচে কারণ বেছে নিন (ধারণা / হিসাব / পড়া হয়নি / তাড়াহুড়া) — তখন এখানে তোমার জন্য পরের ধাপের পরামর্শ আসবে।'
                : 'Tag each wrong answer below (concept / calculation / unread / rushed) and this panel will suggest the next step.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MISTAKE_REASONS.map((r) => {
                  const count = reasonSummary.counts[r.id];
                  const share = reasonSummary.total > 0 ? (count / reasonSummary.total) * 100 : 0;
                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-slate-900/55 border-slate-700/80' : 'bg-slate-50/75 border-slate-200/85'
                      }`}
                    >
                      <div className="text-lg font-extrabold font-mono tabular-nums">
                        {formatNum(count, lang)}
                      </div>
                      <div className="text-[10px] font-mono uppercase opacity-60 mt-0.5">
                        {r.label[lang]}
                      </div>
                      <div
                        className={`mt-2 h-1 rounded-full overflow-hidden ${
                          isDark ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {reasonSummary.advice && (
                <p
                  className={`text-xs leading-relaxed p-3 rounded-xl border ${
                    isDark
                      ? 'bg-indigo-500/12 border-indigo-400/25 text-indigo-200'
                      : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <strong>
                    {lang === 'bn' ? 'পরের ধাপ: ' : 'Next step: '}
                  </strong>
                  {reasonSummary.advice[lang]}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Calibration: confidence versus reality */}
      {lastResult && confidence.total > 0 && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border space-y-3 ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          <h2 className="text-base font-bold flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>{lang === 'bn' ? 'নিশ্চয়তা বনাম বাস্তবতা' : 'Confidence versus reality'}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                value: confidence.solid,
                bn: 'নিশ্চিত ও সঠিক',
                en: 'sure & right',
                good: true,
              },
              {
                value: confidence.blindSpots,
                bn: 'নিশ্চিত ও ভুল',
                en: 'sure & wrong',
                good: false,
              },
              {
                value: confidence.fragile,
                bn: 'অনুমানে সঠিক',
                en: 'guessed & right',
                good: true,
              },
              {
                value: confidence.knownGaps,
                bn: 'অনুমানে ভুল',
                en: 'guessed & wrong',
                good: false,
              },
            ].map((cell) => (
              <div
                key={cell.en}
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/55 border-slate-700/80' : 'bg-slate-50/75 border-slate-200/85'
                }`}
              >
                <div
                  className={`text-lg font-extrabold font-mono tabular-nums ${
                    cell.good ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatNum(cell.value, lang)}
                </div>
                <div className="text-[10px] font-mono uppercase opacity-60 mt-0.5">
                  {lang === 'bn' ? cell.bn : cell.en}
                </div>
              </div>
            ))}
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'bn' ? confidence.messageBn : confidence.messageEn}
          </p>
          {confidence.blindSpots > 0 && (
            <button
              onClick={startBlindSpotDrill}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
            >
              {lang === 'bn'
                ? `নিশ্চিত-ভুল ${formatNum(confidence.blindSpots, lang)}টি আবার পরীক্ষা করো`
                : `Re-test the ${confidence.blindSpots} confidently wrong answer(s)`}
            </button>
          )}
        </div>
      )}

      {/* Detailed Answer Key & Explanations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">
          {lang === 'bn'
            ? 'উত্তরপত্র পর্যালোচনা ও ব্যাখ্যাসহ সমাধান'
            : 'Answer Sheet Review & Step-by-Step Solutions'}
        </h2>

        {examQuestions.map((q, idx) => {
          const userAns = answers[q.id];
          const isCorrect = userAns === q.correctIndex;
          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border space-y-3.5 ${
                isDark
                  ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                  : 'bg-white/95 border-slate-200/80 card-soft-light'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono opacity-65">
                  #{formatNum(idx + 1, lang)} • {q.chapter[lang]} ({q.boardTag[lang]})
                </span>
                {userAns === undefined ? (
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      isDark
                        ? 'border-slate-700 text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {lang === 'bn' ? 'অনুত্তরিত' : 'SKIPPED'}
                  </span>
                ) : isCorrect ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    {lang === 'bn' ? 'সঠিক' : 'CORRECT'}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    {lang === 'bn' ? 'ভুল' : 'INCORRECT'}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base">{q.question[lang]}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => {
                  const isRightOpt = oIdx === q.correctIndex;
                  const isUserWrong = userAns === oIdx && !isRightOpt;
                  return (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2.5 ${
                        isRightOpt
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 font-bold'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                          : isUserWrong
                          ? isDark
                            ? 'bg-rose-500/15 border-rose-400/30 text-rose-200 line-through'
                            : 'bg-rose-50/80 border-rose-200 text-rose-700 line-through'
                          : isDark
                          ? 'bg-slate-900/45 border-slate-700/70 text-slate-400'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{labels[oIdx]}.</span>
                        <span>{opt[lang]}</span>
                      </div>
                      {isRightOpt && <Check className="w-4 h-4 shrink-0 text-emerald-500 stroke-[3]" />}
                      {isUserWrong && <X className="w-4 h-4 shrink-0 text-rose-500" />}
                    </div>
                  );
                })}
              </div>

              <div
                className={`p-3.5 rounded-xl border-l-4 text-xs sm:text-sm leading-relaxed ${
                  isDark
                    ? 'bg-slate-900/60 border-teal-400/70 text-slate-300'
                    : 'bg-teal-50/55 border-teal-500/80 text-slate-700'
                }`}
              >
                <strong className="text-teal-700 dark:text-teal-300">
                  {lang === 'bn' ? 'সমাধান ব্যাখ্যা: ' : 'Solution: '}
                </strong>
                {q.explanation[lang]}
              </div>

              <SelfExplainBox questionId={q.id} lang={lang} theme={theme} />

              {userAns !== undefined && !isCorrect && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-60 mb-1.5">
                    {lang === 'bn' ? 'কেন ভুল হলো?' : 'WHY WAS IT WRONG?'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MISTAKE_REASONS.map((r) => {
                      const active = reasonStore[q.id] === r.id;
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() =>
                            setReasonStore(saveMistakeReason(q.id, active ? null : r.id))
                          }
                          aria-pressed={active}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                            active
                              ? isDark
                                ? 'bg-amber-500/25 border-amber-400/50 text-amber-100'
                                : 'bg-amber-100 border-amber-300 text-amber-900'
                              : isDark
                              ? 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                          }`}
                        >
                          {r.label[lang]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-60 mb-1.5">
                      {lang === 'bn' ? 'উত্তরটা কতটা নিশ্চিত ছিলে?' : 'HOW SURE WERE YOU?'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { tag: 'sure' as const, bn: 'পুরোপুরি নিশ্চিত', en: 'I was sure' },
                          { tag: 'guess' as const, bn: 'অনুমান করেছিলাম', en: 'I guessed' },
                        ]
                      ).map((option) => {
                        const active = confidenceStore[q.id]?.tag === option.tag;
                        return (
                          <button
                            type="button"
                            key={option.tag}
                            onClick={() =>
                              setConfidenceStore(
                                saveConfidence(q.id, active ? null : option.tag, false)
                              )
                            }
                            aria-pressed={active}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                              active
                                ? option.tag === 'sure'
                                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-700 dark:text-rose-200'
                                  : 'bg-sky-500/20 border-sky-400/50 text-sky-700 dark:text-sky-200'
                                : isDark
                                  ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {option[lang]}
                          </button>
                        );
                      })}
                    </div>
                    {confidenceStore[q.id]?.tag === 'sure' && (
                      <p className="text-[10px] mt-1 text-rose-600 dark:text-rose-300">
                        {lang === 'bn'
                          ? 'নিশ্চিত হয়ে ভুল — গবেষণায় এগুলোই সবচেয়ে দ্রুত ঠিক হয়, তাই এগুলো আলাদা ড্রিলে রাখা হলো।'
                          : 'Confidently wrong — research says these corrections stick best, so they go into their own drill.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
