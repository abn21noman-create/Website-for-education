import React, { useState } from 'react';
import {
  Search,
  Star,
  Check,
  Filter,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import {
  ChapterProgressState,
  Lang,
  SubjectKey,
  Theme,
} from '../types';
import { CHAPTERS, SUBJECTS } from '../data/syllabusData';
import { PREREQUISITE_CHAINS } from '../data/hsc28EcosystemData';
import { formatNum } from '../lib/i18n';
import { SubjectIcon } from './SubjectIcon';

interface SyllabusTrackerViewProps {
  lang: Lang;
  theme: Theme;
  initialSubject: SubjectKey | 'all';
  progressMap: Record<string, ChapterProgressState>;
  onToggleStage: (
    chapterId: string,
    stage: keyof ChapterProgressState
  ) => void;
  /** Lets the shell mirror the in-view paper filter into the URL. */
  onSubjectChange?: (subject: SubjectKey | 'all') => void;
}

export const SyllabusTrackerView: React.FC<SyllabusTrackerViewProps> = ({
  lang,
  theme,
  initialSubject,
  progressMap,
  onToggleStage,
  onSubjectChange,
}) => {
  const isDark = theme === 'dark';
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | 'all'>(
    initialSubject
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'not_started' | 'in_progress' | 'mastered'
  >('all');
  const [onlyHighYield, setOnlyHighYield] = useState(false);
  const [onlyFirstYear, setOnlyFirstYear] = useState(false);
  const [showPrereqMap, setShowPrereqMap] = useState(false);

  React.useEffect(() => {
    setSelectedSubject(initialSubject);
  }, [initialSubject]);

  const stages: {
    key: keyof ChapterProgressState;
    labelBn: string;
    labelEn: string;
  }[] = [
    { key: 'theoryDone', labelBn: 'মূল বই / থিওরি', labelEn: 'Textbook / Theory' },
    { key: 'notesDone', labelBn: 'সূত্র ও নোটস', labelEn: 'Formulas & Notes' },
    { key: 'mcqDone', labelBn: 'MCQ অনুশীলন', labelEn: 'MCQ Practice' },
    { key: 'cqDone', labelBn: 'বোর্ড CQ সমাধান', labelEn: 'Board CQ Solved' },
  ];

  const filteredChapters = CHAPTERS.filter((ch) => {
    if (selectedSubject !== 'all' && ch.subjectKey !== selectedSubject) {
      return false;
    }
    if (
      onlyFirstYear &&
      !['physics1', 'chemistry1', 'math1', 'biology1', 'ict', 'bangla', 'english'].includes(
        ch.subjectKey
      )
    ) {
      return false;
    }
    if (onlyHighYield && !ch.highYield) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle =
        ch.title.bn.toLowerCase().includes(q) ||
        ch.title.en.toLowerCase().includes(q) ||
        ch.keyTopics.bn.toLowerCase().includes(q) ||
        ch.keyTopics.en.toLowerCase().includes(q);
      if (!matchTitle) return false;
    }

    const st = progressMap[ch.id] || {
      theoryDone: false,
      notesDone: false,
      mcqDone: false,
      cqDone: false,
    };
    const count =
      (st.theoryDone ? 1 : 0) +
      (st.notesDone ? 1 : 0) +
      (st.mcqDone ? 1 : 0) +
      (st.cqDone ? 1 : 0);

    if (statusFilter === 'not_started' && count !== 0) return false;
    if (statusFilter === 'in_progress' && (count === 0 || count === 4)) return false;
    if (statusFilter === 'mastered' && count !== 4) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {lang === 'bn' ? 'NCTB পাঠ্যক্রম • HSC 2028' : 'NCTB CURRICULUM • HSC 2028'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {lang === 'bn'
              ? 'পূর্ণাঙ্গ সিলেবাস ট্র্যাকার'
              : 'Complete Syllabus Tracker'}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'প্রতিটি অধ্যায়ের ৪টি ধাপ সম্পন্ন করে টিক দিন — প্রতি ধাপে +১৫ XP অর্জিত হবে।'
              : 'Mark each of the 4 completion stages per chapter — earn +15 XP per stage.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowPrereqMap(!showPrereqMap)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
              showPrereqMap
                ? isDark
                  ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : isDark
                ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-indigo-400/40'
                : 'bg-white border-slate-200/90 text-slate-700 hover:border-indigo-300 shadow-2xs'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>
              {lang === 'bn' ? 'পূর্বশর্ত অধ্যায় ম্যাপ' : 'Prerequisite Map'}
            </span>
          </button>

          <button
            onClick={() => setOnlyFirstYear(!onlyFirstYear)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
              onlyFirstYear
                ? isDark
                  ? 'bg-teal-500/20 text-teal-200 border-teal-400/35'
                  : 'bg-teal-50 text-teal-800 border-teal-300 shadow-2xs'
                : isDark
                ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-teal-400/40'
                : 'bg-white border-slate-200/90 text-slate-700 hover:border-teal-300 shadow-2xs'
            }`}
          >
            <span>
              {lang === 'bn' ? 'একাদশ শ্রেণি (১ম বর্ষ)' : 'Class 11 (Year 1)'}
            </span>
          </button>

          <button
            onClick={() => setOnlyHighYield(!onlyHighYield)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
              onlyHighYield
                ? isDark
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/35'
                  : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : isDark
                ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-amber-400/40'
                : 'bg-white border-slate-200/90 text-slate-700 hover:border-amber-300 shadow-2xs'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyHighYield ? 'fill-current text-amber-500' : 'text-amber-500'}`} />
            <span>
              {lang === 'bn'
                ? 'High-Yield অধ্যায়'
                : 'High-Yield Priority'}
            </span>
          </button>
        </div>
      </div>

      {/* Prerequisite Learning Sequence Panel */}
      {showPrereqMap && (
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isDark
              ? 'bg-indigo-950/25 border-indigo-400/25 card-soft-dark'
              : 'bg-indigo-50/45 border-indigo-200/80 card-soft-light'
          }`}
        >
          <div>
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-500" />
              <span>
                {lang === 'bn'
                  ? 'HSC ’28 বিজ্ঞান: কোন অধ্যায়ের পর কোন অধ্যায় পড়বেন (Prerequisite Tree)'
                  : 'HSC ’28 Science: Optimal Chapter Learning Sequence'}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PREREQUISITE_CHAINS.map((chain) => (
              <div
                key={chain.id}
                className={`p-4 rounded-xl border space-y-2.5 ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-white border-slate-200/85'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                  {chain.stream[lang]}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {chain.steps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span
                        className={`px-2 py-1 rounded-lg border font-medium ${
                          isDark
                            ? 'bg-slate-900/70 border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {step[lang]}
                      </span>
                      {sIdx < chain.steps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  {chain.advice[lang]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setSelectedSubject('all');
            onSubjectChange?.('all');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all duration-200 cursor-pointer ${
            selectedSubject === 'all'
              ? isDark
                ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/35'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
              : 'bg-white border-slate-200/85 text-slate-600 hover:text-slate-900 shadow-2xs'
          }`}
        >
          {lang === 'bn'
            ? `সকল বিষয় (${formatNum(CHAPTERS.length, lang)})`
            : `All Papers (${CHAPTERS.length})`}
        </button>

        {SUBJECTS.map((subj) => {
          const active = selectedSubject === subj.key;
          return (
            <button
              key={subj.key}
              onClick={() => {
                setSelectedSubject(subj.key);
                onSubjectChange?.(subj.key);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all duration-200 cursor-pointer ${
                active
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/35'
                    : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                  : 'bg-white border-slate-200/85 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <SubjectIcon name={subj.iconName} className="w-3.5 h-3.5" />
              <span>{subj.shortName[lang]}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-7 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'অধ্যায় বা টপিক অনুসন্ধান করুন (যেমন: ভেক্টর, জৈব রসায়ন, ক্যালকুলাস)...'
                : 'Search chapter or topic (e.g., Vectors, Organic, Calculus)...'
            }
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                : 'bg-white border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 shadow-2xs'
            }`}
          />
        </div>

        <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-4 h-4 opacity-45 shrink-0 mr-1 hidden sm:block" />
          {(
            [
              { id: 'all', bn: 'সবগুলো', en: 'All' },
              { id: 'not_started', bn: 'শুরু হয়নি', en: 'Pending' },
              { id: 'in_progress', bn: 'চলমান', en: 'In Progress' },
              { id: 'mastered', bn: 'সম্পন্ন', en: 'Completed' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border shrink-0 cursor-pointer transition-all ${
                statusFilter === f.id
                  ? isDark
                    ? 'bg-teal-500/20 text-teal-200 border-teal-400/35'
                    : 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                  : 'bg-white border-slate-200/85 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {lang === 'bn' ? f.bn : f.en}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters List */}
      {filteredChapters.length === 0 ? (
        <div
          className={`p-10 rounded-2xl border text-center ${
            isDark
              ? 'bg-slate-800/50 border-slate-700/70'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <p className="text-sm opacity-65">
            {lang === 'bn'
              ? 'নির্বাচিত ফিল্টারে কোনো অধ্যায় পাওয়া যায়নি।'
              : 'No chapters match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredChapters.map((ch) => {
            const subj = SUBJECTS.find((s) => s.key === ch.subjectKey)!;
            const st = progressMap[ch.id] || {
              theoryDone: false,
              notesDone: false,
              mcqDone: false,
              cqDone: false,
            };
            const doneCount =
              (st.theoryDone ? 1 : 0) +
              (st.notesDone ? 1 : 0) +
              (st.mcqDone ? 1 : 0) +
              (st.cqDone ? 1 : 0);
            const pct = doneCount * 25;

            return (
              <div
                key={ch.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                  doneCount === 4
                    ? isDark
                      ? 'bg-emerald-950/20 border-emerald-500/30 card-soft-dark'
                      : 'bg-emerald-50/45 border-emerald-200/90 card-soft-light'
                    : isDark
                    ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                    : 'bg-white/95 border-slate-200/80 card-soft-light'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                          isDark ? subj.bgDark : subj.bgLight
                        }`}
                      >
                        {subj.shortName[lang]} •{' '}
                        {lang === 'bn'
                          ? `অধ্যায় ${formatNum(ch.chapterNumber, lang)}`
                          : `CH ${ch.chapterNumber}`}
                      </span>

                      {ch.highYield && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                            isDark
                              ? 'bg-amber-500/12 border-amber-400/25 text-amber-300'
                              : 'bg-amber-50 border-amber-200/80 text-amber-700'
                          }`}
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {lang === 'bn' ? 'গুরুত্বপূর্ণ' : 'HIGH-YIELD'}
                        </span>
                      )}

                      {doneCount === 4 && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border ${
                            isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-emerald-100/90 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          {lang === 'bn' ? 'সম্পন্ন' : 'COMPLETE'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold">{ch.title[lang]}</h3>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      <span className="font-semibold">
                        {lang === 'bn' ? 'মূল আলোচ্য বিষয়: ' : 'Key Topics: '}
                      </span>
                      {ch.keyTopics[lang]}
                    </p>
                  </div>

                  {/* 4 Stage Soft Pastel Checkboxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                    {stages.map((stage) => {
                      const checked = st[stage.key];
                      return (
                        <button
                          key={stage.key}
                          onClick={() => onToggleStage(ch.id, stage.key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            checked
                              ? isDark
                                ? 'bg-emerald-500/18 text-emerald-200 border-emerald-400/35 font-bold'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                              : isDark
                              ? 'bg-slate-900/50 border-slate-700/80 text-slate-300 hover:border-slate-500'
                              : 'bg-slate-50/70 border-slate-200/85 text-slate-700 hover:border-indigo-300 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              checked
                                ? isDark
                                  ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                                  : 'border-emerald-600 bg-emerald-600 text-white'
                                : isDark
                                ? 'border-slate-600'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="truncate">
                            {lang === 'bn' ? stage.labelBn : stage.labelEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Strip */}
                <div className="mt-3.5 flex items-center gap-3">
                  <div
                    className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-700/60' : 'bg-slate-100'
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-500 to-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold tabular-nums opacity-70">
                    {formatNum(pct, lang)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
