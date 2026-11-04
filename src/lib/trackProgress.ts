import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
import type { ChapterProgressState, SubjectKey } from '../types';
import type { MockKind } from './mockPlan';

/**
 * Three admission tracks, measured against the syllabus the app already tracks.
 *
 * Every chapter in the syllabus carries four stages (theory → notes → MCQ → CQ),
 * so a track's readiness is how much of the tracked syllabus is actually done.
 * Medical weights map the latest published 2025–26 HSC subject marks and omit
 * the separate 15-mark GK/aptitude/human-qualities section. Engineering uses a balanced study-
 * planning mix rather than claiming one official paper distribution; university
 * exams differ. The varsity mix is likewise a study-planning estimate.
 */

export type TrackKey = 'engineering' | 'medical' | 'varsity';
export type ReadinessVerdict = 'ready' | 'almost' | 'building' | 'early';

export interface TrackSubject {
  subjectKey: SubjectKey;
  /** Share of the exam, 0–1. */
  weight: number;
}

export interface AdmissionTrack {
  key: TrackKey;
  nameBn: string;
  nameEn: string;
  examBn: string;
  examEn: string;
  patternId: string;
  mockKind: MockKind;
  requiresBn: string;
  requiresEn: string;
  subjects: TrackSubject[];
  tipBn: string;
  tipEn: string;
}

