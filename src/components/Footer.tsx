import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ActiveTab, Lang, Theme } from '../types';
import { ACCOUNT_DELETION_URL, PRIVACY_POLICY_URL } from '../lib/publicUrls';

interface FooterProps {
  lang: Lang;
  theme: Theme;
  isAuthenticated: boolean;
  onNavigate: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, theme, onNavigate }) => {
  const bn = lang === 'bn';
  return <footer className={`premium-footer-inner no-print ${theme === 'dark' ? 'is-dark' : ''}`}>
    <div className="premium-footer-brand"><span><Sparkles size={15} /></span><div><strong>নক্ষত্র <i>HSC ’28</i></strong><small>{bn ? 'তোমার স্বপ্নের পথে, প্রতিদিন।' : 'For the journey ahead.'}</small></div></div>
    <div className="premium-footer-links">
      <button onClick={() => onNavigate('syllabus')}>{bn ? 'সিলেবাস' : 'Syllabus'}</button>
      <button onClick={() => onNavigate('routine')}>{bn ? 'রুটিন' : 'Routine'}</button>
      <button onClick={() => onNavigate('admission')}>{bn ? 'অ্যাডমিশন' : 'Admission'}</button>
      <button onClick={() => onNavigate('hub')}>{bn ? 'স্টুডেন্ট হাব' : 'Student hub'}</button>
      <a href={PRIVACY_POLICY_URL}>{bn ? 'গোপনীয়তা' : 'Privacy'}</a>
      <a href={ACCOUNT_DELETION_URL}>{bn ? 'অ্যাকাউন্ট মুছুন' : 'Delete account'}</a>
    </div>
    <span className="premium-footer-note">{bn ? 'শিক্ষার্থীদের জন্য তৈরি ✦' : 'Made for students ✦'}</span>
  </footer>;
};
