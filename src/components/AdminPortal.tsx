import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { AccessibilityMenu } from './AccessibilityMenu';

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

interface AdminSurveyInsights {
  responses: number;
  updatedLast30Days: number;
  privacyThreshold: number;
  insightsReady: boolean;
  averageHelpfulness: number;
  averagePlanClarity: number;
  primaryNeeds: Record<string, number>;
  biggestBlockers: Record<string, number>;
  nextPriorities: Record<string, number>;
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

const ADMIN_PAGE_SIZE = 20;

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

const EMPTY_SURVEY: AdminSurveyInsights = {
  responses: 0,
  updatedLast30Days: 0,
  privacyThreshold: 5,
  insightsReady: false,
  averageHelpfulness: 0,
  averagePlanClarity: 0,
  primaryNeeds: {},
  biggestBlockers: {},
  nextPriorities: {},
};

const SURVEY_LABELS = {
  primaryNeeds: {
    daily_plan: { bn: 'আজকের স্পষ্ট পরিকল্পনা', en: 'Clear daily plan' },
    board_practice: { bn: 'বোর্ড MCQ ও CQ', en: 'Board MCQ and CQ' },
    revision: { bn: 'রিভিশন ও ভুল সংশোধন', en: 'Revision and mistakes' },
    admission_prep: { bn: 'ভর্তি প্রস্তুতি', en: 'Admission preparation' },
  },
  biggestBlockers: {
    know_what_next: { bn: 'পরের কাজ জানা', en: 'Knowing what is next' },
    understand_concepts: { bn: 'কঠিন ধারণা', en: 'Understanding concepts' },
    stay_consistent: { bn: 'নিয়মিত থাকা', en: 'Staying consistent' },
    find_time: { bn: 'সময় বের করা', en: 'Finding time' },
  },
  nextPriorities: {
    more_mcq: { bn: 'আরও MCQ', en: 'More MCQs' },
    more_cq_models: { bn: 'আরও CQ ও মডেল উত্তর', en: 'More CQs and model answers' },
    routine_reminders: { bn: 'রুটিন ও রিমাইন্ডার', en: 'Routines and reminders' },
    simpler_faster: { bn: 'সহজ ও দ্রুত অ্যাপ', en: 'Simpler and faster app' },
  },
} as const;

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

function normalizeCountMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, count]) => [key, Math.max(0, Math.floor(numberValue(count)))])
      .filter(([, count]) => Number(count) > 0)
  );
}

