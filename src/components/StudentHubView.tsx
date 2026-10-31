import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Calendar,
  Search,
  Send,
  ThumbsUp,
  CheckCircle2,
  Plus,
  BookOpen,
} from 'lucide-react';
import {
  Lang,
  StudentDoubtPost,
  StudentProfile,
  SubjectKey,
  Theme,
} from '../types';
import { syncWrite } from '../lib/sync';
import {
  CONCEPT_QA_CARDS,
  HSC28_NOTICES,
  HSC28_ROADMAP,
} from '../data/hsc28EcosystemData';
import { SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { FORMULAS } from '../data/formulasData';
import { getSupabase } from '../lib/supabase';
import { formatNum, getBoardLabel } from '../lib/i18n';

interface StudentHubViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  isAuthenticated: boolean;
  authUserId: string | null;
  onAwardXp: (amount: number, msgBn: string, msgEn: string) => void;
}

const FALLBACK_DOUBTS: StudentDoubtPost[] = [
  {
    id: '00000000-0000-4000-8000-000000000501',
    authorName: 'তানভীর আহমেদ',
    collegeName: 'নটর ডেম কলেজ, ঢাকা',
    board: 'Dhaka',
    subjectKey: 'physics1',
    title:
      'নদী-নৌকার অংকে ন্যূনতম সময় আর ন্যূনতম দূরত্বের কোণ নিয়ে কনফিউশন কীভাবে দূর করব?',
    details:
      'ন্যূনতম সময়ে পার হতে α = 90° ধরব নাকি cos⁻¹(-u/v)? বোর্ড CQ আর MCQ-তে প্রায়ই গুলিয়ে যায়।',
    upvotes: 14,
    solved: true,
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: 'r-501',
        doubtId: '00000000-0000-4000-8000-000000000501',
        authorName: 'মালিহা তাবাসসুম',
        collegeName: 'হলি ক্রস কলেজ, ঢাকা',
        content:
          'মনে রাখার সহজ টেকনিক: ১) ন্যূনতম সময়ে নদী পার হতে নৌকা স্রোতের সাথে লম্বভাবে অর্থাৎ α = 90° কোণে চালাতে হয় (t_min = d/v)। ২) আর ন্যূনতম দূরত্ব বা সোজাসুজি পার হতে স্রোতের বিপরীত দিকে হেলিয়ে α = cos⁻¹(-u/v) কোণে চালাতে হয় (যেখানে v > u)।',
        isHelpful: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: '00000000-0000-4000-8000-000000000502',
    authorName: 'নুসরাত জাহান',
    collegeName: 'সরকারি এম. এম. সিটি কলেজ, খুলনা',
    board: 'Jashore',
    subjectKey: 'chemistry1',
    title:
      'ক্রোমিয়াম (Cr-24) ও কপার (Cu-29) আউফবাউ নীতির ব্যতিক্রম কেন — খ নম্বরে কীভাবে লিখলে পূর্ণ নম্বর পাওয়া যায়?',
    details:
      'একাদশ শ্রেণির গুণগত রসায়ন অধ্যায়ে অনুধাবনমূলক প্রশ্নের আদর্শ পয়েন্টগুলো জানালে উপকার হতো।',
    upvotes: 11,
    solved: true,
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: 'r-502',
        doubtId: '00000000-0000-4000-8000-000000000502',
        authorName: 'রাহাতুল ইসলাম',
        collegeName: 'সরকারি বি. এল. কলেজ, খুলনা',
        content:
          'সমশক্তিসম্পন্ন অরবিটাল অর্ধপূর্ণ (d⁵) অথবা পূর্ণ (d¹⁰) থাকলে বিনিময় শক্তি বেশি হওয়ায় ইলেকট্রন বিন্যাস অধিক স্থিতিশীল হয়। এজন্য Cr(24)-এ [Ar] 3d⁵ 4s¹ এবং Cu(29)-এ [Ar] 3d¹⁰ 4s¹ হয় — এই দুটি পয়েন্ট ও বিন্যাস লিখলেই ২-এ ২ পাওয়া যায়।',
        isHelpful: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

export const StudentHubView: React.FC<StudentHubViewProps> = ({
  lang,
  theme,
  profile,
  isAuthenticated,
  authUserId,
  onAwardXp,
}) => {
  const isDark = theme === 'dark';
  const [subTab, setSubTab] = useState<'mentor' | 'forum' | 'roadmap'>('mentor');

  // 1. Smart Concept Helper State
  const [conceptQuery, setConceptQuery] = useState('');

  // 2. Peer Student Q&A State
  const [doubts, setDoubts] = useState<StudentDoubtPost[]>(() => {
    try {
      const saved = localStorage.getItem('hsc28_peer_doubts');
      return saved ? JSON.parse(saved) : FALLBACK_DOUBTS;
    } catch {
      return FALLBACK_DOUBTS;
    }
  });
  const [showAskBox, setShowAskBox] = useState(false);
  const [askSubject, setAskSubject] = useState<SubjectKey>('physics1');
  const [askTitle, setAskTitle] = useState('');
  const [askDetails, setAskDetails] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  // Persisted so a reload cannot be used to vote the same doubt repeatedly.
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('hsc28_upvoted');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('hsc28_peer_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('hsc28_upvoted', JSON.stringify(upvotedMap));
  }, [upvotedMap]);

  // Hydrate peer doubts from Supabase
  useEffect(() => {
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data: dRows } = await supabase
          .from('hsc28_student_doubts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25);
        const { data: rRows } = await supabase
          .from('hsc28_doubt_replies')
          .select('*')
          .order('created_at', { ascending: true });

        if (dRows && dRows.length > 0) {
          const mapped: StudentDoubtPost[] = dRows.map((d: any) => ({
            id: d.id,
            authorName: d.author_name,
            collegeName: d.college_name || '',
            board: d.board || 'Jashore',
            subjectKey: (d.subject_key as SubjectKey) || 'physics1',
            title: d.title,
            details: d.details,
            upvotes: Number(d.upvotes || 0),
            solved: !!d.solved,
            createdAt: d.created_at,
            replies: (rRows || [])
              .filter((r: any) => r.doubt_id === d.id)
              .map((r: any) => ({
                id: r.id,
                doubtId: r.doubt_id,
                authorName: r.author_name,
                collegeName: r.college_name || '',
                content: r.content,
                isHelpful: !!r.is_helpful,
                createdAt: r.created_at,
              })),
          }));
          // Merge instead of replacing. `setDoubts(mapped)` used to throw away
          // two things: questions the student posted while offline (the local
          // insert only happens when authenticated and reachable), and any
          // upvote they had cast, since upvote counts are never written back to
          // the cloud. Seed/demo posts are dropped once real cloud data exists.
          const seedIds = new Set(FALLBACK_DOUBTS.map((d) => d.id));
          setDoubts((prevLocal) => {
            const cloudIds = new Set(mapped.map((d) => d.id));
            const localOnly = prevLocal.filter(
              (d) => !cloudIds.has(d.id) && !seedIds.has(d.id)
            );
            const merged = mapped.map((cloud) => {
              const local = prevLocal.find((d) => d.id === cloud.id);
              return local && local.upvotes > cloud.upvotes
                ? { ...cloud, upvotes: local.upvotes }
                : cloud;
            });
            return [...localOnly, ...merged];
          });

          // Restore which doubts this student already upvoted, so the vote
          // ledger in hsc28_doubt_votes survives reloads and other devices.
          if (authUserId) {
            const { data: voteRows } = await supabase
              .from('hsc28_doubt_votes')
              .select('doubt_id')
              .eq('user_id', authUserId);
            if (voteRows && voteRows.length > 0) {
              setUpvotedMap((prev) => {
                const next = { ...prev };
                voteRows.forEach((v: any) => {
                  next[v.doubt_id] = true;
                });
                return next;
              });
            }
          }
        }
      } catch {
        // Offline safe
      }
    })();
    // Re-runs when the session resolves: the vote ledger needs authUserId,
    // which is null on first paint because session restore is async.
  }, [authUserId]);

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askTitle.trim() || !askDetails.trim()) return;
    const id = crypto.randomUUID();
    const newPost: StudentDoubtPost = {
      id,
      authorName: profile.fullName,
      collegeName: profile.collegeName || 'HSC ’28 Science',
      board: profile.board,
      subjectKey: askSubject,
      title: askTitle.trim(),
      details: askDetails.trim(),
      upvotes: 1,
      solved: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setDoubts((prev) => [newPost, ...prev]);
    setAskTitle('');
    setAskDetails('');
    setShowAskBox(false);
    onAwardXp(10, 'প্রশ্ন পোস্ট করা হয়েছে (+১০ XP)', 'Question posted (+10 XP)');

    if (isAuthenticated && authUserId) {
      try {
        const client = await getSupabase();
        await client.from('hsc28_student_doubts').insert({
          id,
          user_id: authUserId,
          author_name: newPost.authorName,
          college_name: newPost.collegeName,
          board: newPost.board,
          subject_key: newPost.subjectKey,
          title: newPost.title,
          details: newPost.details,
          upvotes: 1,
          solved: false,
        });
      } catch {
        // Offline safe
      }
    }
  };

  const handlePostReply = async (doubtId: string) => {
    const text = (replyInputs[doubtId] || '').trim();
    if (!text) return;
    const replyId = crypto.randomUUID();
    setDoubts((prev) =>
      prev.map((d) =>
        d.id !== doubtId
          ? d
          : {
              ...d,
              solved: true,
              replies: [
                ...d.replies,
                {
                  id: replyId,
                  doubtId,
                  authorName: profile.fullName,
                  collegeName: profile.collegeName || 'HSC ’28 Batchmate',
                  content: text,
                  isHelpful: true,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
      )
    );
    setReplyInputs((prev) => ({ ...prev, [doubtId]: '' }));
    onAwardXp(
      15,
      'সহপাঠীর প্রশ্নের সমাধান প্রদান (+১৫ XP)',
      'Peer answer contributed (+15 XP)'
    );

    if (isAuthenticated && authUserId) {
      try {
        const client = await getSupabase();
        await client.from('hsc28_doubt_replies').insert({
          id: replyId,
          doubt_id: doubtId,
          user_id: authUserId,
          author_name: profile.fullName,
          college_name: profile.collegeName || 'HSC ’28 Science',
          content: text,
          is_helpful: true,
        });
      } catch {
        // Offline safe
      }
    }
  };

  // Filtered Concept Helper cards
  const qLower = conceptQuery.trim().toLowerCase();
  const matchedConcepts = !qLower
    ? CONCEPT_QA_CARDS
    : CONCEPT_QA_CARDS.filter(
        (c) =>
          c.keywords.some((k) => qLower.includes(k.toLowerCase()) || k.toLowerCase().includes(qLower)) ||
          c.question.bn.toLowerCase().includes(qLower) ||
          c.question.en.toLowerCase().includes(qLower) ||
          c.answer.bn.toLowerCase().includes(qLower) ||
          c.answer.en.toLowerCase().includes(qLower)
      );

  const matchedFormulaHelp = qLower
    ? FORMULAS.filter(
        (f) =>
          f.title.bn.toLowerCase().includes(qLower) ||
          f.title.en.toLowerCase().includes(qLower) ||
          f.formula.toLowerCase().includes(qLower)
      ).slice(0, 3)
    : [];

  const cardClass = `p-5 sm:p-6 rounded-2xl border ${
    isDark
      ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
      : 'bg-white/95 border-slate-200/80 card-soft-light'
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {lang === 'bn'
              ? 'শুধুমাত্র HSC ২০২৮ শিক্ষার্থীদের নিজস্ব কমিউনিটি'
              : 'EXCLUSIVELY FOR HSC 2028 SCIENCE STUDENTS'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
            {lang === 'bn'
              ? 'HSC ’28 স্টুডেন্ট হাব — কনসেপ্ট সহায়ক, ডাউট ফোরাম ও রোডম্যাপ'
              : 'HSC ’28 Student Hub — Concept Mentor, Peer Q&A & Roadmap'}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'কঠিন টপিকের তাৎক্ষণিক ব্যাখ্যা, সহপাঠীদের সাথে সমস্যা সমাধান এবং ২০২৬–২০২৮ একাডেমিক রোডম্যাপ।'
              : 'Instant concept explanations, peer-to-peer batchmate doubt solving, and your 2026–2028 HSC roadmap.'}
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: 'mentor' as const,
            icon: <Sparkles className="w-4 h-4" />,
            bn: 'তাৎক্ষণিক কনসেপ্ট ও সূত্র সহায়ক',
            en: 'Instant Concept Explainer',
          },
          {
            id: 'forum' as const,
            icon: <MessageSquare className="w-4 h-4" />,
            bn: `সহপাঠী ডাউট ফোরাম (${formatNum(doubts.length, lang)})`,
            en: `Batch ’28 Peer Q&A (${doubts.length})`,
          },
          {
            id: 'roadmap' as const,
            icon: <Calendar className="w-4 h-4" />,
            bn: 'HSC ’28 রোডম্যাপ ও নোটিশ বোর্ড',
            en: 'HSC ’28 Roadmap & Notices',
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer transition-all ${
              subTab === t.id
                ? isDark
                  ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : isDark
                ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                : 'bg-white border-slate-200/85 text-slate-700 shadow-2xs'
            }`}
          >
            {t.icon}
            <span>{lang === 'bn' ? t.bn : t.en}</span>
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: SMART CONCEPT EXPLAINER */}
      {subTab === 'mentor' && (
        <div className="space-y-5">
          <div className={cardClass}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-indigo-500" />
              <input
                type="text"
                value={conceptQuery}
                onChange={(e) => setConceptQuery(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'আপনার প্রশ্ন বা টপিক লিখুন (যেমন: নদী-নৌকা, সংকরায়ন, বাফার pH, ক্যালকুলাস LIATE, মাইটোসিস, NAND)...'
                    : 'Ask a concept or topic (e.g., river-boat, hybridization, buffer pH, LIATE, mitosis, NAND)...'
                }
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none ${
                  isDark
                    ? 'bg-slate-900/75 border-slate-700 text-slate-100 focus:border-indigo-400'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400 focus:bg-white'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-[11px] opacity-60 mr-1">
                {lang === 'bn' ? 'জনপ্রিয় প্রশ্ন:' : 'Quick prompts:'}
              </span>
              {[
                { q: 'নদী', labelBn: 'নদী-নৌকার কোণ', labelEn: 'River-Boat Angle' },
                { q: 'সংকরায়ন', labelBn: 'সংকরায়ন শর্টকাট', labelEn: 'Hybridization Trick' },
                { q: 'বাফার', labelBn: 'বাফার pH', labelEn: 'Buffer pH' },
                { q: 'liate', labelBn: 'যোগজীকরণ LIATE', labelEn: 'Integration LIATE' },
                { q: 'মাইটোসিস', labelBn: 'ক্রসিং ওভার ও ধাপ', labelEn: 'Mitosis/Meiosis' },
                { q: 'nand', labelBn: 'NAND সর্বজনীন গেট', labelEn: 'Universal NAND' },
              ].map((chip) => (
                <button
                  key={chip.q}
                  onClick={() => setConceptQuery(chip.q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 text-indigo-300 hover:border-indigo-400/50'
                      : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-700 hover:bg-indigo-100/70'
                  }`}
                >
                  {lang === 'bn' ? chip.labelBn : chip.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedConcepts.map((item) => {
              const s = getSubjectByKey(item.subjectKey);
              return (
                <div key={item.id} className={`${cardClass} space-y-3`}>
                  <span
                    className={`inline-block text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      isDark ? s.bgDark : s.bgLight
                    }`}
                  >
                    {s.shortName[lang]}
                  </span>
                  <h3 className="font-bold text-base">{item.question[lang]}</h3>
                  {item.formula && (
                    <div
                      className={`p-3 rounded-xl font-formula text-xs font-semibold border ${
                        isDark
                          ? 'bg-slate-900/75 border-slate-700 text-indigo-200'
                          : 'bg-indigo-50/55 border-indigo-100 text-indigo-950'
                      }`}
                    >
                      {item.formula}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed opacity-85">
                    {item.answer[lang]}
                  </p>
                </div>
              );
            })}

            {matchedFormulaHelp.map((f) => (
              <div key={f.id} className={`${cardClass} space-y-2.5`}>
                <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-300">
                  FORMULA MATCH • {f.chapterTitle[lang]}
                </span>
                <h3 className="font-bold text-base">{f.title[lang]}</h3>
                <div
                  className={`p-3 rounded-xl font-formula text-xs font-bold border ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {f.formula}
                </div>
                <p className="text-xs opacity-80">{f.explanation[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: BATCH '28 PEER Q&A FORUM */}
      {subTab === 'forum' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm opacity-75">
              {lang === 'bn'
                ? 'HSC ২০২৮ ব্যাচের সহপাঠীদের সাথে অংক, সূত্র বা অনুধাবনমূলক প্রশ্ন নিয়ে আলোচনা করুন — উত্তর দিলে +১৫ XP!'
                : 'Collaborate strictly with fellow HSC 2028 Science students — earn +15 XP per helpful solution!'}
            </p>
            <button
              onClick={() => setShowAskBox(!showAskBox)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>
                {lang === 'bn' ? 'নতুন প্রশ্ন করুন' : 'Ask Batchmates'}
              </span>
            </button>
          </div>

          {showAskBox && (
            <form onSubmit={handlePostDoubt} className={`${cardClass} space-y-3`}>
              <h3 className="font-bold text-sm">
                {lang === 'bn'
                  ? 'সহপাঠীদের কাছে আপনার প্রশ্নটি লিখুন'
                  : 'Post a Doubt for HSC ’28 Batchmates'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={askSubject}
                  onChange={(e) => setAskSubject(e.target.value as SubjectKey)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.name[lang]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'প্রশ্নের মূল শিরোনাম...'
                      : 'Short question title...'
                  }
                  className={`sm:col-span-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <textarea
                rows={3}
                required
                value={askDetails}
                onChange={(e) => setAskDetails(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'উদ্দীপক বা সমস্যার বিস্তারিত লিখুন...'
                    : 'Describe where you are getting stuck...'
                }
                className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAskBox(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs opacity-70 cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                >
                  {lang === 'bn' ? 'পোস্ট করুন (+১০ XP)' : 'Publish (+10 XP)'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {doubts.map((d) => {
              const s = getSubjectByKey(d.subjectKey);
              const upvoted = !!upvotedMap[d.id];
              return (
                <div key={d.id} className={`${cardClass} space-y-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                          isDark ? s.bgDark : s.bgLight
                        }`}
                      >
                        {s.shortName[lang]}
                      </span>
                      <span className="text-xs font-semibold">
                        {d.authorName}
                      </span>
                      <span className="text-xs opacity-55">
                        • {d.collegeName} ({getBoardLabel(d.board, lang)})
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (upvoted) return;
                        setUpvotedMap((p) => ({ ...p, [d.id]: true }));
                        // Optimistic bump so the tap feels instant.
                        setDoubts((prev) =>
                          prev.map((item) =>
                            item.id === d.id
                              ? { ...item, upvotes: item.upvotes + 1 }
                              : item
                          )
                        );
                        if (!isAuthenticated || !authUserId) return;
                        // Persist through the atomic RPC (one vote per user,
                        // enforced by hsc28_doubt_votes). Falls back to the
                        // retry queue when the network is down.
                        void (async () => {
                          try {
                            const client = await getSupabase();
                            const { data, error } = await client.rpc(
                              'hsc28_upvote_doubt',
                              { p_doubt_id: d.id }
                            );
                            if (!error && typeof data === 'number') {
                              setDoubts((prev) =>
                                prev.map((item) =>
                                  item.id === d.id
                                    ? { ...item, upvotes: data }
                                    : item
                                )
                              );
                            } else if (error) {
                              void syncWrite(
                                {
                                  op: 'rpc',
                                  fn: 'hsc28_upvote_doubt',
                                  args: { p_doubt_id: d.id },
                                },
                                authUserId
                              );
                            }
                          } catch {
                            void syncWrite(
                              {
                                op: 'rpc',
                                fn: 'hsc28_upvote_doubt',
                                args: { p_doubt_id: d.id },
                              },
                              authUserId
                            );
                          }
                        })();
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                        upvoted
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-400/30'
                          : isDark
                          ? 'border-slate-700 text-slate-300'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{formatNum(d.upvotes, lang)}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-base">{d.title}</h3>
                    <p className="text-xs sm:text-sm opacity-80 mt-1 leading-relaxed">
                      {d.details}
                    </p>
                  </div>

                  {/* Peer Replies */}
                  {d.replies.length > 0 && (
                    <div className="space-y-2.5 pl-3 border-l-2 border-emerald-400/60">
                      {d.replies.map((r) => (
                        <div
                          key={r.id}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm space-y-1 ${
                            isDark
                              ? 'bg-emerald-500/8 border-emerald-400/20'
                              : 'bg-emerald-50/55 border-emerald-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{r.authorName}</span>
                            <span className="font-normal opacity-70">
                              • {r.collegeName}
                            </span>
                          </div>
                          <p className="leading-relaxed">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Peer Solution */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyInputs[d.id] || ''}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({
                          ...prev,
                          [d.id]: e.target.value,
                        }))
                      }
                      placeholder={
                        lang === 'bn'
                          ? 'সহপাঠী হিসেবে আপনার সমাধান বা ব্যাখ্যা লিখুন...'
                          : 'Write a helpful explanation for your batchmate...'
                      }
                      className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none ${
                        isDark
                          ? 'bg-slate-900/65 border-slate-700 text-slate-100 focus:border-indigo-400'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handlePostReply(d.id)}
                      className="px-3.5 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'উত্তর দিন' : 'Reply'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: HSC 2028 2-YEAR ROADMAP & NOTICES */}
      {subTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-7 ${cardClass} space-y-4`}>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>
                {lang === 'bn'
                  ? 'HSC ২০২৮ ব্যাচের পূর্ণাঙ্গ ২-বছরের একাডেমিক রোডম্যাপ'
                  : 'Complete 2-Year Master Roadmap for HSC Batch 2028'}
              </span>
            </h2>

            <div className="space-y-3.5">
              {HSC28_ROADMAP.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    m.status === 'current'
                      ? isDark
                        ? 'bg-indigo-500/12 border-indigo-400/40'
                        : 'bg-indigo-50/65 border-indigo-300'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-700/80'
                      : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
                      {m.timeframe[lang]}
                    </span>
                    {m.status === 'current' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                        {lang === 'bn' ? '● চলমান ধাপ' : '● CURRENT PHASE'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {m.phase[lang]}
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80">
                    {m.goals[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`lg:col-span-5 ${cardClass} space-y-4`}>
            <h2 className="font-bold text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500" />
              <span>
                {lang === 'bn'
                  ? 'HSC ’28 একাডেমিক নির্দেশনা ও নোটিশ'
                  : 'HSC ’28 Student Advisories'}
              </span>
            </h2>

            <div className="space-y-3">
              {HSC28_NOTICES.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark
                      ? 'bg-slate-900/55 border-slate-700/80'
                      : 'bg-slate-50/75 border-slate-200/85'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-teal-600 dark:text-teal-300">
                      {n.category[lang]}
                    </span>
                    <span className="opacity-60">{n.date[lang]}</span>
                  </div>
                  <h3 className="font-bold text-sm">{n.title[lang]}</h3>
                  <p className="text-xs leading-relaxed opacity-75">
                    {n.summary[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
