import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
import type { ChapterProgressState, SubjectKey } from '../types';
import type { MockKind } from './mockPlan';

/**
 * Three admission tracks, measured against the syllabus the app already tracks.
 *
 * Every chapter in the syllabus carries four stages (theory → notes → MCQ → CQ),
 * so a track's readiness is simply: how much of the weighted syllabus for that
 * track is actually done. The weights are the app's reading of the published
 * marks distribution, trimmed to exactly 100% — they are a planning guide, not
 * an official statement, and the UI says so.
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
    examBn: 'BUET প্রিলি + ইঞ্জিনিয়ারিং বিশ্ববিদ্যালয়',
    examEn: 'BUET preliminary + engineering universities',
    patternId: 'buet-preli',
    mockKind: 'engineering',
    requiresBn: 'SSC+HSC মিলিয়ে ৮.০০, পদার্থ-রসায়ন-গণিত প্রতিটিতে ৪.০০',
    requiresEn: 'Combined 8.00, with 4.00 in each of physics, chemistry and maths',
    subjects: [
      { subjectKey: 'math1', weight: 0.18 },
      { subjectKey: 'math2', weight: 0.17 },
      { subjectKey: 'physics1', weight: 0.18 },
      { subjectKey: 'physics2', weight: 0.17 },
      { subjectKey: 'chemistry1', weight: 0.12 },
      { subjectKey: 'chemistry2', weight: 0.1 },
      { subjectKey: 'english', weight: 0.08 },
    ],
    tipBn: 'গণিত আর পদার্থ আগে — BUET-এ ওই দুটোতেই সবচেয়ে বেশি নম্বর, আর সময়ও সবচেয়ে কম।',
    tipEn: 'Maths and physics first — they carry the most marks and the tightest time.',
  },
  {
    key: 'medical',
    nameBn: 'Medical',
    nameEn: 'Medical',
    examBn: 'MBBS মেডিকেল ভর্তি',
    examEn: 'MBBS medical admission',
    patternId: 'medical-mbbs',
    mockKind: 'medical',
    requiresBn: 'SSC+HSC মিলিয়ে ৯.০০, প্রতিটি বিষয়ে ৪.০০, জীববিজ্ঞানে ৪.০০',
    requiresEn: 'Combined 9.00, at least 4.00 in every subject including biology',
    subjects: [
      { subjectKey: 'biology1', weight: 0.24 },
      { subjectKey: 'biology2', weight: 0.24 },
      { subjectKey: 'chemistry1', weight: 0.14 },
      { subjectKey: 'chemistry2', weight: 0.14 },
      { subjectKey: 'physics1', weight: 0.12 },
      { subjectKey: 'physics2', weight: 0.1 },
      { subjectKey: 'english', weight: 0.02 },
    ],
    tipBn: 'জীববিজ্ঞান দুই পত্র মিলিয়ে প্রায় অর্ধেক — এখানেই সবার আগে সময় দাও।',
    tipEn: 'Biology is nearly half the paper — it earns first priority.',
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
  const percent = clampPercent(subjects.reduce((sum, s) => sum + s.weightedPercent, 0));
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