function normalizeSurvey(value: unknown): AdminSurveyInsights {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const responses = Math.max(0, Math.floor(numberValue(row.responses)));
  const privacyThreshold = Math.min(100, Math.max(2, Math.floor(numberValue(row.privacyThreshold) || 5)));
  return {
    responses,
    updatedLast30Days: Math.max(0, Math.floor(numberValue(row.updatedLast30Days))),
    privacyThreshold,
    insightsReady: row.insightsReady === true && responses >= privacyThreshold,
    averageHelpfulness: Math.min(5, Math.max(0, numberValue(row.averageHelpfulness))),
    averagePlanClarity: Math.min(5, Math.max(0, numberValue(row.averagePlanClarity))),
    primaryNeeds: normalizeCountMap(row.primaryNeeds),
    biggestBlockers: normalizeCountMap(row.biggestBlockers),
    nextPriorities: normalizeCountMap(row.nextPriorities),
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
  const [survey, setSurvey] = useState<AdminSurveyInsights>(EMPTY_SURVEY);
  const [surveyAvailable, setSurveyAvailable] = useState(true);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const requestSequence = useRef(0);
  const languageRef = useRef(lang);

  useEffect(() => {
    languageRef.current = lang;
    document.documentElement.lang = lang;
    document.title = `${lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin dashboard'} — ${lang === 'bn' ? 'নক্ষত্র HSC ’28' : 'Nokkhotro HSC ’28'}`;
  }, [lang]);

  const load = useCallback(async (search = '', nextPage = 0, quiet = false) => {
    const request = ++requestSequence.current;
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const client = await clientFactory();
      const [overviewResult, usersResult, surveyResult] = await Promise.all([
        client.rpc('hsc28_admin_overview'),
        client.rpc('hsc28_admin_list_users', {
          p_search: search.trim(),
          p_limit: ADMIN_PAGE_SIZE,
          p_offset: nextPage * ADMIN_PAGE_SIZE,
        }),
        client.rpc('hsc28_admin_survey_insights'),
      ]);
      if (overviewResult.error) throw overviewResult.error;
      if (usersResult.error) throw usersResult.error;
      if (request !== requestSequence.current) return;

      const rows = Array.isArray(usersResult.data) ? usersResult.data as AdminUserRow[] : [];
      setOverview(normalizeOverview(overviewResult.data));
      if (surveyResult?.error) {
        setSurveyAvailable(false);
      } else {
        setSurvey(normalizeSurvey(surveyResult?.data));
        setSurveyAvailable(true);
      }
      setUsers(rows);
      setPage(nextPage);
      if (rows[0]) setTotalCount(numberValue(rows[0].total_count));
      else if (nextPage === 0) setTotalCount(0);
      setLastUpdated(new Date());
    } catch {
      if (request !== requestSequence.current) return;
      setError(languageRef.current === 'bn'
        ? 'অ্যাডমিন ডেটা লোড করা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
        : 'Admin data could not be loaded. Check the connection and try again.');
    } finally {
      if (request === requestSequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [clientFactory]);

  useEffect(() => {
    void load('', 0);
  }, [load]);

  const shownCount = users.length;
  const pageStart = shownCount ? page * ADMIN_PAGE_SIZE + 1 : 0;
  const pageEnd = page * ADMIN_PAGE_SIZE + shownCount;
  const pageCount = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
  const studyHours = Math.round((overview.totalStudyMinutes / 60) * 10) / 10;
  const fmt = useMemo(
    () => new Intl.NumberFormat(bn ? 'bn-BD' : 'en-US'),
    [bn]
  );

  const surveyGroups: Array<{
    key: 'primaryNeeds' | 'biggestBlockers' | 'nextPriorities';
    title: string;
    labels: Record<string, { bn: string; en: string }>;
  }> = [
    {
      key: 'primaryNeeds',
      title: bn ? 'এখন সবচেয়ে বেশি দরকার' : 'Needed most right now',
      labels: SURVEY_LABELS.primaryNeeds,
    },
    {
      key: 'biggestBlockers',
      title: bn ? 'সবচেয়ে বড় বাধা' : 'Biggest study blocker',
      labels: SURVEY_LABELS.biggestBlockers,
    },
    {
      key: 'nextPriorities',
      title: bn ? 'পরের উন্নতির অগ্রাধিকার' : 'Priority for the next improvement',
      labels: SURVEY_LABELS.nextPriorities,
    },
  ];

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
    void load(query, 0, true);
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
          <a href="#admin-survey" onClick={() => setMobileNav(false)}><MessageSquareText size={18} /><span>{bn ? 'শিক্ষার্থী মতামত' : 'Student pulse'}</span><small>{fmt.format(survey.responses)}</small></a>
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
            <AccessibilityMenu lang={lang} theme="light" triggerClassName="admin-language" />
            <button className="admin-language" onClick={() => onLanguageChange(bn ? 'en' : 'bn')}>{bn ? 'EN' : 'বাংলা'}</button>
            <button className="admin-refresh" onClick={() => void load(query, page, true)} disabled={refreshing} aria-label={bn ? 'ডেটা রিফ্রেশ করুন' : 'Refresh data'}><RefreshCw className={refreshing ? 'animate-spin' : ''} size={17} /><span>{bn ? 'রিফ্রেশ' : 'Refresh'}</span></button>
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

          {error && <div className="admin-error" role="alert"><span>{error}</span><button onClick={() => void load(query, page)}>{bn ? 'আবার চেষ্টা করুন' : 'Try again'}</button></div>}

          <section className="admin-stat-grid" aria-label={bn ? 'সারসংক্ষেপ' : 'Summary'}>
            {cards.map(card => {
              const Icon = card.icon;
              return <article className={`admin-stat-card ${card.tone}`} key={card.label}>
                <div className="admin-stat-icon"><Icon size={20} /></div>
                <div><small>{card.label}</small><strong>{loading ? '—' : card.value}</strong><span>{card.note}</span></div>
              </article>;
            })}
          </section>

          <section className="admin-survey-panel" id="admin-survey" aria-labelledby="admin-survey-title">
            <div className="admin-panel-head">
              <div>
                <span>{bn ? '৫-প্রশ্নের ইন-অ্যাপ গবেষণা' : 'FIVE-QUESTION IN-APP RESEARCH'}</span>
                <h2 id="admin-survey-title">{bn ? 'শিক্ষার্থীরা পরের ধাপে কী চায়' : 'What students need next'}</h2>
                <p>{bn ? 'শুধু aggregate total—কোনো নাম, ইমেইল, user ID, খোলা লেখা বা ব্যক্তিগত উত্তর এখানে আসে না।' : 'Aggregate totals only—no name, email, user ID, free text, or individual response is returned here.'}</p>
              </div>
              <div className="admin-survey-count"><MessageSquareText size={18} /><strong>{loading ? '—' : fmt.format(survey.responses)}</strong><span>{bn ? 'মোট উত্তর' : 'responses'}</span></div>
            </div>

            {!surveyAvailable ? (
              <div className="admin-survey-empty" role="status">{bn ? 'সার্ভে aggregate এখন পাওয়া যাচ্ছে না; মূল অ্যাডমিন ডেটা অক্ষুণ্ণ আছে।' : 'Survey aggregates are unavailable right now; core admin data remains available.'}</div>
            ) : survey.responses === 0 ? (
              <div className="admin-survey-empty"><MessageSquareText size={23} /><div><strong>{bn ? 'এখনো কোনো উত্তর নেই' : 'No responses yet'}</strong><span>{bn ? 'শিক্ষার্থী Analytics-এ ৫টি উত্তর সেভ করলে aggregate এখানে আসবে।' : 'Aggregates appear after a student saves the five answers in Analytics.'}</span></div></div>
            ) : !survey.insightsReady ? (
              <div className="admin-survey-empty"><ShieldCheck size={23} /><div><strong>{bn ? 'ছোট sample-এর উত্তর গোপন রাখা হয়েছে' : 'Small-sample answers are hidden'}</strong><span>{bn
                ? `কমপক্ষে ${fmt.format(survey.privacyThreshold)}টি account উত্তর দিলে score ও choice distribution দেখা যাবে—আর ${fmt.format(Math.max(0, survey.privacyThreshold - survey.responses))}টি দরকার।`
                : `Scores and choice distributions unlock at ${fmt.format(survey.privacyThreshold)} accounts; ${fmt.format(Math.max(0, survey.privacyThreshold - survey.responses))} more needed.`}</span></div></div>
            ) : (
              <>
                <div className="admin-survey-metrics">
                  <div><small>{bn ? 'গত ৩০ দিনে আপডেট' : 'Updated in 30 days'}</small><strong>{fmt.format(survey.updatedLast30Days)}</strong></div>
                  <div><small>{bn ? 'অ্যাপের সহায়তা' : 'App helpfulness'}</small><strong>{survey.averageHelpfulness.toFixed(1)} <span>/ 5</span></strong></div>
                  <div><small>{bn ? 'আজকের প্ল্যান কতটা স্পষ্ট' : 'Today-plan clarity'}</small><strong>{survey.averagePlanClarity.toFixed(1)} <span>/ 5</span></strong></div>
                </div>
                <div className="admin-survey-groups">
                  {surveyGroups.map(group => (
                    <article key={group.key}>
                      <h3>{group.title}</h3>
                      <div className="admin-survey-bars">
                        {Object.entries(group.labels).map(([key, label]) => {
                          const count = survey[group.key][key] || 0;
                          const percent = survey.responses > 0
                            ? Math.min(100, Math.max(0, Math.round((count / survey.responses) * 100)))
                            : 0;
                          return <div className="admin-survey-bar" key={key}>
                            <div><span>{label[lang]}</span><strong>{fmt.format(count)} · {fmt.format(percent)}%</strong></div>
                            <i><b style={{ width: `${percent}%` }} /></i>
                          </div>;
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="admin-users-panel" id="admin-users">
            <div className="admin-panel-head">
              <div><span>{bn ? 'ব্যবহারকারী তালিকা' : 'USER DIRECTORY'}</span><h2>{bn ? 'শিক্ষার্থী ও অ্যাডমিন' : 'Students & administrators'}</h2><p>{bn ? 'পাসওয়ার্ড বা ব্যক্তিগত স্টাডি কনটেন্ট এখানে কখনো দেখানো হয় না।' : 'Passwords and private study content are never exposed here.'}</p></div>
              <form className="admin-search" onSubmit={submitSearch} role="search">
                <Search size={17} />
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder={bn ? 'নাম বা ইমেইল খুঁজুন' : 'Search name or email'} aria-label={bn ? 'ব্যবহারকারী খুঁজুন' : 'Search users'} />
                {query && <button type="button" onClick={() => { setQuery(''); void load('', 0, true); }} aria-label={bn ? 'খোঁজ মুছুন' : 'Clear search'}><X size={15} /></button>}
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

              <div className="admin-table-footer">
                <span>{bn ? `${fmt.format(totalCount)}টির মধ্যে ${fmt.format(pageStart)}–${fmt.format(pageEnd)} দেখানো হচ্ছে` : `Showing ${fmt.format(pageStart)}–${fmt.format(pageEnd)} of ${fmt.format(totalCount)}`}</span>
                {pageCount > 1 && <div className="admin-pagination" aria-label={bn ? 'ব্যবহারকারী তালিকার পৃষ্ঠা' : 'User directory pages'}>
                  <button type="button" onClick={() => void load(query, page - 1, true)} disabled={page === 0 || refreshing} aria-label={bn ? 'আগের পৃষ্ঠা' : 'Previous page'}><ChevronLeft size={14} /></button>
                  <strong>{fmt.format(page + 1)} / {fmt.format(pageCount)}</strong>
                  <button type="button" onClick={() => void load(query, page + 1, true)} disabled={page + 1 >= pageCount || refreshing} aria-label={bn ? 'পরের পৃষ্ঠা' : 'Next page'}><ChevronRight size={14} /></button>
                </div>}
                <span><BarChart3 size={14} /> {bn ? `${fmt.format(overview.adminUsers)} জন অ্যাডমিন` : `${fmt.format(overview.adminUsers)} administrator${overview.adminUsers === 1 ? '' : 's'}`}</span>
              </div>
            </>}
          </section>
        </div>
      </main>
    </div>
  );
}
