import React, { useState } from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import { Lang, StudentProfile, Theme } from '../types';
import { EDUCATION_BOARDS, TARGET_GOALS, formatNum, getBoardLabel } from '../lib/i18n';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  isAuthenticated: boolean;
  onAuthSuccess: (userId: string, email: string, meta?: Partial<StudentProfile>) => Promise<void>;
  onSignOut: () => Promise<void>;
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
      if (!cleanEmail || password.length < 6) {
        throw new Error(
          lang === 'bn'
            ? 'সঠিক ইমেইল এবং কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড প্রদান করুন।'
            : 'Please enter a valid email and a password of at least 6 characters.'
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

        const { data, error } = await supabase.auth.signUp({
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
        if (data.user) {
          const metadata = {
            fullName: fullName.trim(),
            collegeName: collegeName.trim(),
            board,
            targetGoal,
            avatarColor: '#4f46e5',
          };

          if (data.session) {
            await onAuthSuccess(data.user.id, cleanEmail, metadata);
            setSuccessMsg(
              lang === 'bn'
                ? 'অ্যাকাউন্ট সম্পন্ন হয়েছে এবং ক্লাউড সিঙ্ক শুরু হয়েছে।'
                : 'Account created and cloud sync has started.'
            );
            setTimeout(() => onClose(), 800);
          } else {
            // With email confirmation enabled there is no authenticated
            // session yet. Writing now would fail RLS, so keep the metadata
            // locally and ask the student to confirm before signing in.
            await onUpdateProfileMeta(metadata);
            setPassword('');
            setSuccessMsg(
              lang === 'bn'
                ? 'অ্যাকাউন্ট তৈরি হয়েছে। ইমেইলের কনফার্মেশন লিংকে ক্লিক করে তারপর লগইন করুন। এই ডিভাইসের পড়াশোনার অগ্রগতি সংরক্ষিত আছে।'
                : 'Account created. Open the confirmation link in your email, then sign in. Your study progress remains saved on this device.'
            );
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await onAuthSuccess(data.user.id, cleanEmail, {
            fullName: data.user.user_metadata?.full_name,
            collegeName: data.user.user_metadata?.college_name,
            board: data.user.user_metadata?.board,
            targetGoal: data.user.user_metadata?.target_goal,
            avatarColor: data.user.user_metadata?.avatar_color,
          });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-slate-800 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <button
          onClick={onClose}
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
                  onClick={async () => {
                    await onSignOut();
                    onClose();
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password (min 6 chars) *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 opacity-45" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {errorMsg && (
                <div
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
