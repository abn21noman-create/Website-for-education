import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileCheck2,
  Clock,
  LayoutGrid,
  Search,
  X,
  ChevronRight,
  BookMarked,
  FileSpreadsheet,
  FlaskConical,
  BarChart3,
  MessageSquareText,
  Compass,
  Microscope,
  Calculator,
  Trophy,
  HeartPulse,
  Brain,
} from 'lucide-react';
import type { ActiveTab, Lang, Theme } from '../types';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onPreload: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  lang: Lang;
  theme: Theme;
}

interface NavEntry {
  id: ActiveTab;
  bn: string;
  en: string;
  icon: React.ReactNode;
}

/**
 * Phone navigation.
 *
 * The desktop header crams 14 modules into a horizontal scroller that is
 * awkward to reach with a thumb and steals vertical space from the content.
 * On phones we instead show four primary destinations plus a "More" sheet that
 * exposes everything else in a big, easy-to-hit grid. Both live inside the
 * thumb arc at the bottom of the screen and respect the device safe area.
 */
export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onNavigate,
  onPreload,
  onOpenSearch,
  lang,
  theme,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDark = theme === 'dark';
  const bn = lang === 'bn';

  const primary: NavEntry[] = [
    { id: 'dashboard', bn: 'হোম', en: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'syllabus', bn: 'সিলেবাস', en: 'Syllabus', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'mcq', bn: 'MCQ', en: 'MCQ', icon: <FileCheck2 className="w-5 h-5" /> },
    { id: 'planner', bn: 'প্ল্যানার', en: 'Planner', icon: <Clock className="w-5 h-5" /> },
  ];

  const allModules: NavEntry[] = [
    { id: 'dashboard', bn: 'ড্যাশবোর্ড', en: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'syllabus', bn: 'সিলেবাস ট্র্যাকার', en: 'Syllabus Tracker', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'formulas', bn: 'সূত্র ভল্ট', en: 'Formula Vault', icon: <BookMarked className="w-4 h-4" /> },
    { id: 'cq', bn: 'CQ ব্যাংক', en: 'CQ Bank', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'mcq', bn: 'MCQ পরীক্ষা', en: 'MCQ Exam', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'gk', bn: 'দ্রুত ড্রিল', en: 'Quick Drill', icon: <Brain className="w-4 h-4" /> },
    { id: 'lab', bn: 'ভার্চুয়াল ল্যাব', en: 'Virtual Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'planner', bn: 'স্টাডি প্ল্যানার', en: 'Study Planner', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', bn: 'বিশ্লেষণ', en: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'hub', bn: 'স্টুডেন্ট হাব', en: 'Student Hub', icon: <MessageSquareText className="w-4 h-4" /> },
    { id: 'admission', bn: 'অ্যাডমিশন', en: 'Admission', icon: <Compass className="w-4 h-4" /> },
    { id: 'practical', bn: 'ব্যবহারিক ও রাইটিং', en: 'Practicals', icon: <Microscope className="w-4 h-4" /> },
    { id: 'gpa', bn: 'GPA টুল', en: 'GPA Tool', icon: <Calculator className="w-4 h-4" /> },
    { id: 'leaderboard', bn: 'মেধাক্রম', en: 'Merit List', icon: <Trophy className="w-4 h-4" /> },
    { id: 'life', bn: 'লাইফ হাব', en: 'Life Hub', icon: <HeartPulse className="w-4 h-4" /> },
  ];

  // Lock the page behind the sheet so a swipe does not scroll the module list.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen]);

  // A navigation from the sheet should always close it.
  useEffect(() => {
    setSheetOpen(false);
  }, [activeTab]);

  const go = (tab: ActiveTab) => {
    onNavigate(tab);
    setSheetOpen(false);
  };

  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={bn ? 'সব মডিউল' : 'All modules'}
            className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t shadow-2xl animate-sheet-up ${
              isDark ? 'bg-[#111c33] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div className={`mx-auto h-1 w-10 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-sm font-extrabold">
                {bn ? 'সব মডিউল' : 'All modules'}
              </h2>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label={bn ? 'বন্ধ করুন' : 'Close'}
                className={`p-2 -mr-1 rounded-xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[62dvh] overflow-y-auto overscroll-contain px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {allModules.map((m) => {
                  const active = activeTab === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => go(m.id)}
                      onTouchStart={() => onPreload(m.id)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left active:scale-[0.98] transition-transform ${
                        active
                          ? isDark
                            ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
                            : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : isDark
                          ? 'border-slate-700/70 bg-slate-800/50 text-slate-200'
                          : 'border-slate-200/90 bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          active
                            ? isDark
                              ? 'bg-indigo-500/25 text-indigo-200'
                              : 'bg-indigo-600 text-white'
                            : isDark
                            ? 'bg-slate-700/60 text-slate-300'
                            : 'bg-white text-slate-500 border border-slate-200/80'
                        }`}
                      >
                        {m.icon}
                      </span>
                      <span className="text-[11px] font-bold leading-tight min-w-0">
                        {bn ? m.bn : m.en}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40 shrink-0" />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSheetOpen(false);
                  onOpenSearch();
                }}
                className={`mt-2 w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold active:scale-[0.99] ${
                  isDark
                    ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-200'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                }`}
              >
                <Search className="w-4 h-4" />
                {bn ? 'দ্রুত সার্চ (অধ্যায়, সূত্র, CQ)' : 'Quick search (chapters, formulas, CQ)'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label={bn ? 'প্রধান মেনু' : 'Primary navigation'}
        className={`no-print fixed bottom-0 inset-x-0 z-40 md:hidden border-t backdrop-blur-xl ${
          isDark ? 'bg-[#0f172a]/92 border-slate-800/90' : 'bg-white/92 border-slate-200/80'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-[58px]">
          {primary.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                onTouchStart={() => onPreload(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform ${
                  active
                    ? isDark
                      ? 'text-indigo-300'
                      : 'text-indigo-600'
                    : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {active && (
                  <span
                    className={`absolute top-0 h-0.5 w-8 rounded-full ${
                      isDark ? 'bg-indigo-400' : 'bg-indigo-600'
                    }`}
                  />
                )}
                {item.icon}
                <span className="text-[10px] font-bold leading-none">{bn ? item.bn : item.en}</span>
              </button>
            );
          })}

          <button
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            className={`relative flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform ${
              sheetOpen || !primary.some((p) => p.id === activeTab)
                ? isDark
                  ? 'text-indigo-300'
                  : 'text-indigo-600'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-bold leading-none">{bn ? 'আরও' : 'More'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
