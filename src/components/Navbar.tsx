import React from 'react';
import {
  LayoutDashboard, BookOpenCheck, BookMarked, FileText, FileCheck2, BrainCircuit,
  CalendarDays, FlaskConical, CalendarClock, ChartNoAxesCombined, MessagesSquare,
  Compass, Microscope, Calculator, Trophy, HeartPulse, Search, Sun, Moon, Sparkles,
  Cloud, CloudOff, LoaderCircle, CircleAlert, ChevronDown, Command,
} from 'lucide-react';
import type { ActiveTab, Lang, StudentProfile, Theme } from '../types';
import { formatNum } from '../lib/i18n';
import type { SyncSnapshot } from '../lib/sync';

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
  syncStatus: SyncSnapshot;
}

const groups: { bn: string; en: string; items: { id: ActiveTab; bn: string; en: string; icon: React.ElementType }[] }[] = [
  { bn: 'ওভারভিউ', en: 'OVERVIEW', items: [
    { id: 'dashboard', bn: 'ড্যাশবোর্ড', en: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', bn: 'স্টাডি প্ল্যানার', en: 'Study planner', icon: CalendarDays },
    { id: 'routine', bn: 'মাস্টার রুটিন', en: 'Master routine', icon: CalendarClock },
  ]},
  { bn: 'পড়াশোনা', en: 'LEARNING', items: [
    { id: 'syllabus', bn: 'সিলেবাস ট্র্যাকার', en: 'Syllabus tracker', icon: BookOpenCheck },
    { id: 'formulas', bn: 'সূত্র ভল্ট', en: 'Formula vault', icon: BookMarked },
    { id: 'cq', bn: 'সৃজনশীল প্রশ্ন', en: 'CQ bank', icon: FileText },
    { id: 'mcq', bn: 'MCQ পরীক্ষা', en: 'MCQ exams', icon: FileCheck2 },
    { id: 'gk', bn: 'দ্রুত ড্রিল', en: 'Quick drills', icon: BrainCircuit },
    { id: 'lab', bn: 'ভার্চুয়াল ল্যাব', en: 'Virtual lab', icon: FlaskConical },
    { id: 'practical', bn: 'ব্যবহারিক ও রাইটিং', en: 'Practicals & writing', icon: Microscope },
  ]},
  { bn: 'আরও আবিষ্কার', en: 'EXPLORE', items: [
    { id: 'analytics', bn: 'আমার অগ্রগতি', en: 'My analytics', icon: ChartNoAxesCombined },
    { id: 'admission', bn: 'অ্যাডমিশন হাব', en: 'Admission hub', icon: Compass },
    { id: 'hub', bn: 'স্টুডেন্ট হাব', en: 'Student hub', icon: MessagesSquare },
    { id: 'life', bn: 'লাইফ হাব', en: 'Life hub', icon: HeartPulse },
    { id: 'gpa', bn: 'GPA ক্যালকুলেটর', en: 'GPA calculator', icon: Calculator },
    { id: 'leaderboard', bn: 'মেধাক্রম', en: 'Leaderboard', icon: Trophy },
  ]},
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, lang, setLang, theme, setTheme, profile, isAuthenticated, onOpenAuth, onOpenSearch, syncStatus }) => {
  const bn = lang === 'bn';
  const isDark = theme === 'dark';
  const active = groups.flatMap(group => group.items).find(item => item.id === activeTab);
  const syncText = syncStatus.phase === 'idle' ? (bn ? 'ক্লাউডে সেভড' : 'Cloud synced')
    : syncStatus.phase === 'saving' ? (bn ? 'সেভ হচ্ছে' : 'Syncing')
    : syncStatus.phase === 'offline' ? (bn ? 'সিঙ্ক বাকি' : 'Sync pending')
    : syncStatus.phase === 'error' ? (bn ? 'সিঙ্ক সমস্যা' : 'Sync issue')
    : (bn ? 'লোকাল ডেটা' : 'Local data');
  const SyncIcon = syncStatus.phase === 'saving' ? LoaderCircle : syncStatus.phase === 'error' ? CircleAlert : syncStatus.phase === 'offline' ? CloudOff : Cloud;
  return <>
    <aside className="premium-sidebar no-print hidden md:flex" aria-label={bn ? 'প্রধান নেভিগেশন' : 'Main navigation'}>
      <button className="premium-brand" onClick={() => setActiveTab('dashboard')} aria-label="Nokkhotro dashboard">
        <span className="premium-brand-mark"><Sparkles size={20} strokeWidth={1.8} /></span>
        <span><strong>নক্ষত্র<span className="premium-brand-dot">.</span></strong><small>HSC 2028 · STUDY SPACE</small></span>
      </button>
      <div className="premium-sidebar-scroll">
        {groups.map(group => <div className="premium-nav-group" key={group.en}>
          <p>{bn ? group.bn : group.en}</p>
          {group.items.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} aria-current={activeTab === item.id ? 'page' : undefined} className={`premium-nav-item ${activeTab === item.id ? 'is-active' : ''}`}>
            <item.icon size={17} strokeWidth={1.8} /><span>{bn ? item.bn : item.en}</span>{activeTab === item.id && <span className="premium-nav-active-dot" />}
          </button>)}
        </div>)}
      </div>
      <div className="premium-sidebar-bottom"><div className="premium-sidebar-note"><span>✦</span><div><strong>{bn ? 'একটু একটু করে, প্রতিদিন' : 'A little progress, every day'}</strong><small>{bn ? 'তোমার স্বপ্নের পথে এগিয়ে চলো।' : 'Keep moving towards your goal.'}</small></div></div></div>
    </aside>
    <header className={`premium-topbar no-print ${isDark ? 'is-dark' : ''}`}>
      <div className="premium-topbar-title"><span className="premium-mobile-logo"><Sparkles size={19} /></span><div><span>{bn ? 'আমার স্টাডি স্পেস' : 'MY STUDY SPACE'}</span><strong>{active ? (bn ? active.bn : active.en) : 'নক্ষত্র'}</strong></div></div>
      <div className="premium-topbar-actions">
        <button className="premium-search" onClick={onOpenSearch} aria-label={bn ? 'খুঁজুন' : 'Search'}><Search size={17} /><span>{bn ? 'কিছু খুঁজছ?' : 'Search anything...'}</span><kbd><Command size={11} /> K</kbd></button>
        <div className={`premium-sync ${syncStatus.phase}`} role="status" aria-label={syncText} title={syncStatus.lastError || syncText}><SyncIcon size={15} className={syncStatus.phase === 'saving' ? 'animate-spin' : ''} /><span>{syncText}</span></div>
        <button className="premium-icon-button" onClick={() => setLang(bn ? 'en' : 'bn')} title="Switch language / ভাষা পরিবর্তন" aria-label="Switch language">{bn ? 'EN' : 'বাং'}</button>
        <button className="premium-icon-button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Light mode' : 'Dark mode'}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>
        <button className="premium-profile" onClick={onOpenAuth} aria-label={bn ? 'প্রোফাইল খুলুন' : 'Open profile'}><span className="premium-avatar">{profile.fullName?.trim().charAt(0) || 'N'}</span><span className="premium-profile-text"><strong>{isAuthenticated ? profile.fullName : (bn ? 'শিক্ষার্থী' : 'Student')}</strong><small>{formatNum(profile.xp, lang)} XP · HSC ’28</small></span><ChevronDown size={15} /></button>
      </div>
    </header>
  </>;
};
