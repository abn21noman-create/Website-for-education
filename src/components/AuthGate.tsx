import React, { useEffect, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Eye, EyeOff, GraduationCap, LoaderCircle, ShieldCheck } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { startCloudVault } from '../lib/cloudVault';
import { setSyncUser } from '../lib/sync';
import { finishGuestMigration, selectAccountSpace } from '../lib/accountSpace';
import App from '../App';

type Lang = 'bn' | 'en';
type Mode = 'login' | 'signup' | 'forgot' | 'recovery';

function message(error: unknown, bn: boolean): string {
  const text = error instanceof Error ? error.message : String(error);
  if (!bn) return text;
  if (/invalid login credentials/i.test(text)) return 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।';
  if (/email not confirmed/i.test(text)) return 'প্রথমে ইমেইল যাচাই করুন।';
  if (/already registered/i.test(text)) return 'এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে।';
  if (/rate limit|too many/i.test(text)) return 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।';
  if (/fetch|network/i.test(text)) return 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
  return 'কাজটি সম্পন্ন হয়নি। আবার চেষ্টা করুন। (' + text + ')';
}

export function AuthGate({ clientFactory = getSupabase }: { clientFactory?: () => Promise<SupabaseClient> } = {}) {
  const [lang, setLang] = useState<Lang>(() => {
    try { return JSON.parse(localStorage.getItem('hsc28_lang') || '"bn"') === 'en' ? 'en' : 'bn'; } catch { return 'bn'; }
  });
  const bn = lang === 'bn';
  const [mode, setMode] = useState<Mode>('login');
  const [status, setStatus] = useState<'loading' | 'signed-out' | 'preparing' | 'ready' | 'error'>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const recovery = useRef(false);
  const preparingUser = useRef<string | null>(null);

  async function prepare(next: Session) {
    const run = ++sequence.current;
    preparingUser.current = next.user.id;
    setSession(next); setStatus('preparing'); setError('');
    try {
      startCloudVault(null);
      setSyncUser(null);
      const { guestData } = selectAccountSpace(next.user.id);
      if (guestData) {
        // Save a separate immutable cloud copy before normal reconciliation can
        // choose the cloud version of any conflicting key. Do not expose the app
        // until this succeeds; the original guest copy also stays on the device.
        const client = await clientFactory();
        const { error: saveError } = await client.from('hsc28_kv').upsert({
          user_id: next.user.id,
          key: 'nokkhotro_guest_archive_v1',
          value: JSON.stringify({ version: 1, createdAt: new Date().toISOString(), values: guestData }),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,key' });
        if (saveError) throw saveError;
        finishGuestMigration(next.user.id);
      }
      localStorage.setItem('hsc28_lang', JSON.stringify(lang));
      if (run === sequence.current) setStatus('ready');
    } catch (e) { if (run === sequence.current) { setError(message(e, bn)); setStatus('error'); } }
  }

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void clientFactory().then(async client => {
      if (cancelled) return;
      const { data } = client.auth.onAuthStateChange((event, next) => {
        if (cancelled) return;
        if (event === 'PASSWORD_RECOVERY') { recovery.current = true; setMode('recovery'); setSession(next); setStatus('signed-out'); return; }
        if (event === 'SIGNED_OUT') { preparingUser.current = null; sequence.current++; setSession(null); setStatus('signed-out'); return; }
        if (next && !recovery.current && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          // Supabase may deliver both events for one session.
          if (preparingUser.current !== next.user.id) void prepare(next);
        } else if (!next && event === 'INITIAL_SESSION') setStatus('signed-out');
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }).catch(e => { if (!cancelled) { setError(message(e, bn)); setStatus('error'); } });
    return () => { cancelled = true; unsubscribe?.(); sequence.current++; };
    // Auth subscription lasts for the lifetime of the gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const client = await clientFactory();
      const clean = email.trim().toLowerCase();
      if (mode === 'forgot') {
        const { error } = await client.auth.resetPasswordForEmail(clean, { redirectTo: window.location.origin + window.location.pathname });
        if (error) throw error;
        setNotice(bn ? 'এই ইমেইলে অ্যাকাউন্ট থাকলে পাসওয়ার্ড রিসেটের লিংক পাঠানো হবে।' : 'If an account exists, a reset link will be sent.');
      } else if (mode === 'recovery') {
        const { error } = await client.auth.updateUser({ password }); if (error) throw error;
        recovery.current = false; setPassword(''); setNotice(bn ? 'পাসওয়ার্ড পরিবর্তন হয়েছে।' : 'Password updated.');
        const { data } = await client.auth.getSession(); if (data.session) await prepare(data.session);
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error(bn ? 'আপনার নাম লিখুন।' : 'Enter your name.');
        const { data, error } = await client.auth.signUp({ email: clean, password, options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin + window.location.pathname } });
        if (error) throw error;
        if (!data.session) setNotice(bn ? 'ইমেইলে পাঠানো লিংক দিয়ে অ্যাকাউন্ট যাচাই করে লগইন করুন।' : 'Verify your email using the link, then sign in.');
      } else {
        const { error } = await client.auth.signInWithPassword({ email: clean, password }); if (error) throw error;
      }
    } catch (e) { setError(message(e, bn)); } finally { setBusy(false); }
  }

  if (status === 'ready' && session) return <App key={session.user.id} />;
  if (status === 'loading' || status === 'preparing') return <div className="min-h-dvh grid place-items-center bg-slate-950 text-white" role="status"><div className="text-center"><LoaderCircle className="animate-spin mx-auto mb-4" /><p>{status === 'preparing' ? (bn ? 'আপনার ডেটা নিরাপদে প্রস্তুত হচ্ছে…' : 'Preparing your data safely…') : (bn ? 'নক্ষত্র চালু হচ্ছে…' : 'Starting Nokkhotro…')}</p></div></div>;
  return <main className="min-h-dvh bg-slate-950 text-white flex items-center justify-center p-4 sm:p-8">
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl grid lg:grid-cols-2">
      <section className="p-8 sm:p-12 bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900">
        <div className="flex items-center gap-3 font-extrabold text-xl"><GraduationCap /> নক্ষত্র <span className="text-indigo-200 text-sm">HSC ’28</span></div>
        <h1 className="mt-10 text-3xl sm:text-4xl font-extrabold leading-tight">{bn ? 'তোমার স্বপ্নের পথে, প্রতিদিন।' : 'Your goals, one day at a time.'}</h1>
        <p className="mt-4 text-indigo-100 leading-relaxed">{bn ? 'পড়াশোনা, অনুশীলন ও অগ্রগতি—সব এক নিরাপদ অ্যাকাউন্টে।' : 'Study, practice and track your progress in one account.'}</p>
        <div className="mt-8 flex gap-2 text-sm text-indigo-100"><ShieldCheck className="w-5 h-5 shrink-0" />{bn ? 'তোমার ব্যক্তিগত অগ্রগতি তোমার অ্যাকাউন্টেই থাকবে।' : 'Your personal progress stays in your account.'}</div>
      </section>
      <section className="p-8 sm:p-12">
        <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-bold">{mode === 'recovery' ? (bn ? 'নতুন পাসওয়ার্ড' : 'New password') : (bn ? 'স্বাগতম' : 'Welcome')}</h2><button className="border border-slate-600 rounded-lg px-3 py-1 text-sm" onClick={() => setLang(bn ? 'en' : 'bn')}>{bn ? 'EN' : 'বাংলা'}</button></div>
        {status === 'error' && session ? <div role="alert" className="space-y-4"><p className="text-rose-300">{bn ? 'ডেটা প্রস্তুত করা যায়নি। আপনার আগের ডেটা ডিভাইসে রয়ে গেছে।' : 'Could not prepare your data. Your previous data remains on this device.'} {error}</p><button className="bg-indigo-600 rounded-xl px-4 py-3" onClick={() => void prepare(session)}>{bn ? 'আবার চেষ্টা করুন' : 'Retry'}</button></div> : <>
          {(mode === 'login' || mode === 'signup') && <div className="grid grid-cols-2 rounded-xl bg-slate-800 p-1 mb-6">{(['login','signup'] as const).map(m => <button key={m} onClick={() => { setMode(m); setError(''); setNotice(''); }} className={'rounded-lg py-2 font-semibold text-sm ' + (mode === m ? 'bg-indigo-600' : 'text-slate-300')}>{m === 'login' ? (bn ? 'লগইন' : 'Sign in') : (bn ? 'রেজিস্ট্রেশন' : 'Register')}</button>)}</div>}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && <label className="block text-sm">{bn ? 'পুরো নাম' : 'Full name'}<input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-600 p-3" /></label>}
            {mode !== 'recovery' && <label className="block text-sm">{bn ? 'ইমেইল' : 'Email'}<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-600 p-3" /></label>}
            {mode !== 'forgot' && <label className="block text-sm">{bn ? 'পাসওয়ার্ড' : 'Password'}<span className="mt-2 flex rounded-xl bg-slate-800 border border-slate-600"><input required minLength={6} type={show ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full min-w-0 p-3 outline-none" /><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="px-3">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>}
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 p-3 font-bold">{busy ? (bn ? 'অপেক্ষা করুন…' : 'Please wait…') : mode === 'login' ? (bn ? 'লগইন করুন' : 'Sign in') : mode === 'signup' ? (bn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account') : mode === 'forgot' ? (bn ? 'রিসেট লিংক পাঠান' : 'Send reset link') : (bn ? 'পাসওয়ার্ড বদলান' : 'Update password')}</button>
          </form>
          {mode !== 'recovery' && <button className="mt-5 text-sm text-indigo-300 hover:text-white" onClick={() => { setMode(mode === 'forgot' ? 'login' : 'forgot'); setError(''); setNotice(''); }}>{mode === 'forgot' ? (bn ? 'লগইনে ফিরে যান' : 'Back to sign in') : (bn ? 'পাসওয়ার্ড ভুলে গেছি?' : 'Forgot password?')}</button>}
        </>}
      </section>
    </div>
  </main>;
}
