import type {
  ChapterProgressState,
  PersonalNote,
  QuizAttemptRecord,
  StudentProfile,
  StudySessionRecord,
  StudyTask,
  SubjectKey,
} from '../types';
import { SUBJECTS } from '../data/syllabusData';
import type { SyncOp } from './sync';

export const BACKUP_APP_ID = 'nokkhotro-hsc-2028';

export interface StudyBackupData {
  profile: StudentProfile;
  progressMap: Record<string, ChapterProgressState>;
  quizHistory: QuizAttemptRecord[];
  tasks: StudyTask[];
  sessions: StudySessionRecord[];
  personalNotes: PersonalNote[];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid backup: ${field} must be text.`);
  }
  return value;
}

function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid backup: ${field} must be true or false.`);
  }
  return value;
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid backup: ${field} must be a finite number.`);
  }
  return value;
}

function requiredNonNegativeNumber(value: unknown, field: string): number {
  const parsed = requiredNumber(value, field);
  if (parsed < 0) throw new Error(`Invalid backup: ${field} cannot be negative.`);
  return parsed;
}

function requiredStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Invalid backup: ${field} must be a list of text values.`);
  }
  return [...value] as string[];
}

function optionalStringArray(value: unknown, field: string): string[] {
  return value === undefined ? [] : requiredStringArray(value, field);
}

function requiredSubject(value: unknown, field: string): SubjectKey {
  const key = requiredString(value, field);
  if (!SUBJECTS.some((subject) => subject.key === key)) {
    throw new Error(`Invalid backup: ${field} contains an unknown subject.`);
  }
  return key as SubjectKey;
}

function requiredTimestamp(value: unknown, field: string): string {
  const timestamp = requiredString(value, field);
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error(`Invalid backup: ${field} must be a valid date.`);
  }
  return timestamp;
}

function parseProfile(value: unknown): StudentProfile {
  if (!isRecord(value)) throw new Error('Invalid backup: profile is missing.');
  return {
    id: requiredString(value.id, 'profile.id'),
    email:
      value.email === undefined
        ? undefined
        : requiredString(value.email, 'profile.email'),
    fullName: requiredString(value.fullName, 'profile.fullName'),
    collegeName: requiredString(value.collegeName, 'profile.collegeName'),
    board: requiredString(value.board, 'profile.board'),
    targetGoal: requiredString(value.targetGoal, 'profile.targetGoal'),
    avatarColor: requiredString(value.avatarColor, 'profile.avatarColor'),
    xp: requiredNonNegativeNumber(value.xp, 'profile.xp'),
    chaptersMastered: requiredNonNegativeNumber(
      value.chaptersMastered,
      'profile.chaptersMastered'
    ),
    quizzesTaken: requiredNonNegativeNumber(
      value.quizzesTaken,
      'profile.quizzesTaken'
    ),
    bestAccuracy: requiredNonNegativeNumber(
      value.bestAccuracy,
      'profile.bestAccuracy'
    ),
    studyMinutes: requiredNonNegativeNumber(
      value.studyMinutes,
      'profile.studyMinutes'
    ),
    streakDays: requiredNonNegativeNumber(
      value.streakDays,
      'profile.streakDays'
    ),
    bookmarks: requiredStringArray(value.bookmarks, 'profile.bookmarks'),
    solvedCqs: optionalStringArray(value.solvedCqs, 'profile.solvedCqs'),
    mistakeIds: optionalStringArray(value.mistakeIds, 'profile.mistakeIds'),
    srsMasteredIds: optionalStringArray(
      value.srsMasteredIds,
      'profile.srsMasteredIds'
    ),
    completedPracticals: optionalStringArray(
      value.completedPracticals,
      'profile.completedPracticals'
    ),
  };
}

function parseProgressMap(
  value: unknown
): Record<string, ChapterProgressState> {
  if (!isRecord(value)) throw new Error('Invalid backup: progressMap is missing.');
  const result: Record<string, ChapterProgressState> = {};
  for (const [chapterId, progress] of Object.entries(value)) {
    if (!chapterId || !isRecord(progress)) {
      throw new Error('Invalid backup: progressMap contains an invalid chapter.');
    }
    result[chapterId] = {
      theoryDone: requiredBoolean(
        progress.theoryDone,
        `progressMap.${chapterId}.theoryDone`
      ),
      notesDone: requiredBoolean(
        progress.notesDone,
        `progressMap.${chapterId}.notesDone`
      ),
      mcqDone: requiredBoolean(
        progress.mcqDone,
        `progressMap.${chapterId}.mcqDone`
      ),
      cqDone: requiredBoolean(
        progress.cqDone,
        `progressMap.${chapterId}.cqDone`
      ),
    };
  }
  return result;
}

