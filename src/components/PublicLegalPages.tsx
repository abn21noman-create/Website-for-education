import React, { useEffect, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  GraduationCap,
  KeyRound,
  Languages,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import {
  accountDeletionErrorMessage,
  deleteCurrentAccount,
} from '../lib/accountDeletion';
import { getSupabase } from '../lib/supabase';
import {
  ACCOUNT_DELETION_URL,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_URL,
  PUBLIC_SITE_URL,
  type PublicRoute,
} from '../lib/publicUrls';

type LegalLanguage = 'bn' | 'en';

function initialLanguage(): LegalLanguage {
  try {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'bn' || requested === 'en') return requested;
  } catch {
    // The default remains English for Play Console and external reviewers.
  }
  return 'en';
}

function useLegalMetadata(route: PublicRoute, lang: LegalLanguage): void {
  useEffect(() => {
    const bn = lang === 'bn';
    document.documentElement.lang = lang;
    document.title = route === 'privacy'
      ? `${bn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'} — Nokkhotro HSC ’28`
      : `${bn ? 'অ্যাকাউন্ট মুছুন' : 'Delete your account'} — Nokkhotro HSC ’28`;

    const description = route === 'privacy'
      ? (bn
        ? 'নক্ষত্র HSC ’28 কী তথ্য সংগ্রহ করে, কেন ব্যবহার করে এবং কীভাবে মুছবেন—তার প্রকাশ্য গোপনীয়তা নীতি।'
        : 'How Nokkhotro HSC ’28 collects, uses, protects, and deletes account and study data.')
      : (bn
        ? 'নক্ষত্র HSC ’28 অ্যাকাউন্ট ও সংশ্লিষ্ট তথ্য স্থায়ীভাবে মুছুন।'
        : 'Sign in and permanently delete a Nokkhotro HSC ’28 account and its associated data.');
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = route === 'privacy' ? PRIVACY_POLICY_URL : ACCOUNT_DELETION_URL;
  }, [lang, route]);
}

function LegalHeader({
  lang,
  setLang,
  current,
}: {
  lang: LegalLanguage;
  setLang: (lang: LegalLanguage) => void;
  current: PublicRoute;
}) {
  const bn = lang === 'bn';
  return <header className="legal-header">
    <a className="legal-brand" href={PUBLIC_SITE_URL} aria-label={bn ? 'নক্ষত্র হোম' : 'Nokkhotro home'}>
      <span><GraduationCap size={22} /></span>
      <span><strong>নক্ষত্র<span>.</span></strong><small>HSC 2028 · STUDY SPACE</small></span>
    </a>
    <nav aria-label={bn ? 'আইনি ও অ্যাকাউন্ট লিংক' : 'Legal and account links'}>
      <a aria-current={current === 'privacy' ? 'page' : undefined} href={PRIVACY_POLICY_URL}>{bn ? 'গোপনীয়তা' : 'Privacy'}</a>
      <a aria-current={current === 'account-deletion' ? 'page' : undefined} href={ACCOUNT_DELETION_URL}>{bn ? 'অ্যাকাউন্ট মুছুন' : 'Delete account'}</a>
      <button type="button" onClick={() => setLang(bn ? 'en' : 'bn')} aria-label={bn ? 'Switch to English' : 'বাংলায় দেখুন'}>
        <Languages size={15} /> {bn ? 'EN' : 'বাংলা'}
      </button>
    </nav>
  </header>;
}

function LegalFooter({ lang }: { lang: LegalLanguage }) {
  const bn = lang === 'bn';
  return <footer className="legal-footer">
    <p>© 2026 Nokkhotro HSC ’28 · {bn ? 'শিক্ষার্থীদের জন্য যত্নে তৈরি' : 'Built thoughtfully for students'}</p>
    <p>{bn ? 'গোপনীয়তা প্রশ্ন:' : 'Privacy questions:'} <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a></p>
  </footer>;
}

