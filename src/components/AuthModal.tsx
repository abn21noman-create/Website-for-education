import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  UserPlus,
  LogIn,
  LogOut,
  Building2,
  Award,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Lang, StudentProfile, Theme } from '../types';
import { EDUCATION_BOARDS, TARGET_GOALS, formatNum, getBoardLabel } from '../lib/i18n';
import { getSupabase } from '../lib/supabase';
import { ACCOUNT_DELETION_URL, PRIVACY_POLICY_URL } from '../lib/publicUrls';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  isAuthenticated: boolean;
  onAuthSuccess: (userId: string, email: string, meta?: Partial<StudentProfile>) => Promise<void>;
  onSignOut: () => Promise<void>;
  onClearStudyData: () => Promise<void>;
  onDeleteAccount: (password: string) => Promise<void>;
  onUpdateProfileMeta: (updates: Partial<StudentProfile>) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  profile,
  isAuthenticated,
  onAuthSuccess,
  onSignOut,
  onClearStudyData,
  onDeleteAccount,
  onUpdateProfileMeta,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(
    profile.fullName === 'HSC 2028 শিক্ষার্থী' ? '' : profile.fullName
  );
  const [collegeName, setCollegeName] = useState(profile.collegeName);
  const [board, setBoard] = useState(profile.board || 'Jashore');
  const [targetGoal, setTargetGoal] = useState(
    profile.targetGoal || 'BUET / Engineering'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletionPhrase, setDeletionPhrase] = useState('');
  const [deletionAcknowledged, setDeletionAcknowledged] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>('button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    setShowAccountDeletion(false);
    setDeletionPassword('');
    setDeletionPhrase('');
    setDeletionAcknowledged(false);
  }, [isOpen]);

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const inputClass = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    isDark
      ? 'bg-slate-900/75 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
      : 'bg-slate-50/80 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white'
  }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const minimumPasswordLength = mode === 'signup' ? 8 : 6;
      if (!cleanEmail || password.length < minimumPasswordLength) {
        throw new Error(
          lang === 'bn'
            ? `সঠিক ইমেইল এবং কমপক্ষে ${minimumPasswordLength} অক্ষরের পাসওয়ার্ড প্রদান করুন।`
            : `Please enter a valid email and a password of at least ${minimumPasswordLength} characters.`
        );
      }

      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error(
            lang === 'bn'
              ? 'অনুগ্রহ করে শিক্ষার্থীর পূর্ণ নাম লিখুন।'
              : 'Please enter your full name.'
          );
        }

        const client = await getSupabase();
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              college_name: collegeName.trim(),
              board,
              target_goal: targetGoal,
              avatar_color: '#4f46e5',
            },
          },
        });

        if (error) throw error;
        if (data.user && data.session) {
          await onAuthSuccess(data.user.id, cleanEmail, {
            fullName: fullName.trim(),
            collegeName: collegeName.trim(),
            board,
            targetGoal,
            avatarColor: '#4f46e5',
          });
          setSuccessMsg(
            lang === 'bn'
              ? 'অ্যাকাউন্ট তৈরি হয়েছে; সিঙ্কের অবস্থা দেখুন।'
              : 'Account created. Check the sync status for your progress.'
          );
          setTimeout(() => onClose(), 800);
        } else {
          setSuccessMsg(lang === 'bn'
            ? 'ইমেইল যাচাই করে তারপর লগইন করুন। আপনার লোকাল ডেটা এই ডিভাইসে থাকবে।'
            : 'Verify your email, then sign in. Your local data remains on this device.');
        }
      } else {
        const client = await getSupabase();
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await onAuthSuccess(data.user.id, cleanEmail);
          setSuccessMsg(
            lang === 'bn' ? 'সফলভাবে লগইন সম্পন্ন হয়েছে।' : 'Signed in successfully.'
          );
          setTimeout(() => onClose(), 650);
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (lang === 'bn'
            ? 'প্রমাণীকরণে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।'
            : 'Authentication error. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onUpdateProfileMeta({
        fullName: fullName.trim() || profile.fullName,
        collegeName: collegeName.trim(),
        board,
        targetGoal,
      });
      setSuccessMsg(
        lang === 'bn' ? 'প্রোফাইল তথ্য হালনাগাদ করা হয়েছে।' : 'Profile updated.'
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isAuthenticated ? (lang === 'bn' ? 'প্রোফাইল ও অ্যাকাউন্ট' : 'Profile and account') : (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি বা লগইন' : 'Create account or sign in')}
        className={`relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border p-5 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto overscroll-contain ${
          isDark
            ? 'bg-slate-800 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white'
              : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {isAuthenticated ? (
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 border ${
                  isDark
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">{profile.fullName}</h2>
                <p
                  className={`text-xs truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {profile.email || getBoardLabel(profile.board, lang)} •{' '}
                  {formatNum(profile.xp, lang)} XP
                </p>
              </div>
            </div>

            <div
              className={`grid grid-cols-3 divide-x rounded-xl mb-5 text-center border py-3 ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700 divide-slate-700'
                  : 'bg-slate-50 border-slate-200 divide-slate-200'
              }`}
            >
              <div>
                <div className="text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatNum(profile.chaptersMastered, lang)}
                </div>
                <div className="text-[11px] opacity-60">
                  {lang === 'bn' ? 'অধ্যায় সম্পন্ন' : 'Chapters'}
                </div>
              </div>
              <div>
                <div className="text-base font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {formatNum(profile.quizzesTaken, lang)}
                </div>
                <div className="text-[11px] opacity-60">
                  {lang === 'bn' ? 'মডেল টেস্ট' : 'Exams'}
                </div>
              </div>
              <div>
                <div className="text-base font-extrabold tabular-nums text-teal-600 dark:text-teal-400">
                  {formatNum(profile.studyMinutes, lang)}m
                </div>
                <div className="text-[11px] opacity-60">
                  {lang === 'bn' ? 'স্টাডি সময়' : 'Focus Time'}
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'প্রতিষ্ঠান / কলেজের নাম' : 'Institution / College'}
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: সরকারি এম. এম. সিটি কলেজ, খুলনা'
                      : 'e.g. Govt. M.M. City College, Khulna'
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {lang === 'bn' ? 'শিক্ষা বোর্ড' : 'Education Board'}
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className={inputClass}
                  >
                    {EDUCATION_BOARDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'bn' ? b.bn : b.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {lang === 'bn' ? 'একাডেমিক লক্ষ্য' : 'Academic Target'}
                  </label>
                  <select
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    className={inputClass}
                  >
                    {TARGET_GOALS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {lang === 'bn' ? g.bn : g.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? 'bg-rose-500/15 border-rose-400/30 text-rose-200'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div
                  role="status"
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  {loading
                    ? lang === 'bn'
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : lang === 'bn'
                    ? 'তথ্য সংরক্ষণ করুন'
                    : 'Save Changes'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setErrorMsg(null);
                    try {
                      await onSignOut();
                      onClose();
                    } catch (error) {
                      setErrorMsg(error instanceof Error ? error.message : 'Sign out failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className={`py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:border-rose-400/40 hover:text-rose-300'
                      : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                </button>
              </div>
            </form>
            <button type="button" disabled={loading} className="mt-5 block text-xs text-indigo-600 underline disabled:opacity-50" onClick={async () => {
              setLoading(true); setErrorMsg(null); setSuccessMsg(null);
              try {
                const client = await getSupabase();
                const { data: auth } = await client.auth.getUser();
                if (!auth.user) throw new Error('Sign in first');
                const { data, error } = await client.from('hsc28_kv').select('value').eq('user_id', auth.user.id).eq('key', 'nokkhotro_guest_archive_v1').maybeSingle();
                if (error) throw error;
                if (!data?.value) { setSuccessMsg(lang === 'bn' ? 'সংরক্ষিত অতিথি-ডেটা পাওয়া যায়নি।' : 'No guest-data archive found.'); return; }
                const url = URL.createObjectURL(new Blob([data.value], { type: 'application/json' }));
                const link = document.createElement('a'); link.href = url; link.download = 'nokkhotro-guest-archive.json'; link.click(); URL.revokeObjectURL(url);
                setSuccessMsg(lang === 'bn' ? 'অতিথি-ডেটার নিরাপদ কপি ডাউনলোড হয়েছে।' : 'Guest-data archive downloaded.');
              } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Could not download guest data'); } finally { setLoading(false); }
            }}>{lang === 'bn' ? 'পুরোনো অতিথি-ডেটার কপি ডাউনলোড' : 'Download guest-data archive'}</button>
            <section className={`mt-5 rounded-2xl border p-3.5 ${isDark ? 'border-slate-700 bg-slate-900/45' : 'border-slate-200 bg-slate-50'}`} aria-label={lang === 'bn' ? 'ডেটা নিয়ন্ত্রণ' : 'Data controls'}>
              <div className="flex items-start gap-2.5">
                <ShieldAlert className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
                <div>
                  <h3 className="text-xs font-bold">{lang === 'bn' ? 'ডেটা ও অ্যাকাউন্ট নিয়ন্ত্রণ' : 'Data and account controls'}</h3>
                  <p className={`mt-1 text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{lang === 'bn' ? 'Study reset account ও community post রাখে। Full account deletion সব সংশ্লিষ্ট live data মুছে দেয়।' : 'A study reset keeps your account and community posts. Full account deletion removes the account and associated live data.'}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                <button type="button" disabled={loading} className={`min-h-11 rounded-xl border px-3 text-left text-[10px] font-bold disabled:opacity-50 ${isDark ? 'border-slate-600 text-slate-200 hover:border-amber-400/50' : 'border-slate-300 text-slate-700 hover:border-amber-400'}`} onClick={async () => {
                  setLoading(true); setErrorMsg(null); setSuccessMsg(null);
                  try { await onClearStudyData(); } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Reset failed'); } finally { setLoading(false); }
                }}>{lang === 'bn' ? 'শুধু Study data reset করুন — account রাখুন' : 'Reset study data only — keep my account'}</button>
                <button type="button" disabled={loading} aria-expanded={showAccountDeletion} className={`min-h-11 rounded-xl border px-3 text-left text-[10px] font-bold disabled:opacity-50 ${isDark ? 'border-rose-400/30 bg-rose-500/10 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'}`} onClick={() => {
                  setShowAccountDeletion((value) => !value);
                  setErrorMsg(null); setSuccessMsg(null);
                }}><span className="inline-flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" />{lang === 'bn' ? 'Account ও সব সংশ্লিষ্ট data স্থায়ীভাবে মুছুন' : 'Permanently delete account and all associated data'}</span></button>
              </div>

              {showAccountDeletion && <div className={`mt-3 rounded-xl border p-3 ${isDark ? 'border-rose-400/25 bg-slate-950/55' : 'border-rose-200 bg-white'}`}>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{lang === 'bn' ? 'এতে Auth account, profile, private study/life data, student pulse, leaderboard consent, নিজের প্রশ্ন/উত্তর ও vote মুছে যাবে। নিজের শুরু করা thread মুছলে তার replies-ও চলে যেতে পারে। এটি ফেরানো যাবে না।' : 'This deletes the Auth account, profile, private study/life data, student pulse, leaderboard consent, authored questions/replies, and votes. Replies inside a thread you started may also disappear. This cannot be undone.'}</p>
                <label className="mt-3 block text-[10px] font-semibold">{lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current password'}
                  <input className={`${inputClass} mt-1.5`} required type="password" minLength={6} maxLength={72} autoComplete="current-password" value={deletionPassword} onChange={(event) => setDeletionPassword(event.target.value)} />
                </label>
                <label className="mt-3 block text-[10px] font-semibold">{lang === 'bn' ? 'নিশ্চিত করতে DELETE লিখুন' : 'Type DELETE to confirm'}
                  <input className={`${inputClass} mt-1.5`} required type="text" autoComplete="off" spellCheck={false} placeholder="DELETE" value={deletionPhrase} onChange={(event) => setDeletionPhrase(event.target.value)} />
                </label>
                <label className={`mt-3 flex items-start gap-2 text-[10px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <input className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600" type="checkbox" checked={deletionAcknowledged} onChange={(event) => setDeletionAcknowledged(event.target.checked)} />
                  <span>{lang === 'bn' ? 'আমি বুঝেছি—এটি study reset নয়; account ও সংশ্লিষ্ট live data স্থায়ীভাবে মুছে যাবে।' : 'I understand this is not a study reset; the account and associated live data will be permanently deleted.'}</span>
                </label>
                <button type="button" disabled={loading || deletionPhrase !== 'DELETE' || !deletionPassword || !deletionAcknowledged} className="mt-3 min-h-11 w-full rounded-xl bg-rose-600 px-3 text-[10px] font-extrabold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-45" onClick={async () => {
                  setLoading(true); setErrorMsg(null); setSuccessMsg(null);
                  try { await onDeleteAccount(deletionPassword); } catch (error) { setErrorMsg(error instanceof Error ? error.message : (lang === 'bn' ? 'Account মোছা নিশ্চিত করা যায়নি।' : 'Account deletion could not be confirmed.')); } finally { setLoading(false); }
                }}>{loading ? (lang === 'bn' ? 'মুছছে…' : 'Deleting…') : (lang === 'bn' ? 'হ্যাঁ, account স্থায়ীভাবে মুছুন' : 'Yes, permanently delete my account')}</button>
              </div>}
              <div className={`mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><a className="underline" href={PRIVACY_POLICY_URL}>{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</a><a className="underline" href={ACCOUNT_DELETION_URL}>{lang === 'bn' ? 'Web deletion page' : 'Web deletion page'}</a></div>
            </section>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border mb-3 ${
                  isDark
                    ? 'bg-indigo-500/15 border-indigo-400/25 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200/80 text-indigo-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn'
                    ? 'ক্লাউড ডাটাবেস সিঙ্ক ও জাতীয় মেধাতালিকা'
                    : 'CLOUD SYNC & NATIONAL MERIT LIST'}
                </span>
              </div>

              <h2 className="text-xl font-extrabold tracking-tight">
                {mode === 'signup'
                  ? lang === 'bn'
                    ? 'শিক্ষার্থী অ্যাকাউন্ট নিবন্ধন'
                    : 'Student Portal Registration'
                  : lang === 'bn'
                  ? 'শিক্ষার্থী পোর্টালে লগইন'
                  : 'Sign In to Student Portal'}
              </h2>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {lang === 'bn'
                  ? 'নিবন্ধন করলে আপনার সিলেবাস অগ্রগতি, পরীক্ষার ফলাফল এবং অধ্যয়ন সময় স্বয়ংক্রিয়ভাবে ক্লাউডে সংরক্ষিত থাকবে।'
                  : 'Sync your syllabus progress, exam records & study hours across all devices.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div
              className={`grid grid-cols-2 gap-1 p-1 rounded-xl border mb-4 ${
                isDark
                  ? 'bg-slate-900/70 border-slate-700'
                  : 'bg-slate-100/80 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  mode === 'signup'
                    ? isDark
                      ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                      : 'bg-white text-indigo-700 shadow-2xs'
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নিবন্ধন (Sign Up)' : 'Register'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  mode === 'login'
                    ? isDark
                      ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                      : 'bg-white text-indigo-700 shadow-2xs'
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগইন (Sign In)' : 'Sign In'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1 opacity-80">
                      {lang === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 opacity-45" />
                      <input
                        type="text"
                        required
                        maxLength={80}
                  value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Your full name'}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 opacity-80">
                      {lang === 'bn' ? 'কলেজের নাম' : 'College Name'}
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-3 opacity-45" />
                      <input
                        type="text"
                        maxLength={120}
                  value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder={
                          lang === 'bn'
                            ? 'যেমন: সরকারি এম. এম. সিটি কলেজ / নটর ডেম কলেজ'
                            : 'e.g. Govt. M.M. City College / NDC'
                        }
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold mb-1 opacity-80">
                        {lang === 'bn' ? 'শিক্ষা বোর্ড' : 'Board'}
                      </label>
                      <select
                        value={board}
                        onChange={(e) => setBoard(e.target.value)}
                        className={inputClass}
                      >
                        {EDUCATION_BOARDS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {lang === 'bn' ? b.bn : b.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 opacity-80">
                        <span className="inline-flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          {lang === 'bn' ? 'লক্ষ্য' : 'Target'}
                        </span>
                      </label>
                      <select
                        value={targetGoal}
                        onChange={(e) => setTargetGoal(e.target.value)}
                        className={inputClass}
                      >
                        {TARGET_GOALS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {lang === 'bn' ? g.bn : g.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 opacity-45" />
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {mode === 'signup'
                    ? (lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *' : 'Password (min 8 chars) *')
                    : (lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 opacity-45" />
                  <input
                    type="password"
                    required
                    minLength={mode === 'signup' ? 8 : 6}
                    maxLength={72}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    autoCapitalize="none"
                    spellCheck={false}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? 'bg-rose-500/15 border-rose-400/30 text-rose-200'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer mt-1 bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
              >
                {loading
                  ? lang === 'bn'
                    ? 'প্রক্রিয়াকরণ চলছে...'
                    : 'Processing...'
                  : mode === 'signup'
                  ? lang === 'bn'
                    ? 'অ্যাকাউন্ট তৈরি করুন'
                    : 'Create Student Account'
                  : lang === 'bn'
                  ? 'পোর্টালে প্রবেশ করুন'
                  : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
