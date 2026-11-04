import React, { useEffect, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Eye, EyeOff, GraduationCap, LoaderCircle, ShieldCheck } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { startCloudVault } from '../lib/cloudVault';
import { setSyncUser, withUserSyncWriteLock } from '../lib/sync';
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
        const { error: saveError } = await withUserSyncWriteLock(next.user.id, async () =>
          await client.from('hsc28_kv').upsert({
            user_id: next.user.id,
            key: 'nokkhotro_guest_archive_v1',
            value: JSON.stringify({ version: 1, createdAt: new Date().toISOString(), values: guestData }),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,key' })
        );
        if (saveError) throw saveError;
        finishGuestMigration(next.user.id);
      }
      // Start reconciliation before App mounts. Cloud Vault pauses table writes
      // until it has checked for a server reset marker, while login stays usable
      // if the network is slow or unavailable.
      startCloudVault(next.user.id);
      if (run === sequence.current) {
        localStorage.setItem('hsc28_lang', JSON.stringify(lang));
        setStatus('ready');
      }
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
        if (event === 'SIGNED_OUT') { preparingUser.current = null; sequence.current++; startCloudVault(null); setSyncUser(null); setSession(null); setStatus('signed-out'); return; }
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
  return <main className="auth-page">
    <div className="auth-shell">
      <section className="auth-story">
        <div className="auth-story-image" aria-hidden="true" />
        <div className="auth-brand"><span><GraduationCap size={22} /></span><div><strong>নক্ষত্র<span>.</span></strong><small>HSC 2028 · STUDY SPACE</small></div></div>
        <div className="auth-story-copy"><div className="auth-story-kicker">✦ &nbsp; HSC 2028 · SCIENCE</div><h1>{bn ? <>স্বপ্নটা তোমার,<br /><em>পথচলায় আমরা।</em></> : <>Your dreams.<br /><em>Our journey together.</em></>}</h1><p>{bn ? 'পড়াশোনা থেকে ভর্তি প্রস্তুতি—তোমার সব স্বপ্নের জন্য একটি সুন্দর, গোছানো জায়গা।' : 'From everyday study to admission prep, a thoughtful space for everything you dream of.'}</p></div>
        <div className="auth-story-footer"><ShieldCheck size={17} /><span>{bn ? 'তোমার প্রস্তুতি, তোমার নিজস্ব জায়গা' : 'Your preparation, your personal space'}</span><span className="auth-story-stars">✦ &nbsp; ✧ &nbsp; ✦</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><span>{bn ? 'তোমার স্টাডি স্পেসে স্বাগতম' : 'WELCOME TO YOUR STUDY SPACE'}</span><button type="button" className="auth-language" aria-label={bn ? 'Switch to English' : 'বাংলা ভাষা নির্বাচন'} onClick={() => setLang(bn ? 'en' : 'bn')}>{bn ? 'EN' : 'বাংলা'}</button></div>
        <div className="auth-panel-heading"><span className="auth-panel-sparkle">✦</span><h2>{mode === 'recovery' ? (bn ? 'নতুন পাসওয়ার্ড' : 'Set a new password') : mode === 'signup' ? (bn ? 'যাত্রা শুরু করো' : 'Start your journey') : mode === 'forgot' ? (bn ? 'পাসওয়ার্ড রিসেট' : 'Reset your password') : (bn ? 'আবারও স্বাগতম!' : 'Welcome back!')}</h2><p>{bn ? 'তোমার লক্ষ্য পূরণের যাত্রাটা এখান থেকেই শুরু।' : 'Your journey toward your goals starts here.'}</p></div>
        {status === 'error' && session ? <div role="alert" className="auth-message error"><p>{bn ? 'ডেটা প্রস্তুত করা যায়নি। তোমার আগের ডেটা ডিভাইসে রয়ে গেছে।' : 'Could not prepare your data. Your previous data remains on this device.'} {error}</p><button type="button" onClick={() => void prepare(session)}>{bn ? 'আবার চেষ্টা করুন' : 'Retry'}</button></div> : <>
          {(mode === 'login' || mode === 'signup') && <div className="auth-tabs" role="group" aria-label={bn ? 'অ্যাকাউন্ট অপশন' : 'Account options'}>{(['login', 'signup'] as const).map(m => <button type="button" aria-pressed={mode === m} key={m} onClick={() => { setMode(m); setError(''); setNotice(''); }} className={mode === m ? 'active' : ''}>{m === 'login' ? (bn ? 'লগইন' : 'Sign in') : (bn ? 'রেজিস্ট্রেশন' : 'Register')}</button>)}</div>}
          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && <label>{bn ? 'তোমার পুরো নাম' : 'Full name'}<input required autoComplete="name" placeholder={bn ? 'নাম লিখুন' : 'Enter your name'} value={name} onChange={e => setName(e.target.value)} /></label>}
            {mode !== 'recovery' && <label>{bn ? 'ইমেইল ঠিকানা' : 'Email address'}<input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>}
            {mode !== 'forgot' && <label>{bn ? 'পাসওয়ার্ড' : 'Password'}<span className="auth-password"><input required minLength={6} type={show ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={bn ? 'পাসওয়ার্ড লিখুন' : 'Enter your password'} value={password} onChange={e => setPassword(e.target.value)} /><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>}
            {mode === 'login' && <button type="button" className="auth-forgot" onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}>{bn ? 'পাসওয়ার্ড ভুলে গেছ?' : 'Forgot password?'}</button>}
            {error && <p role="alert" className="auth-message error">{error}</p>}{notice && <p role="status" className="auth-message success">{notice}</p>}
            <button disabled={busy} className="auth-submit">{busy ? (bn ? 'অপেক্ষা করুন…' : 'Please wait…') : mode === 'login' ? (bn ? 'লগইন করুন' : 'Sign in') : mode === 'signup' ? (bn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account') : mode === 'forgot' ? (bn ? 'রিসেট লিংক পাঠান' : 'Send reset link') : (bn ? 'পাসওয়ার্ড বদলান' : 'Update password')} <span>→</span></button>
          </form>
          {mode === 'forgot' && <button className="auth-back" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>← {bn ? 'লগইনে ফিরে যান' : 'Back to sign in'}</button>}
        </>}
        <div className="auth-panel-footer"><ShieldCheck size={16} /><span>{bn ? 'তোমার তথ্য সুরক্ষিত রাখতে আমরা যত্নশীল' : 'Thoughtfully designed for your learning'}</span></div>
      </section>
    </div>
    <p className="auth-copyright">© নক্ষত্র HSC ’28 &nbsp; · &nbsp; Made for your journey ✦</p>
  </main>;
}