export const ADMISSION_TRACKS: AdmissionTrack[] = [
  {
    key: 'engineering',
    nameBn: 'Engineering',
    nameEn: 'Engineering',
    examBn: 'BUET লিখিত প্রস্তুতি + লক্ষ্য বিশ্ববিদ্যালয়ের নিজস্ব ইঞ্জিনিয়ারিং পরীক্ষা',
    examEn: 'BUET written practice + target university’s own engineering test',
    patternId: 'buet-preli',
    mockKind: 'engineering',
    requiresBn: 'SSC GPA ≥ ৪.০০; HSC বিষয়ভিত্তিক GP-শর্ত CUET/KUET/RUET/BUET অনুযায়ী আলাদা',
    requiresEn: 'SSC GPA ≥ 4.00; HSC subject-GP rules differ across CUET/KUET/RUET/BUET',
    subjects: [
      // These are deliberately broad study-planning weights, not a claim about
      // any one university's subject distribution or written-test blueprint.
      { subjectKey: 'math1', weight: 0.15 },
      { subjectKey: 'math2', weight: 0.15 },
      { subjectKey: 'physics1', weight: 0.15 },
      { subjectKey: 'physics2', weight: 0.15 },
      { subjectKey: 'chemistry1', weight: 0.15 },
      { subjectKey: 'chemistry2', weight: 0.15 },
      { subjectKey: 'english', weight: 0.1 },
    ],
    tipBn: 'প্রকাশিত প্রতিবেদন অনুযায়ী BUET-এর ২০২৫–২৬ ভর্তি পরীক্ষায় MCQ প্রিলি ছিল না; লিখিত পরীক্ষার জন্য Math, Physics ও Chemistry-তে ভারসাম্যপূর্ণ প্রস্তুতি নাও। এখানে বিষয়-ভাগটি শুধু study-planning estimate, কোনো একক official pattern নয়; CUET/KUET/RUET-এর নিজস্ব প্যাটার্নে English-ও আছে।',
    tipEn: 'Published reports say BUET had no MCQ preliminary in 2025–26; prepare Math, Physics and Chemistry evenly for the written test. This subject mix is only a study-planning estimate, not one official pattern; CUET/KUET/RUET have their own patterns, including English.',
  },
  {
    key: 'medical',
    nameBn: 'Medical',
    nameEn: 'Medical',
    examBn: 'MBBS মেডিকেল ভর্তি',
    examEn: 'MBBS medical admission',
    patternId: 'medical-mbbs',
    mockKind: 'medical',
    requiresBn: 'সর্বশেষ ২০২৫–২৬: SSC+HSC মোট GPA ≥ ৮.৫০; প্রতিটিতে ≥ ৪.০০; HSC পদার্থ, রসায়ন ও জীববিজ্ঞানে GP ≥ ৩.৫০ করে',
    requiresEn: 'Latest 2025–26: combined GPA ≥ 8.50; each exam ≥ 4.00; HSC Physics, Chemistry and Biology each GP ≥ 3.50',
    subjects: [
      // The app has no separate GK/aptitude syllabus bank, so track only the
      // 85% of the paper represented by tracked HSC subjects.
      { subjectKey: 'biology1', weight: 0.15 },
      { subjectKey: 'biology2', weight: 0.15 },
      { subjectKey: 'chemistry1', weight: 0.125 },
      { subjectKey: 'chemistry2', weight: 0.125 },
      { subjectKey: 'physics1', weight: 0.075 },
      { subjectKey: 'physics2', weight: 0.075 },
      { subjectKey: 'english', weight: 0.15 },
    ],
    tipBn: '২০২৫–২৬ পরীক্ষায় জীববিজ্ঞান ৩০, রসায়ন ২৫, পদার্থ ১৫ ও ইংরেজি ১৫ নম্বর; বাকি ১৫ নম্বর GK/aptitude/human qualities, যা এই HSC সিলেবাস ট্র্যাকার মাপে না—আলাদা GK ড্রিলও করো।',
    tipEn: 'The 2025–26 paper weights Biology 30, Chemistry 25, Physics 15 and English 15. The remaining 15 marks are GK/aptitude/human qualities, which this HSC syllabus tracker does not measure—use the separate GK drill.',
  },
  {
    key: 'varsity',
    nameBn: 'Varsity ‘ক’ ইউনিট',
    nameEn: 'Varsity Ka unit',
    examBn: 'ঢাবি ‘ক’ ইউনিট + সাধারণ বিশ্ববিদ্যালয়',
    examEn: 'DU Ka unit + general universities',
    patternId: 'du-ka',
    mockKind: 'varsity',
    requiresBn: 'SSC+HSC মিলিয়ে ৮.০০, কোনোটিই ৩.৫০-এর নিচে নয়',
    requiresEn: 'Combined 8.00 with neither GPA below 3.50',
    subjects: [
      { subjectKey: 'bangla', weight: 0.15 },
      { subjectKey: 'english', weight: 0.15 },
      { subjectKey: 'math1', weight: 0.18 },
      { subjectKey: 'math2', weight: 0.17 },
      { subjectKey: 'physics1', weight: 0.1 },
      { subjectKey: 'physics2', weight: 0.1 },
      { subjectKey: 'chemistry1', weight: 0.075 },
      { subjectKey: 'chemistry2', weight: 0.075 },
    ],
    tipBn: 'বাংলা-ইংরেজিও এখানে সমান গুরুত্বপূর্ণ — শুধু সায়েন্স পড়ে ‘ক’ ইউনিটে সুবিধা নেই।',
    tipEn: 'Bangla and English carry real weight here — science alone is not enough for Ka unit.',
  },
];

const STAGES: (keyof ChapterProgressState)[] = ['theoryDone', 'notesDone', 'mcqDone', 'cqDone'];

export interface SubjectReadiness {
  subjectKey: SubjectKey;
  nameBn: string;
  nameEn: string;
  shortBn: string;
  shortEn: string;
  weight: number;
  totalChapters: number;
  /** Chapters with all four stages ticked. */
  finishedChapters: number;
  /** 0–100, the average of the four stages across the subject. */
  percent: number;
  /** percent × weight, on the same 0–100 scale, ready to be summed. */
  weightedPercent: number;
}

