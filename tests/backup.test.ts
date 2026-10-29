import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BACKUP_APP_ID,
  buildBackupSyncOps,
  buildFirstSyncMigrationOps,
  parseStudyBackup,
  prepareBackupForAccount,
} from '../src/lib/backup';
import type { StudyBackupData } from '../src/lib/backup';

const NOW = '2026-10-29T06:00:00.000Z';

function validData(): StudyBackupData {
  return {
    profile: {
      id: 'student-from-backup',
      email: 'old@example.com',
      fullName: 'Test Student',
      collegeName: 'Test College',
      board: 'Jashore',
      targetGoal: 'BUET / Engineering',
      avatarColor: '#4f46e5',
      xp: 120,
      chaptersMastered: 1,
      quizzesTaken: 1,
      bestAccuracy: 80,
      studyMinutes: 25,
      streakDays: 2,
      bookmarks: ['formula-1'],
      solvedCqs: ['cq-1'],
      mistakeIds: ['mcq-1'],
      srsMasteredIds: ['formula-1'],
      completedPracticals: ['practical-1'],
    },
    progressMap: {
      'physics1-1': {
        theoryDone: true,
        notesDone: true,
        mcqDone: false,
        cqDone: false,
      },
    },
    quizHistory: [
      {
        id: 'quiz-1',
        subjectKey: 'physics1',
        examTitle: 'Physics assessment',
        totalQuestions: 5,
        correctAnswers: 4,
        wrongAnswers: 1,
        score: 3.75,
        accuracy: 80,
        durationSeconds: 240,
        createdAt: NOW,
      },
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Revise vectors',
        subjectKey: 'physics1',
        priority: 'high',
        completed: false,
        dueDate: '2026-10-29',
        createdAt: NOW,
      },
    ],
    sessions: [
      {
        id: 'session-1',
        subjectKey: 'chemistry1',
        durationMinutes: 25,
        note: 'Buffer solutions',
        createdAt: NOW,
      },
    ],
    personalNotes: [
      {
        id: 'note-1',
        subjectKey: 'math1',
        chapterTitle: 'Matrices',
        title: 'Determinant shortcut',
        content: 'Remember the scalar exponent.',
        formula: '|kA| = k^n |A|',
        createdAt: NOW,
      },
    ],
  };
}

function validBackup() {
  return {
    app: BACKUP_APP_ID,
    exportedAt: NOW,
    ...validData(),
  };
}

test('a complete exported backup passes validation without changing its data', () => {
  const parsed = parseStudyBackup(validBackup());
  assert.deepEqual(parsed, validData());
});

test('legacy optional profile lists are normalized to empty arrays', () => {
  const backup = validBackup();
  delete (backup.profile as Partial<typeof backup.profile>).solvedCqs;
  delete (backup.profile as Partial<typeof backup.profile>).mistakeIds;
  delete (backup.profile as Partial<typeof backup.profile>).srsMasteredIds;
  delete (backup.profile as Partial<typeof backup.profile>).completedPracticals;

  const parsed = parseStudyBackup(backup);
  assert.deepEqual(parsed.profile.solvedCqs, []);
  assert.deepEqual(parsed.profile.mistakeIds, []);
  assert.deepEqual(parsed.profile.srsMasteredIds, []);
  assert.deepEqual(parsed.profile.completedPracticals, []);
});

test('wrong app identifiers and malformed JSON shapes are rejected', () => {
  assert.throws(() => parseStudyBackup(null), /Invalid backup/);
  assert.throws(() => parseStudyBackup({}), /Invalid backup/);
  assert.throws(
    () => parseStudyBackup({ ...validBackup(), app: 'another-app' }),
    /Nokkhotro HSC 2028/
  );
  assert.throws(
    () => parseStudyBackup({ ...validBackup(), tasks: {} }),
    /tasks must be a list/
  );
});

