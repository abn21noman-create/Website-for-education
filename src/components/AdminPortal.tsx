import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';

type AdminLang = 'bn' | 'en';

interface AdminPortalProps {
  session: Session;
  lang: AdminLang;
  onLanguageChange: (lang: AdminLang) => void;
  onOpenStudentApp: () => void;
  onSignOut: () => Promise<void>;
  clientFactory?: () => Promise<SupabaseClient>;
}

interface AdminOverview {
  totalUsers: number;
  confirmedUsers: number;
  newLast7Days: number;
  activeLast7Days: number;
  adminUsers: number;
  totalStudyMinutes: number;
  totalXp: number;
  openDoubts: number;
  totalReplies: number;
}

interface AdminUserRow {
  user_id: string;
  email: string;
  full_name: string;
  board: string;
  target_goal: string;
  xp: number;
  study_minutes: number;
  joined_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  is_admin: boolean;
  total_count: number;
}

const EMPTY_OVERVIEW: AdminOverview = {
  totalUsers: 0,
  confirmedUsers: 0,
  newLast7Days: 0,
  activeLast7Days: 0,
  adminUsers: 0,
  totalStudyMinutes: 0,
  totalXp: 0,
  openDoubts: 0,
  totalReplies: 0,
};

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeOverview(value: unknown): AdminOverview {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    totalUsers: numberValue(row.totalUsers),
    confirmedUsers: numberValue(row.confirmedUsers),
    newLast7Days: numberValue(row.newLast7Days),
    activeLast7Days: numberValue(row.activeLast7Days),
    adminUsers: numberValue(row.adminUsers),
    totalStudyMinutes: numberValue(row.totalStudyMinutes),
    totalXp: numberValue(row.totalXp),
    openDoubts: numberValue(row.openDoubts),
    totalReplies: numberValue(row.totalReplies),
  };
}