function PrivacyEnglish() {
  return <>
    <section id="scope">
      <h2>1. Scope and who is responsible</h2>
      <p>This policy applies to the Nokkhotro HSC ’28 website, installable web app, and Android app (together, “Nokkhotro”). Nokkhotro is an education and study-planning service maintained by the project owner. Privacy requests can be sent to <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.</p>
    </section>
    <section id="data">
      <h2>2. Information we process</h2>
      <ul>
        <li><strong>Account and profile:</strong> email address, authentication identifiers, name, optional college, education board, study target, account dates, and sign-in status.</li>
        <li><strong>Private learning and life data:</strong> syllabus progress, quiz results, bookmarks, notes, tasks, study sessions, routines, goals, mistakes, focus minutes, habits, attendance, deadlines, exam plans/results, and accessibility preferences.</li>
        <li><strong>Community data:</strong> questions, replies, votes, and the name/college/board shown with a post. XP/profile summaries appear in the community list only after the student opts in.</li>
        <li><strong>Student pulse:</strong> five constrained multiple-choice answers linked to the account for update/deletion. Administrators receive only threshold-protected aggregate totals, never individual pulse rows.</li>
        <li><strong>Service and security data:</strong> hosting and authentication providers may process IP address, browser/app version, request time, and diagnostic or abuse-prevention logs needed to operate and protect the service.</li>
      </ul>
      <div className="legal-callout"><ShieldCheck size={20} /><p><strong>Focus Lock stays local.</strong> Nokkhotro does not read the list of installed apps, the app you opened, screen content, contacts, precise location, camera, or microphone. Android focus state and the live countdown remain on the device. There are no ads or third-party advertising trackers.</p></div>
    </section>
    <section id="use">
      <h2>3. Why we use information</h2>
      <p>We use information to create and secure accounts; sync and restore study data; calculate progress; provide requested community features; answer support or security reports; prevent abuse; and maintain the service. We do not sell personal information. We do not use private study content for advertising.</p>
    </section>
    <section id="storage">
      <h2>4. Local storage and cloud storage</h2>
      <p>The browser or Android WebView keeps account-scoped copies and an offline write queue so work can continue during a connection problem. Signed-in data is synced over encrypted HTTPS to Supabase. The website is delivered through Vercel. Nokkhotro does not use advertising cookies; essential authentication and preference data is stored locally.</p>
    </section>
    <section id="sharing">
      <h2>5. Sharing and visibility</h2>
      <p>Supabase processes authentication and database data, and Vercel delivers the website and related request logs. They act as infrastructure providers. Data may be processed in countries where these providers operate, including the configured Supabase Asia-Pacific region.</p>
      <p>Private study records are owner-only. Authorized administrators can see a limited account directory (such as email, profile name, account status, last sign-in, XP, and study-minute summary) but not passwords, access tokens, personal notes, routines, or private study documents. Community posts and replies are visible to signed-in students. A student’s XP profile is shared only after explicit opt-in.</p>
    </section>
    <section id="retention">
      <h2>6. Retention and deletion</h2>
      <p>Live account and study data is kept while the account is active. A completed full-account deletion removes the Supabase Auth user, profile, private study/life data, student-pulse row, leaderboard participation, administrator membership/allowlist entry (if applicable), authored questions and replies, and votes from the live service. A thread started by the deleted user is removed, so replies inside that thread may also disappear.</p>
      <p>Limited residual copies may remain temporarily in encrypted provider backups or security logs for the provider’s rolling operational retention period, or longer where required to investigate abuse or comply with law. These copies are not available through the app and are overwritten or deleted under provider schedules. Files a user exported, copied to Dropbox, or left on another offline device are controlled by that user and cannot be remotely erased by Nokkhotro.</p>
    </section>
    <section id="choices">
      <h2>7. Your controls</h2>
      <ul>
        <li>Edit profile information and optional leaderboard consent inside the app.</li>
        <li>Use <strong>Reset study data</strong> to erase private study records while keeping the account and community contributions.</li>
        <li>Use <a href={ACCOUNT_DELETION_URL}><strong>Delete account and all data</strong></a> in the app or on the public deletion page to delete the Auth account and associated live data.</li>
        <li>Export a portable study backup before deletion if desired. Exported copies are then the user’s responsibility.</li>
      </ul>
    </section>
    <section id="security">
      <h2>8. Security</h2>
      <p>Nokkhotro uses encrypted transport, Supabase Row Level Security, account-scoped local spaces, server-authoritative administrator roles, restrictive web security headers, and a server-side deletion function. No service-role secret is included in the website or Android bundle. No system is perfectly secure, so suspected privacy or security issues should be reported privately by email.</p>
    </section>
    <section id="young-users">
      <h2>9. Teen and young users</h2>
      <p>Nokkhotro is designed for HSC learners, including teenagers. It is not intended for children under 13. A parent or guardian may contact us if they believe a younger child supplied personal information; after reasonable verification, we will delete it. Teen users should involve a guardian where local law requires consent.</p>
    </section>
    <section id="changes">
      <h2>10. Changes and contact</h2>
      <p>Material changes will be dated on this page. Questions, access/deletion problems, or guardian requests can be sent to <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>. Please do not send passwords, access tokens, or a full study-data export by email.</p>
    </section>
  </>;
}