test('invalid nested records fail the whole import', () => {
  const badProfile = validBackup();
  badProfile.profile.bookmarks = 'formula-1' as unknown as string[];
  assert.throws(() => parseStudyBackup(badProfile), /profile.bookmarks/);

  const badProgress = validBackup();
  badProgress.progressMap['physics1-1'].theoryDone = 'yes' as unknown as boolean;
  assert.throws(() => parseStudyBackup(badProgress), /theoryDone/);

  const badSubject = validBackup();
  badSubject.tasks[0].subjectKey = 'unknown-subject' as never;
  assert.throws(() => parseStudyBackup(badSubject), /unknown subject/);

  const badDate = validBackup();
  badDate.sessions[0].createdAt = 'not-a-date';
  assert.throws(() => parseStudyBackup(badDate), /valid date/);
});

test('cross-account restores get fresh record ids and keep the active identity', () => {
  let nextId = 0;
  const restored = prepareBackupForAccount(
    validData(),
    'currently-signed-in-student',
    'current@example.com',
    () => `new-id-${++nextId}`
  );

  assert.equal(restored.profile.id, 'currently-signed-in-student');
  assert.equal(restored.profile.email, 'current@example.com');
  assert.deepEqual(
    [
      restored.quizHistory[0].id,
      restored.tasks[0].id,
      restored.sessions[0].id,
      restored.personalNotes[0].id,
    ],
    ['new-id-1', 'new-id-2', 'new-id-3', 'new-id-4']
  );
  assert.equal(restored.quizHistory[0].createdAt, NOW);
  assert.deepEqual(restored.progressMap, validData().progressMap);
});

test('same-account restores retain record ids for idempotent upserts', () => {
  const data = validData();
  const restored = prepareBackupForAccount(
    data,
    data.profile.id,
    'new-email@example.com',
    () => {
      throw new Error('No new id should be needed for a same-account restore.');
    }
  );

  assert.equal(restored.quizHistory[0].id, 'quiz-1');
  assert.equal(restored.tasks[0].id, 'task-1');
  assert.equal(restored.sessions[0].id, 'session-1');
  assert.equal(restored.personalNotes[0].id, 'note-1');
  assert.equal(restored.profile.email, 'new-email@example.com');
});

test('first sign-in migrates quizzes and notes only into empty cloud tables', () => {
  const operations = buildFirstSyncMigrationOps(
    validData(),
    'new-account',
    NOW,
    {
      hsc28_chapter_progress: [],
      hsc28_quiz_attempts: [],
      hsc28_personal_notes: null,
      hsc28_study_tasks: [{ id: 'existing-cloud-task' }],
      hsc28_study_sessions: [{ id: 'existing-cloud-session' }],
    }
  );

  assert.deepEqual(
    operations.map((operation) => operation.table),
    [
      'hsc28_chapter_progress',
      'hsc28_quiz_attempts',
      'hsc28_personal_notes',
    ]
  );
  assert.ok(
    operations.every((operation) => operation.payload.user_id === 'new-account')
  );
});

test('restore writes cover every record and always use the active user id', () => {
  const data = validData();
  const operations = buildBackupSyncOps(
    data,
    'currently-signed-in-student',
    NOW
  );

  assert.equal(operations.length, 5);
  assert.deepEqual(
    operations.map((operation) => operation.table),
    [
      'hsc28_chapter_progress',
      'hsc28_quiz_attempts',
      'hsc28_study_tasks',
      'hsc28_study_sessions',
      'hsc28_personal_notes',
    ]
  );

  for (const operation of operations) {
    assert.equal(operation.op, 'upsert');
    if (operation.op !== 'upsert') continue;
    assert.equal(operation.payload.user_id, 'currently-signed-in-student');
    assert.notEqual(operation.payload.user_id, data.profile.id);
  }

  const quiz = operations[1];
  assert.ok(quiz.op === 'upsert');
  assert.equal(quiz.payload.id, 'quiz-1');
  assert.equal(quiz.payload.created_at, NOW);
  assert.equal(quiz.payload.duration_seconds, 240);
});
