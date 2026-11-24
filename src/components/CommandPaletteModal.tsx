import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  ArrowRight,
  BookMarked,
  CheckSquare,
  FileSpreadsheet,
  Compass,
  StickyNote,
  Play,
  CornerDownLeft,
} from 'lucide-react';
import { ActiveTab, Lang, PersonalNote, SubjectKey, Theme } from '../types';
import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
import { FORMULAS } from '../data/formulasData';
import { CQ_QUESTIONS } from '../data/cqData';
import { requestChapterDrill } from '../lib/chapterDrill';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  theme: Theme;
  personalNotes?: PersonalNote[];
  onSelectDestination: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
}

interface ModuleDestination {
  tab: ActiveTab;
  bn: string;
  en: string;
  keywords: string;
}

const ALL_MODULES: ModuleDestination[] = [
  { tab: 'dashboard', bn: 'ড্যাশবোর্ড ও আজকের ফোকাস', en: 'Dashboard & Today Focus', keywords: 'home overview today focus streak' },
  { tab: 'syllabus', bn: 'পূর্ণাঙ্গ সিলেবাস ট্র্যাকার', en: 'Complete Syllabus Tracker', keywords: 'chapters curriculum nctb progress' },
  { tab: 'formulas', bn: 'সূত্র সংকলন ও ফ্ল্যাশকার্ড', en: 'Formula Archive & Flashcards', keywords: 'equations notes srs flashcards' },
  { tab: 'cq', bn: 'বোর্ড সৃজনশীল (CQ) ব্যাংক', en: 'Creative Question (CQ) Bank', keywords: 'written creative stem board' },
  { tab: 'mcq', bn: 'MCQ পরীক্ষা ও অধ্যায় ড্রিল', en: 'MCQ Exam & Chapter Drill', keywords: 'mock quiz test negative marking' },
  { tab: 'gk', bn: 'মেডিকেল GK ও ইংলিশ ড্রিল', en: 'Medical GK & English Drill', keywords: 'general knowledge vocabulary medical' },
  { tab: 'routine', bn: 'মাস্টার রুটিন ও পড়ার সময়', en: 'Master Routine & Study Time', keywords: 'schedule timetable weekly review' },
  { tab: 'planner', bn: 'স্টাডি প্ল্যানার ও পোমোডোরো', en: 'Study Planner & Focus Log', keywords: 'tasks todo timer sessions' },
  { tab: 'lab', bn: 'ভার্চুয়াল বিজ্ঞান ও ICT ল্যাব', en: 'Virtual Science & ICT Lab', keywords: 'simulator pendulum titration logic' },
  { tab: 'practical', bn: 'ব্যবহারিক খাতা ও রাইটিং গাইড', en: 'Practicals & Writing Formats', keywords: 'experiment lab report email essay' },
  { tab: 'admission', bn: 'অ্যাডমিশন রোডম্যাপ (মেডিকেল/বুয়েট/ঢাবি)', en: 'Admission Hub (Medical/BUET/DU)', keywords: 'university eligibility marks' },
  { tab: 'gpa', bn: 'HSC ও ভর্তি GPA ক্যালকুলেটর', en: 'HSC & Admission GPA Calculator', keywords: 'grade point marks ssc' },
  { tab: 'analytics', bn: 'দুর্বলতা বিশ্লেষণ ও ব্যাকআপ', en: 'Analytics, Mistake Bank & Backup', keywords: 'weakness accuracy export import json' },
  { tab: 'hub', bn: 'স্টুডেন্ট Q&A ও পিয়ার হাব', en: 'Student Q&A & Peer Hub', keywords: 'forum doubt community roadmap' },
  { tab: 'leaderboard', bn: 'ব্যক্তিগত XP ও কমিউনিটি র‍্যাঙ্ক', en: 'XP Progress & Leaderboard', keywords: 'points level badges rank' },
  { tab: 'life', bn: 'লাইফ হাব, উপস্থিতি ও অভ্যাস', en: 'Life Hub, Attendance & Habits', keywords: 'college routine exam results reminders' },
];