function PrivacyBangla() {
  return <>
    <section><h2>১. নীতির আওতা ও দায়িত্ব</h2><p>এই নীতি নক্ষত্র HSC ’28 ওয়েবসাইট, ইনস্টলযোগ্য ওয়েব অ্যাপ এবং Android অ্যাপের জন্য প্রযোজ্য। গোপনীয়তা-সংক্রান্ত অনুরোধ <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>-এ পাঠানো যায়।</p></section>
    <section><h2>২. আমরা যে তথ্য প্রক্রিয়া করি</h2><ul>
      <li><strong>অ্যাকাউন্ট ও প্রোফাইল:</strong> ইমেইল, authentication ID, নাম, ঐচ্ছিক কলেজ, বোর্ড, পড়াশোনার লক্ষ্য, account date ও sign-in status।</li>
      <li><strong>ব্যক্তিগত পড়াশোনা ও জীবন-তথ্য:</strong> syllabus progress, quiz result, bookmark, note, task, study session, routine, goal, mistake, focus minute, habit, attendance, deadline, exam plan/result ও accessibility preference।</li>
      <li><strong>কমিউনিটি:</strong> প্রশ্ন, উত্তর, ভোট এবং post-এর সাথে দেখানো নাম/কলেজ/বোর্ড। শিক্ষার্থী নিজে opt-in করলেই XP summary কমিউনিটি তালিকায় আসে।</li>
      <li><strong>Student pulse:</strong> account-এর সাথে update/delete করার জন্য যুক্ত পাঁচটি নির্ধারিত উত্তর; Admin কেবল privacy-threshold পূরণ করা মোট হিসাব দেখে, ব্যক্তিগত row নয়।</li>
      <li><strong>সেবা ও নিরাপত্তা:</strong> hosting/auth provider সেবা চালু ও নিরাপদ রাখতে IP address, browser/app version, request time এবং সীমিত diagnostic/abuse-prevention log প্রক্রিয়া করতে পারে।</li>
    </ul><div className="legal-callout"><ShieldCheck size={20}/><p><strong>Focus Lock ডিভাইসেই থাকে।</strong> নক্ষত্র installed app-এর তালিকা, অন্য কোন app খোলা হয়েছে, screen content, contact, precise location, camera বা microphone পড়ে না। বিজ্ঞাপন বা third-party advertising tracker নেই।</p></div></section>
    <section><h2>৩. তথ্য ব্যবহারের কারণ</h2><p>অ্যাকাউন্ট তৈরি ও সুরক্ষিত রাখা, পড়াশোনার ডেটা sync/restore, progress হিসাব, অনুরোধ করা community feature, support/security response এবং abuse ঠেকাতে তথ্য ব্যবহার করা হয়। ব্যক্তিগত তথ্য বিক্রি করা হয় না এবং private study content বিজ্ঞাপনে ব্যবহার করা হয় না।</p></section>
    <section><h2>৪. লোকাল ও ক্লাউড সংরক্ষণ</h2><p>অফলাইনে কাজ চালাতে browser বা Android WebView-তে account-scoped copy ও write queue থাকে। Signed-in data encrypted HTTPS-এ Supabase-এ sync হয়; Vercel ওয়েবসাইট সরবরাহ করে। Advertising cookie ব্যবহার করা হয় না; authentication ও preference-এর প্রয়োজনীয় তথ্য লোকালি থাকে।</p></section>
    <section><h2>৫. শেয়ার ও দৃশ্যমানতা</h2><p>Supabase authentication/database এবং Vercel website/request delivery-এর infrastructure provider। Provider যেখানে কাজ করে সেখানে—configured Supabase Asia-Pacific region-সহ—তথ্য প্রক্রিয়া হতে পারে। Private study record শুধু মালিকের। সীমিত Admin directory-তে email, profile name, account status, last sign-in, XP ও study-minute summary থাকতে পারে; password, token, note, routine বা private document নয়। Community post/reply signed-in শিক্ষার্থীরা দেখে। XP profile explicit opt-in ছাড়া শেয়ার হয় না।</p></section>
    <section><h2>৬. কতদিন রাখা হয় ও কীভাবে মোছে</h2><p>অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত live account/study data রাখা হয়। Full deletion সম্পন্ন হলে Supabase Auth user, profile, private study/life data, student-pulse row, leaderboard participation, প্রযোজ্য admin membership/allowlist, নিজের প্রশ্ন/উত্তর ও ভোট live service থেকে মোছে। নিজের শুরু করা thread মোছায় ওই thread-এর অন্য উত্তরও চলে যেতে পারে।</p><p>Provider-এর rolling operational retention অনুযায়ী encrypted backup বা security log-এ সীমিত residual copy সাময়িক থাকতে পারে, অথবা আইন/abuse investigation-এর প্রয়োজনে বেশি সময়। এগুলো app থেকে পাওয়া যায় না এবং provider schedule-এ overwrite/delete হয়। User-এর export, Dropbox copy বা অন্য offline device-এর copy নক্ষত্র দূর থেকে মুছতে পারে না।</p></section>
    <section><h2>৭. আপনার নিয়ন্ত্রণ</h2><ul><li>App থেকে profile ও leaderboard consent বদলান।</li><li><strong>Study data reset</strong> account/community contribution রেখে private study record মোছে।</li><li>App অথবা <a href={ACCOUNT_DELETION_URL}>public deletion page</a>-এর <strong>Delete account and all data</strong> Auth account ও সংশ্লিষ্ট live data মোছে।</li><li>চাইলে আগে portable backup export করুন; export-এর পরে copy-টির দায়িত্ব user-এর।</li></ul></section>
    <section><h2>৮. নিরাপত্তা</h2><p>Encrypted transport, Supabase RLS, account-scoped local space, server-authoritative Admin role, restrictive security header ও server-side deletion function ব্যবহার করা হয়। Website বা Android bundle-এ service-role secret থাকে না।</p></section>
    <section><h2>৯. কিশোর ও অল্পবয়সী ব্যবহারকারী</h2><p>নক্ষত্র HSC শিক্ষার্থী—কিশোর-কিশোরীসহ—ব্যবহারের জন্য। ১৩ বছরের কম শিশুর জন্য নয়। কমবয়সী শিশু তথ্য দিয়েছে মনে হলে guardian যোগাযোগ করতে পারেন; যথাযথ যাচাইয়ের পরে তা মোছা হবে। স্থানীয় আইনে প্রয়োজন হলে কিশোর ব্যবহারকারী guardian-এর সহায়তা নেবে।</p></section>
    <section><h2>১০. পরিবর্তন ও যোগাযোগ</h2><p>গুরুত্বপূর্ণ পরিবর্তনের তারিখ এই পাতায় থাকবে। প্রশ্ন, deletion সমস্যা বা guardian request <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>-এ পাঠান। ইমেইলে password, access token বা পূর্ণ data export পাঠাবেন না।</p></section>
  </>;
}

