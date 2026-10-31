import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HeartPulse,
  CalendarClock,
  Compass,
  Brain,
  Check,
  Plus,
  Trash2,
  Flame,
  Droplets,
  Moon,
  Footprints,
  BookOpenCheck,
  Wind,
  Smartphone,
  ListChecks,
  ArrowRight,
  Sparkles,
  AlarmClock,
  GraduationCap,
  Stethoscope,
  Building2,
  Landmark,
  Code2,
  Plane,
  Quote,
  ChevronDown,
  Pause,
  Play,
  CalendarDays,
  Target,
  CloudUpload,
  CloudOff,
  Loader2,
  MapPin,
  Clock,
  School,
  AlertTriangle,
} from 'lucide-react';
import type {
  ActiveTab,
  Lang,
  StudentProfile,
  SubjectKey,
  Theme,
} from '../types';
import { formatNum } from '../lib/i18n';
import { SUBJECTS, getSubjectByKey } from '../data/syllabusData';
import { getSupabase } from '../lib/supabase';
import { syncWrite } from '../lib/sync';
import {
  HABIT_TARGET,
  LIFE_DATA_EVENT,
  attendanceForMonth,
  habitStreak,
  daysUntil,
  lastNDays,
  loadLifeData,
  localDateKey,
  normalizeLifeData,
  saveLifeData,
  subjectResultAverages,
  type AttendanceStatus,
  type DeadlineCategory,
  type DeadlineItem,
  type ExamItem,
  type ExamResult,
  type LifeData,
  type RoutineSlot,
} from '../lib/lifeStore';
import { ReminderCard } from './ReminderCard';