interface PaletteResultItem {
  id: string;
  section: 'modules' | 'chapters' | 'formulas' | 'cqs' | 'notes';
  label: string;
  sublabel?: string;
  onActivate: () => void;
  secondaryAction?: {
    label: string;
    onActivate: () => void;
  };
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  personalNotes = [],
  onSelectDestination,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActiveIndex(0);
    const raf = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const matchedModules = useMemo(() => {
    if (!q) return ALL_MODULES.slice(0, 8);
    return ALL_MODULES.filter(
      (m) =>
        m.bn.toLowerCase().includes(q) ||
        m.en.toLowerCase().includes(q) ||
        m.keywords.toLowerCase().includes(q) ||
        m.tab.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [q]);

  const matchedChapters = useMemo(
    () =>
      CHAPTERS.filter((c) =>
        !q
          ? c.highYield
          : c.title.bn.toLowerCase().includes(q) ||
            c.title.en.toLowerCase().includes(q) ||
            c.keyTopics.bn.toLowerCase().includes(q) ||
            c.keyTopics.en.toLowerCase().includes(q)
      ).slice(0, 5),
    [q]
  );

  const matchedFormulas = useMemo(
    () =>
      FORMULAS.filter((f) =>
        !q
          ? false
          : f.title.bn.toLowerCase().includes(q) ||
            f.title.en.toLowerCase().includes(q) ||
            f.formula.toLowerCase().includes(q) ||
            f.chapterTitle.bn.toLowerCase().includes(q) ||
            f.chapterTitle.en.toLowerCase().includes(q)
      ).slice(0, 4),
    [q]
  );

  const matchedCqs = useMemo(
    () =>
      CQ_QUESTIONS.filter((c) =>
        !q
          ? false
          : c.chapter.bn.toLowerCase().includes(q) ||
            c.chapter.en.toLowerCase().includes(q) ||
            c.stem.bn.toLowerCase().includes(q) ||
            c.stem.en.toLowerCase().includes(q)
      ).slice(0, 3),
    [q]
  );

  const matchedNotes = useMemo(
    () =>
      personalNotes
        .filter((n) =>
          !q
            ? false
            : n.title.toLowerCase().includes(q) ||
              n.content.toLowerCase().includes(q) ||
              (n.formula || '').toLowerCase().includes(q)
        )
        .slice(0, 3),
    [personalNotes, q]
  );

  const flatItems = useMemo<PaletteResultItem[]>(() => {
    const items: PaletteResultItem[] = [];
    for (const mod of matchedModules) {
      items.push({
        id: `mod-${mod.tab}`,
        section: 'modules',
        label: lang === 'bn' ? mod.bn : mod.en,
        onActivate: () => {
          onSelectDestination(mod.tab);
          onClose();
        },
      });
    }
    for (const ch of matchedChapters) {
      const s = getSubjectByKey(ch.subjectKey);
      items.push({
        id: `ch-${ch.id}`,
        section: 'chapters',
        label: ch.title[lang],
        sublabel: s.shortName[lang],
        onActivate: () => {
          onSelectDestination('syllabus', ch.subjectKey);
          onClose();
        },
        secondaryAction: {
          label: lang === 'bn' ? 'ড্রিল' : 'Drill',
          onActivate: () => {
            requestChapterDrill({
              subjectKey: ch.subjectKey,
              chapterBn: ch.title.bn,
              chapterEn: ch.title.en,
              chapterId: ch.id,
              count: 10,
            });
            onSelectDestination('mcq');
            onClose();
          },
        },
      });
    }
    for (const f of matchedFormulas) {
      items.push({
        id: `f-${f.id}`,
        section: 'formulas',
        label: f.title[lang],
        sublabel: f.formula.slice(0, 36),
        onActivate: () => {
          onSelectDestination('formulas');
          onClose();
        },
      });
    }
    for (const cq of matchedCqs) {
      items.push({
        id: `cq-${cq.id}`,
        section: 'cqs',
        label: cq.chapter[lang],
        sublabel: getSubjectByKey(cq.subjectKey).shortName[lang],
        onActivate: () => {
          onSelectDestination('cq');
          onClose();
        },
      });
    }
    for (const note of matchedNotes) {
      items.push({
        id: `note-${note.id}`,
        section: 'notes',
        label: note.title,
        sublabel: getSubjectByKey(note.subjectKey).shortName[lang],
        onActivate: () => {
          onSelectDestination('formulas');
          onClose();
        },
      });
    }
    return items;
  }, [
    lang,
    matchedChapters,
    matchedCqs,
    matchedFormulas,
    matchedModules,
    matchedNotes,
    onClose,
    onSelectDestination,
  ]);

  const safeActiveIndex = flatItems.length
    ? Math.min(activeIndex, flatItems.length - 1)
    : -1;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' && flatItems.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
        return;
      }
      if (e.key === 'ArrowUp' && flatItems.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? flatItems.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === 'Enter' && safeActiveIndex >= 0) {
        const target = e.target as HTMLElement | null;
        if (target && target.tagName === 'BUTTON' && target !== inputRef.current) {
          return;
        }
        e.preventDefault();
        flatItems[safeActiveIndex]?.onActivate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flatItems, isOpen, onClose, safeActiveIndex]);

  if (!isOpen) return null;

