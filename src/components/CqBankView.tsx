import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { Lang, SubjectKey, Theme } from '../types';
import { CQ_QUESTIONS } from '../data/cqData';
import { SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';

interface CqBankViewProps {
  lang: Lang;
  theme: Theme;
  solvedCqs: string[];
  onToggleSolvedCq: (cqId: string) => void;
}

export const CqBankView: React.FC<CqBankViewProps> = ({
  lang,
  theme,
  solvedCqs,
  onToggleSolvedCq,
}) => {
  const isDark = theme === 'dark';
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | 'all'>('all');
  const [search, setSearch] = useState('');
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  const filtered = CQ_QUESTIONS.filter((cq) => {
    if (selectedSubject !== 'all' && cq.subjectKey !== selectedSubject) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        cq.stem.bn.toLowerCase().includes(q) ||
        cq.stem.en.toLowerCase().includes(q) ||
        cq.chapter.bn.toLowerCase().includes(q) ||
        cq.chapter.en.toLowerCase().includes(q) ||
        cq.qC.bn.toLowerCase().includes(q) ||
        cq.qD.bn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const subjectsWithCq = SUBJECTS.filter((s) =>
    CQ_QUESTIONS.some((q) => q.subjectKey === s.key)
  );

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
            {lang === 'bn' ? 'লিখিত প্রস্তুতি • ১০ নম্বর কাঠামো' : 'WRITTEN PREPARATION • 10-MARK RUBRIC'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {lang === 'bn'
              ? 'বোর্ড সৃজনশীল (CQ) প্রশ্ন ব্যাংক ও মডেল সমাধান'
              : 'Board Creative Question (CQ) Archive'}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'উদ্দীপক মনোযোগ দিয়ে পড়ে খাতায় নিজে সমাধান করুন, এরপর আদর্শ বোর্ড উত্তর নির্দেশিকার সাথে মিলিয়ে নিন (+২০ XP)।'
              : 'Practice full 4-part (1+2+3+4) board creative questions and verify against model solutions (+20 XP).'}
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold self-start sm:self-auto ${
            isDark
              ? 'bg-emerald-500/12 border-emerald-400/25 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200/85 text-emerald-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>
            {lang === 'bn'
              ? `অনুশীলন সম্পন্ন: ${formatNum(solvedCqs.length, lang)} / ${formatNum(
                  CQ_QUESTIONS.length,
                  lang
                )}`
              : `SOLVED: ${solvedCqs.length} / ${CQ_QUESTIONS.length}`}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border cursor-pointer transition-all ${
              selectedSubject === 'all'
                ? isDark
                  ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/35'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : isDark
                ? 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                : 'bg-white border-slate-200/85 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            {lang === 'bn' ? 'সকল বিষয়' : 'All Papers'}
          </button>

          {subjectsWithCq.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSubject(s.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border cursor-pointer transition-all ${
                selectedSubject === s.key
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/35'
                    : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                  : 'bg-white border-slate-200/85 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {s.shortName[lang]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'সৃজনশীল উদ্দীপক বা অধ্যায় অনুসন্ধান করুন (যেমন: নদী-নৌকা, কার্নো ইঞ্জিন, বাফার, বৃত্ত)...'
                : 'Search CQ stem or topic (e.g., river-boat, Carnot, buffer, circle)...'
            }
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                : 'bg-white border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 shadow-2xs'
            }`}
          />
        </div>
      </div>

      {/* CQ Cards */}
      <div className="space-y-5">
        {filtered.map((cq, idx) => {
          const subj = getSubjectByKey(cq.subjectKey);
          const isOpen = !!openSolutions[cq.id];
          const isSolved = solvedCqs.includes(cq.id);

          return (
            <div
              key={cq.id}
              className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all ${
                isDark
                  ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                  : 'bg-white/95 border-slate-200/80 card-soft-light'
              }`}
            >
              {/* Top Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
                      isDark
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                    }`}
                  >
                    CQ #{formatNum(idx + 1, lang)}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      isDark ? subj.bgDark : subj.bgLight
                    }`}
                  >
                    {subj.shortName[lang]} • {cq.chapter[lang]}
                  </span>
                  <span className="text-xs opacity-60">[{cq.boardTag[lang]}]</span>
                </div>

                <button
                  onClick={() => onToggleSolvedCq(cq.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    isSolved
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/35'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isDark
                      ? 'border-slate-600/80 bg-slate-900/40 text-slate-300 hover:border-indigo-400/50'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>
                    {isSolved
                      ? lang === 'bn'
                        ? 'অনুশীলন সম্পন্ন'
                        : 'Practiced'
                      : lang === 'bn'
                      ? 'খাতায় সমাধান সম্পন্ন করুন (+২০ XP)'
                      : 'Mark Practiced (+20 XP)'}
                  </span>
                </button>
              </div>

              {/* Stem Box */}
              <div
                className={`p-4 rounded-xl border-l-4 text-sm leading-relaxed ${
                  isDark
                    ? 'bg-slate-900/55 border-indigo-400/70 text-slate-200'
                    : 'bg-indigo-50/45 border-indigo-500/80 text-slate-800'
                }`}
              >
                <span className="font-bold block text-xs font-mono uppercase text-indigo-600 dark:text-indigo-300 mb-1">
                  {lang === 'bn' ? 'উদ্দীপক (STEM)' : 'SCENARIO / STEM'}
                </span>
                {cq.stem[lang]}
              </div>

              {/* 4 Sub-Questions */}
              <div
                className={`divide-y text-sm ${
                  isDark ? 'divide-slate-700/50' : 'divide-slate-100'
                }`}
              >
                {[
                  { mark: 1, tagBn: 'ক', tagEn: 'a', q: cq.qA },
                  { mark: 2, tagBn: 'খ', tagEn: 'b', q: cq.qB },
                  { mark: 3, tagBn: 'গ', tagEn: 'c', q: cq.qC },
                  { mark: 4, tagBn: 'ঘ', tagEn: 'd', q: cq.qD },
                ].map((part) => (
                  <div
                    key={part.tagEn}
                    className="py-2.5 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-indigo-600 dark:text-indigo-300 shrink-0">
                        {lang === 'bn' ? `${part.tagBn})` : `(${part.tagEn})`}
                      </span>
                      <span>{part.q[lang]}</span>
                    </div>
                    <span className="font-mono text-xs font-bold opacity-60 shrink-0 tabular-nums">
                      [{formatNum(part.mark, lang)}]
                    </span>
                  </div>
                ))}
              </div>

              {/* Toggle Model Solution */}
              <div className="pt-1">
                <button
                  onClick={() =>
                    setOpenSolutions((prev) => ({
                      ...prev,
                      [cq.id]: !prev[cq.id],
                    }))
                  }
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-700 hover:border-teal-400/40 text-teal-300'
                      : 'bg-teal-50/55 border-teal-200/75 hover:bg-teal-50 text-teal-800'
                  }`}
                >
                  <span>
                    {isOpen
                      ? lang === 'bn'
                        ? 'মডেল উত্তর ও সমাধান লুকান'
                        : 'Hide Model Solution Rubric'
                      : lang === 'bn'
                      ? 'আদর্শ উত্তর ও গাণিতিক সমাধান দেখুন (ক, খ, গ, ঘ)'
                      : 'View Complete Model Solution (a, b, c, d)'}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isOpen && (
                  <div
                    className={`mt-3 p-4 sm:p-5 rounded-xl border space-y-3.5 text-xs sm:text-sm leading-relaxed ${
                      isDark
                        ? 'bg-slate-900/65 border-slate-700/80 text-slate-300'
                        : 'bg-slate-50/80 border-slate-200/85 text-slate-700'
                    }`}
                  >
                    {[
                      { labelBn: 'উত্তর (ক) — জ্ঞানমূলক [১]:', labelEn: 'Ans (a) [1]:', ans: cq.ansA },
                      { labelBn: 'উত্তর (খ) — অনুধাবনমূলক [২]:', labelEn: 'Ans (b) [2]:', ans: cq.ansB },
                      { labelBn: 'উত্তর (গ) — প্রয়োগমূলক [৩]:', labelEn: 'Ans (c) [3]:', ans: cq.ansC },
                      { labelBn: 'উত্তর (ঘ) — উচ্চতর দক্ষতা [৪]:', labelEn: 'Ans (d) [4]:', ans: cq.ansD },
                    ].map((sol, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        <div className="font-bold text-xs font-mono text-teal-700 dark:text-teal-300">
                          {lang === 'bn' ? sol.labelBn : sol.labelEn}
                        </div>
                        <p>{sol.ans[lang]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