interface LifeHubViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  /** Signed-in student, or null in guest/local-only mode. */
  authUserId?: string | null;
  onNavigate: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
  onAwardXp: (points: number, msgBn: string, msgEn: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Persistence is shared with the weekly review — see lib/lifeStore    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const HABITS = [
  { id: 'sleep', bn: '৭–৮ ঘণ্টা ঘুম', en: '7–8 hrs sleep', icon: Moon, tone: 'indigo' },
  { id: 'water', bn: '৮ গ্লাস পানি', en: '8 glasses of water', icon: Droplets, tone: 'cyan' },
  { id: 'move', bn: '২০ মিনিট হাঁটা / ব্যায়াম', en: '20 min walk / exercise', icon: Footprints, tone: 'emerald' },
  { id: 'revision', bn: 'আজকের রিভিশন', en: "Today's revision", icon: BookOpenCheck, tone: 'amber' },
  { id: 'calm', bn: 'নামাজ / ধ্যান / ৫ মিনিট শ্বাস', en: 'Prayer / meditation / 5 min breathing', icon: Wind, tone: 'violet' },
  { id: 'focus', bn: 'সোশ্যাল মিডিয়া ১ ঘণ্টার কম', en: 'Social media under 1 hour', icon: Smartphone, tone: 'rose' },
  { id: 'plan', bn: 'কালকের প্ল্যান লিখে রাখা', en: "Tomorrow's plan written down", icon: ListChecks, tone: 'sky' },
] as const;

/**
 * Bangladeshi academic week runs Saturday → Friday. `js` is the value returned
 * by `Date#getDay()`, so "today" can be highlighted without conversion tables.
 */
const WEEK_DAYS = [
  { js: 6, bn: 'শনিবার', shortBn: 'শনি', en: 'Saturday', shortEn: 'Sat' },
  { js: 0, bn: 'রবিবার', shortBn: 'রবি', en: 'Sunday', shortEn: 'Sun' },
  { js: 1, bn: 'সোমবার', shortBn: 'সোম', en: 'Monday', shortEn: 'Mon' },
  { js: 2, bn: 'মঙ্গলবার', shortBn: 'মঙ্গল', en: 'Tuesday', shortEn: 'Tue' },
  { js: 3, bn: 'বুধবার', shortBn: 'বুধ', en: 'Wednesday', shortEn: 'Wed' },
  { js: 4, bn: 'বৃহস্পতিবার', shortBn: 'বৃহঃ', en: 'Thursday', shortEn: 'Thu' },
  { js: 5, bn: 'শুক্রবার', shortBn: 'শুক্র', en: 'Friday', shortEn: 'Fri' },
];

const ATTENDANCE_META: Record<
  AttendanceStatus,
  { bn: string; en: string; dot: string; active: string }
> = {
  present: {
    bn: 'উপস্থিত',
    en: 'Present',
    dot: 'bg-emerald-500',
    active: 'bg-emerald-600 text-white border-emerald-600',
  },
  late: {
    bn: 'দেরি',
    en: 'Late',
    dot: 'bg-amber-400',
    active: 'bg-amber-500 text-white border-amber-500',
  },
  absent: {
    bn: 'অনুপস্থিত',
    en: 'Absent',
    dot: 'bg-rose-500',
    active: 'bg-rose-600 text-white border-rose-600',
  },
  leave: {
    bn: 'ছুটি',
    en: 'Leave',
    dot: 'bg-slate-400',
    active: 'bg-slate-600 text-white border-slate-600',
  },
};

const DEADLINE_META: Record<DeadlineCategory, { bn: string; en: string; tone: string }> = {
  admission: { bn: 'ভর্তি', en: 'Admission', tone: 'indigo' },
  scholarship: { bn: 'বৃত্তি', en: 'Scholarship', tone: 'emerald' },
  exam: { bn: 'পরীক্ষা', en: 'Exam', tone: 'rose' },
  fee: { bn: 'ফি / ফর্ম', en: 'Fee / Form', tone: 'amber' },
  other: { bn: 'অন্যান্য', en: 'Other', tone: 'slate' },
};

const CAREER_PATHS: {
  id: string;
  bn: string;
  en: string;
  icon: React.ElementType;
  tone: string;
  summaryBn: string;
  summaryEn: string;
  focusBn: string;
  focusEn: string;
  stepsBn: string[];
  stepsEn: string[];
  goTo?: ActiveTab;
}[] = [
  {
    id: 'buet',
    bn: 'BUET / ইঞ্জিনিয়ারিং',
    en: 'BUET / Engineering',
    icon: Building2,
    tone: 'indigo',
    summaryBn: 'গণিত-পদার্থে গভীরতা, লিখিত পরীক্ষায় গাণিতিক গতি ও নির্ভুলতা।',
    summaryEn: 'Depth in math & physics, speed and accuracy in the written test.',
    focusBn: 'উচ্চতর গণিত ১ম ও ২য় • পদার্থবিজ্ঞান ১ম ও ২য় • রসায়ন',
    focusEn: 'Higher Math 1 & 2 • Physics 1 & 2 • Chemistry',
    stepsBn: [
      'একাদশেই প্রতিদিন ২টি গাণিতিক সমস্যা — ক্যালকুলেটর ছাড়া।',
      'প্রতি অধ্যায় শেষে বোর্ড প্রশ্নের সময় ধরে সেট সলভ।',
      'দ্বাদশের শুরুতে সাপ্তাহিক লিখিত মক টেস্ট শুরু করুন।',
    ],
    stepsEn: [
      'Two math problems a day in year 1 — without a calculator.',
      'Timed board question sets after each chapter.',
      'Start weekly written mock tests at the beginning of year 2.',
    ],
    goTo: 'admission',
  },
  {
    id: 'medical',
    bn: 'মেডিকেল / ডেন্টাল',
    en: 'Medical / Dental',
    icon: Stethoscope,
    tone: 'rose',
    summaryBn: 'জীববিজ্ঞানে মুখস্থ-বোঝার ভারসাম্য এবং দ্রুত MCQ নিশ্চিততা।',
    summaryEn: 'A balance of memorising and understanding in biology plus fast MCQ recall.',
    focusBn: 'জীববিজ্ঞান ১ম ও ২য় • রসায়ন • পদার্থবিজ্ঞান (MCQ-কেন্দ্রিক)',
    focusEn: 'Biology 1 & 2 • Chemistry • Physics (MCQ driven)',
    stepsBn: [
      'প্রতিদিন ১টি অধ্যায়ের চিত্র ও শব্দার্থ রিভিশন।',
      'MCQ মিস্টেক ব্যাংক সপ্তাহে একবার পুরোটা আবার দিন।',
      'প্রতিটি ভুলের কারণ লিখে রাখুন — উত্তর শুধু নয়।',
    ],
    stepsEn: [
      'Revise diagrams and terminology of one chapter daily.',
      'Re-run the whole MCQ mistake bank once a week.',
      'Write down why each mistake happened, not just the answer.',
    ],
    goTo: 'mcq',
  },
  {
    id: 'du',
    bn: 'ঢাবি "ক" ইউনিট / বিজ্ঞান শাখা',
    en: 'DU "Ka" Unit / Science',
    icon: GraduationCap,
    tone: 'violet',
    summaryBn: 'একক প্রশ্নে গতি, নেগেটিভ মার্কিং সামলানো ও ধারণার স্বচ্ছতা।',
    summaryEn: 'Speed on unit questions, managing negative marking and clear concepts.',
    focusBn: 'পদার্থ • রসায়ন • গণিত • জীববিজ্ঞান (শাখা অনুযায়ী)',
    focusEn: 'Physics • Chemistry • Math • Biology (per branch)',
    stepsBn: [
      'সপ্তাহে ২টি ফুল মক দিয়ে নিজের গতি মাপুন।',
      'যে ২টি টপিকে বারবার ভুল হয়, সেগুলোর জন্য আলাদা খাতা।',
      'সূত্র ভল্টের SRS কার্ড রোজ ১০ মিনিট রিভিশন করুন।',
    ],
    stepsEn: [
      'Measure your pace with two full mocks a week.',
      'Keep a separate notebook for the two topics you miss most.',
      'Revise 10 minutes of SRS flashcards from the Formula Vault daily.',
    ],
    goTo: 'formulas',
  },
  {
    id: 'gst',
    bn: 'GST ক্লাস্টার / সাধারণ ভর্তি',
    en: 'GST Cluster / General Admission',
    icon: Landmark,
    tone: 'emerald',
    summaryBn: 'একই প্রস্তুতিতে একাধিক বিশ্ববিদ্যালয় — সিলেবাস মিলিয়ে পড়া।',
    summaryEn: 'One preparation for many universities — study the overlapping syllabus.',
    focusBn: 'HSC মূল সিলেবাস + সাধারণ জ্ঞান ও বাংলা-ইংরেজি',
    focusEn: 'HSC core syllabus + general knowledge, Bangla & English',
    stepsBn: [
      'কমন অংশগুলো আগে শেষ করুন, তারপর ক্লাস্টার-নির্দিষ্ট অংশ।',
      'প্রতি বিশ্ববিদ্যালয়ের প্যাটার্ন আলাদা খাতায় লিখে রাখুন।',
      'ভর্তি ডেডলাইন ট্র্যাকারে সব ফর্মের তারিখ যোগ করুন।',
    ],
    stepsEn: [
      'Finish overlapping topics first, then cluster-specific ones.',
      'Note each university’s pattern in a separate notebook.',
      'Add every application date to the deadline tracker.',
    ],
    goTo: 'admission',
  },
  {
    id: 'bcs',
    bn: 'BCS / সরকারি চাকরি',
    en: 'BCS / Government Jobs',
    icon: Landmark,
    tone: 'amber',
    summaryBn: 'দীর্ঘমেয়াদি লক্ষ্য — HSC থেকেই সাধারণ জ্ঞান ও বাংলা-ইংরেজি শক্তি।',
    summaryEn: 'A long-term goal — build general knowledge and Bangla/English strength from HSC.',
    focusBn: 'বাংলা • ইংরেজি • সাধারণ জ্ঞান • গণিত',
    focusEn: 'Bangla • English • General knowledge • Math',
    stepsBn: [
      'প্রতিদিন ১০ মিনিট সংবাদ ও একটি নতুন শব্দ শিখুন।',
      'বাংলা ও ইংরেজি রচনা-অনুচ্ছেদ নিয়মিত লিখুন।',
      'স্নাতক পর্যায়ে বিষয়ভিত্তিক প্রস্তুতি শুরু করুন।',
    ],
    stepsEn: [
      'Read news 10 minutes and learn one new word daily.',
      'Write Bangla and English essays regularly.',
      'Start subject-specific preparation at undergraduate level.',
    ],
    goTo: 'practical',
  },
  {
    id: 'skills',
    bn: 'স্কিল / ফ্রিল্যান্সিং',
    en: 'Skills / Freelancing',
    icon: Code2,
    tone: 'sky',
    summaryBn: 'পড়াশোনার পাশাপাশি একটি বাস্তব স্কিল — প্রোগ্রামিং, ডিজাইন বা লেখালেখি।',
    summaryEn: 'A practical skill alongside studies — programming, design or writing.',
    focusBn: 'সপ্তাহে ৪ ঘণ্টা স্কিল প্র্যাকটিস (পড়ার সময় কমানো যাবে না)',
    focusEn: '4 hours of skill practice a week (never at the cost of study time)',
    stepsBn: [
      'একটি স্কিল বেছে নিন, ৩ মাসের ছোট লক্ষ্য ভাগ করুন।',
      'ছোট প্রজেক্ট তৈরি করে পোর্টফোলিও শুরু করুন।',
      'পরীক্ষার আগে স্কিল প্র্যাকটিস কমিয়ে দিন — পড়া আগে।',
    ],
    stepsEn: [
      'Pick one skill and split it into 3-month goals.',
      'Build small projects to start a portfolio.',
      'Slow down skill practice before exams — study comes first.',
    ],
  },
  {
    id: 'abroad',
    bn: 'বিদেশে উচ্চশিক্ষা',
    en: 'Study Abroad',
    icon: Plane,
    tone: 'cyan',
    summaryBn: 'HSC ফল + SAT/IELTS + স্কলারশিপ — ৩ বছরেই প্রস্তুতি সম্ভব।',
    summaryEn: 'HSC results + SAT/IELTS + scholarships — preparable within 3 years.',
    focusBn: 'ইংরেজি ভিত্তি • SAT Math • স্কুলের ফল',
    focusEn: 'English foundation • SAT Math • school results',
    stepsBn: [
      'শুরুতেই IELTS/SAT-এর জন্য ইংরেজি ভিত্তি মজবুত করুন।',
      'HSC-র ফল ভালো রাখুন — এটাই সবচেয়ে বড় যোগ্যতা।',
      'দ্বাদশে স্কলারশিপ ডেডলাইন ট্র্যাকারে তারিখ যোগ করুন।',
    ],
    stepsEn: [
      'Build an English base for IELTS/SAT early on.',
      'Keep HSC results strong — that is the biggest qualification.',
      'Add scholarship deadlines to the tracker in year 2.',
    ],
    goTo: 'life',
  },
];

const EXAM_CHECKLIST = [
  { id: 'admit', bn: 'প্রবেশপত্র প্রিন্ট করা', en: 'Admit card printed' },
  { id: 'reg', bn: 'রেজিস্ট্রেশন কার্ড প্রস্তুত', en: 'Registration card ready' },
  { id: 'pen', bn: 'কালো বলপেন ২টি', en: 'Two black ballpoint pens' },
  { id: 'pencil', bn: 'পেন্সিল, ইরেজার, স্কেল', en: 'Pencil, eraser, ruler' },
  { id: 'watch', bn: 'হাতঘড়ি (স্মার্ট নয়)', en: 'Wrist watch (not smart)' },
  { id: 'water', bn: 'স্বচ্ছ পানির বোতল', en: 'Transparent water bottle' },
  { id: 'sleep', bn: 'আগের রাতে ৭+ ঘণ্টা ঘুম', en: '7+ hours sleep the night before' },
  { id: 'reach', bn: '৩০ মিনিট আগে কেন্দ্রে পৌঁছানো', en: 'Reach centre 30 min early' },
];

const QUOTES = [
  {
    bn: 'প্রতিদিনের ছোট ছোট অধ্যায়গুলোই একদিন পরীক্ষার হলে বড় পার্থক্য তৈরি করে।',
    en: 'Small daily chapters are what make the big difference in the exam hall one day.',
  },
  {
    bn: 'তুলনা করুন গতকালের নিজের সাথে, পাশের বেঞ্চের কারো সাথে নয়।',
    en: 'Compare yourself with yesterday’s you, not with the person on the next bench.',
  },
  {
    bn: 'যে বিষয়টি কঠিন লাগছে, সেটাই এখন সবচেয়ে বেশি মনোযোগ দরকার।',
    en: 'The topic that feels hardest right now needs your attention the most.',
  },
  {
    bn: 'বিশ্রাম নেওয়াও পড়ার অংশ — ক্লান্ত মস্তিষ্ক নতুন কিছু ধরে না।',
    en: 'Rest is part of studying — a tired brain cannot absorb anything new.',
  },
  {
    bn: 'আজ যা ৩০ মিনিটে পারছেন না, সপ্তাহে তিনবার করতে করতে পারবেন।',
    en: 'What takes you 30 minutes today becomes easy after three attempts a week.',
  },
];

const STRESS_TIPS = [
  {
    bn: 'পরীক্ষার আগে ভয় পেলে ৪ সেকেন্ড শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন, ৮ সেকেন্ডে ছাড়ুন।',
    en: 'If panic hits before an exam: breathe in 4 seconds, hold 7, breathe out 8.',
  },
  {
    bn: 'একসাথে ১১ পত্রের কথা ভাববেন না — আজ শুধু একটি অধ্যায়।',
    en: 'Do not think of 11 papers at once — only one chapter today.',
  },
  {
    bn: 'ঘুম কম হলে যা পড়েছেন তাও মনে থাকবে না; ৭ ঘণ্টা ঘুমকে টার্গেট করুন।',
    en: 'With too little sleep you forget what you studied; target 7 hours.',
  },
  {
    bn: 'সপ্তাহে একদিন সম্পূর্ণ বিশ্রাম — এতে মনোযোগ বাড়ে, কমে না।',
    en: 'One fully rested day a week increases focus, it does not reduce it.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Section = 'today' | 'deadlines' | 'exams' | 'routine' | 'career' | 'mind';

export const LifeHubView: React.FC<LifeHubViewProps> = ({
  lang,
  theme,
  profile,
  authUserId = null,
  onNavigate,
  onAwardXp,
}) => {
  const bn = lang === 'bn';
  const isDark = theme === 'dark';
  const today = localDateKey();

  const [data, setData] = useState<LifeData>(() => loadLifeData());
  const [section, setSection] = useState<Section>('today');
  /** Tracks whether the cloud copy is reachable, so the header can be honest. */
  const [cloudState, setCloudState] = useState<'guest' | 'loading' | 'synced' | 'local' | 'error'>(
    authUserId ? 'loading' : 'guest'
  );
  const [openCareer, setOpenCareer] = useState<string | null>('buet');
  const [quoteIndex, setQuoteIndex] = useState(() => new Date().getDate() % QUOTES.length);

  // Deadline form
  const [dTitle, setDTitle] = useState('');
  const [dDate, setDDate] = useState('');
  const [dCategory, setDCategory] = useState<DeadlineCategory>('admission');

  // Exam form
  const [eTitle, setETitle] = useState('');
  const [eDate, setEDate] = useState('');
  const [eTime, setETime] = useState('');

  // Routine form
  const [routineDay, setRoutineDay] = useState<number>(new Date().getDay());
  const [rSubject, setRSubject] = useState('');
  const [rStart, setRStart] = useState('');
  const [rEnd, setREnd] = useState('');
  const [rRoom, setRRoom] = useState('');

  // Result form
  const [resTitle, setResTitle] = useState('');
  const [resSubject, setResSubject] = useState<SubjectKey | 'all'>('all');
  const [resObtained, setResObtained] = useState('');
  const [resTotal, setResTotal] = useState('');
  const [resDate, setResDate] = useState('');

  // Breathing exercise — kept in one object so a tick is a single atomic update
  // (pure updater, so React StrictMode's double-invoke cannot double-count).
  const [breathing, setBreathing] = useState(false);
  const [breath, setBreath] = useState<{ phase: 'in' | 'hold' | 'out'; left: number; cycles: number }>(
    { phase: 'in', left: 4, cycles: 0 }
  );

  useEffect(() => {
    saveLifeData(data);
  }, [data]);

  // Re-read when a backup is imported from the Analytics screen.
  useEffect(() => {
    const reload = () => setData(loadLifeData());
    window.addEventListener(LIFE_DATA_EVENT, reload);
    return () => window.removeEventListener(LIFE_DATA_EVENT, reload);
  }, []);

  /**
   * Sign-in reconciliation.
   *
   * Guests collect habits/deadlines on the device; when they create an account
   * the local document is uploaded once. On later devices whichever copy was
   * edited more recently wins, so nothing is silently overwritten.
   */
  const lastPushedRef = useRef('');

  useEffect(() => {
    if (!authUserId) {
      setCloudState('guest');
      return;
    }

    let cancelled = false;
    setCloudState('loading');

    void (async () => {
      try {
        const sb = await getSupabase();
        const { data: row, error } = await sb
          .from('hsc28_life_data')
          .select('data, updated_at')
          .eq('user_id', authUserId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // 42P01 = table missing (migration not applied). Stay local instead of
          // flagging every keystroke as a failed sync in the navbar.
          setCloudState((error as { code?: string }).code === '42P01' ? 'local' : 'error');
          return;
        }

        const local = loadLifeData();
        const remote = row?.data ? normalizeLifeData(row.data) : null;
        const remoteTime = remote?.updatedAt ? Date.parse(remote.updatedAt) || 0 : 0;
        const localTime = local.updatedAt ? Date.parse(local.updatedAt) || 0 : 0;

        if (remote && remoteTime > localTime) {
          lastPushedRef.current = remote.updatedAt;
          setData(remote);
        } else if (!remote || localTime > remoteTime) {
          await syncWrite(
            {
              op: 'upsert',
              table: 'hsc28_life_data',
              onConflict: 'user_id',
              payload: {
                user_id: authUserId,
                data: local,
                updated_at: new Date().toISOString(),
              },
            },
            authUserId
          );
          lastPushedRef.current = local.updatedAt;
        }

        if (!cancelled) setCloudState('synced');
      } catch {
        if (!cancelled) setCloudState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUserId]);

  // Debounced upload: a burst of habit ticks becomes one write.
  useEffect(() => {
    if (!authUserId || cloudState !== 'synced') return;
    if (!data.updatedAt || data.updatedAt === lastPushedRef.current) return;

    const timer = window.setTimeout(() => {
      lastPushedRef.current = data.updatedAt;
      void syncWrite(
        {
          op: 'upsert',
          table: 'hsc28_life_data',
          onConflict: 'user_id',
          payload: {
            user_id: authUserId,
            data,
            updated_at: new Date().toISOString(),
          },
        },
        authUserId
      );
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [data, authUserId, cloudState]);

  /** Every mutation stamps `updatedAt`, which decides who wins on sign-in. */
  const patch = useCallback((updater: (prev: LifeData) => LifeData) => {
    setData((prev) => ({ ...updater(prev), updatedAt: new Date().toISOString() }));
  }, []);

  const todayHabits = data.habits[today] ?? [];

  const toggleHabit = (habitId: string) => {
    patch((prev) => {
      const current = prev.habits[today] ?? [];
      const next = current.includes(habitId)
        ? current.filter((id) => id !== habitId)
        : [...current, habitId];
      return { ...prev, habits: { ...prev.habits, [today]: next } };
    });
  };

  // Award XP once per day when every habit is ticked.
  const xpGuard = useRef(false);
  useEffect(() => {
    if (todayHabits.length < HABITS.length) return;
    if (data.xpAwardedOn.includes(today) || xpGuard.current) return;
    xpGuard.current = true;
    patch((prev) => ({ ...prev, xpAwardedOn: [...prev.xpAwardedOn, today] }));
    onAwardXp(
      25,
      'আজকের সব অভ্যাস সম্পন্ন! (+২৫ XP)',
      'All of today’s habits complete! (+25 XP)'
    );
  }, [todayHabits.length, data.xpAwardedOn, today, onAwardXp, patch]);

  const streak = useMemo(() => {
    let count = 0;
    // Today only counts once the target is met; until then the streak is measured
    // up to yesterday so opening the app in the morning never shows "0 days".
    const start = (data.habits[today] ?? []).length >= HABIT_TARGET ? 0 : 1;
    for (let i = start; i < 400; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const done = (data.habits[localDateKey(d)] ?? []).length;
      if (done >= HABIT_TARGET) count++;
      else break;
    }
    return count;
  }, [data.habits, today]);

  const week = useMemo(() => lastNDays(7), []);

  /** This month's college attendance: present + late count as attended. */
  const attendanceMonth = useMemo(() => {
    const summary = attendanceForMonth(data.attendance);
    const [year, month] = summary.monthPrefix.split('-').map(Number);
    return {
      ...summary,
      monthLabel: new Date(year, month - 1, 1).toLocaleDateString(bn ? 'bn-BD' : 'en-GB', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [data.attendance, bn]);

  const weakestSubject = useMemo(() => {
    const ranked = subjectResultAverages(data.results);
    return ranked.length > 0 && ranked[0].avg < 75 ? ranked[0] : null;
  }, [data.results]);

  /**
   * 75% eligibility maths: with `a` attended out of `t` marked classes,
   * attending `x` more brings the ratio to (a+x)/(t+x). Solving for 0.75
   * gives the number of classes needed — or how many can still be missed.
   */
  const attendanceProjection = useMemo(() => {
    const { attended, marked } = attendanceMonth;
    if (marked === 0) return { above: false, needed: 0, affordable: 0 };
    const needed = Math.ceil(Math.max(0, (0.75 * marked - attended) / 0.25));
    const affordable = Math.floor(Math.max(0, (attended - 0.75 * marked) / 0.75));
    return { above: attended >= 0.75 * marked, needed, affordable };
  }, [attendanceMonth]);

  const resultStats = useMemo(() => {
    const list = [...data.results].sort((a, b) => b.date.localeCompare(a.date));
    const pcts = list.filter((r) => r.total > 0).map((r) => (r.obtained / r.total) * 100);
    const average = pcts.length
      ? Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length)
      : 0;
    return { list, average, best: pcts.length ? Math.round(Math.max(...pcts)) : 0 };
  }, [data.results]);

  const todayClasses = useMemo(
    () =>
      [...data.routine]
        .filter((slot) => slot.day === new Date().getDay())
        .sort((a, b) => a.start.localeCompare(b.start)),
    [data.routine]
  );

  const routineForDay = useMemo(
    () =>
      [...data.routine]
        .filter((slot) => slot.day === routineDay)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [data.routine, routineDay]
  );

  const activeDeadlines = useMemo(
    () =>
      [...data.deadlines]
        .filter((d) => !d.done)
        .sort((a, b) => daysUntil(a.date) - daysUntil(b.date)),
    [data.deadlines]
  );

  const nextExam = useMemo(
    () =>
      [...data.exams]
        .filter((e) => daysUntil(e.date) >= 0)
        .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0],
    [data.exams]
  );

  const nextDeadline = activeDeadlines[0];

  // Breathing timer: 4 s in, 7 s hold, 8 s out.
  useEffect(() => {
    if (!breathing) return;
    const id = window.setInterval(() => {
      setBreath((prev) => {
        if (prev.left > 1) return { ...prev, left: prev.left - 1 };
        if (prev.phase === 'in') return { phase: 'hold', left: 7, cycles: prev.cycles };
        if (prev.phase === 'hold') return { phase: 'out', left: 8, cycles: prev.cycles };
        return { phase: 'in', left: 4, cycles: prev.cycles + 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [breathing]);

  const startBreathing = () => {
    setBreath({ phase: 'in', left: 4, cycles: 0 });
    setBreathing(true);
  };

  const stopBreathing = () => {
    setBreathing(false);
    setBreath({ phase: 'in', left: 4, cycles: 0 });
  };

  const addDeadline = () => {
    if (!dTitle.trim() || !dDate) return;
    const item: DeadlineItem = {
      id: crypto.randomUUID(),
      title: dTitle.trim(),
      date: dDate,
      category: dCategory,
      note: '',
      done: false,
    };
    patch((prev) => ({ ...prev, deadlines: [item, ...prev.deadlines] }));
    setDTitle('');
    setDDate('');
  };

  const addResult = () => {
    const obtained = Number(resObtained);
    const total = Number(resTotal);
    if (!resTitle.trim() || !Number.isFinite(obtained) || !Number.isFinite(total) || total <= 0) {
      return;
    }
    const item: ExamResult = {
      id: crypto.randomUUID(),
      title: resTitle.trim(),
      subject:
        resSubject === 'all'
          ? ''
          : getSubjectByKey(resSubject)?.shortName[bn ? 'bn' : 'en'] ?? '',
      subjectKey: resSubject,
      obtained: Math.max(0, Math.min(obtained, total)),
      total,
      date: resDate || localDateKey(),
    };
    patch((prev) => ({ ...prev, results: [item, ...prev.results] }));
    setResTitle('');
    setResSubject('all');
    setResObtained('');
    setResTotal('');
    setResDate('');
  };

  const addRoutineSlot = () => {
    if (!rSubject.trim() || !rStart || !rEnd) return;
    const slot: RoutineSlot = {
      id: crypto.randomUUID(),
      day: routineDay,
      start: rStart,
      end: rEnd,
      subject: rSubject.trim(),
      room: rRoom.trim(),
    };
    patch((prev) => ({
      ...prev,
      routine: [...prev.routine, slot].sort((a, b) => a.start.localeCompare(b.start)),
    }));
    setRSubject('');
    setRStart('');
    setREnd('');
    setRRoom('');
  };

  const addExam = () => {
    if (!eTitle.trim() || !eDate) return;
    const item: ExamItem = {
      id: crypto.randomUUID(),
      title: eTitle.trim(),
      date: eDate,
      time: eTime,
      subjectKey: 'all',
    };
    patch((prev) => ({ ...prev, exams: [item, ...prev.exams] }));
    setETitle('');
    setEDate('');
    setETime('');
  };

  /* ---------- theme tokens ---------- */
  const card = `rounded-2xl border transition-colors ${
    isDark ? 'bg-slate-900/55 border-slate-800' : 'bg-white/85 border-slate-200/85 card-soft-light'
  }`;
  const sub = isDark ? 'text-slate-400' : 'text-slate-500';
  const head = isDark ? 'text-slate-100' : 'text-slate-900';
  const field = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors ${
    isDark
      ? 'bg-slate-800/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400'
  }`;

  const sections: { id: Section; bn: string; en: string; icon: React.ElementType }[] = [
    { id: 'today', bn: 'আজকের অভ্যাস', en: 'Daily habits', icon: HeartPulse },
    { id: 'deadlines', bn: 'ডেডলাইন', en: 'Deadlines', icon: CalendarClock },
    { id: 'exams', bn: 'পরীক্ষা রুটিন', en: 'Exam routine', icon: AlarmClock },
    { id: 'routine', bn: 'ক্লাস রুটিন', en: 'Class routine', icon: School },
    { id: 'career', bn: 'ক্যারিয়ার পথ', en: 'Career paths', icon: Compass },
    { id: 'mind', bn: 'মনোবল', en: 'Mind & focus', icon: Brain },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <header
        className={`rounded-2xl border p-4 sm:p-6 ${
          isDark
            ? 'border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-indigo-950/40'
            : 'border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-emerald-50/40 card-soft-light'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${head}`}>
              {bn ? 'লাইফ হাব — পুরো ছাত্রজীবনের সাথী' : 'Life Hub — with you through student life'}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${sub}`}>
              {bn
                ? 'ঘুম, অভ্যাস, ডেডলাইন, পরীক্ষা আর ক্যারিয়ার — HSC থেকে অ্যাডমিশন পর্যন্ত সব এক জায়গায়।'
                : 'Sleep, habits, deadlines, exams and careers — everything from HSC to admission in one place.'}
            </p>

            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                cloudState === 'synced'
                  ? isDark
                    ? 'border-emerald-400/25 bg-emerald-500/12 text-emerald-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : cloudState === 'loading'
                  ? isDark
                    ? 'border-indigo-400/25 bg-indigo-500/12 text-indigo-300'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : isDark
                  ? 'border-slate-700 bg-slate-800/70 text-slate-300'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {cloudState === 'loading' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : cloudState === 'synced' ? (
                <CloudUpload className="w-3 h-3" />
              ) : (
                <CloudOff className="w-3 h-3" />
              )}
              {cloudState === 'synced'
                ? bn
                  ? 'ক্লাউডে সংরক্ষিত'
                  : 'Synced to cloud'
                : cloudState === 'loading'
                ? bn
                  ? 'সিঙ্ক হচ্ছে…'
                  : 'Syncing…'
                : cloudState === 'error'
                ? bn
                  ? 'সিঙ্ক সমস্যা — ডিভাইসে সংরক্ষিত'
                  : 'Sync issue — saved on device'
                : bn
                ? 'শুধু এই ডিভাইসে'
                : 'Device only'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          <StatTile
            isDark={isDark}
            icon={Flame}
            tone="amber"
            label={bn ? 'অভ্যাস স্ট্রিক' : 'Habit streak'}
            value={bn ? `${formatNum(streak, lang)} দিন` : `${streak} days`}
          />
          <StatTile
            isDark={isDark}
            icon={Check}
            tone="emerald"
            label={bn ? 'আজকের অভ্যাস' : "Today's habits"}
            value={`${formatNum(todayHabits.length, lang)}/${formatNum(HABITS.length, lang)}`}
          />
          <StatTile
            isDark={isDark}
            icon={CalendarClock}
            tone="indigo"
            label={bn ? 'পরবর্তী ডেডলাইন' : 'Next deadline'}
            value={
              nextDeadline
                ? `${formatNum(Math.max(0, daysUntil(nextDeadline.date)), lang)} ${bn ? 'দিন' : 'days'}`
                : bn
                ? 'নেই'
                : 'None'
            }
          />
          <StatTile
            isDark={isDark}
            icon={GraduationCap}
            tone="rose"
            label={bn ? 'পরবর্তী পরীক্ষা' : 'Next exam'}
            value={
              nextExam
                ? `${formatNum(Math.max(0, daysUntil(nextExam.date)), lang)} ${bn ? 'দিন' : 'days'}`
                : bn
                ? 'নেই'
                : 'None'
            }
          />
        </div>
      </header>

      {/* Section switcher — a 3×2 grid on phones so every section is visible
          without a horizontal swipe; a single row from small screens up. */}
      <div className="sm:overflow-x-auto sm:no-scrollbar">
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:w-max">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold border shrink-0 transition-colors ${
                  active
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                      : 'bg-indigo-600 text-white border-indigo-600'
                    : isDark
                    ? 'bg-slate-800/50 text-slate-300 border-slate-700/70 hover:border-slate-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{bn ? s.bn : s.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------- Today -------------------- */}
      {section === 'today' && (
        <div className="space-y-4">
          <section className={`${card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className={`text-sm font-extrabold ${head}`}>
                {bn ? 'আজকের ৭টি অভ্যাস' : 'Today’s 7 habits'}
              </h2>
              <span className={`text-[11px] font-bold ${sub}`}>
                {bn ? 'টার্গেট' : 'Target'} {formatNum(HABIT_TARGET, lang)}/{formatNum(HABITS.length, lang)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HABITS.map((h) => {
                const Icon = h.icon;
                const done = todayHabits.includes(h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    aria-pressed={done}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${
                      done
                        ? isDark
                          ? 'border-emerald-400/30 bg-emerald-500/10'
                          : 'border-emerald-200 bg-emerald-50/80'
                        : isDark
                        ? 'border-slate-700/70 bg-slate-800/40 hover:border-slate-600'
                        : 'border-slate-200/90 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                        done
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-emerald-600 text-white'
                          : isDark
                          ? 'bg-slate-700/60 text-slate-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className={`text-xs font-semibold min-w-0 ${done ? head : sub}`}>
                      {bn ? h.bn : h.en}
                    </span>
                    <span
                      className={`ml-auto w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${
                        done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isDark
                          ? 'border-slate-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {done && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <ReminderCard data={data} lang={lang} theme={theme} />

          {/* College attendance */}
          <section className={`${card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className={`text-sm font-extrabold ${head}`}>
                {bn ? 'আজকের উপস্থিতি' : "Today's attendance"}
              </h2>
              <span
                className={`text-[11px] font-extrabold tabular-nums px-2 py-0.5 rounded-full ${
                  attendanceMonth.pct >= 75
                    ? isDark
                      ? 'bg-emerald-500/12 text-emerald-300'
                      : 'bg-emerald-50 text-emerald-700'
                    : isDark
                    ? 'bg-rose-500/12 text-rose-300'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {attendanceMonth.monthLabel} · {formatNum(attendanceMonth.pct, lang)}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(ATTENDANCE_META) as AttendanceStatus[]).map((status) => {
                const active = data.attendance[today] === status;
                const meta = ATTENDANCE_META[status];
                return (
                  <button
                    key={status}
                    onClick={() =>
                      patch((prev) => {
                        const next = { ...prev.attendance };
                        if (next[today] === status) delete next[today];
                        else next[today] = status;
                        return { ...prev, attendance: next };
                      })
                    }
                    aria-pressed={active}
                    className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors active:scale-[0.98] ${
                      active
                        ? meta.active
                        : isDark
                        ? 'border-slate-700/70 bg-slate-800/40 text-slate-300'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {bn ? meta.bn : meta.en}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {(bn
                  ? ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ']
                  : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                ).map((d, i) => (
                  <span key={i} className={`text-center text-[9px] font-bold ${sub}`}>
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: attendanceMonth.firstWeekday }).map((_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: attendanceMonth.daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const key = `${attendanceMonth.monthPrefix}-${String(dayNum).padStart(2, '0')}`;
                  const status = data.attendance[key];
                  const isToday = key === today;
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        patch((prev) => {
                          const next = { ...prev.attendance };
                          if (next[key]) delete next[key];
                          else next[key] = 'present';
                          return { ...prev, attendance: next };
                        })
                      }
                      title={status ? (bn ? ATTENDANCE_META[status].bn : ATTENDANCE_META[status].en) : ''}
                      className={`aspect-square rounded-md text-[10px] font-bold tabular-nums flex items-center justify-center transition-colors ${
                        status
                          ? status === 'present'
                            ? isDark
                              ? 'bg-emerald-500/25 text-emerald-200'
                              : 'bg-emerald-500 text-white'
                            : status === 'late'
                            ? isDark
                              ? 'bg-amber-400/25 text-amber-200'
                              : 'bg-amber-400 text-white'
                            : status === 'absent'
                            ? isDark
                              ? 'bg-rose-500/25 text-rose-200'
                              : 'bg-rose-500 text-white'
                            : isDark
                            ? 'bg-slate-600/50 text-slate-200'
                            : 'bg-slate-400 text-white'
                          : isDark
                          ? 'bg-slate-800/60 text-slate-500'
                          : 'bg-slate-100 text-slate-500'
                      } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-transparent' : ''}`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
              {(Object.keys(ATTENDANCE_META) as AttendanceStatus[]).map((status) => (
                <span key={status} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${sub}`}>
                  <span className={`w-2 h-2 rounded-full ${ATTENDANCE_META[status].dot}`} />
                  {formatNum(attendanceMonth.counts[status], lang)}
                </span>
              ))}
              <span className={`ml-auto text-[10px] font-bold ${sub}`}>
                {bn ? 'মাসিক' : 'Month'} {formatNum(attendanceMonth.attended, lang)}/
                {formatNum(attendanceMonth.marked, lang)}
              </span>
            </div>

            {attendanceMonth.marked > 0 && (
              <p
                className={`mt-2 text-[11px] font-semibold ${
                  attendanceMonth.pct >= 75 ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : sub
                }`}
              >
                {attendanceProjection.above
                  ? attendanceProjection.affordable > 0
                    ? bn
                      ? `৭৫% ধরে রাখতে আর ${formatNum(attendanceProjection.affordable, lang)} দিন অনুপস্থিত থাকা যাবে।`
                      : `You can still miss ${attendanceProjection.affordable} more class(es) and stay above 75%.`
                    : bn
                    ? 'আর একটি ক্লাসও মিস করা যাবে না — ৭৫% একদম সীমারেখায়।'
                    : 'You cannot miss another class — you are exactly at the 75% line.'
                  : bn
                  ? `৭৫%-এ পৌঁছাতে টানা ${formatNum(attendanceProjection.needed, lang)} দিন ক্লাসে উপস্থিত থাকতে হবে।`
                  : `Attend ${attendanceProjection.needed} more class(es) in a row to reach 75%.`}
              </p>
            )}

            {attendanceMonth.marked >= 5 && attendanceMonth.pct < 75 && (
              <p className={`mt-2 text-[11px] font-semibold ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
                {bn
                  ? 'উপস্থিতি ৭৫%-এর নিচে — বোর্ড পরীক্ষার ফর্মে সমস্যা হতে পারে। এই সপ্তাহে ক্লাস মিস করবেন না।'
                  : 'Attendance is below 75% — this can affect board form eligibility. Do not miss class this week.'}
              </p>
            )}
          </section>

          {todayClasses.length > 0 && (
            <section className={`${card} p-4 sm:p-5`}>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h2 className={`text-sm font-extrabold ${head}`}>
                  {bn ? 'আজকের ক্লাস' : "Today's classes"}
                </h2>
                <button
                  onClick={() => setSection('routine')}
                  className={`text-[11px] font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}
                >
                  {bn ? 'পুরো রুটিন' : 'Full routine'} →
                </button>
              </div>
              <div className="space-y-1.5">
                {todayClasses.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                      isDark ? 'border-slate-700/70 bg-slate-800/40' : 'border-slate-200/90 bg-slate-50/70'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-extrabold tabular-nums px-1.5 py-0.5 rounded-md ${
                        isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {slot.start}
                    </span>
                    <span className={`text-[11px] font-semibold truncate ${head}`}>{slot.subject}</span>
                    {slot.room && (
                      <span className={`ml-auto text-[10px] shrink-0 ${sub}`}>{slot.room}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={`${card} p-4 sm:p-5`}>
            <h2 className={`text-sm font-extrabold mb-3 ${head}`}>
              {bn ? 'শেষ ৭ দিন' : 'Last 7 days'}
            </h2>
            <div className="flex items-end justify-between gap-1.5 sm:gap-2">
              {week.map((key) => {
                const done = (data.habits[key] ?? []).length;
                const pct = Math.round((done / HABITS.length) * 100);
                const isToday = key === today;
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full rounded-lg relative overflow-hidden ${
                        isDark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                      style={{ height: 72 }}
                      title={`${done}/${HABITS.length}`}
                    >
                      <div
                        className={`absolute bottom-0 inset-x-0 rounded-lg transition-all ${
                          pct >= 57
                            ? 'bg-emerald-500/80'
                            : pct > 0
                            ? 'bg-amber-400/80'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(0, pct)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold tabular-nums ${
                        isToday ? 'text-indigo-500' : sub
                      }`}
                    >
                      {new Date(`${key}T00:00:00`).toLocaleDateString(bn ? 'bn-BD' : 'en-GB', {
                        weekday: 'short',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className={`text-[11px] mt-3 ${sub}`}>
              {bn
                ? `স্ট্রিক ধরে রাখতে দিনে অন্তত ${formatNum(HABIT_TARGET, lang)}টি অভ্যাস সম্পন্ন করুন।`
                : `Complete at least ${HABIT_TARGET} habits a day to keep the streak alive.`}
            </p>
          </section>

          <section className={`${card} p-4 sm:p-5 flex items-start gap-3`}>
            <div
              className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${head}`}>
                {bn ? 'আজকের ফোকাস' : "Today's focus"}
              </p>
              <p className={`text-[11px] mt-0.5 ${sub}`}>
                {bn
                  ? `${profile.fullName || 'শিক্ষার্থী'}, আজকের সবচেয়ে গুরুত্বপূর্ণ কাজটি করতে প্ল্যানারে যান।`
                  : `${profile.fullName || 'Student'}, head to the planner for today’s most important task.`}
              </p>
              <button
                onClick={() => onNavigate('planner')}
                className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${
                  isDark ? 'text-indigo-300' : 'text-indigo-600'
                }`}
              >
                {bn ? 'প্ল্যানার খুলুন' : 'Open planner'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* -------------------- Deadlines -------------------- */}
      {section === 'deadlines' && (
        <div className="space-y-4">
          <section className={`${card} p-4 sm:p-5`}>
            <h2 className={`text-sm font-extrabold mb-3 ${head}`}>
              {bn ? 'নতুন ডেডলাইন যোগ করুন' : 'Add a deadline'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                className={field}
                value={dTitle}
                onChange={(e) => setDTitle(e.target.value)}
                placeholder={bn ? 'যেমন: ঢাবি "ক" ইউনিট আবেদন' : 'e.g. DU "Ka" unit application'}
              />
              <input
                type="date"
                className={field}
                value={dDate}
                onChange={(e) => setDDate(e.target.value)}
              />
              <select
                className={field}
                value={dCategory}
                onChange={(e) => setDCategory(e.target.value as DeadlineCategory)}
              >
                {(Object.keys(DEADLINE_META) as DeadlineCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {bn ? DEADLINE_META[key].bn : DEADLINE_META[key].en}
                  </option>
                ))}
              </select>
              <button
                onClick={addDeadline}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                <Plus className="w-4 h-4" />
                {bn ? 'যোগ করুন' : 'Add'}
              </button>
            </div>
          </section>

          <section className="space-y-2">
            {data.deadlines.length === 0 && (
              <div className={`${card} p-6 text-center`}>
                <CalendarDays className={`w-8 h-8 mx-auto mb-2 ${sub}`} />
                <p className={`text-xs ${sub}`}>
                  {bn
                    ? 'এখনো কোনো ডেডলাইন নেই। ভর্তি ফর্ম, বৃত্তি বা পরীক্ষার তারিখ যোগ করে কাউন্টডাউন দেখুন।'
                    : 'No deadlines yet. Add application, scholarship or exam dates to see a countdown.'}
                </p>
              </div>
            )}
            {[...data.deadlines]
              .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
              .map((d) => {
                const left = daysUntil(d.date);
                const meta = DEADLINE_META[d.category];
                return (
                  <div
                    key={d.id}
                    className={`${card} p-3.5 flex items-center gap-3 ${
                      d.done ? 'opacity-60' : ''
                    }`}
                  >
                    <button
                      onClick={() =>
                        patch((prev) => ({
                          ...prev,
                          deadlines: prev.deadlines.map((x) =>
                            x.id === d.id ? { ...x, done: !x.done } : x
                          ),
                        }))
                      }
                      aria-label={bn ? 'সম্পন্ন চিহ্নিত করুন' : 'Mark done'}
                      className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center ${
                        d.done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isDark
                          ? 'border-slate-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {d.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${d.done ? 'line-through' : head}`}>
                        {d.title}
                      </p>
                      <p className={`text-[11px] ${sub}`}>
                        {new Date(`${d.date}T00:00:00`).toLocaleDateString(bn ? 'bn-BD' : 'en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' • '}
                        {bn ? meta.bn : meta.en}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 text-[11px] font-extrabold tabular-nums px-2 py-1 rounded-lg border ${
                        left < 0
                          ? isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                          : left <= 7
                          ? isDark
                            ? 'bg-rose-500/12 text-rose-300 border-rose-400/25'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                          : isDark
                          ? 'bg-indigo-500/12 text-indigo-300 border-indigo-400/25'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {left < 0
                        ? bn
                          ? 'শেষ'
                          : 'Past'
                        : `${formatNum(left, lang)} ${bn ? 'দিন' : 'd'}`}
                    </span>

                    <button
                      onClick={() =>
                        patch((prev) => ({
                          ...prev,
                          deadlines: prev.deadlines.filter((x) => x.id !== d.id),
                        }))
                      }
                      aria-label={bn ? 'মুছুন' : 'Delete'}
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isDark ? 'text-slate-500 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
          </section>
        </div>
      )}

      {/* -------------------- Exams -------------------- */}
      {section === 'exams' && (
        <div className="space-y-4">
          <section
            className={`rounded-2xl border p-4 sm:p-5 ${
              isDark
                ? 'border-slate-800 bg-slate-900/60'
                : 'border-slate-200/85 bg-white/85 card-soft-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className={`text-[11px] font-mono font-bold uppercase tracking-wider ${sub}`}>
                  {bn ? 'HSC ২০২৮ বোর্ড পরীক্ষা (আনুমানিক)' : 'HSC 2028 Board Exam (est.)'}
                </p>
                <p className={`text-2xl font-extrabold tabular-nums mt-1 ${head}`}>
                  {formatNum(Math.max(0, daysUntil('2028-05-10')), lang)}{' '}
                  <span className="text-sm font-bold">{bn ? 'দিন বাকি' : 'days to go'}</span>
                </p>
              </div>
              <Flame
                className={`w-9 h-9 ${isDark ? 'text-amber-300/80' : 'text-amber-500/80'}`}
              />
            </div>
            <div className={`h-2 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                style={{
                  width: `${Math.min(100, Math.max(2, Math.round(((1095 - Math.max(0, daysUntil('2028-05-10'))) / 1095) * 100)))}%`,
                }}
              />
            </div>
          </section>

          <section className={`${card} p-4 sm:p-5`}>
            <h2 className={`text-sm font-extrabold mb-3 ${head}`}>
              {bn ? 'পরীক্ষা / টেস্ট রুটিন যোগ করুন' : 'Add an exam / test'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                className={field}
                value={eTitle}
                onChange={(e) => setETitle(e.target.value)}
                placeholder={bn ? 'যেমন: পদার্থ ১ম পত্র টেস্ট' : 'e.g. Physics 1st paper test'}
              />
              <input
                type="date"
                className={field}
                value={eDate}
                onChange={(e) => setEDate(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  className={field}
                  value={eTime}
                  onChange={(e) => setETime(e.target.value)}
                />
                <button
                  onClick={addExam}
                  aria-label={bn ? 'যোগ করুন' : 'Add'}
                  className={`shrink-0 px-3 rounded-xl ${
                    isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            {data.exams.length === 0 && (
              <div className={`${card} p-6 text-center`}>
                <AlarmClock className={`w-8 h-8 mx-auto mb-2 ${sub}`} />
                <p className={`text-xs ${sub}`}>
                  {bn
                    ? 'ক্লাস টেস্ট বা মডেল টেস্টের তারিখ যোগ করুন — প্রতিটির কাউন্টডাউন এখানে দেখাবে।'
                    : 'Add class or model test dates — each one gets a countdown here.'}
                </p>
              </div>
            )}
            {[...data.exams]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((e) => {
                const left = daysUntil(e.date);
                return (
                  <div key={e.id} className={`${card} p-3.5 flex items-center gap-3`}>
                    <div
                      className={`w-11 h-11 shrink-0 rounded-xl border flex flex-col items-center justify-center ${
                        isDark
                          ? 'bg-slate-800/60 border-slate-700'
                          : 'bg-indigo-50/70 border-indigo-100'
                      }`}
                    >
                      <span className={`text-[10px] font-bold leading-none ${sub}`}>
                        {new Date(`${e.date}T00:00:00`).toLocaleDateString(bn ? 'bn-BD' : 'en-GB', {
                          month: 'short',
                        })}
                      </span>
                      <span className={`text-sm font-extrabold leading-tight ${head}`}>
                        {new Date(`${e.date}T00:00:00`).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${head}`}>{e.title}</p>
                      <p className={`text-[11px] ${sub}`}>
                        {e.time ? `${e.time} • ` : ''}
                        {left < 0
                          ? bn
                            ? 'শেষ হয়েছে'
                            : 'Completed'
                          : `${formatNum(left, lang)} ${bn ? 'দিন বাকি' : 'days left'}`}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        patch((prev) => ({ ...prev, exams: prev.exams.filter((x) => x.id !== e.id) }))
                      }
                      aria-label={bn ? 'মুছুন' : 'Delete'}
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isDark ? 'text-slate-500 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
          </section>

          <section className={`${card} p-4 sm:p-5`}>
            <h2 className={`text-sm font-extrabold mb-2 ${head}`}>
              {bn ? 'পরীক্ষার দিনের চেকলিস্ট' : 'Exam-day checklist'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {EXAM_CHECKLIST.map((item) => {
                const done = data.examChecklist.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      patch((prev) => ({
                        ...prev,
                        examChecklist: done
                          ? prev.examChecklist.filter((x) => x !== item.id)
                          : [...prev.examChecklist, item.id],
                      }))
                    }
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] font-semibold ${
                      done
                        ? isDark
                          ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : isDark
                        ? 'border-slate-700/70 text-slate-300'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isDark
                          ? 'border-slate-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    {bn ? item.bn : item.en}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Exam results log — a plain record so trends are visible later */}
          <section className={`${card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className={`text-sm font-extrabold ${head}`}>
                {bn ? 'পরীক্ষার ফলাফল' : 'Exam results'}
              </h2>
              {resultStats.list.length > 0 && (
                <span className={`text-[11px] font-bold ${sub}`}>
                  {bn ? 'গড়' : 'Avg'} {formatNum(resultStats.average, lang)}% ·{' '}
                  {bn ? 'সেরা' : 'Best'} {formatNum(resultStats.best, lang)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <input
                className={`${field} col-span-2`}
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder={bn ? 'পরীক্ষার নাম' : 'Exam name'}
              />
              <select
                className={field}
                value={resSubject}
                onChange={(e) => setResSubject(e.target.value as SubjectKey | 'all')}
                aria-label={bn ? 'বিষয়' : 'Subject'}
              >
                <option value="all">{bn ? 'সাধারণ / অন্যান্য' : 'General / other'}</option>
                {SUBJECTS.map((subj) => (
                  <option key={subj.key} value={subj.key}>
                    {bn ? subj.name.bn : subj.name.en}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  className={field}
                  value={resObtained}
                  onChange={(e) => setResObtained(e.target.value)}
                  placeholder={bn ? 'প্রাপ্ত' : 'Got'}
                  aria-label={bn ? 'প্রাপ্ত নম্বর' : 'Marks obtained'}
                />
                <span className={`text-xs font-bold ${sub}`}>/</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className={field}
                  value={resTotal}
                  onChange={(e) => setResTotal(e.target.value)}
                  placeholder={bn ? 'মোট' : 'Total'}
                  aria-label={bn ? 'মোট নম্বর' : 'Total marks'}
                />
              </div>
              <input
                type="date"
                className={field}
                value={resDate}
                onChange={(e) => setResDate(e.target.value)}
                aria-label={bn ? 'তারিখ' : 'Date'}
              />
              <button
                onClick={addResult}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold ${
                  isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                {bn ? 'যোগ' : 'Add'}
              </button>
            </div>

            {resultStats.list.length === 0 ? (
              <p className={`mt-3 text-[11px] ${sub}`}>
                {bn
                  ? 'ক্লাস টেস্ট বা মডেল টেস্টের নম্বর লিখে রাখুন — গড় ও উন্নতির ধারা এখানে দেখা যাবে।'
                  : 'Log class or model test marks — your average and trend will show up here.'}
              </p>
            ) : (
              <div className="mt-3 space-y-1.5">
                {resultStats.list.slice(0, 8).map((r) => {
                  const pct = r.total > 0 ? Math.round((r.obtained / r.total) * 100) : 0;
                  const tone =
                    pct >= 80
                      ? isDark
                        ? 'bg-emerald-500/12 text-emerald-300 border-emerald-400/25'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : pct >= 60
                      ? isDark
                        ? 'bg-amber-500/12 text-amber-300 border-amber-400/25'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      : isDark
                      ? 'bg-rose-500/12 text-rose-300 border-rose-400/25'
                      : 'bg-rose-50 text-rose-700 border-rose-200';
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                        isDark ? 'border-slate-700/70 bg-slate-800/40' : 'border-slate-200/90 bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] font-bold truncate ${head}`}>{r.title}</p>
                        <p className={`text-[10px] ${sub}`}>
                          {r.subject ? `${r.subject} • ` : ''}
                          {new Date(`${r.date}T00:00:00`).toLocaleDateString(bn ? 'bn-BD' : 'en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <span className={`text-[11px] tabular-nums ${sub}`}>
                        {formatNum(r.obtained, lang)}/{formatNum(r.total, lang)}
                      </span>
                      <span className={`text-[11px] font-extrabold tabular-nums px-2 py-0.5 rounded-md border ${tone}`}>
                        {formatNum(pct, lang)}%
                      </span>
                      <button
                        onClick={() =>
                          patch((prev) => ({
                            ...prev,
                            results: prev.results.filter((x) => x.id !== r.id),
                          }))
                        }
                        aria-label={bn ? 'মুছুন' : 'Delete'}
                        className={`p-1 rounded-md shrink-0 ${
                          isDark ? 'text-slate-500 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {weakestSubject && (
              <div
                className={`mt-3 rounded-xl border p-3 flex items-center gap-2.5 ${
                  isDark
                    ? 'border-rose-400/25 bg-rose-500/8'
                    : 'border-rose-200 bg-rose-50/70'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold ${head}`}>
                    {bn ? 'সবচেয়ে দুর্বল পত্র' : 'Weakest paper'}:{' '}
                    {getSubjectByKey(weakestSubject.subjectKey)?.shortName[bn ? 'bn' : 'en']} —{' '}
                    {formatNum(weakestSubject.avg, lang)}%
                  </p>
                  <p className={`text-[10px] ${sub}`}>
                    {bn
                      ? 'এই পত্রে নিয়মিত MCQ দিলে দ্রুত উন্নতি হবে।'
                      : 'Regular MCQs on this paper will lift it fastest.'}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('mcq')}
                  className={`shrink-0 text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${
                    isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-600 text-white'
                  }`}
                >
                  {bn ? 'MCQ' : 'Practise'}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* -------------------- Routine -------------------- */}
      {section === 'routine' && (
        <div className="space-y-4">
          <section className={`${card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className={`text-sm font-extrabold ${head}`}>
                {bn ? 'সাপ্তাহিক ক্লাস রুটিন' : 'Weekly class routine'}
              </h2>
              <span className={`text-[11px] font-bold ${sub}`}>
                {formatNum(data.routine.length, lang)} {bn ? 'ক্লাস' : 'classes'}
              </span>
            </div>

            <div className="-mx-1 px-1 overflow-x-auto no-scrollbar">
              <div className="flex gap-1.5 w-max">
                {WEEK_DAYS.map((day) => {
                  const count = data.routine.filter((r) => r.day === day.js).length;
                  const active = routineDay === day.js;
                  const isToday = new Date().getDay() === day.js;
                  return (
                    <button
                      key={day.js}
                      onClick={() => setRoutineDay(day.js)}
                      className={`relative shrink-0 px-3 py-2 rounded-xl border text-[11px] font-bold transition-colors ${
                        active
                          ? isDark
                            ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                            : 'bg-indigo-600 text-white border-indigo-600'
                          : isDark
                          ? 'bg-slate-800/50 text-slate-300 border-slate-700/70'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {bn ? day.shortBn : day.shortEn}
                      {count > 0 && (
                        <span
                          className={`ml-1.5 text-[9px] px-1 rounded ${
                            active
                              ? 'bg-white/25'
                              : isDark
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {formatNum(count, lang)}
                        </span>
                      )}
                      {isToday && (
                        <span
                          className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                            isDark ? 'bg-emerald-400' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className={`${card} p-4 sm:p-5`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wide mb-2.5 ${sub}`}>
              {bn
                ? `${WEEK_DAYS.find((d) => d.js === routineDay)?.bn ?? ''}-এর ক্লাস`
                : `${WEEK_DAYS.find((d) => d.js === routineDay)?.en ?? ''} classes`}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <input
                className={`${field} col-span-2 sm:col-span-1`}
                value={rSubject}
                onChange={(e) => setRSubject(e.target.value)}
                placeholder={bn ? 'বিষয় / ক্লাস' : 'Subject / class'}
              />
              <input
                type="time"
                aria-label={bn ? 'শুরুর সময়' : 'Start time'}
                className={field}
                value={rStart}
                onChange={(e) => setRStart(e.target.value)}
              />
              <input
                type="time"
                aria-label={bn ? 'শেষের সময়' : 'End time'}
                className={field}
                value={rEnd}
                onChange={(e) => setREnd(e.target.value)}
              />
              <input
                className={field}
                value={rRoom}
                onChange={(e) => setRRoom(e.target.value)}
                placeholder={bn ? 'রুম (ঐচ্ছিক)' : 'Room (optional)'}
              />
              <button
                onClick={addRoutineSlot}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold ${
                  isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                {bn ? 'যোগ' : 'Add'}
              </button>
            </div>
          </section>

          <section className="space-y-2">
            {routineForDay.length === 0 && (
              <div className={`${card} p-6 text-center`}>
                <School className={`w-8 h-8 mx-auto mb-2 ${sub}`} />
                <p className={`text-xs ${sub}`}>
                  {bn
                    ? 'এই দিনে কোনো ক্লাস যোগ করা হয়নি। উপরে বিষয় ও সময় দিয়ে যোগ করুন।'
                    : 'No classes for this day yet. Add one above with a subject and time.'}
                </p>
              </div>
            )}

            {routineForDay.map((slot) => (
              <div key={slot.id} className={`${card} p-3.5 flex items-center gap-3`}>
                <div
                  className={`w-14 shrink-0 rounded-lg border px-1 py-1 text-center ${
                    isDark ? 'border-slate-700 bg-slate-800/50' : 'border-indigo-100 bg-indigo-50/70'
                  }`}
                >
                  <p className={`text-[11px] font-extrabold tabular-nums leading-tight ${head}`}>
                    {slot.start}
                  </p>
                  <p className={`text-[10px] tabular-nums leading-tight ${sub}`}>{slot.end}</p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${head}`}>{slot.subject}</p>
                  <p className={`text-[11px] flex items-center gap-1 ${sub}`}>
                    {slot.room ? (
                      <>
                        <MapPin className="w-3 h-3" />
                        {slot.room}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        {bn ? 'রুম নেই' : 'No room'}
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={() =>
                    patch((prev) => ({
                      ...prev,
                      routine: prev.routine.filter((r) => r.id !== slot.id),
                    }))
                  }
                  aria-label={bn ? 'মুছুন' : 'Delete'}
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isDark ? 'text-slate-500 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </section>

          <p className={`text-[11px] px-1 ${sub}`}>
            {bn
              ? 'টিপস: ক্লাস রুটিনের ফাঁকা সময়গুলোই আপনার সেলফ-স্টাডির সেরা সময় — প্ল্যানারে সেগুলো কাজ হিসেবে যোগ করুন।'
              : 'Tip: the gaps in your class routine are your best self-study slots — add them as tasks in the Planner.'}
          </p>
        </div>
      )}

      {/* -------------------- Career -------------------- */}
      {section === 'career' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {CAREER_PATHS.map((path) => {
            const Icon = path.icon;
            const open = openCareer === path.id;
            return (
              <div key={path.id} className={`${card} overflow-hidden`}>
                <button
                  onClick={() => setOpenCareer(open ? null : path.id)}
                  className="w-full flex items-center gap-3 p-4 text-left active:scale-[0.995]"
                  aria-expanded={open}
                >
                  <span
                    className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                      isDark
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-400/25'
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs font-extrabold ${head}`}>
                      {bn ? path.bn : path.en}
                    </span>
                    <span className={`block text-[11px] mt-0.5 ${sub}`}>
                      {bn ? path.summaryBn : path.summaryEn}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${sub}`}
                  />
                </button>

                {open && (
                  <div className={`px-4 pb-4 border-t pt-3 space-y-2.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                      <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${sub}`}>
                        {bn ? 'কেন্দ্রীয় বিষয়' : 'Core focus'}
                      </p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${head}`}>
                        {bn ? path.focusBn : path.focusEn}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${sub}`}>
                        {bn ? 'ধাপে ধাপে পথ' : 'Step by step'}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {(bn ? path.stepsBn : path.stepsEn).map((step, i) => (
                          <li key={i} className={`flex gap-2 text-[11px] ${sub}`}>
                            <span
                              className={`shrink-0 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                                isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {path.goTo && (
                      <button
                        onClick={() => onNavigate(path.goTo as ActiveTab)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          isDark ? 'text-indigo-300' : 'text-indigo-600'
                        }`}
                      >
                        {bn ? 'সংশ্লিষ্ট মডিউলে যান' : 'Open related module'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------- Mind -------------------- */}
      {section === 'mind' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <section className={`${card} p-4 sm:p-5 flex flex-col items-center text-center lg:col-span-1`}>
            <h2 className={`text-sm font-extrabold ${head}`}>
              {bn ? '৪–৭–৮ শ্বাস-ব্যায়াম' : '4–7–8 breathing'}
            </h2>
            <p className={`text-[11px] mt-1 max-w-xs ${sub}`}>
              {bn
                ? 'পরীক্ষার আগে উদ্বেগ কমাতে ৩ চক্র করুন। ৪ সেকেন্ড শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন, ৮ সেকেন্ডে ছাড়ুন।'
                : 'Do 3 cycles before an exam to settle nerves: in 4s, hold 7s, out 8s.'}
            </p>

            <div className="relative my-5 flex items-center justify-center" style={{ width: 148, height: 148 }}>
              <div
                className={`absolute inset-0 rounded-full border ${
                  isDark ? 'border-indigo-400/20' : 'border-indigo-200'
                }`}
              />
              <div
                className={`rounded-full transition-all ease-in-out ${
                  breath.phase === 'in' && breathing
                    ? 'bg-indigo-500/50 duration-[4000ms]'
                    : breath.phase === 'hold' && breathing
                    ? 'bg-emerald-500/40 duration-700'
                    : breathing
                    ? 'bg-sky-400/30 duration-[8000ms]'
                    : isDark
                    ? 'bg-slate-700/40 duration-500'
                    : 'bg-indigo-100 duration-500'
                }`}
                style={{
                  width: breathing ? (breath.phase === 'in' ? 136 : breath.phase === 'hold' ? 136 : 72) : 88,
                  height: breathing ? (breath.phase === 'in' ? 136 : breath.phase === 'hold' ? 136 : 72) : 88,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-extrabold tabular-nums ${head}`}>
                  {breathing ? formatNum(breath.left, lang) : '–'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>
                  {breathing
                    ? breath.phase === 'in'
                      ? bn
                        ? 'শ্বাস নিন'
                        : 'Inhale'
                      : breath.phase === 'hold'
                      ? bn
                        ? 'ধরে রাখুন'
                        : 'Hold'
                      : bn
                      ? 'ছাড়ুন'
                      : 'Exhale'
                    : bn
                    ? 'প্রস্তুত'
                    : 'Ready'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {breathing ? (
                <button
                  onClick={stopBreathing}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold ${
                    isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Pause className="w-3.5 h-3.5" /> {bn ? 'থামুন' : 'Stop'}
                </button>
              ) : (
                <button
                  onClick={startBreathing}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold ${
                    isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" /> {bn ? 'শুরু করুন' : 'Start'}
                </button>
              )}
              <span className={`text-[11px] font-bold tabular-nums ${sub}`}>
                {bn ? 'চক্র' : 'Cycles'}: {formatNum(breath.cycles, lang)}
              </span>
            </div>
          </section>

          <div className="space-y-3">
            <section className={`${card} p-4 sm:p-5`}>
              <div className="flex items-start gap-3">
                <Quote className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-500'}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-semibold leading-relaxed ${head}`}>
                    {bn ? QUOTES[quoteIndex].bn : QUOTES[quoteIndex].en}
                  </p>
                  <button
                    onClick={() => setQuoteIndex((i) => (i + 1) % QUOTES.length)}
                    className={`mt-2 text-[11px] font-bold ${
                      isDark ? 'text-indigo-300' : 'text-indigo-600'
                    }`}
                  >
                    {bn ? 'পরবর্তী অনুপ্রেরণা →' : 'Next motivation →'}
                  </button>
                </div>
              </div>
            </section>

            <section className={`${card} p-4 sm:p-5`}>
              <h3 className={`text-sm font-extrabold mb-2 ${head}`}>
                {bn ? 'মন চাঙ্গা রাখার ৪টি নিয়ম' : '4 rules for a steady mind'}
              </h3>
              <ul className="space-y-2">
                {STRESS_TIPS.map((tip, i) => (
                  <li key={i} className={`flex gap-2 text-[11px] leading-relaxed ${sub}`}>
                    <Sparkles className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
                    {bn ? tip.bn : tip.en}
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={`rounded-2xl border p-4 ${
                isDark
                  ? 'border-rose-400/20 bg-rose-500/5'
                  : 'border-rose-200 bg-rose-50/60'
              }`}
            >
              <p className={`text-[11px] font-semibold leading-relaxed ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                {bn
                  ? 'টানা কয়েক সপ্তাহ মন খারাপ, ঘুম না আসা বা পড়ায় মন না বসলে পরিবারের কারো বা বিশ্বস্ত বন্ধুর সাথে কথা বলুন। এটি দুর্বলতা নয়।'
                  : 'If low mood, sleeplessness or an inability to study lasts weeks, talk to family or a friend you trust. That is not weakness.'}
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Small presentational helper                                        */
/* ------------------------------------------------------------------ */

const StatTile: React.FC<{
  isDark: boolean;
  icon: React.ElementType;
  tone: 'amber' | 'emerald' | 'indigo' | 'rose';
  label: string;
  value: string;
}> = ({ isDark, icon: Icon, tone, label, value }) => {
  const tones: Record<string, string> = {
    amber: isDark ? 'text-amber-300 bg-amber-500/12' : 'text-amber-700 bg-amber-100/80',
    emerald: isDark ? 'text-emerald-300 bg-emerald-500/12' : 'text-emerald-700 bg-emerald-100/80',
    indigo: isDark ? 'text-indigo-300 bg-indigo-500/12' : 'text-indigo-700 bg-indigo-100/80',
    rose: isDark ? 'text-rose-300 bg-rose-500/12' : 'text-rose-700 bg-rose-100/80',
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200/80 bg-white/80'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className={`text-[10px] font-bold leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>
      <p className={`text-base font-extrabold tabular-nums mt-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
};

export default LifeHubView;