function parseQuizHistory(value: unknown): QuizAttemptRecord[] {
  if (!Array.isArray(value)) throw new Error('Invalid backup: quizHistory must be a list.');
  return value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid backup: quizHistory.${index} is invalid.`);
    const subjectKey = requiredString(item.subjectKey, `quizHistory.${index}.subjectKey`);
    if (subjectKey !== 'all') requiredSubject(subjectKey, `quizHistory.${index}.subjectKey`);
    return {
      id: requiredString(item.id, `quizHistory.${index}.id`),
      subjectKey: subjectKey as SubjectKey | 'all',
      examTitle: requiredString(item.examTitle, `quizHistory.${index}.examTitle`),
      totalQuestions: requiredNonNegativeNumber(
        item.totalQuestions,
        `quizHistory.${index}.totalQuestions`
      ),
      correctAnswers: requiredNonNegativeNumber(
        item.correctAnswers,
        `quizHistory.${index}.correctAnswers`
      ),
      wrongAnswers: requiredNonNegativeNumber(
        item.wrongAnswers,
        `quizHistory.${index}.wrongAnswers`
      ),
      score: requiredNumber(item.score, `quizHistory.${index}.score`),
      accuracy: requiredNonNegativeNumber(
        item.accuracy,
        `quizHistory.${index}.accuracy`
      ),
      durationSeconds: requiredNonNegativeNumber(
        item.durationSeconds,
        `quizHistory.${index}.durationSeconds`
      ),
      createdAt: requiredTimestamp(item.createdAt, `quizHistory.${index}.createdAt`),
    };
  });
}

function parseTasks(value: unknown): StudyTask[] {
  if (!Array.isArray(value)) throw new Error('Invalid backup: tasks must be a list.');
  return value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid backup: tasks.${index} is invalid.`);
    const priority = requiredString(item.priority, `tasks.${index}.priority`);
    if (!['high', 'medium', 'low'].includes(priority)) {
      throw new Error(`Invalid backup: tasks.${index}.priority is unknown.`);
    }
    return {
      id: requiredString(item.id, `tasks.${index}.id`),
      title: requiredString(item.title, `tasks.${index}.title`),
      subjectKey: requiredSubject(item.subjectKey, `tasks.${index}.subjectKey`),
      priority: priority as StudyTask['priority'],
      completed: requiredBoolean(item.completed, `tasks.${index}.completed`),
      dueDate: requiredTimestamp(item.dueDate, `tasks.${index}.dueDate`),
      createdAt: requiredTimestamp(item.createdAt, `tasks.${index}.createdAt`),
    };
  });
}

function parseSessions(value: unknown): StudySessionRecord[] {
  if (!Array.isArray(value)) throw new Error('Invalid backup: sessions must be a list.');
  return value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid backup: sessions.${index} is invalid.`);
    return {
      id: requiredString(item.id, `sessions.${index}.id`),
      subjectKey: requiredSubject(item.subjectKey, `sessions.${index}.subjectKey`),
      durationMinutes: requiredNonNegativeNumber(
        item.durationMinutes,
        `sessions.${index}.durationMinutes`
      ),
      note: requiredString(item.note, `sessions.${index}.note`),
      createdAt: requiredTimestamp(item.createdAt, `sessions.${index}.createdAt`),
    };
  });
}

function parsePersonalNotes(value: unknown): PersonalNote[] {
  if (!Array.isArray(value)) throw new Error('Invalid backup: personalNotes must be a list.');
  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Invalid backup: personalNotes.${index} is invalid.`);
    }
    return {
      id: requiredString(item.id, `personalNotes.${index}.id`),
      subjectKey: requiredSubject(
        item.subjectKey,
        `personalNotes.${index}.subjectKey`
      ),
      chapterTitle: requiredString(
        item.chapterTitle,
        `personalNotes.${index}.chapterTitle`
      ),
      title: requiredString(item.title, `personalNotes.${index}.title`),
      content: requiredString(item.content, `personalNotes.${index}.content`),
      formula: requiredString(item.formula, `personalNotes.${index}.formula`),
      createdAt: requiredTimestamp(
        item.createdAt,
        `personalNotes.${index}.createdAt`
      ),
    };
  });
}