export function PrivacyPolicyPage() {
  const [lang, setLang] = useState<LegalLanguage>(initialLanguage);
  const bn = lang === 'bn';
  useLegalMetadata('privacy', lang);

  return <div className="legal-page">
    <a className="skip-link" href="#legal-content">{bn ? 'মূল নীতিতে যান' : 'Skip to policy'}</a>
    <LegalHeader lang={lang} setLang={setLang} current="privacy" />
    <main id="legal-content" className="legal-main">
      <div className="legal-hero">
        <div className="legal-kicker"><LockKeyhole size={16} /> {bn ? 'প্রকাশ্য গোপনীয়তা নীতি' : 'PUBLIC PRIVACY POLICY'}</div>
        <h1>{bn ? 'আপনার পড়াশোনা, আপনার তথ্য।' : 'Your study space. Your data.'}</h1>
        <p>{bn ? 'কোন তথ্য কেন নেওয়া হয়, কার সাথে শেয়ার হয় এবং কীভাবে সম্পূর্ণ মুছবেন—এখানে স্পষ্টভাবে বলা আছে।' : 'A clear explanation of what Nokkhotro processes, why it is needed, who can see it, and how to delete it.'}</p>
        <div className="legal-date"><span>{bn ? 'কার্যকর' : 'Effective'}: 7 November 2026</span><span>{bn ? 'সর্বশেষ হালনাগাদ' : 'Last updated'}: 7 November 2026</span></div>
      </div>
      <div className="legal-layout">
        <aside className="legal-summary" aria-label={bn ? 'নীতির সারাংশ' : 'Policy summary'}>
          <strong>{bn ? 'এক নজরে' : 'At a glance'}</strong>
          <ul>
            <li><CheckCircle2 size={15}/>{bn ? 'কোনো বিজ্ঞাপন বা তথ্য বিক্রি নেই' : 'No ads or sale of personal data'}</li>
            <li><CheckCircle2 size={15}/>{bn ? 'Private study data owner-only' : 'Private study data is owner-only'}</li>
            <li><CheckCircle2 size={15}/>{bn ? 'XP sharing শুধু opt-in' : 'Community XP is opt-in'}</li>
            <li><CheckCircle2 size={15}/>{bn ? 'App ও web থেকে account deletion' : 'Deletion is available in app and on the web'}</li>
          </ul>
          <a className="legal-danger-link" href={ACCOUNT_DELETION_URL}><Trash2 size={15}/>{bn ? 'অ্যাকাউন্ট মুছুন' : 'Delete an account'}</a>
        </aside>
        <article className="legal-policy">{bn ? <PrivacyBangla /> : <PrivacyEnglish />}</article>
      </div>
    </main>
    <LegalFooter lang={lang}/>
  </div>;
}

