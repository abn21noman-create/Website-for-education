import { DEFAULT_TIME_SETTINGS, TimeSettings, toDateKey } from './masterRoutine';
import type { Chronotype, LearnedItem } from './studyScience';
import { classSlotsForDay, dayNumberForDate } from './masterRoutine';

/**
 * Local state for the master routine.
 *
 * Everything lives on the device: the start date the student picked, which
 * tasks are ticked, the minutes actually studied each day, and the hours the
 * time plan should assume. No account needed, and the routine keeps working
 * offline — which is the whole point of a printed plan.
 */

export const ROUTINE_KEY = 'hsc28_master_routine_v1';

export interface RoutineState {
  /** Calendar date that counts as Day 1 of the 391-day plan. */
  startDate: string;
  /** When this student's attention is sharpest — shifts the timetable order. */
  chronotype: Chronotype;
  /** `${dateKey}|${slotIndex}|${taskIndex}` → ticked. Revision tasks use `rev`. */
  tasks: Record<string, boolean>;
  /** dateKey → minutes studied that day. */
  minutes: Record<string, number>;
  settings: TimeSettings;
}

export function emptyRoutineState(startDate = toDateKey(new Date())): RoutineState {
  return {
    startDate,
    chronotype: 'neutral',
    tasks: {},
    minutes: {},
    settings: { ...DEFAULT_TIME_SETTINGS },
  };
}

export function loadRoutineState(): RoutineState {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return emptyRoutineState();
    const parsed = JSON.parse(raw) as Partial<RoutineState>;
    return {
      startDate: typeof parsed.startDate === 'string' ? parsed.startDate : toDateKey(new Date()),
      chronotype:
        parsed.chronotype === 'morning' || parsed.chronotype === 'evening'
          ? parsed.chronotype
          : 'neutral',
      tasks: parsed.tasks && typeof parsed.tasks === 'object' ? parsed.tasks : {},
      minutes: parsed.minutes && typeof parsed.minutes === 'object' ? parsed.minutes : {},
      settings: { ...DEFAULT_TIME_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    return emptyRoutineState();
  }
}

export function saveRoutineState(state: RoutineState): RoutineState {
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(state));
  } catch {
    /* private mode or a full quota — the screen still works for this session */
  }
  return state;
}

export function taskKey(dateKey: string, slotIndex: number, taskIndex: number): string {
  return `${dateKey}|${slotIndex}|${taskIndex}`;
}

export function revisionTaskKey(dateKey: string, taskIndex: number): string {
  return `${dateKey}|rev|${taskIndex}`;
}

export function toggleRoutineTask(state: RoutineState, key: string): RoutineState {
  const tasks = { ...state.tasks };
  if (tasks[key]) delete tasks[key];
  else tasks[key] = true;
  return saveRoutineState({ ...state, tasks });
}

export function logStudyMinutes(state: RoutineState, dateKey: string, delta: number): RoutineState {
  const minutes = { ...state.minutes };
  const next = Math.max(0, Math.min(900, (minutes[dateKey] || 0) + delta));
  if (next === 0) delete minutes[dateKey];
  else minutes[dateKey] = next;
  return saveRoutineState({ ...state, minutes });
}

export function setStartDate(state: RoutineState, startDate: string): RoutineState {
  return saveRoutineState({ ...state, startDate });
}

export function setTimeSettings(state: RoutineState, settings: TimeSettings): RoutineState {
  return saveRoutineState({ ...state, settings });
}

/** Ticked-task count for one date, across both class slots and the revision list. */
export function completedTasksForDate(state: RoutineState, dateKey: string): number {
  return Object.keys(state.tasks).filter(
    (key) => key.startsWith(`${dateKey}|`) && state.tasks[key]
  ).length;
}

export function setChronotype(state: RoutineState, chronotype: Chronotype): RoutineState {
  return saveRoutineState({ ...state, chronotype });
}

/**
 * Chapters already studied, derived from the ticked routine tasks.
 *
 * Ticking "watch the class" is what marks a chapter as learned; the spaced
 * schedule then brings it back on day 1, 3, 7 and 21.
 */
export function learnedChapters(state: RoutineState): LearnedItem[] {
  const out: LearnedItem[] = [];
  const seen = new Set<string>();
  Object.keys(state.tasks).forEach((key) => {
    if (!state.tasks[key]) return;
    const [dateKey, slotRaw, taskRaw] = key.split('|');
    if (slotRaw === 'rev' || slotRaw === 'due') return;
    if (taskRaw !== '0') return; // only the first task marks the chapter as learned
    const dayNumber = dayNumberForDate(state.startDate, dateKey);
    if (!dayNumber) return;
    const slotIndex = Number(slotRaw);
    const slot = classSlotsForDay(dayNumber)[slotIndex];
    if (!slot || !slot.chapterId) return;
    const unique = `${dateKey}|${slot.chapterId}`;
    if (seen.has(unique)) return;
    seen.add(unique);
    out.push({
      learnedOn: dateKey,
      chapterId: slot.chapterId,
      chapterBn: slot.chapterBn,
      chapterEn: slot.chapterEn,
      subjectBn: slot.subjectBn,
      subjectEn: slot.subjectEn,
    });
  });
  return out.sort((a, b) => a.learnedOn.localeCompare(b.learnedOn));
}

export function dueTaskKey(dateKey: string, chapterId: string, interval: number): string {
  return `${dateKey}|due|${chapterId}|${interval}`;
}
