import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BookMarked,
  FileSpreadsheet,
  FileCheck2,
  Clock,
  Calculator,
  Trophy,
  Sun,
  Moon,
  Zap,
  UserCheck,
  LogIn,
  GraduationCap,
  Search,
  FlaskConical,
  BarChart3,
  MessageSquareText,
  Compass,
} from 'lucide-react';
import { ActiveTab, Lang, StudentProfile, Theme } from '../types';
import { formatNum } from '../lib/i18n';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  profile: StudentProfile;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  profile,
  isAuthenticated,
  onOpenAuth,
  onOpenSearch,
}) => {
  const navItems: {
    id: ActiveTab;
    labelBn: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      labelBn: 'ড্যাশবোর্ড',
      labelEn: 'Overview',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'syllabus',
      labelBn: 'সিলেবাস',
      labelEn: 'Syllabus',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
    },
    {
      id: 'formulas',
      labelBn: 'সূত্র',
      labelEn: 'Formulas',
      icon: <BookMarked className="w-3.5 h-3.5" />,
    },
    {
      id: 'cq',
      labelBn: 'CQ ব্যাংক',
      labelEn: 'CQ Bank',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      id: 'mcq',
      labelBn: 'MCQ পরীক্ষা',
      labelEn: 'MCQ Exam',
      icon: <FileCheck2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'lab',
      labelBn: 'ভার্চুয়াল ল্যাব',
      labelEn: 'Virtual Lab',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
    },
    {
      id: 'planner',
      labelBn: 'প্ল্যানার',
      labelEn: 'Planner',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: 'analytics',
      labelBn: 'বিশ্লেষণ',
      labelEn: 'Analytics',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    {
      id: 'hub',
      labelBn: 'স্টুডেন্ট হাব',
      labelEn: 'Student Hub',
      icon: <MessageSquareText className="w-3.5 h-3.5" />,
    },
    {
      id: 'admission',
      labelBn: 'অ্যাডমিশন হাব',
      labelEn: 'Admission',
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: 'gpa',
      labelBn: 'GPA টুল',
      labelEn: 'GPA Tool',
      icon: <Calculator className="w-3.5 h-3.5" />,
    },
    {
      id: 'leaderboard',
      labelBn: 'মেধাক্রম',
      labelEn: 'Merit',
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`no-print sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? 'bg-[#0f172a]/85 border-slate-800/90 text-slate-100'
          : 'bg-[#f4f7fb]/90 border-slate-200/80 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2.5">
        {/* Soft Brand Identity */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left group shrink-0 cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-xs ${
              isDark
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/25'
                : 'bg-indigo-600 text-white'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight leading-none">
                {lang === 'bn' ? 'নক্ষত্র' : 'NOKKHOTRO'}
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                  isDark
                    ? 'border-indigo-400/25 bg-indigo-500/12 text-indigo-300'
                    : 'border-indigo-200/80 bg-indigo-50 text-indigo-700'
                }`}
              >
                HSC ’28
              </span>
            </div>
            <p
              className={`text-[10px] mt-0.5 hidden md:block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {lang === 'bn'
                ? 'বিজ্ঞান বিভাগ • একাডেমিক পোর্টাল'
                : 'Science Division • Academic Portal'}
            </p>
          </div>
        </button>

        {/* Ultra-wide Smooth Pill Navigation */}
        <nav
          className={`hidden 2xl:flex items-center gap-0.5 p-1 rounded-xl border ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/60'
              : 'bg-white/80 border-slate-200/80 shadow-2xs'
          }`}
        >
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {item.icon}
                <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Search Trigger */}
          <button
            onClick={onOpenSearch}
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs border transition-all duration-200 cursor-pointer ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/70 text-slate-300 hover:border-indigo-400/40 hover:text-white'
                : 'bg-white border-slate-200/85 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs'
            }`}
            title="Quick Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono text-[10px] opacity-65">
              ⌘K
            </span>
          </button>

          {/* Soft Warm Amber XP Pill */}
          <div
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold tabular-nums border ${
              isDark
                ? 'bg-amber-500/12 text-amber-300 border-amber-400/20'
                : 'bg-amber-50/90 text-amber-700 border-amber-200/80'
            }`}
            title={lang === 'bn' ? 'অর্জিত একাডেমিক পয়েন্ট (XP)' : 'Academic Points (XP)'}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{formatNum(profile.xp, lang)}</span>
          </div>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/70 text-slate-200 hover:border-slate-500'
                : 'bg-white border-slate-200/85 text-slate-700 hover:border-slate-300 shadow-2xs'
            }`}
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            {lang === 'bn' ? 'EN' : 'বাংলা'}
          </button>

          {/* Soft Day / Night Comfort Switcher */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/70 text-amber-300 hover:border-slate-500'
                : 'bg-white border-slate-200/85 text-slate-600 hover:text-indigo-600 hover:border-slate-300 shadow-2xs'
            }`}
            aria-label="Toggle comfort theme"
            title={
              isDark
                ? lang === 'bn'
                  ? 'সফট ডে-লাইট মোড (Soft Light)'
                  : 'Switch to Soft Light Mode'
                : lang === 'bn'
                ? 'আই-কমফোর্ট নাইট মোড (Soft Dark)'
                : 'Switch to Soft Dark Mode'
            }
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Account / Login Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
              isAuthenticated
                ? isDark
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25 hover:bg-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80'
                : isDark
                ? 'bg-indigo-500 text-white border-indigo-400/40 hover:bg-indigo-400'
                : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 shadow-xs'
            }`}
          >
            {isAuthenticated ? (
              <>
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[85px] truncate">
                  {profile.fullName.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'bn' ? 'লগইন' : 'Sign In'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Smooth Horizontal Module Sub-Nav */}
      <div
        className={`2xl:hidden border-t px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto ${
          isDark
            ? 'border-slate-800/80 bg-[#0f172a]/95'
            : 'border-slate-200/70 bg-white/80'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center gap-1.5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all duration-200 ${
                  active
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-bold'
                      : 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
