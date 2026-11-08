import { CHAPTERS, SUBJECTS } from '../data/syllabusData';
import type { ClassSlot } from './masterRoutine';
import type { Lang, SubjectKey } from '../types';

/**
 * A focus session is intentionally device-local while it is running. Syncing a
 * live countdown between phones would make two devices disagree about which
 * screen is actually in focus.
 */
export const FOCUS_SESSION_KEY = 'hsc28_focus_session_v1';
export const FOCUS_SESSION_VERSION = 1;
export const MAX_FOCUS_SESSION_AGE_MS = 12 * 60 * 60 * 1000;

export type FocusPauseReason =
  | 'tab-hidden'
  | 'window-blur'
  | 'fullscreen-exit'
  | 'reload'
  | 'emergency';

export interface StudyFocusPlan {
  dateKey: string;
  slotIndex: number;
  subjectKey: SubjectKey;
  subjectBn: string;
  subjectEn: string;
  chapterId: string;
  chapterBn: string;
  chapterEn: string;
  topicsBn: string[];
  topicsEn: string[];
  durationMinutes: number;
}

export interface StoredFocusSession extends StudyFocusPlan {
  version: typeof FOCUS_SESSION_VERSION;
  id: string;
  createdAt: number;
  updatedAt: number;
  remainingSeconds: number;
  status: 'running' | 'paused';
  pauseReason?: FocusPauseReason;
  interruptions: number;
}

/**
 * Key-topic text is authored as a short comma-separated textbook boundary.
 * Keep slashes, ampersands and parenthetical examples together: they describe
 * one study unit rather than separate lessons.
 */
export function splitStudyTopics(value: string): string[] {
  return value
    .split(/[,;\n।]+/u)
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** Five minutes to preview/recall, then roughly ten focused minutes per unit. */
export function focusMinutesForTopicCount(topicCount: number): number {
  const safeCount = Math.max(1, Math.min(12, Math.round(topicCount) || 1));
  return Math.min(50, Math.max(25, 5 + safeCount * 10));
}

export function focusPlanForSlot(
  slot: ClassSlot,
  dateKey: string,
  slotIndex: number,
  lang: Lang = 'bn'
): StudyFocusPlan {
  const chapter = CHAPTERS.find((item) => item.id === slot.chapterId);
  const topicsBn = splitStudyTopics(chapter?.keyTopics.bn || slot.chapterBn);
  const topicsEn = splitStudyTopics(chapter?.keyTopics.en || slot.chapterEn);
  const topicCount = Math.max(lang === 'bn' ? topicsBn.length : topicsEn.length, 1);

  return {
    dateKey,
    slotIndex,
    subjectKey: slot.subjectKey,
    subjectBn: slot.subjectBn,
    subjectEn: slot.subjectEn,
    chapterId: slot.chapterId,
    chapterBn: slot.chapterBn,
    chapterEn: slot.chapterEn,
    topicsBn,
    topicsEn,
    durationMinutes: focusMinutesForTopicCount(topicCount),
  };
}

function sessionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `focus-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function createFocusSession(
  plan: StudyFocusPlan,
  now = Date.now()
): StoredFocusSession {
  return {
    ...plan,
    version: FOCUS_SESSION_VERSION,
    id: sessionId(),
    createdAt: now,
    updatedAt: now,
    remainingSeconds: plan.durationMinutes * 60,
    status: 'running',
    interruptions: 0,
  };
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 12 &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0 && item.length <= 240)
  );
}

function isStoredFocusSession(value: unknown): value is StoredFocusSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Partial<StoredFocusSession>;
  const totalSeconds = Number(item.durationMinutes) * 60;
  return (
    item.version === FOCUS_SESSION_VERSION &&
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.dateKey === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.dateKey) &&
    Number.isInteger(item.slotIndex) &&
    Number(item.slotIndex) >= 0 &&
    Number(item.slotIndex) <= 1 &&
    typeof item.subjectKey === 'string' &&
    SUBJECTS.some((subject) => subject.key === item.subjectKey) &&
    typeof item.subjectBn === 'string' && item.subjectBn.length <= 120 &&
    typeof item.subjectEn === 'string' && item.subjectEn.length <= 120 &&
    typeof item.chapterId === 'string' && item.chapterId.length > 0 && item.chapterId.length <= 120 &&
    typeof item.chapterBn === 'string' && item.chapterBn.length <= 240 &&
    typeof item.chapterEn === 'string' && item.chapterEn.length <= 240 &&
    isStringArray(item.topicsBn) &&
    isStringArray(item.topicsEn) &&
    Number.isInteger(item.durationMinutes) &&
    Number(item.durationMinutes) >= 5 &&
    Number(item.durationMinutes) <= 120 &&
    Number.isFinite(item.createdAt) &&
    Number.isFinite(item.updatedAt) &&
    Number.isInteger(item.remainingSeconds) &&
    Number(item.remainingSeconds) > 0 &&
    Number(item.remainingSeconds) <= totalSeconds &&
    (item.status === 'running' || item.status === 'paused') &&
    Number.isInteger(item.interruptions) &&
    Number(item.interruptions) >= 0 &&
    Number(item.interruptions) <= 10_000
  );
}

export function saveFocusSession(session: StoredFocusSession): StoredFocusSession {
  try {
    localStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage may be unavailable; the in-memory countdown still works.
  }
  return session;
}

/**
 * A restored countdown never advances automatically. Time spent with the page
 * closed is not study time; the student explicitly resumes after returning.
 */
export function loadFocusSession(now = Date.now()): StoredFocusSession | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FOCUS_SESSION_KEY) || 'null');
    if (!isStoredFocusSession(parsed)) {
      localStorage.removeItem(FOCUS_SESSION_KEY);
      return null;
    }
    if (now - parsed.createdAt > MAX_FOCUS_SESSION_AGE_MS || parsed.createdAt > now + 60_000) {
      localStorage.removeItem(FOCUS_SESSION_KEY);
      return null;
    }
    const restored: StoredFocusSession = {
      ...parsed,
      updatedAt: now,
      status: 'paused',
      pauseReason: 'reload',
      interruptions: parsed.interruptions + (parsed.status === 'running' ? 1 : 0),
    };
    saveFocusSession(restored);
    return restored;
  } catch {
    try {
      localStorage.removeItem(FOCUS_SESSION_KEY);
    } catch {
      // Ignore blocked storage.
    }
    return null;
  }
}

export function clearFocusSession(): void {
  try {
    localStorage.removeItem(FOCUS_SESSION_KEY);
  } catch {
    // Ignore blocked storage.
  }
}
