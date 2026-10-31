import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Layers,
  LayoutGrid,
  Plus,
  Trash2,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Printer,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Lang, PersonalNote, SubjectKey, Theme } from '../types';
import { FORMULAS } from '../data/formulasData';
import { EXCEPTION_SHEETS } from '../data/hsc28EcosystemData';
import { SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';

interface FormulaVaultViewProps {
  lang: Lang;
  theme: Theme;
  bookmarks: string[];
  onToggleBookmark: (formulaId: string) => void;
  srsMasteredIds: string[];
  onToggleSrsMastered: (formulaId: string) => void;
  personalNotes: PersonalNote[];
  onAddPersonalNote: (note: Omit<PersonalNote, 'id' | 'createdAt'>) => void;
  onDeletePersonalNote: (id: string) => void;
}

export const FormulaVaultView: React.FC<FormulaVaultViewProps> = ({
  lang,
  theme,
  bookmarks,
  onToggleBookmark,
  srsMasteredIds,
  onToggleSrsMastered,
  personalNotes,
  onAddPersonalNote,
  onDeletePersonalNote,
}) => {
  const isDark = theme === 'dark';
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | 'all'>('all');
  const [viewMode, setViewMode] = useState<
    'grid' | 'flashcard' | 'exceptions' | 'my_notes'
  >('grid');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyUnmasteredSrs, setOnlyUnmasteredSrs] = useState(false);
  const [search, setSearch] = useState('');

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteSubject, setNoteSubject] = useState<SubjectKey>('physics1');
  const [noteChapter, setNoteChapter] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFormula, setNoteFormula] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const filteredFormulas = FORMULAS.filter((f) => {
    if (selectedSubject !== 'all' && f.subjectKey !== selectedSubject) return false;
    if (onlyBookmarked && !bookmarks.includes(f.id)) return false;
    if (onlyUnmasteredSrs && srsMasteredIds.includes(f.id)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.title.bn.toLowerCase().includes(q) ||
        f.title.en.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.explanation.bn.toLowerCase().includes(q) ||
        f.explanation.en.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCard =
    filteredFormulas[Math.min(cardIndex, Math.max(0, filteredFormulas.length - 1))];

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    onAddPersonalNote({
      subjectKey: noteSubject,
      chapterTitle: noteChapter.trim(),
      title: noteTitle.trim(),
      formula: noteFormula.trim(),
      content: noteContent.trim(),
    });
    setNoteChapter('');
    setNoteTitle('');
    setNoteFormula('');
    setNoteContent('');
    setShowNoteModal(false);
    setViewMode('my_notes');
  };

  return (
    <div className="space-y-6">
      {/* Header & View Mode Controls */}
      <div
        className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {lang === 'bn' ? 'রেফারেন্স সংকলন • HSC 2028' : 'FORMULA & NOTE ARCHIVE'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {lang === 'bn'
              ? 'সূত্র সংকলন ও রিভিশন নোটস'
              : 'Formula Archive & Smart Notes'}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'অধ্যায়ভিত্তিক গুরুত্বপূর্ণ সমীকরণ, রাসায়নিক বিক্রিয়া, ব্যাকরণ নিয়ম ও ফ্ল্যাশকার্ড রিভিশন।'
              : 'Curated equations, reactions, grammar rules, and interactive active-recall flashcards.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex p-1 rounded-xl border ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/70'
                : 'bg-white border-slate-200/85 shadow-2xs'
            }`}
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'grid'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সূত্র তালিকা' : 'Sheet'}</span>
            </button>

            <button
              onClick={() => {
                setViewMode('flashcard');
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'flashcard'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ফ্ল্যাশকার্ড' : 'Flashcards'}</span>
            </button>

            <button
              onClick={() => setViewMode('exceptions')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'exceptions'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ব্যতিক্রম তালিকা' : 'Exceptions'}</span>
            </button>

            <button
              onClick={() => setViewMode('my_notes')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'my_notes'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn'
                  ? `নিজস্ব নোট (${formatNum(personalNotes.length, lang)})`
                  : `My Notes (${personalNotes.length})`}
              </span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className={`no-print inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500'
                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 shadow-2xs'
            }`}
            title="Print / Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'PDF / প্রিন্ট' : 'PDF'}</span>
          </button>

          <button
            onClick={() => setShowNoteModal(true)}
            className={`no-print inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs ${
              isDark
                ? 'bg-teal-500 text-white hover:bg-teal-400'
                : 'bg-teal-600 text-white hover:bg-teal-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন নোট' : 'New Note'}</span>
          </button>
        </div>
      </div>

      {/* Subject Filter & Search */}
      {viewMode !== 'my_notes' && viewMode !== 'exceptions' && (
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
              {lang === 'bn' ? 'সকল বিষয়' : 'All Subjects'}
            </button>

            {SUBJECTS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setSelectedSubject(s.key);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'সূত্র, বিক্রিয়া বা টপিক খুঁজুন (যেমন: কার্নো, Kp, সংকরায়ন, ক্যালকুলাস)...'
                    : 'Search formula, equation, or rule (e.g., Carnot, pH, Calculus)...'
                }
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                    : 'bg-white border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 shadow-2xs'
                }`}
              />
            </div>

            <button
              onClick={() => setOnlyUnmasteredSrs(!onlyUnmasteredSrs)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                onlyUnmasteredSrs
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/35'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                  : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
              }`}
            >
              <span>
                {lang === 'bn'
                  ? `SRS রিভিশন বাকি (${formatNum(
                      FORMULAS.length - srsMasteredIds.length,
                      lang
                    )})`
                  : `Due SRS (${FORMULAS.length - srsMasteredIds.length})`}
              </span>
            </button>

            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                onlyBookmarked
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/35'
                    : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-amber-400/40'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-amber-300 shadow-2xs'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 text-amber-500 ${onlyBookmarked ? 'fill-current' : ''}`} />
              <span>
                {lang === 'bn'
                  ? `বুকমার্ককৃত (${formatNum(bookmarks.length, lang)})`
                  : `Saved (${bookmarks.length})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: FORMULA GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFormulas.length === 0 ? (
            <div
              className={`col-span-full p-10 rounded-2xl border text-center ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700/70'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <p className="text-sm opacity-65">
                {lang === 'bn'
                  ? 'কোনো সূত্র খুঁজে পাওয়া যায়নি।'
                  : 'No matching formula cards found.'}
              </p>
            </div>
          ) : (
            filteredFormulas.map((f) => {
              const subj = getSubjectByKey(f.subjectKey);
              const starred = bookmarks.includes(f.id);
              return (
                <div
                  key={f.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                    isDark
                      ? 'bg-slate-800/65 border-slate-700/65 hover:border-slate-600 card-soft-dark'
                      : 'bg-white/95 border-slate-200/80 hover:border-indigo-200 card-soft-light'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                            isDark ? subj.bgDark : subj.bgLight
                          }`}
                        >
                          {subj.shortName[lang]}
                        </span>
                        <span className="text-[11px] opacity-65 font-medium">
                          {f.chapterTitle[lang]}
                        </span>
                      </div>
                      <button
                        onClick={() => onToggleBookmark(f.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          starred
                            ? isDark
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                            : isDark
                            ? 'border-slate-700 text-slate-400 hover:text-amber-300'
                            : 'border-slate-200 text-slate-400 hover:text-amber-600'
                        }`}
                        title={lang === 'bn' ? 'বুকমার্ক' : 'Bookmark'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${starred ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="font-bold text-base">{f.title[lang]}</h3>

                    {/* Soft Slate Formula Code Block */}
                    <div
                      className={`p-3.5 rounded-xl font-formula text-xs sm:text-sm font-semibold overflow-x-auto border ${
                        isDark
                          ? 'bg-slate-900/75 border-slate-700/80 text-indigo-200'
                          : 'bg-indigo-50/45 border-indigo-100/90 text-indigo-950'
                      }`}
                    >
                      {f.formula}
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {f.explanation[lang]}
                    </p>
                  </div>

                  {/* Soft Teal Callout */}
                  <div
                    className={`pl-3 py-2 border-l-3 text-xs flex items-start gap-2 rounded-r-lg pr-3 ${
                      isDark
                        ? 'border-teal-400/60 text-slate-300 bg-teal-500/8'
                        : 'border-teal-500/80 text-slate-700 bg-teal-50/60'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
                    <div>
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {lang === 'bn' ? 'পরীক্ষা নির্দেশিকা: ' : 'Exam Note: '}
                      </span>
                      {f.examTip[lang]}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: SOFT INTERACTIVE FLASHCARD MODE */}
      {viewMode === 'flashcard' && activeCard && (
        <div className="max-w-2xl mx-auto py-4 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono opacity-65">
            <span>
              {lang === 'bn'
                ? 'কার্ডে ক্লিক করে সূত্র ও ব্যাখ্যা দেখুন'
                : 'CLICK CARD TO REVEAL FORMULA'}
            </span>
            <span className="tabular-nums">
              {formatNum(cardIndex + 1, lang)} /{' '}
              {formatNum(filteredFormulas.length, lang)}
            </span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[300px] p-7 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 select-none ${
              isFlipped
                ? isDark
                  ? 'bg-gradient-to-br from-slate-800 to-teal-950/35 border-teal-400/40 text-slate-100 card-soft-dark'
                  : 'bg-gradient-to-br from-white to-teal-50/60 border-teal-300 text-slate-800 card-soft-light'
                : isDark
                ? 'bg-gradient-to-br from-slate-800/80 to-indigo-950/30 border-slate-700 hover:border-indigo-400/40 text-slate-100 card-soft-dark'
                : 'bg-gradient-to-br from-white to-indigo-50/45 border-slate-200 hover:border-indigo-300 text-slate-800 card-soft-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                  isDark
                    ? getSubjectByKey(activeCard.subjectKey).bgDark
                    : getSubjectByKey(activeCard.subjectKey).bgLight
                }`}
              >
                {getSubjectByKey(activeCard.subjectKey).shortName[lang]} •{' '}
                {activeCard.chapterTitle[lang]}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-indigo-600 dark:text-indigo-300">
                <RotateCcw className="w-3.5 h-3.5" />
                {isFlipped
                  ? lang === 'bn'
                    ? 'উত্তর পৃষ্ঠা'
                    : 'ANSWER'
                  : lang === 'bn'
                  ? 'প্রশ্ন পৃষ্ঠা'
                  : 'PROMPT'}
              </span>
            </div>

            {!isFlipped ? (
              <div className="my-8 text-center space-y-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold">
                  {activeCard.title[lang]}
                </h2>
                <p className="text-xs opacity-60">
                  {lang === 'bn'
                    ? 'মনে মনে সমীকরণটি স্মরণ করুন, এরপর কার্ডে ক্লিক করে মিলিয়ে নিন'
                    : 'Recall the formula mentally, then click to verify'}
                </p>
              </div>
            ) : (
              <div className="my-4 space-y-4">
                <div
                  className={`p-4 rounded-xl font-formula text-sm sm:text-base font-bold text-center border ${
                    isDark
                      ? 'bg-slate-900/75 border-slate-700 text-indigo-200'
                      : 'bg-white border-indigo-100 text-indigo-950 shadow-2xs'
                  }`}
                >
                  {activeCard.formula}
                </div>
                <p className="text-sm leading-relaxed">{activeCard.explanation[lang]}</p>
                <div
                  className={`text-xs font-medium opacity-85 border-t pt-3 ${
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}
                >
                  <span className="font-bold text-teal-600 dark:text-teal-300">
                    {lang === 'bn' ? 'টিপস: ' : 'Note: '}
                  </span>
                  {activeCard.examTip[lang]}
                </div>
              </div>
            )}

            <div className="text-center text-[11px] font-mono opacity-55">
              {activeCard.boardTag}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setCardIndex((prev) =>
                  prev > 0 ? prev - 1 : filteredFormulas.length - 1
                );
                setIsFlipped(false);
              }}
              className={`flex-1 py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800/75 border-slate-700 hover:border-slate-500'
                  : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
            </button>

            <button
              onClick={() => onToggleSrsMastered(activeCard.id)}
              className={`flex-1 py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                srsMasteredIds.includes(activeCard.id)
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isDark
                  ? 'bg-slate-800/75 border-slate-700 text-emerald-300 hover:border-emerald-400/40'
                  : 'bg-white border-slate-200 text-emerald-700 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {srsMasteredIds.includes(activeCard.id)
                  ? lang === 'bn'
                    ? 'SRS আয়ত্তকৃত'
                    : 'SRS Mastered'
                  : lang === 'bn'
                  ? 'মনে আছে (+১০ XP)'
                  : 'Mark Mastered (+10 XP)'}
              </span>
            </button>

            <button
              onClick={() => {
                setCardIndex((prev) => (prev + 1) % filteredFormulas.length);
                setIsFlipped(false);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs ${
                isDark
                  ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              <span>{lang === 'bn' ? 'পরবর্তী কার্ড' : 'Next Card'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW: HIGH-YIELD EXCEPTION CHEAT SHEETS */}
      {viewMode === 'exceptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXCEPTION_SHEETS.map((ex) => {
            const s = getSubjectByKey(ex.subjectKey);
            return (
              <div
                key={ex.id}
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDark
                    ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                    : 'bg-white/95 border-slate-200/80 card-soft-light'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      isDark ? s.bgDark : s.bgLight
                    }`}
                  >
                    {s.shortName[lang]}
                  </span>
                  <span className="text-[11px] font-mono opacity-65">
                    {ex.targetTag}
                  </span>
                </div>
                <h3 className="font-bold text-base">{ex.title[lang]}</h3>
                <p className="text-xs opacity-75">{ex.rule[lang]}</p>
                <div
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold ${
                    isDark
                      ? 'bg-amber-500/12 border-amber-400/30 text-amber-200'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {ex.exception[lang]}
                </div>
                <p className="text-xs leading-relaxed opacity-85">
                  <span className="font-bold text-teal-600 dark:text-teal-300">
                    {lang === 'bn' ? 'কারণ: ' : 'Why: '}
                  </span>
                  {ex.reason[lang]}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: STUDENT'S PERSONAL NOTES */}
      {viewMode === 'my_notes' && (
        <div className="space-y-4">
          {personalNotes.length === 0 ? (
            <div
              className={`p-10 rounded-2xl border border-dashed text-center space-y-3 ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-white border-slate-300'
              }`}
            >
              <p className="text-base font-bold">
                {lang === 'bn'
                  ? 'কোনো ব্যক্তিগত নোট সংরক্ষিত নেই'
                  : 'No personal study notes saved yet'}
              </p>
              <p className="text-xs opacity-65 max-w-md mx-auto">
                {lang === 'bn'
                  ? 'ক্লাসের গুরুত্বপূর্ণ সূত্র, বিক্রিয়া বা সংক্ষিপ্ত নোট এখানে লিখে রাখলে তা ক্লাউড ডাটাবেসে সংরক্ষিত থাকবে।'
                  : 'Archive your own class formulas, mnemonics, and short notes.'}
              </p>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
              >
                {lang === 'bn' ? '+ প্রথম নোট তৈরি করুন' : '+ Create First Note'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalNotes.map((n) => {
                const s = getSubjectByKey(n.subjectKey);
                return (
                  <div
                    key={n.id}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      isDark
                        ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                        : 'bg-white/95 border-slate-200/80 card-soft-light'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                          isDark ? s.bgDark : s.bgLight
                        }`}
                      >
                        {s.shortName[lang]} {n.chapterTitle ? `• ${n.chapterTitle}` : ''}
                      </span>
                      <button
                        onClick={() => onDeletePersonalNote(n.id)}
                        className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-base">{n.title}</h3>
                    {n.formula && (
                      <div
                        className={`p-3 rounded-xl font-formula text-xs font-semibold border ${
                          isDark
                            ? 'bg-slate-900/75 border-slate-700 text-indigo-200'
                            : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                        }`}
                      >
                        {n.formula}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line opacity-80">{n.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal to Add Personal Note */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl border p-5 sm:p-6 shadow-2xl relative max-h-[92dvh] overflow-y-auto overscroll-contain ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <button
              onClick={() => setShowNoteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">
              {lang === 'bn'
                ? 'নতুন সংক্ষিপ্ত নোট বা সূত্র সংযোজন'
                : 'Add Study Note / Formula'}
            </h2>
            <form onSubmit={handleSaveNote} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {lang === 'bn' ? 'বিষয়' : 'Subject'}
                  </label>
                  <select
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value as SubjectKey)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name[lang]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {lang === 'bn' ? 'অধ্যায় (ঐচ্ছিক)' : 'Chapter (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: ভেক্টর' : 'e.g. Vectors'}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'শিরোনাম *' : 'Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: নদী-নৌকার ন্যূনতম দূরত্বের সূত্র'
                      : 'e.g. River-Boat Minimum Path'
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'সমীকরণ / সূত্র (ঐচ্ছিক)' : 'Equation / Formula (Optional)'}
                </label>
                <input
                  type="text"
                  value={noteFormula}
                  onChange={(e) => setNoteFormula(e.target.value)}
                  placeholder="t_min = d / v"
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-formula outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'বিস্তারিত নোট *' : 'Details *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'বিস্তারিত ব্যাখ্যা লিখুন...'
                      : 'Write key explanation or steps...'
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-xs"
              >
                {lang === 'bn' ? 'সংরক্ষণ করুন (+১০ XP)' : 'Save Note (+10 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