export interface TrackReadiness {
  track: AdmissionTrack;
  /** 0–100 readiness across the weighted syllabus. */
  percent: number;
  verdict: ReadinessVerdict;
  subjects: SubjectReadiness[];
  weakest: SubjectReadiness | null;
  strongest: SubjectReadiness | null;
  finishedChapters: number;
  totalChapters: number;
  messageBn: string;
  messageEn: string;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function subjectReadiness(
  subjectKey: SubjectKey,
  progressMap: Record<string, ChapterProgressState>,
  weight: number
): SubjectReadiness {
  const chapters = CHAPTERS.filter((chapter) => chapter.subjectKey === subjectKey);
  const info = getSubjectByKey(subjectKey);
  let stagePoints = 0;
  let finishedChapters = 0;

  for (const chapter of chapters) {
    const state = progressMap[chapter.id];
    let ticked = 0;
    for (const stage of STAGES) {
      if (state && state[stage]) ticked += 1;
    }
    stagePoints += ticked / STAGES.length;
    if (ticked === STAGES.length) finishedChapters += 1;
  }

  const percent = chapters.length ? clampPercent((stagePoints / chapters.length) * 100) : 0;
  return {
    subjectKey,
    nameBn: info.name.bn,
    nameEn: info.name.en,
    shortBn: info.shortName.bn,
    shortEn: info.shortName.en,
    weight,
    totalChapters: chapters.length,
    finishedChapters,
    percent,
    weightedPercent: percent * weight,
  };
}

const verdictOf = (percent: number): ReadinessVerdict =>
  percent >= 85 ? 'ready' : percent >= 65 ? 'almost' : percent >= 40 ? 'building' : 'early';

function messageOf(verdict: ReadinessVerdict, weakest: SubjectReadiness | null): { bn: string; en: string } {
  const gap = weakest
    ? { bn: `${weakest.shortBn} (${weakest.percent}%)`, en: `${weakest.shortEn} (${weakest.percent}%)` }
    : { bn: 'সিলেবাস', en: 'the syllabus' };
  switch (verdict) {
    case 'ready':
      return {
        bn: `প্রস্তুতি প্রায় শেষ — এখন শুধু মক আর ভুলের খাতা। দুর্বলতম: ${gap.bn}।`,
        en: `Nearly done — now it is mocks and the mistake log. Weakest: ${gap.en}.`,
      };
    case 'almost':
      return {
        bn: `ভালো জায়গায় আছ। ${gap.bn} একটু টেনে নিলেই আত্মবিশ্বাসী হওয়া যাবে।`,
        en: `In a good place. Lift ${gap.en} a little and you can walk in confident.`,
      };
    case 'building':
      return {
        bn: `ভিত্তি তৈরি হচ্ছে। এই ট্র্যাকে এগোতে ${gap.bn}-এ বেশি সময় দাও।`,
        en: `The base is forming. To move this track, give more time to ${gap.en}.`,
      };
    default:
      return {
        bn: `এখনো শুরু — আগে ${gap.bn} ধরে নাও, তারপর বাকিগুলো।`,
        en: `Early stage — start with ${gap.en}, then the rest.`,
      };
  }
}

export function trackReadiness(
  track: AdmissionTrack,
  progressMap: Record<string, ChapterProgressState>
): TrackReadiness {
  const subjects = track.subjects.map((item) =>
    subjectReadiness(item.subjectKey, progressMap, item.weight)
  );
  const trackedWeight = subjects.reduce((sum, subject) => sum + subject.weight, 0);
  const weightedCompletion = subjects.reduce((sum, subject) => sum + subject.weightedPercent, 0);
  // Some exam sections (e.g. medical GK/aptitude) are not in the HSC syllabus
  // tracker. Normalize against the subjects we can actually measure.
  const percent = clampPercent(trackedWeight ? weightedCompletion / trackedWeight : 0);
  const sorted = [...subjects].sort((a, b) => a.percent - b.percent);
  const weakest = sorted[0] ?? null;
  const strongest = sorted[sorted.length - 1] ?? null;
  const verdict = verdictOf(percent);
  const { bn, en } = messageOf(verdict, weakest);
  return {
    track,
    percent,
    verdict,
    subjects,
    weakest,
    strongest,
    finishedChapters: subjects.reduce((sum, s) => sum + s.finishedChapters, 0),
    totalChapters: subjects.reduce((sum, s) => sum + s.totalChapters, 0),
    messageBn: bn,
    messageEn: en,
  };
}

export function allTrackReadiness(
  progressMap: Record<string, ChapterProgressState>
): TrackReadiness[] {
  return ADMISSION_TRACKS.map((track) => trackReadiness(track, progressMap));
}

/**
 * Which track gets the extra time.
 *
 * The student's main goal is Medical, so that track is the default: it sits
 * first everywhere, it carries the "main track" badge, and it takes half of the
 * weekly study budget (the other two split the rest). The choice is stored, so
 * an engineering-first student can flip it without losing anything.
 */
export const DEFAULT_PRIMARY_TRACK: TrackKey = 'medical';

/** Share of the weekly study budget the main track takes. */
export const PRIMARY_TRACK_SHARE = 0.5;

export function tracksByPriority(primary: TrackKey): AdmissionTrack[] {
  return [...ADMISSION_TRACKS].sort((a, b) => {
    if (a.key === primary) return -1;
    if (b.key === primary) return 1;
    return ADMISSION_TRACKS.indexOf(a) - ADMISSION_TRACKS.indexOf(b);
  });
}

export interface TrackTimeShare {
  track: AdmissionTrack;
  isPrimary: boolean;
  share: number;
  minutes: number;
}

/** Weekly minutes per track: the main track takes half, the others split the rest. */
export function trackTimeSplit(primary: TrackKey, weeklyMinutes: number): TrackTimeShare[] {
  const others = ADMISSION_TRACKS.length - 1;
  const restShare = others > 0 ? (1 - PRIMARY_TRACK_SHARE) / others : 0;
  return tracksByPriority(primary).map((track) => {
    const isPrimary = track.key === primary;
    const share = isPrimary ? PRIMARY_TRACK_SHARE : restShare;
    return {
      track,
      isPrimary,
      share,
      minutes: Math.round(weeklyMinutes * share),
    };
  });
}

/** Minutes the main-track block gets each day. */
export const DAILY_FOCUS_MINUTES = 45;

export interface DailyFocus {
  trackKey: TrackKey;
  subjectKey: SubjectKey;
  titleBn: string;
  titleEn: string;
  minutes: number;
  whyBn: string;
  whyEn: string;
}

/**
 * Which paper the daily focus block should carry.
 *
 * Among the first four subjects carrying at least 12% of the main-track mix
 * (or the two heaviest if none qualify), it picks the one furthest behind, so
 * the priority block follows the biggest gap — Medical starts with biology,
 * then shifts to chemistry once biology is ahead.
 */
export function dailyFocus(
  primary: TrackKey,
  progressMap: Record<string, ChapterProgressState>,
  minutes = DAILY_FOCUS_MINUTES
): DailyFocus {
  const track = ADMISSION_TRACKS.find((item) => item.key === primary) ?? ADMISSION_TRACKS[0];
  // Only the papers that actually carry weight; the small ones never win the slot.
  const important = track.subjects.filter((item) => item.weight >= 0.12).slice(0, 4);
  const heaviest = (important.length ? important : [...track.subjects].sort((a, b) => b.weight - a.weight).slice(0, 2)).sort(
    (a, b) => b.weight - a.weight
  );
  const scored = heaviest.map((item) => ({
    item,
    readiness: subjectReadiness(item.subjectKey, progressMap, item.weight),
  }));
  scored.sort((a, b) => a.readiness.percent - b.readiness.percent || b.item.weight - a.item.weight);
  const chosen = scored[0];
  return {
    trackKey: track.key,
    subjectKey: chosen.item.subjectKey,
    titleBn: `মূল ট্র্যাক ব্লক — ${chosen.readiness.nameBn}`,
    titleEn: `Main-track block — ${chosen.readiness.nameEn}`,
    minutes,
    whyBn: `${track.nameBn} তোমার মূল ট্র্যাক, আর ${chosen.readiness.nameBn} এখন সবচেয়ে পিছিয়ে (${chosen.readiness.percent}%) — তাই দিনের সবচেয়ে তাজা স্লটটা এখানে।`,
    whyEn: `${track.nameEn} is your main track and ${chosen.readiness.nameEn} is furthest behind (${chosen.readiness.percent}%) — so it gets the freshest slot of the day.`,
  };
}