/**
 * Validates and normalizes an untrusted JSON backup before any application
 * state is replaced. A malformed file must fail as a whole rather than leave
 * half of the student's data restored.
 */
export function parseStudyBackup(value: unknown): StudyBackupData {
  if (!isRecord(value) || value.app !== BACKUP_APP_ID) {
    throw new Error('Invalid backup: choose a Nokkhotro HSC 2028 JSON backup.');
  }

  return {
    profile: parseProfile(value.profile),
    progressMap: parseProgressMap(value.progressMap),
    quizHistory: parseQuizHistory(value.quizHistory),
    tasks: parseTasks(value.tasks),
    sessions: parseSessions(value.sessions),
    personalNotes: parsePersonalNotes(value.personalNotes),
  };
}

/**
 * Binds a backup to the active identity. Record UUIDs are globally unique in
 * Supabase, so importing a file from another account must allocate fresh IDs;
 * otherwise an upsert could collide with (or be rejected by) the source
 * account's rows. Same-account restores retain IDs and remain idempotent.
 */
export function prepareBackupForAccount(
  data: StudyBackupData,
  userId: string,
  email: string | undefined,
  createId: () => string
): StudyBackupData {
  const comesFromAnotherAccount = data.profile.id !== userId;
  const rehome = <T extends { id: string }>(record: T): T => ({
    ...record,
    id: comesFromAnotherAccount ? createId() : record.id,
  });

  return {
    ...data,
    profile: {
      ...data.profile,
      id: userId,
      email,
      isDemo: false,
    },
    quizHistory: data.quizHistory.map(rehome),
    tasks: data.tasks.map(rehome),
    sessions: data.sessions.map(rehome),
    personalNotes: data.personalNotes.map(rehome),
  };
}

/**
 * Converts restored records into the same durable writes used by the live UI.
 * Keeping this mapping pure makes it possible to verify that no restored
 * record can accidentally be written under another student's account.
 */
export function buildBackupSyncOps(
  data: StudyBackupData,
  userId: string,
  syncedAt: string
): SyncOp[] {
  const ops: SyncOp[] = [];

  for (const [chapterId, progress] of Object.entries(data.progressMap)) {
    ops.push({
      op: 'upsert',
      table: 'hsc28_chapter_progress',
      onConflict: 'user_id,chapter_id',
      payload: {
        user_id: userId,
        chapter_id: chapterId,
        theory_done: progress.theoryDone,
        notes_done: progress.notesDone,
        mcq_done: progress.mcqDone,
        cq_done: progress.cqDone,
        updated_at: syncedAt,
      },
    });
  }

  for (const quiz of data.quizHistory) {
    ops.push({
      op: 'upsert',
      table: 'hsc28_quiz_attempts',
      onConflict: 'id',
      payload: {
        id: quiz.id,
        user_id: userId,
        subject_key: quiz.subjectKey,
        exam_title: quiz.examTitle,
        total_questions: quiz.totalQuestions,
        correct_answers: quiz.correctAnswers,
        wrong_answers: quiz.wrongAnswers,
        score: quiz.score,
        accuracy: quiz.accuracy,
        duration_seconds: quiz.durationSeconds,
        created_at: quiz.createdAt,
      },
    });
  }

  for (const task of data.tasks) {
    ops.push({
      op: 'upsert',
      table: 'hsc28_study_tasks',
      onConflict: 'id',
      payload: {
        id: task.id,
        user_id: userId,
        title: task.title,
        subject_key: task.subjectKey,
        priority: task.priority,
        completed: task.completed,
        due_date: task.dueDate,
        created_at: task.createdAt,
      },
    });
  }

  for (const session of data.sessions) {
    ops.push({
      op: 'upsert',
      table: 'hsc28_study_sessions',
      onConflict: 'id',
      payload: {
        id: session.id,
        user_id: userId,
        subject_key: session.subjectKey,
        duration_minutes: session.durationMinutes,
        note: session.note,
        created_at: session.createdAt,
      },
    });
  }

  for (const note of data.personalNotes) {
    ops.push({
      op: 'upsert',
      table: 'hsc28_personal_notes',
      onConflict: 'id',
      payload: {
        id: note.id,
        user_id: userId,
        subject_key: note.subjectKey,
        chapter_title: note.chapterTitle,
        title: note.title,
        content: note.content,
        formula: note.formula,
        created_at: note.createdAt,
      },
    });
  }

  return ops;
}
