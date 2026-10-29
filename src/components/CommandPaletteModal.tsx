import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  ArrowRight,
  BookMarked,
  CheckSquare,
  FileSpreadsheet,
  FlaskConical,
} from 'lucide-react';
import { ActiveTab, Lang, SubjectKey, Theme } from '../types';
import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
import { FORMULAS } from '../data/formulasData';
import { CQ_QUESTIONS } from '../data/cqData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  theme: Theme;
  onSelectDestination: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  onSelectDestination,
}) => {
  const [query, setQuery] = useState('');
  const isDark = theme === 'dark';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedChapters = CHAPTERS.filter((c) =>
    !q
      ? c.highYield
      : c.title.bn.toLowerCase().includes(q) ||
        c.title.en.toLowerCase().includes(q) ||
        c.keyTopics.bn.toLowerCase().includes(q) ||
        c.keyTopics.en.toLowerCase().includes(q)
  ).slice(0, 5);

  const matchedFormulas = FORMULAS.filter((f) =>
    !q
      ? true
      : f.title.bn.toLowerCase().includes(q) ||
        f.title.en.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchedCqs = CQ_QUESTIONS.filter((c) =>
    !q
      ? true
      : c.chapter.bn.toLowerCase().includes(q) ||
        c.chapter.en.toLowerCase().includes(q) ||
        c.stem.bn.toLowerCase().includes(q)
  ).slice(0, 3);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-2xl border overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-slate-800/95 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-800'
        }`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-3.5 border-b ${
            isDark ? 'border-slate-700/80 bg-slate-900/40' : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'যেকোনো অধ্যায়, সূত্র বা সৃজনশীল প্রশ্ন অনুসন্ধান করুন...'
                : 'Search chapters, formulas, CQ topics...'
            }
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {!q && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-violet-500">
                {lang === 'bn'
                  ? 'HSC ’28 স্টুডেন্ট টুলস'
                  : 'HSC ’28 STUDENT TOOLS'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  {
                    tab: 'lab' as ActiveTab,
                    bn: 'বিজ্ঞান ও ICT ল্যাব',
                    en: 'Science & ICT Lab',
                  },
                  {
                    tab: 'admission' as ActiveTab,
                    bn: 'অ্যাডমিশন হাব',
                    en: 'Admission Hub',
                  },
                  {
                    tab: 'analytics' as ActiveTab,
                    bn: 'দুর্বলতা রাডার',
                    en: 'Weakness Radar',
                  },
                  {
                    tab: 'hub' as ActiveTab,
                    bn: 'স্টুডেন্ট Q&A হাব',
                    en: 'Student Q&A Hub',
                  },
                ].map((tool) => (
                  <button
                    key={tool.tab}
                    onClick={() => {
                      onSelectDestination(tool.tab);
                      onClose();
                    }}
                    className={`px-3 py-2 rounded-xl border text-left text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                      isDark
                        ? 'bg-slate-900/50 border-slate-700 hover:border-indigo-400/40'
                        : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FlaskConical className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {lang === 'bn' ? tool.bn : tool.en}
                      </span>
                    </span>
                    <ArrowRight className="w-3 h-3 opacity-45 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedChapters.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500/90">
                {lang === 'bn' ? 'পাঠ্যক্রম অধ্যায়সমূহ' : 'SYLLABUS CHAPTERS'}
              </div>
              <div className="space-y-1">
                {matchedChapters.map((ch) => {
                  const s = getSubjectByKey(ch.subjectKey);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        onSelectDestination('syllabus', ch.subjectKey);
                        onClose();
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-xs sm:text-sm cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-slate-700/60' : 'hover:bg-indigo-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold">{ch.title[lang]}</span>
                          <span className="opacity-60 ml-2 text-xs">
                            ({s.shortName[lang]})
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchedFormulas.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                {lang === 'bn' ? 'সূত্র সংকলন' : 'FORMULAS'}
              </div>
              <div className="space-y-1">
                {matchedFormulas.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectDestination('formulas');
                      onClose();
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-xs sm:text-sm cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-700/60' : 'hover:bg-teal-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookMarked className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold">{f.title[lang]}</span>
                        <span className="font-mono text-[11px] opacity-60 ml-2">
                          {f.formula.slice(0, 32)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedCqs.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {lang === 'bn' ? 'বোর্ড সৃজনশীল (CQ)' : 'CREATIVE QUESTIONS (CQ)'}
              </div>
              <div className="space-y-1">
                {matchedCqs.map((cq) => (
                  <button
                    key={cq.id}
                    onClick={() => {
                      onSelectDestination('cq');
                      onClose();
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-xs sm:text-sm cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-700/60' : 'hover:bg-amber-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-semibold truncate">{cq.chapter[lang]}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
