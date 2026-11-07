import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Calendar,
  Search,
  Send,
  ThumbsUp,
  Plus,
  BookOpen,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  Lang,
  StudentDoubtPost,
  StudentProfile,
  SubjectKey,
  Theme,
} from '../types';
import { syncWrite, withUserSyncWriteLock } from '../lib/sync';
import {
  CONCEPT_QA_CARDS,
  HSC28_NOTICES,
  HSC28_ROADMAP,
} from '../data/hsc28EcosystemData';
import { SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { FORMULAS } from '../data/formulasData';
import { getSupabase } from '../lib/supabase';
import { formatNum, getBoardLabel } from '../lib/i18n';
import {
  loadStudentHubVoteLedger,
  STUDENT_HUB_VOTES_KEY,
  studentHubVoteOwner,
  updateStudentHubVoteLedger,
} from '../lib/studentHubVotes';

const SUBJECT_KEY_SET = new Set(SUBJECTS.map((subject) => subject.key));

function boundedText(value: unknown, max: number, fallback = ''): string {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, max)
    : fallback;
}

function boundedCount(value: unknown, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(0, Math.round(parsed))) : 0;
}

function normalizeLocalDoubts(value: unknown): StudentDoubtPost[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((candidate): StudentDoubtPost[] => {
    if (!candidate || typeof candidate !== 'object') return [];
    const post = candidate as Partial<StudentDoubtPost>;
    const id = boundedText(post.id, 100);
    const title = boundedText(post.title, 140);
    const details = boundedText(post.details, 1200);
    if (!id || !title || !details || !SUBJECT_KEY_SET.has(post.subjectKey as SubjectKey)) return [];
    const replies = Array.isArray(post.replies)
      ? post.replies.slice(0, 100).flatMap((candidateReply) => {
          if (!candidateReply || typeof candidateReply !== 'object') return [];
          const reply = candidateReply as Partial<StudentDoubtPost['replies'][number]>;
          const replyId = boundedText(reply.id, 100);
          const content = boundedText(reply.content, 1200);
          if (!replyId || !content) return [];
          return [{
            id: replyId,
            doubtId: id,
            authorName: boundedText(reply.authorName, 100, 'HSC 2028 Student'),
            collegeName: boundedText(reply.collegeName, 140),
            content,
            isHelpful: reply.isHelpful === true,
            createdAt: boundedText(reply.createdAt, 40),
          }];
        })
      : [];
    return [{
      id,
      authorName: boundedText(post.authorName, 100, 'HSC 2028 Student'),
      collegeName: boundedText(post.collegeName, 140),
      board: boundedText(post.board, 40, 'Jashore'),
      subjectKey: post.subjectKey as SubjectKey,
      title,
      details,
      upvotes: boundedCount(post.upvotes, 1_000_000),
      solved: post.solved === true,
      createdAt: boundedText(post.createdAt, 40),
      replies,
    }];
  });
}

interface StudentHubViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  isAuthenticated: boolean;
  authUserId: string | null;
  onAwardXp: (amount: number, msgBn: string, msgEn: string) => void;
  /** Optional injection keeps the private-first network boundary testable. */
  clientFactory?: typeof getSupabase;
}