  const sections: Array<{
    key: PaletteResultItem['section'];
    titleBn: string;
    titleEn: string;
    colorClass: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'modules',
      titleBn: q ? 'মডিউলসমূহ' : 'দ্রুত নেভিগেশন (১৬টি মডিউলের প্রধান অংশ)',
      titleEn: q ? 'MODULES' : 'QUICK DESTINATIONS',
      colorClass: 'text-violet-500',
      icon: <Compass className="w-4 h-4 text-violet-500 shrink-0" />,
    },
    {
      key: 'chapters',
      titleBn: 'পাঠ্যক্রম অধ্যায়সমূহ',
      titleEn: 'SYLLABUS CHAPTERS',
      colorClass: 'text-indigo-500/90',
      icon: <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />,
    },
    {
      key: 'formulas',
      titleBn: 'সূত্র সংকলন',
      titleEn: 'FORMULAS',
      colorClass: 'text-teal-600 dark:text-teal-400',
      icon: <BookMarked className="w-4 h-4 text-teal-500 shrink-0" />,
    },
    {
      key: 'cqs',
      titleBn: 'বোর্ড সৃজনশীল (CQ)',
      titleEn: 'CREATIVE QUESTIONS (CQ)',
      colorClass: 'text-amber-600 dark:text-amber-400',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />,
    },
    {
      key: 'notes',
      titleBn: 'ব্যক্তিগত নোটস',
      titleEn: 'PERSONAL NOTES',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      icon: <StickyNote className="w-4 h-4 text-emerald-500 shrink-0" />,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 px-3 pb-4 sm:p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          lang === 'bn'
            ? 'দ্রুত অনুসন্ধান ও নেভিগেশন'
            : 'Quick search and navigation'
        }
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-2xl border overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-slate-800/95 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-800'
        }`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-3.5 border-b ${
            isDark
              ? 'border-slate-700/80 bg-slate-900/40'
              : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={
              safeActiveIndex >= 0 ? flatItems[safeActiveIndex]?.id : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={
              lang === 'bn'
                ? 'মডিউল, অধ্যায়, সূত্র, CQ বা নোট অনুসন্ধান করুন...'
                : 'Search modules, chapters, formulas, CQs, or notes...'
            }
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              aria-label={lang === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear query'}
              className="px-1.5 py-0.5 text-[11px] rounded-md opacity-70 hover:opacity-100 cursor-pointer"
            >
              {lang === 'bn' ? 'মুছুন' : 'Clear'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close search'}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          id="command-palette-results"
          role="listbox"
          aria-label={lang === 'bn' ? 'অনুসন্ধান ফলাফল' : 'Search results'}
          className="max-h-[64dvh] overflow-y-auto overscroll-contain p-3 space-y-4"
        >
          {flatItems.length === 0 ? (
            <div className="py-10 text-center text-xs sm:text-sm opacity-65">
              {lang === 'bn'
                ? 'কোনো ফলাফল পাওয়া যায়নি। অন্য কীওয়ার্ড লিখে দেখো।'
                : 'No matching results found. Try a different keyword.'}
            </div>
          ) : (
            sections.map((section) => {
              const sectionItems = flatItems
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.section === section.key);
              if (sectionItems.length === 0) return null;

              return (
                <div key={section.key}>
                  <div
                    className={`px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider ${section.colorClass}`}
                  >
                    {lang === 'bn' ? section.titleBn : section.titleEn}
                  </div>
                  <div className="space-y-1">
                    {sectionItems.map(({ item, idx }) => {
                      const active = idx === safeActiveIndex;
                      return (
                        <div
                          key={item.id}
                          id={item.id}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`w-full px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-left text-xs sm:text-sm transition-colors ${
                            active
                              ? isDark
                                ? 'bg-indigo-500/20 text-indigo-100'
                                : 'bg-indigo-50 text-indigo-950'
                              : isDark
                              ? 'hover:bg-slate-700/60'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={item.onActivate}
                            className="flex-1 flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                          >
                            {section.icon}
                            <div className="truncate">
                              <span className="font-semibold">{item.label}</span>
                              {item.sublabel && (
                                <span className="font-mono text-[11px] opacity-60 ml-2">
                                  ({item.sublabel})
                                </span>
                              )}
                            </div>
                          </button>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.secondaryAction && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  item.secondaryAction?.onActivate();
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                                  isDark
                                    ? 'bg-teal-500/15 text-teal-200 border-teal-400/30 hover:bg-teal-500/25'
                                    : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                                }`}
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>{item.secondaryAction.label}</span>
                              </button>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          className={`px-4 py-2 border-t text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 opacity-70 ${
            isDark
              ? 'border-slate-700/80 bg-slate-900/40'
              : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <span>
            {lang === 'bn'
              ? '↑↓ নির্বাচন • Enter খুলুন • Esc বন্ধ'
              : '↑↓ Navigate • Enter Open • Esc Close'}
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            <span>Ctrl / ⌘ + K</span>
          </span>
        </div>
      </div>
    </div>
  );
};