function formatDate(value: string | null, lang: AdminLang): string {
  if (!value) return lang === 'bn' ? 'এখনো নয়' : 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function AdminPortal({
  session,
  lang,
  onLanguageChange,
  onOpenStudentApp,
  onSignOut,
  clientFactory = getSupabase,
}: AdminPortalProps) {
  const bn = lang === 'bn';
  const [overview, setOverview] = useState<AdminOverview>(EMPTY_OVERVIEW);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (search = '', quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const client = await clientFactory();
      const [overviewResult, usersResult] = await Promise.all([
        client.rpc('hsc28_admin_overview'),
        client.rpc('hsc28_admin_list_users', {
          p_search: search.trim(),
          p_limit: 100,
          p_offset: 0,
        }),
      ]);
      if (overviewResult.error) throw overviewResult.error;
      if (usersResult.error) throw usersResult.error;
      setOverview(normalizeOverview(overviewResult.data));
      setUsers(Array.isArray(usersResult.data) ? usersResult.data as AdminUserRow[] : []);
      setLastUpdated(new Date());
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : String(cause);
      setError(bn
        ? `অ্যাডমিন ডেটা লোড করা যায়নি। ${detail}`
        : `Admin data could not be loaded. ${detail}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bn, clientFactory]);

  useEffect(() => {
    void load('');
  }, [load]);

  const shownCount = users.length;
  const matchedCount = users[0] ? numberValue(users[0].total_count) : 0;
  const studyHours = Math.round((overview.totalStudyMinutes / 60) * 10) / 10;
  const fmt = useMemo(
    () => new Intl.NumberFormat(bn ? 'bn-BD' : 'en-US'),
    [bn]
  );

  const cards = [
    {
      label: bn ? 'মোট অ্যাকাউন্ট' : 'Total accounts',
      value: fmt.format(overview.totalUsers),
      note: bn ? `${fmt.format(overview.confirmedUsers)}টি যাচাইকৃত` : `${fmt.format(overview.confirmedUsers)} verified`,
      icon: Users,
      tone: 'violet',
    },
    {
      label: bn ? 'গত ৭ দিনে সক্রিয়' : 'Active in 7 days',
      value: fmt.format(overview.activeLast7Days),
      note: bn ? `${fmt.format(overview.newLast7Days)}টি নতুন অ্যাকাউন্ট` : `${fmt.format(overview.newLast7Days)} new accounts`,
      icon: Activity,
      tone: 'mint',
    },
    {
      label: bn ? 'মোট পড়াশোনা' : 'Total study time',
      value: `${fmt.format(studyHours)}${bn ? ' ঘণ্টা' : ' hrs'}`,
      note: bn ? `${fmt.format(overview.totalXp)} মোট XP` : `${fmt.format(overview.totalXp)} total XP`,
      icon: Clock3,
      tone: 'blue',
    },
    {
      label: bn ? 'খোলা প্রশ্ন' : 'Open questions',
      value: fmt.format(overview.openDoubts),
      note: bn ? `${fmt.format(overview.totalReplies)}টি উত্তর` : `${fmt.format(overview.totalReplies)} replies`,
      icon: MessageCircleQuestion,
      tone: 'amber',
    },
  ] as const;

  async function signOut() {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    void load(query, true);
  }

  return (
    <div className="admin-portal" data-admin-portal="true">
      {mobileNav && <button className="admin-nav-scrim" aria-label={bn ? 'মেনু বন্ধ করুন' : 'Close menu'} onClick={() => setMobileNav(false)} />}
      <aside className={`admin-sidebar ${mobileNav ? 'is-open' : ''}`}>
        <div className="admin-sidebar-head">
          <div className="admin-logo"><GraduationCap size={21} /></div>
          <div><strong>নক্ষত্র<span>.</span></strong><small>ADMIN CONSOLE</small></div>
          <button className="admin-mobile-close" onClick={() => setMobileNav(false)} aria-label={bn ? 'মেনু বন্ধ করুন' : 'Close menu'}><X size={19} /></button>
        </div>

        <div className="admin-sidebar-label">{bn ? 'ওয়ার্কস্পেস' : 'WORKSPACE'}</div>
        <nav aria-label={bn ? 'অ্যাডমিন নেভিগেশন' : 'Admin navigation'}>
          <button className="is-active"><LayoutDashboard size={18} /><span>{bn ? 'ওভারভিউ' : 'Overview'}</span></button>
          <a href="#admin-users" onClick={() => setMobileNav(false)}><Users size={18} /><span>{bn ? 'ব্যবহারকারী' : 'Users'}</span><small>{fmt.format(overview.totalUsers)}</small></a>
        </nav>

        <div className="admin-sidebar-label">{bn ? 'অ্যাপ' : 'APPLICATION'}</div>
        <nav>
          <button onClick={onOpenStudentApp}><BookOpenCheck size={18} /><span>{bn ? 'স্টুডেন্ট অ্যাপ' : 'Student app'}</span><ArrowUpRight size={14} /></button>
        </nav>

        <div className="admin-security-card">
          <span><ShieldCheck size={18} /></span>
          <div><strong>{bn ? 'সুরক্ষিত সেশন' : 'Secure session'}</strong><small>{bn ? 'অ্যাক্সেস সার্ভার থেকে যাচাই করা' : 'Access verified by the server'}</small></div>
        </div>

        <div className="admin-sidebar-user">
          <span>{(session.user.email || 'A').charAt(0).toUpperCase()}</span>
          <div><strong>{bn ? 'অ্যাডমিন' : 'Administrator'}</strong><small>{session.user.email}</small></div>
          <button onClick={() => void signOut()} disabled={signingOut} title={bn ? 'লগআউট' : 'Sign out'} aria-label={bn ? 'লগআউট' : 'Sign out'}><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setMobileNav(true)} aria-label={bn ? 'মেনু খুলুন' : 'Open menu'}><Menu size={20} /></button>
          <div className="admin-topbar-title"><small>{bn ? 'অ্যাডমিন পোর্টাল' : 'ADMIN PORTAL'}</small><strong>{bn ? 'ড্যাশবোর্ড' : 'Dashboard'}</strong></div>
          <div className="admin-topbar-actions">
            <button className="admin-language" onClick={() => onLanguageChange(bn ? 'en' : 'bn')}>{bn ? 'EN' : 'বাংলা'}</button>
            <button className="admin-refresh" onClick={() => void load(query, true)} disabled={refreshing} aria-label={bn ? 'ডেটা রিফ্রেশ করুন' : 'Refresh data'}><RefreshCw className={refreshing ? 'animate-spin' : ''} size={17} /><span>{bn ? 'রিফ্রেশ' : 'Refresh'}</span></button>
            <button className="admin-top-signout" onClick={() => void signOut()} disabled={signingOut}><LogOut size={16} /><span>{bn ? 'লগআউট' : 'Sign out'}</span></button>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <span className="admin-kicker"><Sparkles size={14} /> {bn ? 'নক্ষত্র কন্ট্রোল সেন্টার' : 'NOKKHOTRO CONTROL CENTER'}</span>
              <h1>{bn ? 'শুভেচ্ছা, অ্যাডমিন 👋' : 'Welcome, administrator 👋'}</h1>
              <p>{bn ? 'শিক্ষার্থীদের অ্যাকাউন্ট, সক্রিয়তা ও শেখার অগ্রগতির নিরাপদ সারসংক্ষেপ।' : 'A secure summary of student accounts, activity, and learning progress.'}</p>
            </div>
            <div className="admin-live"><i /><span>{bn ? 'সিস্টেম সচল' : 'System online'}</span><small>{lastUpdated ? `${bn ? 'আপডেট' : 'Updated'} ${lastUpdated.toLocaleTimeString(bn ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}` : (bn ? 'সংযোগ হচ্ছে' : 'Connecting')}</small></div>
          </section>

          {error && <div className="admin-error" role="alert"><span>{error}</span><button onClick={() => void load(query)}>{bn ? 'আবার চেষ্টা করুন' : 'Try again'}</button></div>}

          <section className="admin-stat-grid" aria-label={bn ? 'সারসংক্ষেপ' : 'Summary'}>
            {cards.map(card => {
              const Icon = card.icon;
              return <article className={`admin-stat-card ${card.tone}`} key={card.label}>
                <div className="admin-stat-icon"><Icon size={20} /></div>
                <div><small>{card.label}</small><strong>{loading ? '—' : card.value}</strong><span>{card.note}</span></div>
              </article>;
            })}
          </section>

          <section className="admin-users-panel" id="admin-users">
            <div className="admin-panel-head">
              <div><span>{bn ? 'ব্যবহারকারী তালিকা' : 'USER DIRECTORY'}</span><h2>{bn ? 'শিক্ষার্থী ও অ্যাডমিন' : 'Students & administrators'}</h2><p>{bn ? 'পাসওয়ার্ড বা ব্যক্তিগত স্টাডি কনটেন্ট এখানে কখনো দেখানো হয় না।' : 'Passwords and private study content are never exposed here.'}</p></div>
              <form className="admin-search" onSubmit={submitSearch} role="search">
                <Search size={17} />
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder={bn ? 'নাম বা ইমেইল খুঁজুন' : 'Search name or email'} aria-label={bn ? 'ব্যবহারকারী খুঁজুন' : 'Search users'} />
                {query && <button type="button" onClick={() => { setQuery(''); void load('', true); }} aria-label={bn ? 'খোঁজ মুছুন' : 'Clear search'}><X size={15} /></button>}
              </form>
            </div>

            {loading ? (
              <div className="admin-loading" role="status"><RefreshCw className="animate-spin" size={21} /><span>{bn ? 'ডেটা লোড হচ্ছে…' : 'Loading accounts…'}</span></div>
            ) : users.length === 0 ? (
              <div className="admin-empty"><div><UserCheck size={25} /></div><h3>{query ? (bn ? 'কোনো মিল পাওয়া যায়নি' : 'No matching account') : (bn ? 'এখনো কোনো অ্যাকাউন্ট নেই' : 'No accounts yet')}</h3><p>{query ? (bn ? 'অন্য নাম বা ইমেইল দিয়ে খুঁজুন।' : 'Try another name or email.') : (bn ? 'প্রথম অনুমোদিত ইমেইল দিয়ে রেজিস্ট্রেশন করলে অ্যাডমিন অ্যাকাউন্ট এখানে দেখা যাবে।' : 'Register with the first approved email and the administrator account will appear here.')}</p></div>
            ) : <>
              <div className="admin-table-wrap">
                <table>
                  <thead><tr><th>{bn ? 'অ্যাকাউন্ট' : 'Account'}</th><th>{bn ? 'লক্ষ্য' : 'Goal'}</th><th>{bn ? 'অগ্রগতি' : 'Progress'}</th><th>{bn ? 'শেষ সক্রিয়' : 'Last active'}</th><th>{bn ? 'অবস্থা' : 'Status'}</th></tr></thead>
                  <tbody>{users.map(user => <tr key={user.user_id}>
                    <td><div className="admin-account"><span>{user.full_name.charAt(0).toUpperCase()}</span><div><strong>{user.full_name}</strong><small>{user.email}</small></div></div></td>
                    <td><strong className="admin-cell-main">{user.target_goal || '—'}</strong><small className="admin-cell-sub">{user.board || (bn ? 'বোর্ড দেওয়া হয়নি' : 'No board')}</small></td>
                    <td><strong className="admin-cell-main">{fmt.format(numberValue(user.xp))} XP</strong><small className="admin-cell-sub">{fmt.format(Math.round(numberValue(user.study_minutes) / 60 * 10) / 10)} {bn ? 'ঘণ্টা' : 'hrs'}</small></td>
                    <td><strong className="admin-cell-main">{formatDate(user.last_sign_in_at, lang)}</strong><small className="admin-cell-sub">{bn ? 'যোগদান' : 'Joined'} {formatDate(user.joined_at, lang)}</small></td>
                    <td><div className="admin-badges">{user.is_admin && <span className="admin-badge admin"><ShieldCheck size={12} />{bn ? 'অ্যাডমিন' : 'Admin'}</span>}<span className={`admin-badge ${user.email_confirmed ? 'verified' : 'pending'}`}>{user.email_confirmed ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}{user.email_confirmed ? (bn ? 'যাচাইকৃত' : 'Verified') : (bn ? 'অপেক্ষমাণ' : 'Pending')}</span></div></td>
                  </tr>)}</tbody>
                </table>
              </div>

              <div className="admin-mobile-users">{users.map(user => <article key={user.user_id}>
                <div className="admin-account"><span>{user.full_name.charAt(0).toUpperCase()}</span><div><strong>{user.full_name}</strong><small>{user.email}</small></div></div>
                <div className="admin-mobile-user-grid"><span><small>{bn ? 'লক্ষ্য' : 'Goal'}</small><strong>{user.target_goal || '—'}</strong></span><span><small>XP</small><strong>{fmt.format(numberValue(user.xp))}</strong></span><span><small>{bn ? 'শেষ সক্রিয়' : 'Last active'}</small><strong>{formatDate(user.last_sign_in_at, lang)}</strong></span></div>
                <div className="admin-badges">{user.is_admin && <span className="admin-badge admin"><ShieldCheck size={12} />{bn ? 'অ্যাডমিন' : 'Admin'}</span>}<span className={`admin-badge ${user.email_confirmed ? 'verified' : 'pending'}`}>{user.email_confirmed ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}{user.email_confirmed ? (bn ? 'যাচাইকৃত' : 'Verified') : (bn ? 'অপেক্ষমাণ' : 'Pending')}</span></div>
              </article>)}</div>

              <div className="admin-table-footer"><span>{bn ? `${fmt.format(matchedCount)}টির মধ্যে ${fmt.format(shownCount)}টি দেখানো হচ্ছে` : `Showing ${fmt.format(shownCount)} of ${fmt.format(matchedCount)}`}</span><span><BarChart3 size={14} /> {bn ? `${fmt.format(overview.adminUsers)} জন অ্যাডমিন` : `${fmt.format(overview.adminUsers)} administrator${overview.adminUsers === 1 ? '' : 's'}`}</span></div>
            </>}
          </section>
        </div>
      </main>
    </div>
  );
}