type AccountDeletionPageProps = {
  clientFactory?: () => Promise<SupabaseClient>;
};

export function AccountDeletionPage({ clientFactory = getSupabase }: AccountDeletionPageProps) {
  const [lang, setLang] = useState<LegalLanguage>(initialLanguage);
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('deleted') === '1'; } catch { return false; }
  });
  const [email, setEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phrase, setPhrase] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState('');
  const clientRef = useRef<SupabaseClient | null>(null);
  const deletedRef = useRef(deleted);
  deletedRef.current = deleted;
  const bn = lang === 'bn';
  useLegalMetadata('account-deletion', lang);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void clientFactory().then(async (client) => {
      if (cancelled) return;
      clientRef.current = client;
      const { data } = await client.auth.getSession();
      if (!cancelled && !deletedRef.current) setSession(data.session);
      const listener = client.auth.onAuthStateChange((_event, next) => {
        if (!cancelled && !deletedRef.current) setSession(next);
      });
      unsubscribe = () => listener.data.subscription.unsubscribe();
    }).catch(() => {
      if (!cancelled) setError(bn ? 'Authentication service-এ পৌঁছানো যায়নি।' : 'The authentication service could not be reached.');
    }).finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; unsubscribe?.(); };
  }, [clientFactory, bn]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const client = clientRef.current || await clientFactory();
      clientRef.current = client;
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: loginPassword,
      });
      if (signInError || !data.session) throw signInError || new Error('Sign in failed');
      setSession(data.session);
      setLoginPassword('');
    } catch (signInError) {
      const text = signInError instanceof Error ? signInError.message : '';
      setError(/fetch|network|offline/i.test(text)
        ? (bn ? 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।' : 'Check your connection and try again.')
        : (bn ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'The email or password is incorrect.'));
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true); setError('');
    try {
      const client = clientRef.current || await clientFactory();
      await client.auth.signOut({ scope: 'local' });
      setSession(null);
    } catch {
      setError(bn ? 'লগআউট সম্পন্ন হয়নি। পাতাটি রিফ্রেশ করুন।' : 'Sign-out did not complete. Refresh the page.');
    } finally { setBusy(false); }
  }

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    if (phrase !== 'DELETE' || !understood || !confirmPassword) return;
    setBusy(true); setError('');
    try {
      const client = clientRef.current || await clientFactory();
      await deleteCurrentAccount(confirmPassword, async () => client);
      deletedRef.current = true;
      setDeleted(true);
      setSession(null);
      setConfirmPassword('');
      setPhrase('');
      setUnderstood(false);
    } catch (deletionError) {
      setError(accountDeletionErrorMessage(deletionError, lang));
    } finally { setBusy(false); }
  }

  return <div className="legal-page deletion-page">
    <a className="skip-link" href="#deletion-content">{bn ? 'অ্যাকাউন্ট deletion-এ যান' : 'Skip to account deletion'}</a>
    <LegalHeader lang={lang} setLang={setLang} current="account-deletion" />
    <main id="deletion-content" className="deletion-main">
      <a className="legal-back" href={PUBLIC_SITE_URL}><ArrowLeft size={15}/>{bn ? 'নক্ষত্রে ফিরে যান' : 'Back to Nokkhotro'}</a>
      <div className="deletion-heading">
        <span><Trash2 size={23}/></span>
        <div><p>{bn ? 'GOOGLE PLAY ACCOUNT DELETION' : 'GOOGLE PLAY ACCOUNT DELETION'}</p><h1>{bn ? 'অ্যাকাউন্ট ও সংশ্লিষ্ট ডেটা মুছুন' : 'Delete your account and associated data'}</h1></div>
      </div>

      {deleted ? <section className="deletion-card deletion-success" role="status">
        <CheckCircle2 size={36}/>
        <h2>{bn ? 'অ্যাকাউন্ট মুছে গেছে' : 'Your account has been deleted'}</h2>
        <p>{bn ? 'Live Auth account ও সংশ্লিষ্ট server data মুছে গেছে, এবং এই browser-এর account copy/session পরিষ্কার করা হয়েছে। নিজের export, Dropbox copy বা অন্য offline device-এর copy আলাদাভাবে মুছুন।' : 'The live Auth account and associated server data were deleted, and this browser’s account copy/session was cleared. Delete any exported file, Dropbox copy, or copy on another offline device separately.'}</p>
        <a href={PUBLIC_SITE_URL}>{bn ? 'নক্ষত্র হোম' : 'Return home'}</a>
      </section> : <div className="deletion-grid">
        <section className="deletion-card deletion-explainer">
          <h2>{bn ? 'কী মুছে যাবে' : 'What will be deleted'}</h2>
          <ul>
            <li><Database size={17}/><span><strong>{bn ? 'Auth ও profile' : 'Auth and profile'}</strong>{bn ? 'ইমেইল, profile এবং sign-in session' : 'Email, profile, and sign-in sessions'}</span></li>
            <li><Database size={17}/><span><strong>{bn ? 'Private study/life data' : 'Private study and life data'}</strong>{bn ? 'Progress, note, result, task, routine, habit ও backup vault' : 'Progress, notes, results, tasks, routines, habits, and cloud vault'}</span></li>
            <li><Database size={17}/><span><strong>{bn ? 'Community ও choices' : 'Community and choices'}</strong>{bn ? 'নিজের question/reply, vote, XP opt-in ও student pulse row' : 'Authored questions/replies, votes, XP opt-in, and student-pulse row'}</span></li>
          </ul>
          <div className="deletion-warning"><TriangleAlert size={19}/><p>{bn ? 'এটি Study data reset নয়। Full deletion স্থায়ী; একই ইমেইল দিয়ে পরে নতুন account করলেও পুরোনো data ফেরত আসবে না। নিজের শুরু করা thread মোছায় তার reply-ও চলে যেতে পারে।' : 'This is not a study-data reset. Full deletion is permanent; creating a new account later will not restore old data. Deleting a thread you started may also remove replies inside it.'}</p></div>
          <p className="deletion-retention">{bn ? 'Live data সঙ্গে সঙ্গে মোছে। সীমিত encrypted backup/security log provider-এর rolling retention বা আইন/abuse investigation অনুযায়ী সাময়িক থাকতে পারে; app থেকে তা পাওয়া যায় না।' : 'Live data is removed immediately. Limited encrypted backup/security-log copies may remain temporarily under provider rolling retention or legal/abuse-investigation duties; they are not available through the app.'}</p>
          <a href={PRIVACY_POLICY_URL}>{bn ? 'সম্পূর্ণ গোপনীয়তা নীতি পড়ুন' : 'Read the complete Privacy Policy'}</a>
        </section>

        <section className="deletion-card deletion-action">
          {checking ? <div className="deletion-loading" role="status"><LoaderCircle className="animate-spin"/><span>{bn ? 'Session পরীক্ষা হচ্ছে…' : 'Checking your session…'}</span></div> : session ? <>
            <div className="deletion-account"><span><KeyRound size={18}/></span><div><small>{bn ? 'যে account মুছবেন' : 'Account to delete'}</small><strong>{session.user.email || (bn ? 'Signed-in account' : 'Signed-in account')}</strong></div></div>
            <button type="button" className="deletion-switch" disabled={busy} onClick={() => void signOut()}>{bn ? 'অন্য account ব্যবহার করুন' : 'Use a different account'}</button>
            <form onSubmit={deleteAccount} className="deletion-form" aria-busy={busy}>
              <label>{bn ? 'নিরাপত্তার জন্য বর্তমান পাসওয়ার্ড' : 'Current password for security'}
                <input required type="password" minLength={6} maxLength={72} autoComplete="current-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </label>
              <label>{bn ? 'নিশ্চিত করতে DELETE লিখুন' : 'Type DELETE to confirm'}
                <input required type="text" autoComplete="off" spellCheck={false} value={phrase} onChange={(event) => setPhrase(event.target.value)} placeholder="DELETE" />
              </label>
              <label className="deletion-check"><input type="checkbox" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} /><span>{bn ? 'আমি বুঝেছি—account, private data এবং নিজের community content স্থায়ীভাবে মুছে যাবে।' : 'I understand that the account, private data, and my community content will be permanently deleted.'}</span></label>
              {error && <p className="deletion-error" role="alert">{error}</p>}
              <button className="deletion-submit" type="submit" disabled={busy || !understood || phrase !== 'DELETE' || !confirmPassword}>
                {busy ? <><LoaderCircle className="animate-spin" size={17}/>{bn ? 'মুছছে…' : 'Deleting…'}</> : <><Trash2 size={17}/>{bn ? 'স্থায়ীভাবে account মুছুন' : 'Permanently delete account'}</>}
              </button>
            </form>
          </> : <>
            <div className="deletion-signin-title"><LockKeyhole size={22}/><div><h2>{bn ? 'প্রথমে account যাচাই করুন' : 'Verify the account first'}</h2><p>{bn ? 'শুধু account-এর মালিক deletion শুরু করতে পারেন।' : 'Only the account owner can initiate deletion.'}</p></div></div>
            <form onSubmit={signIn} className="deletion-form" aria-busy={busy}>
              <label>{bn ? 'ইমেইল ঠিকানা' : 'Email address'}<input required type="email" inputMode="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              <label>{bn ? 'পাসওয়ার্ড' : 'Password'}<input required type="password" minLength={6} maxLength={72} autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} /></label>
              {error && <p className="deletion-error" role="alert">{error}</p>}
              <button className="deletion-signin" type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={17}/> : <LockKeyhole size={17}/>} {bn ? 'যাচাই করে এগিয়ে যান' : 'Verify and continue'}</button>
            </form>
          </>}
        </section>
      </div>}
    </main>
    <LegalFooter lang={lang}/>
  </div>;
}

export function PublicLegalPage({ route }: { route: PublicRoute }) {
  return route === 'privacy' ? <PrivacyPolicyPage/> : <AccountDeletionPage/>;
}