export const StudentHubView: React.FC<StudentHubViewProps> = ({
  lang,
  theme,
  profile,
  isAuthenticated,
  authUserId,
  onAwardXp,
  clientFactory = getSupabase,
}) => {
  const isDark = theme === 'dark';
  const [subTab, setSubTab] = useState<'mentor' | 'forum' | 'roadmap'>('mentor');

  // 1. Smart Concept Helper State
  const [conceptQuery, setConceptQuery] = useState('');

  // 2. Peer Student Q&A State
  const [doubts, setDoubts] = useState<StudentDoubtPost[]>(() => {
    try {
      const saved = localStorage.getItem('hsc28_peer_doubts');
      return saved ? normalizeLocalDoubts(JSON.parse(saved) as unknown) : [];
    } catch {
      return [];
    }
  });
  const [forumStatus, setForumStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [forumReloadNonce, setForumReloadNonce] = useState(0);
  const loadedForumKeyRef = useRef<string | null>(null);
  const [showAskBox, setShowAskBox] = useState(false);
  const [askSubject, setAskSubject] = useState<SubjectKey>('physics1');
  const [askTitle, setAskTitle] = useState('');
  const [askDetails, setAskDetails] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  // Local vote hints are kept per account. The server ledger is authoritative
  // for signed-in students; guest/legacy votes must not block another account.
  const [upvotesByOwner, setUpvotesByOwner] = useState(loadStudentHubVoteLedger);
  const voteOwner = studentHubVoteOwner(authUserId);
  const upvotedMap = upvotesByOwner[voteOwner] || {};
  const setUpvotedMap = (
    update: (previous: Record<string, boolean>) => Record<string, boolean>
  ) => setUpvotesByOwner((previous) => updateStudentHubVoteLedger(previous, voteOwner, update));

  useEffect(() => {
    try {
      localStorage.setItem('hsc28_peer_doubts', JSON.stringify(doubts));
    } catch {
      /* storage full or blocked */
    }
  }, [doubts]);

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_HUB_VOTES_KEY, JSON.stringify(upvotesByOwner));
    } catch {
      /* storage full or blocked */
    }
  }, [upvotesByOwner]);

  // The private concept helper and roadmap do not need community data. Hydrate
  // the forum only after the student explicitly opens it, reducing cold-start
  // work and avoiding an unsolicited social comparison request.
  useEffect(() => {
    if (subTab !== 'forum') return;
    const owner = authUserId ? `user:${authUserId}` : 'guest';
    const loadKey = `${owner}:${forumReloadNonce}`;
    if (loadedForumKeyRef.current === loadKey) return;
    loadedForumKeyRef.current = loadKey;
    let cancelled = false;
    let settled = false;
    setForumStatus('loading');

    void (async () => {
      try {
        const supabase = await clientFactory();
        const { data: dRows, error: dError } = await supabase
          .from('hsc28_student_doubts')
          .select('id,author_name,college_name,board,subject_key,title,details,upvotes,solved,created_at')
          .order('created_at', { ascending: false })
          .limit(25);
        if (dError) throw dError;
        const visibleRows = Array.isArray(dRows) ? dRows.slice(0, 25) : [];
        const visibleDoubtIds = visibleRows.flatMap((row: any) => {
          const id = boundedText(row?.id, 100);
          return id ? [id] : [];
        });

        let rRows: any[] = [];
        if (visibleDoubtIds.length > 0) {
          const { data, error } = await supabase
            .from('hsc28_doubt_replies')
            .select('id,doubt_id,author_name,college_name,content,is_helpful,created_at')
            .in('doubt_id', visibleDoubtIds)
            .order('created_at', { ascending: true })
            .limit(250);
          if (error) throw error;
          rRows = data || [];
        }
        if (cancelled) return;

        if (visibleRows.length > 0) {
          const mapped: StudentDoubtPost[] = visibleRows.map((d: any, index: number) => {
            const id = boundedText(d?.id, 100, `community-doubt-${index}`);
            return {
              id,
              authorName: boundedText(d?.author_name, 100, 'HSC 2028 Student'),
              collegeName: boundedText(d?.college_name, 140),
              board: boundedText(d?.board, 40, 'Jashore'),
              subjectKey: SUBJECT_KEY_SET.has(d?.subject_key as SubjectKey)
                ? d.subject_key as SubjectKey
                : 'physics1',
              title: boundedText(d?.title, 140, 'Study question'),
              details: boundedText(d?.details, 1200, 'No details provided.'),
              upvotes: boundedCount(d?.upvotes, 1_000_000),
              solved: d?.solved === true,
              createdAt: boundedText(d?.created_at, 40),
              replies: rRows
                .filter((reply: any) => reply?.doubt_id === d?.id)
                .slice(0, 100)
                .map((reply: any, replyIndex: number) => ({
                  id: boundedText(reply?.id, 100, `${id}:reply:${replyIndex}`),
                  doubtId: id,
                  authorName: boundedText(reply?.author_name, 100, 'HSC 2028 Student'),
                  collegeName: boundedText(reply?.college_name, 140),
                  content: boundedText(reply?.content, 1200, 'No reply text.'),
                  isHelpful: reply?.is_helpful === true,
                  createdAt: boundedText(reply?.created_at, 40),
                })),
            };
          });
          // Keep offline/local-only posts while refreshing cloud-backed ones.
          setDoubts((prevLocal) => {
            const cloudIds = new Set(mapped.map((d) => d.id));
            const localOnly = prevLocal.filter((d) => !cloudIds.has(d.id));
            const merged = mapped.map((cloud) => {
              const local = prevLocal.find((d) => d.id === cloud.id);
              return local && upvotedMap[cloud.id] && local.upvotes > cloud.upvotes
                ? { ...cloud, upvotes: local.upvotes }
                : cloud;
            });
            return [...localOnly.slice(0, 75), ...merged].slice(0, 100);
          });

          if (authUserId) {
            const { data: voteRows, error: voteError } = await supabase
              .from('hsc28_doubt_votes')
              .select('doubt_id')
              .eq('user_id', authUserId)
              .in('doubt_id', visibleDoubtIds)
              .limit(25);
            if (voteError) throw voteError;
            if (!cancelled && voteRows && voteRows.length > 0) {
              setUpvotedMap((prev) => {
                const next = { ...prev };
                voteRows.forEach((vote: any) => {
                  next[vote.doubt_id] = true;
                });
                return next;
              });
            }
          }
        }
        settled = true;
        if (!cancelled) setForumStatus('ready');
      } catch {
        settled = true;
        if (!cancelled) setForumStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      // If navigation interrupted an in-flight request, allow a clean retry on
      // the next forum visit instead of leaving the screen stuck in loading.
      if (!settled && loadedForumKeyRef.current === loadKey) {
        loadedForumKeyRef.current = null;
      }
    };
  }, [subTab, authUserId, clientFactory, forumReloadNonce]);

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = askTitle.trim().slice(0, 140);
    const details = askDetails.trim().slice(0, 1200);
    if (!title || !details) return;
    const id = crypto.randomUUID();
    const newPost: StudentDoubtPost = {
      id,
      authorName: boundedText(profile.fullName, 100, 'HSC 2028 Student'),
      collegeName: boundedText(profile.collegeName, 140, 'HSC ’28 Science'),
      board: boundedText(profile.board, 40, 'Jashore'),
      subjectKey: askSubject,
      title,
      details,
      upvotes: 0,
      solved: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setDoubts((prev) => [newPost, ...prev].slice(0, 100));
    setAskTitle('');
    setAskDetails('');
    setShowAskBox(false);
    onAwardXp(10, 'প্রশ্ন পোস্ট করা হয়েছে (+১০ XP)', 'Question posted (+10 XP)');

    if (isAuthenticated && authUserId) {
      // Use an idempotent upsert through the durable queue. Supabase may return
      // an `{ error }` result without throwing; direct `insert` silently lost
      // posts in that case and could not safely replay an uncertain request.
      void syncWrite(
        {
          op: 'upsert',
          table: 'hsc28_student_doubts',
          onConflict: 'id',
          payload: {
            id,
            user_id: authUserId,
            author_name: newPost.authorName,
            college_name: newPost.collegeName,
            board: newPost.board,
            subject_key: newPost.subjectKey,
            title: newPost.title,
            details: newPost.details,
            upvotes: 0,
            solved: false,
          },
        },
        authUserId
      );
    }
  };

  const handlePostReply = async (doubtId: string) => {
    const text = (replyInputs[doubtId] || '').trim().slice(0, 1200);
    if (!text) return;
    const replyId = crypto.randomUUID();
    const replyAuthorName = boundedText(profile.fullName, 100, 'HSC 2028 Student');
    const replyCollegeName = boundedText(profile.collegeName, 140, 'HSC ’28 Batchmate');
    setDoubts((prev) =>
      prev.map((d) =>
        d.id !== doubtId
          ? d
          : {
              ...d,
              replies: [
                ...d.replies,
                {
                  id: replyId,
                  doubtId,
                  authorName: replyAuthorName,
                  collegeName: replyCollegeName,
                  content: text,
                  isHelpful: false,
                  createdAt: new Date().toISOString(),
                },
              ].slice(-100),
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
      void syncWrite(
        {
          op: 'upsert',
          table: 'hsc28_doubt_replies',
          onConflict: 'id',
          payload: {
            id: replyId,
            doubt_id: doubtId,
            user_id: authUserId,
            author_name: replyAuthorName,
            college_name: replyCollegeName,
            content: text,
            is_helpful: false,
          },
        },
        authUserId
      );
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

      <div
        data-hub-private-first="true"
        className={`rounded-xl border px-3.5 py-3 flex items-start gap-2.5 ${
          isDark ? 'bg-emerald-500/8 border-emerald-400/20 text-slate-300' : 'bg-emerald-50/60 border-emerald-200 text-slate-700'
        }`}
        role="note"
      >
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
        <p className="text-[10px] sm:text-xs leading-relaxed">
          {lang === 'bn'
            ? 'প্রাইভেট-ফার্স্ট: কনসেপ্ট সহায়ক ও রোডম্যাপ অফলাইনে চলে। শুধু “সহপাঠী ডাউট ফোরাম” খুললেই কমিউনিটি পোস্ট লোড হবে।'
            : 'Private first: the concept helper and roadmap work offline. Community posts load only after you open Peer Q&A.'}
        </p>
      </div>

      {/* Sub-navigation */}
      <div className="hub-sections flex flex-wrap gap-2" role="group" aria-label={lang === 'bn' ? 'স্টুডেন্ট হাব বিভাগ' : 'Student hub sections'}>
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
            aria-pressed={subTab === t.id}
            className={`min-h-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer transition-all ${
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
                aria-label={lang === 'bn' ? 'কনসেপ্ট বা সূত্র খুঁজুন' : 'Search concepts or formulas'}
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
                : 'Collaborate with fellow HSC 2028 Science students — earn +15 XP for contributing a reply.'}
            </p>
            <button
              onClick={() => setShowAskBox(!showAskBox)}
              className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>
                {lang === 'bn' ? 'নতুন প্রশ্ন করুন' : 'Ask Batchmates'}
              </span>
            </button>
          </div>

          {forumStatus === 'loading' && doubts.length === 0 && (
            <div className={`${cardClass} flex items-center gap-3`} role="status" aria-live="polite">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold">{lang === 'bn' ? 'সহপাঠীদের পোস্ট লোড হচ্ছে…' : 'Loading batchmate posts…'}</p>
                <p className="mt-0.5 text-[10px] opacity-65">{lang === 'bn' ? 'আপনার লোকাল প্রশ্নগুলো নিরাপদ থাকবে।' : 'Your local questions remain available.'}</p>
              </div>
            </div>
          )}

          {forumStatus === 'error' && (
            <div className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'bg-amber-500/10 border-amber-400/25' : 'bg-amber-50 border-amber-200'}`} role="status">
              <div>
                <p className="text-xs font-bold">{lang === 'bn' ? 'কমিউনিটি পোস্ট এখন আনা যায়নি' : 'Community posts are unavailable right now'}</p>
                <p className="mt-0.5 text-[10px] opacity-70">{lang === 'bn' ? 'লোকাল প্রশ্ন লেখা যাবে; সংযোগ এলে আবার চেষ্টা করুন।' : 'You can still write locally and retry when connected.'}</p>
              </div>
              <button type="button" onClick={() => setForumReloadNonce((value) => value + 1)} className="min-h-11 px-3 rounded-xl border border-amber-400/40 text-xs font-bold inline-flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'আবার চেষ্টা' : 'Retry'}
              </button>
            </div>
          )}

          {forumStatus === 'ready' && doubts.length === 0 && !showAskBox && (
            <div data-forum-empty="true" className={`${cardClass} text-center`} role="status">
              <MessageSquare className="w-6 h-6 mx-auto text-indigo-500" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-extrabold">{lang === 'bn' ? 'এখনো কোনো প্রশ্ন নেই—স্ক্রিনটি খালি নয়' : 'No questions yet—but this space is still useful'}</h3>
              <p className="mt-1 text-xs opacity-70 max-w-xl mx-auto">
                {lang === 'bn'
                  ? 'কোথায় আটকে গেছেন, কী চেষ্টা করেছেন, আর ঠিক কোন ধাপটি বুঝছেন না—এই তিনটি লিখে প্রথম পরিষ্কার প্রশ্নটি করুন।'
                  : 'Write where you are stuck, what you tried, and the exact step that is unclear to ask the first focused question.'}
              </p>
              <button type="button" onClick={() => setShowAskBox(true)} className="mt-3 min-h-11 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                {lang === 'bn' ? 'প্রথম প্রশ্নটি গুছিয়ে লিখুন' : 'Draft the first question'}
              </button>
            </div>
          )}

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
                  aria-label={lang === 'bn' ? 'প্রশ্নের বিষয়' : 'Question subject'}
                  onChange={(e) => setAskSubject(e.target.value as SubjectKey)}
                  className={`min-h-11 px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
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
                  maxLength={140}
                  aria-label={lang === 'bn' ? 'প্রশ্নের শিরোনাম' : 'Question title'}
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'প্রশ্নের মূল শিরোনাম...'
                      : 'Short question title...'
                  }
                  className={`min-h-11 sm:col-span-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <textarea
                rows={3}
                required
                maxLength={1200}
                aria-label={lang === 'bn' ? 'প্রশ্নের বিস্তারিত' : 'Question details'}
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
                  className="min-h-11 px-3.5 py-1.5 rounded-lg text-xs opacity-70 cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="min-h-11 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
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
                            const client = await clientFactory();
                            const { data, error } = await withUserSyncWriteLock(authUserId, async () =>
                              await client.rpc(
                                'hsc28_upvote_doubt',
                                { p_doubt_id: d.id }
                              )
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
                      className={`min-w-11 min-h-11 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
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
                              ? 'bg-slate-900/50 border-slate-700/70'
                              : 'bg-slate-50/70 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            <MessageSquare className="w-3.5 h-3.5" />
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
                      maxLength={1200}
                      aria-label={lang === 'bn' ? `${d.title}-এর উত্তর` : `Reply to ${d.title}`}
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
                      className={`min-h-11 flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none ${
                        isDark
                          ? 'bg-slate-900/65 border-slate-700 text-slate-100 focus:border-indigo-400'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handlePostReply(d.id)}
                      className="min-h-11 px-3.5 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
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
