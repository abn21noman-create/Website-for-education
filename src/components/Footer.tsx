import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ActiveTab, Lang, Theme } from '../types';

interface FooterProps {
  lang: Lang;
  theme: Theme;
  isAuthenticated: boolean;
  onNavigate: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  theme,
  isAuthenticated,
  onNavigate,
}) => {
  const isDark = theme === 'dark';

  return (
    <footer
      className={`no-print mt-16 border-t py-8 px-4 sm:px-6 transition-colors duration-300 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/60 text-slate-400'
          : 'border-slate-200/80 bg-white/75 text-slate-500'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              isDark
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20'
                : 'bg-indigo-600 text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {lang === 'bn' ? 'নক্ষত্র HSC ’28' : 'NOKKHOTRO HSC ’28'}
          </span>
          <span>•</span>
          <span>
            {lang === 'bn'
              ? 'শুধুমাত্র HSC ২০২৮ বিজ্ঞান শিক্ষার্থীদের জন্য নির্মিত'
              : '100% Student-Only HSC 2028 Science Ecosystem'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => onNavigate('lab')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'ভার্চুয়াল ল্যাব' : 'Virtual Lab'}
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'ডায়াগনস্টিক বিশ্লেষণ' : 'Analytics'}
          </button>
          <button
            onClick={() => onNavigate('hub')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'স্টুডেন্ট Q&A হাব' : 'Student Hub'}
          </button>
          <button
            onClick={() => onNavigate('practical')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'ব্যবহারিক ২৫ নম্বর ও রাইটিং' : 'Practicals & Writing'}
          </button>
          <button
            onClick={() => onNavigate('admission')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'অ্যাডমিশন হাব' : 'Admission Hub'}
          </button>
          <button
            onClick={() => onNavigate('cq')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'সৃজনশীল (CQ) ব্যাংক' : 'CQ Archive'}
          </button>
          <button
            onClick={() => onNavigate('gpa')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'GPA ক্যালকুলেটর' : 'GPA Simulator'}
          </button>
          <button
            onClick={() => onNavigate('leaderboard')}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'জাতীয় মেধাতালিকা' : 'Merit List'}
          </button>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${
              isAuthenticated
                ? isDark
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isAuthenticated
              ? lang === 'bn'
                ? '● ক্লাউড সিঙ্ক সক্রিয়'
                : '● CLOUD SYNC ACTIVE'
              : lang === 'bn'
              ? '○ লোকাল মোড (ক্লাউড প্রস্তুত)'
              : '○ LOCAL MODE (CLOUD READY)'}
          </span>
        </div>
      </div>
    </footer>
  );
};
