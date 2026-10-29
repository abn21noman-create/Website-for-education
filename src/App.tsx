import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import {
  ActiveTab,
  ChapterProgressState,
  Lang,
  PersonalNote,
  QuizAttemptRecord,
  StudentProfile,
  StudySessionRecord,
  StudyTask,
  SubjectKey,
  Theme,
} from './types';
import { supabase } from './lib/supabase';
import {
  initSyncNetworkWatcher,
  setSyncUser,
  syncWrite,
  useSyncStatus,
} from './lib/sync';
import {
  BACKUP_APP_ID,
  buildBackupSyncOps,
  parseStudyBackup,
  prepareBackupForAccount,
} from './lib/backup';
import type { StudyBackupData } from './lib/backup';
import { buildHash, parseRoute } from './lib/router';
import { CHAPTERS, SUBJECTS } from './data/syllabusData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SyllabusTrackerView } from './components/SyllabusTrackerView';
import { FormulaVaultView } from './components/FormulaVaultView';
import { CqBankView } from './components/CqBankView';
import { McqExamView } from './components/McqExamView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { GpaCalculatorView } from './components/GpaCalculatorView';
import { LeaderboardView } from './components/LeaderboardView';
import { VirtualLabView } from './components/VirtualLabView';
import { AnalyticsView } from './components/AnalyticsView';
import { StudentHubView } from './components/StudentHubView';
import { AdmissionView } from './components/AdmissionView';
import { PracticalWritingView } from './components/PracticalWritingView';
import { AuthModal } from './components/AuthModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { Footer } from './components/Footer';

const STORAGE_KEYS = {
  lang: 'hsc28_lang',
  theme: 'hsc28_soft_theme',
  profile: 'hsc28_profile',
  progress: 'hsc28_progress',
  quizzes: 'hsc28_quizzes',
  tasks: 'hsc28_tasks',
  sessions: 'hsc28_sessions',
  notes: 'hsc28_notes',
};

const DEFAULT_STARTER_TASKS: StudyTask[] = [
  {
    id: 'starter-1',
    title: 'পদার্থবিজ্ঞান ১ম পত্র — ভেক্টর অধ্যায়ের সামান্তরিক সূত্র ও নদী-নৌকার গাণিতিক সমস্যা অনুশীলন',
    subjectKey: 'physics1',
    priority: 'high',
    completed: false,
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-2',
    title: 'রসায়ন ১ম পত্র — গুণগত রসায়ন (কোয়ান্টাম সংখ্যা ও বোর বর্ণালি) পুনরালোচনা',
    subjectKey: 'chemistry1',
    priority: 'high',
    completed: false,
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-3',
    title: 'উচ্চতর গণিত ১ম পত্র — ম্যাট্রিক্স ও নির্ণায়কের বোর্ড MCQ সমাধান',
    subjectKey: 'math1',
    priority: 'medium',
    completed: false,
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_GUEST_PROFILE: StudentProfile = {
  id: 'guest-local-hsc28',
  fullName: 'HSC 2028 শিক্ষার্থী',
  collegeName: '',
  board: 'Jashore',
  targetGoal: 'BUET / Engineering',
  avatarColor: '#4f46e5',
  xp: 50,
  chaptersMastered: 0,
  quizzesTaken: 0,
  bestAccuracy: 0,
  studyMinutes: 0,
  streakDays: 1,
  bookmarks: ['f-phy1-1', 'f-chem1-2', 'f-math1-2'],
  solvedCqs: [],
  mistakeIds: [],
  srsMasteredIds: [],
  completedPracticals: [],
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function App() {
  const [lang, setLang] = useState<Lang>(() => readLocal<Lang>(STORAGE_KEYS.lang, 'bn'));
  const [theme, setTheme] = useState<Theme>(() =>
    readLocal<Theme>(STORAGE_KEYS.theme, 'light')
  );
  // Restore the view from the URL so refresh, bookmarks and shared links land
  // on the intended module instead of always resetting to the dashboard.
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    () => parseRoute(window.location.hash).tab
  );
  const [syllabusSubject, setSyllabusSubject] = useState<SubjectKey | 'all'>(() => {
    const slug = parseRoute(window.location.hash).subjectSlug;
    const match = SUBJECTS.find((s) => s.key.toLowerCase() === slug);
    return match ? match.key : 'all';
  });

  const [profile, setProfile] = useState<StudentProfile>(() =>
    readLocal<StudentProfile>(STORAGE_KEYS.profile, DEFAULT_GUEST_PROFILE)
  );
  const [progressMap, setProgressMap] = useState<
    Record<string, ChapterProgressState>
  >(() => readLocal(STORAGE_KEYS.progress, {}));
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>(() =>
    readLocal(STORAGE_KEYS.quizzes, [])
  );
  const [tasks, setTasks] = useState<StudyTask[]>(() =>
    readLocal(STORAGE_KEYS.tasks, DEFAULT_STARTER_TASKS)
  );
  const [sessions, setSessions] = useState<StudySessionRecord[]>(() =>
    readLocal(STORAGE_KEYS.sessions, [])
  );
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() =>
    readLocal(STORAGE_KEYS.notes, [])
  );

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [autoStartMistakeExam, setAutoStartMistakeExam] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 2400);
  }, []);

  // Binds the durable write queue to whoever is signed in, and retries anything
  // left over from a previous offline session.
  const syncStatus = useSyncStatus();

  useEffect(() => {
    initSyncNetworkWatcher();
  }, []);

  useEffect(() => {
    setSyncUser(authUserId);
  }, [authUserId]);

  // `hydrateFromCloud` is a stable callback (deps never change), so it would
  // otherwise close over the state as it was on the very first render. The
  // first-sign-in upload needs the *current* local data — a student may study
  // for an hour as a guest before creating an account.
  const tasksRef = useRef(tasks);
  const sessionsRef = useRef(sessions);
  const progressRef = useRef(progressMap);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);
  useEffect(() => {
    progressRef.current = progressMap;
  }, [progressMap]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Keep the view in sync with the URL for back/forward and hand-edited links.
  useEffect(() => {
    const applyRoute = () => {
      const route = parseRoute(window.location.hash);
      setActiveTab(route.tab);
      if (route.subjectSlug) {
        const match = SUBJECTS.find(
          (s) => s.key.toLowerCase() === route.subjectSlug
        );
        setSyllabusSubject(match ? match.key : 'all');
      } else if (route.tab === 'syllabus') {
        setSyllabusSubject('all');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', applyRoute);
    window.addEventListener('hashchange', applyRoute);
    return () => {
      window.removeEventListener('popstate', applyRoute);
      window.removeEventListener('hashchange', applyRoute);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progressMap));
  }, [progressMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(personalNotes));
  }, [personalNotes]);

  const syncProfileToCloud = useCallback(
    async (uid: string, nextProfile: StudentProfile) => {
      // Goes through the durable queue: a dropped connection no longer loses the
      // write, and a permanent failure (e.g. RLS) is surfaced in the UI instead
      // of being swallowed.
      await syncWrite(
        {
          op: 'upsert',
          table: 'hsc28_profiles',
          onConflict: 'id',
          payload: {
            id: uid,
            full_name: nextProfile.fullName,
            college_name: nextProfile.collegeName,
            board: nextProfile.board,
            target_goal: nextProfile.targetGoal,
            avatar_color: nextProfile.avatarColor || '#4f46e5',
            xp: nextProfile.xp,
            chapters_mastered: nextProfile.chaptersMastered,
            quizzes_taken: nextProfile.quizzesTaken,
            best_accuracy: nextProfile.bestAccuracy,
            study_minutes: nextProfile.studyMinutes,
            streak_days: nextProfile.streakDays,
            bookmarks: nextProfile.bookmarks,
            solved_cqs: nextProfile.solvedCqs || [],
            mistake_ids: nextProfile.mistakeIds || [],
            srs_mastered_ids: nextProfile.srsMasteredIds || [],
            completed_practicals: nextProfile.completedPracticals || [],
            is_demo: false,
            updated_at: new Date().toISOString(),
          },
        },
        uid
      );
    },
    []
  );

  const syncRestoredBackup = useCallback(
    async (data: StudyBackupData, userId: string) => {
      // Create/update the profile first, then restore each record through the
      // durable queue. Restoring while offline therefore behaves exactly like
      // editing while offline instead of silently becoming a local-only import.
      await syncProfileToCloud(userId, data.profile);
      const operations = buildBackupSyncOps(
        data,
        userId,
        new Date().toISOString()
      );
      await Promise.all(operations.map((operation) => syncWrite(operation, userId)));
    },
    [syncProfileToCloud]
  );

  const hydrateFromCloud = useCallback(
    async (
      userId: string,
      email?: string,
      signupMeta?: Partial<StudentProfile>
    ) => {
      setAuthUserId(userId);
      try {
        const { data: existingProfile } = await supabase
          .from('hsc28_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (existingProfile) {
          setProfile((prev) => {
            const merged: StudentProfile = {
              id: userId,
              email,
              fullName: existingProfile.full_name || prev.fullName,
              collegeName: existingProfile.college_name || prev.collegeName,
              board: existingProfile.board || prev.board,
              targetGoal: existingProfile.target_goal || prev.targetGoal,
              avatarColor: existingProfile.avatar_color || '#4f46e5',
              xp: Math.max(Number(existingProfile.xp || 0), prev.xp),
              chaptersMastered: Math.max(
                Number(existingProfile.chapters_mastered || 0),
                prev.chaptersMastered
              ),
              quizzesTaken: Math.max(
                Number(existingProfile.quizzes_taken || 0),
                prev.quizzesTaken
              ),
              bestAccuracy: Math.max(
                Number(existingProfile.best_accuracy || 0),
                prev.bestAccuracy
              ),
              studyMinutes: Math.max(
                Number(existingProfile.study_minutes || 0),
                prev.studyMinutes
              ),
              streakDays: Math.max(
                Number(existingProfile.streak_days || 1),
                prev.streakDays
              ),
              bookmarks:
                existingProfile.bookmarks?.length > 0
                  ? existingProfile.bookmarks
                  : prev.bookmarks,
              solvedCqs:
                existingProfile.solved_cqs?.length > 0
                  ? existingProfile.solved_cqs
                  : prev.solvedCqs || [],
              mistakeIds:
                existingProfile.mistake_ids?.length > 0
                  ? existingProfile.mistake_ids
                  : prev.mistakeIds || [],
              srsMasteredIds:
                existingProfile.srs_mastered_ids?.length > 0
                  ? existingProfile.srs_mastered_ids
                  : prev.srsMasteredIds || [],
              // Now a real column. Prefer the cloud list, fall back to whatever
              // was logged locally before the student signed in.
              completedPracticals:
                existingProfile.completed_practicals?.length > 0
                  ? existingProfile.completed_practicals
                  : prev.completedPracticals || [],
            };
            syncProfileToCloud(userId, merged);
            return merged;
          });
        } else {
          setProfile((prev) => {
            const created: StudentProfile = {
              ...prev,
              id: userId,
              email,
              fullName: signupMeta?.fullName || prev.fullName,
              collegeName: signupMeta?.collegeName ?? prev.collegeName,
              board: signupMeta?.board || prev.board,
              targetGoal: signupMeta?.targetGoal || prev.targetGoal,
              avatarColor: '#4f46e5',
              xp: Math.max(prev.xp, 100),
            };
            syncProfileToCloud(userId, created);
            return created;
          });
        }

        const { data: chRows } = await supabase
          .from('hsc28_chapter_progress')
          .select('*')
          .eq('user_id', userId);

        if (chRows && chRows.length > 0) {
          setProgressMap((prev) => {
            const next = { ...prev };
            chRows.forEach((r: any) => {
              next[r.chapter_id] = {
                theoryDone: !!r.theory_done,
                notesDone: !!r.notes_done,
                mcqDone: !!r.mcq_done,
                cqDone: !!r.cq_done,
              };
            });
            return next;
          });
        }

        const { data: qRows } = await supabase
          .from('hsc28_quiz_attempts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(25);

        if (qRows && qRows.length > 0) {
          setQuizHistory(
            qRows.map((q: any) => ({
              id: q.id,
              subjectKey: q.subject_key,
              examTitle: q.exam_title,
              totalQuestions: q.total_questions,
              correctAnswers: q.correct_answers,
              wrongAnswers: q.wrong_answers,
              score: Number(q.score),
              accuracy: Number(q.accuracy),
              durationSeconds: q.duration_seconds,
              createdAt: q.created_at,
            }))
          );
        }

        const { data: noteRows } = await supabase
          .from('hsc28_personal_notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (noteRows && noteRows.length > 0) {
          setPersonalNotes(
            noteRows.map((n: any) => ({
              id: n.id,
              subjectKey: n.subject_key,
              chapterTitle: n.chapter_title || '',
              title: n.title,
              content: n.content,
              formula: n.formula || '',
              createdAt: n.created_at,
            }))
          );
        }

        // Tasks and study sessions were written to Supabase but never read back,
        // so the planner appeared empty on any second device.
        const { data: taskRows } = await supabase
          .from('hsc28_study_tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (taskRows && taskRows.length > 0) {
          setTasks(
            taskRows.map((t: any) => ({
              id: t.id,
              title: t.title,
              subjectKey: (t.subject_key as SubjectKey) || 'physics1',
              priority: (t.priority as StudyTask['priority']) || 'medium',
              completed: !!t.completed,
              dueDate: t.due_date || new Date().toISOString().slice(0, 10),
              createdAt: t.created_at,
            }))
          );
        } else {
          // First sync for this account: upload the local planner instead of
          // letting the cloud stay empty and the guest's work be stranded.
          for (const t of tasksRef.current) {
            void syncWrite(
              {
                op: 'upsert',
                table: 'hsc28_study_tasks',
                onConflict: 'id',
                payload: {
                  id: t.id,
                  user_id: userId,
                  title: t.title,
                  subject_key: t.subjectKey,
                  priority: t.priority,
                  completed: t.completed,
                  due_date: t.dueDate,
                },
              },
              userId
            );
          }
        }

        const { data: sessionRows } = await supabase
          .from('hsc28_study_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (sessionRows && sessionRows.length > 0) {
          setSessions(
            sessionRows.map((r: any) => ({
              id: r.id,
              subjectKey: (r.subject_key as SubjectKey) || 'physics1',
              durationMinutes: Number(r.duration_minutes || 0),
              note: r.note || '',
              createdAt: r.created_at,
            }))
          );
        } else {
          for (const r of sessionsRef.current) {
            void syncWrite(
              {
                op: 'upsert',
                table: 'hsc28_study_sessions',
                onConflict: 'id',
                payload: {
                  id: r.id,
                  user_id: userId,
                  subject_key: r.subjectKey,
                  duration_minutes: r.durationMinutes,
                  note: r.note,
                },
              },
              userId
            );
          }
        }

        // Same one-time upload for progress + notes made while browsing as guest.
        if (!chRows || chRows.length === 0) {
          for (const [chapterId, st] of Object.entries(progressRef.current)) {
            void syncWrite(
              {
                op: 'upsert',
                table: 'hsc28_chapter_progress',
                onConflict: 'user_id,chapter_id',
                payload: {
                  user_id: userId,
                  chapter_id: chapterId,
                  theory_done: st.theoryDone,
                  notes_done: st.notesDone,
                  mcq_done: st.mcqDone,
                  cq_done: st.cqDone,
                  updated_at: new Date().toISOString(),
                },
              },
              userId
            );
          }
        }
      } catch {
        // Offline safe
      }
    },
    // `tasks`, `sessions` and `progressMap` are read for the one-time first-sync
    // upload; they are intentionally not dependencies to avoid re-hydrating on
    // every keystroke elsewhere in the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncProfileToCloud]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        hydrateFromCloud(data.session.user.id, data.session.user.email);
      }
    });
  }, [hydrateFromCloud]);

  const handleToggleStage = useCallback(
    (chapterId: string, stage: keyof ChapterProgressState) => {
      setProgressMap((prev) => {
        const cur = prev[chapterId] || {
          theoryDone: false,
          notesDone: false,
          mcqDone: false,
          cqDone: false,
        };
        const turningOn = !cur[stage];
        const updatedStage = { ...cur, [stage]: turningOn };
        const nextMap = { ...prev, [chapterId]: updatedStage };

        let mastered = 0;
        CHAPTERS.forEach((c) => {
          const s = nextMap[c.id];
          if (s && s.theoryDone && s.notesDone && s.mcqDone && s.cqDone) {
            mastered += 1;
          }
        });

        const xpDelta = turningOn ? 15 : -15;
        setProfile((p) => {
          const nextProfile = {
            ...p,
            xp: Math.max(0, p.xp + xpDelta),
            chaptersMastered: mastered,
          };
          if (authUserId) syncProfileToCloud(authUserId, nextProfile);
          return nextProfile;
        });

        if (turningOn) {
          showToast(
            lang === 'bn'
              ? 'ধাপ সম্পন্ন হয়েছে (+১৫ XP)'
              : 'Stage marked complete (+15 XP)'
          );
        }

        if (authUserId) {
          void syncWrite(
            {
              op: 'upsert',
              table: 'hsc28_chapter_progress',
              onConflict: 'user_id,chapter_id',
              payload: {
                user_id: authUserId,
                chapter_id: chapterId,
                theory_done: updatedStage.theoryDone,
                notes_done: updatedStage.notesDone,
                mcq_done: updatedStage.mcqDone,
                cq_done: updatedStage.cqDone,
                updated_at: new Date().toISOString(),
              },
            },
            authUserId
          );
        }

        return nextMap;
      });
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleToggleBookmark = useCallback(
    (formulaId: string) => {
      setProfile((p) => {
        const exists = p.bookmarks.includes(formulaId);
        const bookmarks = exists
          ? p.bookmarks.filter((id) => id !== formulaId)
          : [...p.bookmarks, formulaId];
        const next = { ...p, bookmarks };
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });
    },
    [authUserId, syncProfileToCloud]
  );

  const handleToggleSrsMastered = useCallback(
    (formulaId: string) => {
      setProfile((p) => {
        const current = p.srsMasteredIds || [];
        const exists = current.includes(formulaId);
        const srsMasteredIds = exists
          ? current.filter((id) => id !== formulaId)
          : [...current, formulaId];
        const xpDelta = exists ? -10 : 10;
        const next: StudentProfile = {
          ...p,
          xp: Math.max(0, p.xp + xpDelta),
          srsMasteredIds,
        };
        if (!exists) {
          showToast(
            lang === 'bn'
              ? 'ফ্ল্যাশকার্ড SRS আয়ত্তকৃত (+১০ XP)'
              : 'Flashcard marked SRS Mastered (+10 XP)'
          );
        }
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleUpdateMistakeIds = useCallback(
    (addIds: string[], removeIds: string[]) => {
      setProfile((p) => {
        const current = new Set(p.mistakeIds || []);
        removeIds.forEach((id) => current.delete(id));
        addIds.forEach((id) => current.add(id));
        const bonusXp = removeIds.length * 15;
        const next: StudentProfile = {
          ...p,
          xp: p.xp + bonusXp,
          mistakeIds: Array.from(current),
        };
        if (removeIds.length > 0) {
          showToast(
            lang === 'bn'
              ? `${removeIds.length}টি ভুল প্রশ্ন সংশোধিত হয়েছে (+${bonusXp} XP)`
              : `${removeIds.length} mistake(s) cleared (+${bonusXp} XP)`
          );
        }
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleAwardStudentXp = useCallback(
    (points: number, msgBn: string, msgEn: string) => {
      setProfile((p) => {
        const next = { ...p, xp: p.xp + points };
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });
      showToast(lang === 'bn' ? msgBn : msgEn);
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleTogglePractical = useCallback(
    (pracId: string) => {
      setProfile((p) => {
        const cur = p.completedPracticals || [];
        const exists = cur.includes(pracId);
        const completedPracticals = exists
          ? cur.filter((id) => id !== pracId)
          : [...cur, pracId];
        const xpDelta = exists ? -15 : 15;
        const next: StudentProfile = {
          ...p,
          xp: Math.max(0, p.xp + xpDelta),
          completedPracticals,
        };
        if (!exists) {
          showToast(
            lang === 'bn'
              ? 'ব্যবহারিক খাতা সম্পন্ন (+১৫ XP)'
              : 'Practical logged (+15 XP)'
          );
        }
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleExportBackup = useCallback(() => {
    const payload = {
      app: BACKUP_APP_ID,
      exportedAt: new Date().toISOString(),
      profile,
      progressMap,
      quizHistory,
      tasks,
      sessions,
      personalNotes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nokkhotro-hsc28-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      lang === 'bn'
        ? 'ব্যাকআপ ফাইল ডাউনলোড হয়েছে!'
        : 'Backup file downloaded!'
    );
  }, [lang, personalNotes, profile, progressMap, quizHistory, sessions, showToast, tasks]);

  const handleImportBackup = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Validate the complete file before replacing anything. Also keep the
          // currently signed-in identity: a backup must never import another
          // student's profile id or email address into this account.
          const restored = parseStudyBackup(
            JSON.parse(String(reader.result || '{}'))
          );
          const restoredWithCurrentIdentity = prepareBackupForAccount(
            restored,
            authUserId || DEFAULT_GUEST_PROFILE.id,
            authUserId ? profile.email : undefined,
            () => crypto.randomUUID()
          );

          setProfile(restoredWithCurrentIdentity.profile);
          setProgressMap(restoredWithCurrentIdentity.progressMap);
          setQuizHistory(restoredWithCurrentIdentity.quizHistory);
          setTasks(restoredWithCurrentIdentity.tasks);
          setSessions(restoredWithCurrentIdentity.sessions);
          setPersonalNotes(restoredWithCurrentIdentity.personalNotes);

          if (authUserId) {
            void syncRestoredBackup(restoredWithCurrentIdentity, authUserId);
          }

          showToast(
            lang === 'bn'
              ? authUserId
                ? 'ব্যাকআপ রিস্টোর হয়েছে এবং ক্লাউড সিঙ্ক শুরু হয়েছে!'
                : 'ব্যাকআপ এই ডিভাইসে সফলভাবে রিস্টোর হয়েছে!'
              : authUserId
              ? 'Backup restored; cloud sync has started.'
              : 'Backup restored on this device.'
          );
        } catch {
          showToast(
            lang === 'bn'
              ? 'সঠিক নক্ষত্র HSC 2028 ব্যাকআপ JSON ফাইল নির্বাচন করুন'
              : 'Choose a valid Nokkhotro HSC 2028 backup JSON file.'
          );
        }
      };
      reader.onerror = () => {
        showToast(
          lang === 'bn' ? 'ফাইলটি পড়া যায়নি' : 'The backup file could not be read.'
        );
      };
      reader.readAsText(file);
    },
    [authUserId, lang, profile.email, showToast, syncRestoredBackup]
  );

  const handleToggleSolvedCq = useCallback(
    (cqId: string) => {
      setProfile((p) => {
        const current = p.solvedCqs || [];
        const exists = current.includes(cqId);
        const solvedCqs = exists
          ? current.filter((id) => id !== cqId)
          : [...current, cqId];
        const xpDelta = exists ? -20 : 20;
        const next: StudentProfile = {
          ...p,
          xp: Math.max(0, p.xp + xpDelta),
          solvedCqs,
        };
        if (!exists) {
          showToast(
            lang === 'bn'
              ? 'সৃজনশীল অনুশীলন সম্পন্ন (+২০ XP)'
              : 'CQ practice logged (+20 XP)'
          );
        }
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleAddPersonalNote = useCallback(
    (note: Omit<PersonalNote, 'id' | 'createdAt'>) => {
      const tempId = crypto.randomUUID();
      const created: PersonalNote = {
        ...note,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setPersonalNotes((prev) => [created, ...prev]);

      setProfile((p) => {
        const next = { ...p, xp: p.xp + 10 };
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });

      showToast(
        lang === 'bn'
          ? 'নোট সংরক্ষিত হয়েছে (+১০ XP)'
          : 'Study note saved (+10 XP)'
      );

      if (authUserId) {
        void syncWrite(
          {
            op: 'upsert',
            table: 'hsc28_personal_notes',
            onConflict: 'id',
            payload: {
              id: tempId,
              user_id: authUserId,
              subject_key: note.subjectKey,
              chapter_title: note.chapterTitle,
              title: note.title,
              content: note.content,
              formula: note.formula,
            },
          },
          authUserId
        );
      }
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleDeletePersonalNote = useCallback(
    (id: string) => {
      setPersonalNotes((prev) => prev.filter((n) => n.id !== id));
      if (authUserId) {
        void syncWrite(
          { op: 'delete', table: 'hsc28_personal_notes', eq: { id, user_id: authUserId } },
          authUserId
        );
      }
    },
    [authUserId]
  );

  const handleCompleteQuiz = useCallback(
    (attempt: Omit<QuizAttemptRecord, 'id' | 'createdAt'>) => {
      const id = crypto.randomUUID();
      const record: QuizAttemptRecord = {
        ...attempt,
        id,
        createdAt: new Date().toISOString(),
      };
      setQuizHistory((prev) => [record, ...prev]);

      const earnedXp = attempt.correctAnswers * 10 + 15;
      setProfile((p) => {
        const next: StudentProfile = {
          ...p,
          xp: p.xp + earnedXp,
          quizzesTaken: p.quizzesTaken + 1,
          bestAccuracy: Math.max(p.bestAccuracy, attempt.accuracy),
        };
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });

      if (authUserId) {
        void syncWrite(
          {
            op: 'upsert',
            table: 'hsc28_quiz_attempts',
            onConflict: 'id',
            payload: {
              id,
              user_id: authUserId,
              subject_key: attempt.subjectKey,
              exam_title: attempt.examTitle,
              total_questions: attempt.totalQuestions,
              correct_answers: attempt.correctAnswers,
              wrong_answers: attempt.wrongAnswers,
              score: attempt.score,
              accuracy: attempt.accuracy,
              duration_seconds: attempt.durationSeconds,
            },
          },
          authUserId
        );
      }
    },
    [authUserId, syncProfileToCloud]
  );

  const handleAddTask = useCallback(
    (title: string, subjectKey: SubjectKey, priority: 'high' | 'medium') => {
      const id = crypto.randomUUID();
      const newTask: StudyTask = {
        id,
        title,
        subjectKey,
        priority,
        completed: false,
        dueDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);

      if (authUserId) {
        void syncWrite(
          {
            op: 'upsert',
            table: 'hsc28_study_tasks',
            onConflict: 'id',
            payload: {
              id,
              user_id: authUserId,
              title,
              subject_key: subjectKey,
              priority,
              completed: false,
              due_date: newTask.dueDate,
            },
          },
          authUserId
        );
      }
    },
    [authUserId]
  );

  const handleToggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setProfile((p) => {
              const next = { ...p, xp: p.xp + 10 };
              if (authUserId) syncProfileToCloud(authUserId, next);
              return next;
            });
            showToast(
              lang === 'bn'
                ? 'অধ্যয়ন লক্ষ্য সম্পন্ন (+১০ XP)'
                : 'Study target completed (+10 XP)'
            );
          }
          if (authUserId) {
            void syncWrite(
              {
                op: 'update',
                table: 'hsc28_study_tasks',
                payload: { completed: nextCompleted },
                eq: { id, user_id: authUserId },
              },
              authUserId
            );
          }
          return { ...t, completed: nextCompleted };
        })
      );
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (authUserId) {
        void syncWrite(
          { op: 'delete', table: 'hsc28_study_tasks', eq: { id, user_id: authUserId } },
          authUserId
        );
      }
    },
    [authUserId]
  );

  const handleLogSession = useCallback(
    (subjectKey: SubjectKey, durationMinutes: number, note: string) => {
      const id = crypto.randomUUID();
      const rec: StudySessionRecord = {
        id,
        subjectKey,
        durationMinutes,
        note,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [rec, ...prev]);

      setProfile((p) => {
        const next: StudentProfile = {
          ...p,
          xp: p.xp + 20,
          studyMinutes: p.studyMinutes + durationMinutes,
        };
        if (authUserId) syncProfileToCloud(authUserId, next);
        return next;
      });

      showToast(
        lang === 'bn'
          ? `${durationMinutes} মিনিট অধ্যয়ন সংরক্ষিত (+২০ XP)`
          : `${durationMinutes} mins study session logged (+20 XP)`
      );

      if (authUserId) {
        void syncWrite(
          {
            op: 'upsert',
            table: 'hsc28_study_sessions',
            onConflict: 'id',
            payload: {
              id,
              user_id: authUserId,
              subject_key: subjectKey,
              duration_minutes: durationMinutes,
              note,
            },
          },
          authUserId
        );
      }
    },
    [authUserId, lang, showToast, syncProfileToCloud]
  );

  // Filtering the syllabus by paper is a refinement, not a new destination, so
  // it rewrites the current history entry instead of pushing a new one.
  const handleSyllabusSubjectChange = useCallback(
    (subject: SubjectKey | 'all') => {
      setSyllabusSubject(subject);
      const nextHash = buildHash('syllabus', subject);
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash);
      }
    },
    []
  );

  const handleNavigate = (tab: ActiveTab, subj?: SubjectKey) => {
    const nextSubject = subj ?? (tab === 'syllabus' ? 'all' : syllabusSubject);
    if (subj) {
      setSyllabusSubject(subj);
    } else if (tab === 'syllabus') {
      setSyllabusSubject('all');
    }
    setActiveTab(tab);

    // Reflect the destination in the URL. `pushState` (rather than assigning
    // location.hash) keeps the back button working without firing a second
    // `hashchange` for a navigation we are already handling.
    const nextHash = buildHash(tab, nextSubject);
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUserId(null);

    // Do not expose one student's private study data to a guest or to the next
    // account using a shared device. Queued writes are intentionally retained:
    // they are tagged with this user's id and can safely resume the next time
    // that same student signs in, even if they signed out while offline.
    setProfile(DEFAULT_GUEST_PROFILE);
    setProgressMap({});
    setQuizHistory([]);
    setTasks(DEFAULT_STARTER_TASKS);
    setSessions([]);
    setPersonalNotes([]);
    setAutoStartMistakeExam(false);
  };

  const handleUpdateProfileMeta = async (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (authUserId) syncProfileToCloud(authUserId, next);
      return next;
    });
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        isDark
          ? 'bg-[#0f172a] text-slate-100'
          : 'bg-[#f4f7fb] text-slate-800'
      }`}
    >
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(t) => handleNavigate(t)}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          profile={profile}
          isAuthenticated={!!authUserId}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          syncStatus={syncStatus}
        />

        {/* Soft Eye-Friendly Toast Notification */}
        {toastMsg && (
          <div
            className={`fixed bottom-6 right-5 z-50 px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-toast backdrop-blur-md ${
              isDark
                ? 'bg-slate-800/95 text-emerald-300 border-emerald-500/30'
                : 'bg-white/95 text-emerald-800 border-emerald-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>{toastMsg}</span>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-7">
          {activeTab === 'dashboard' && (
            <DashboardView
              lang={lang}
              theme={theme}
              profile={profile}
              isAuthenticated={!!authUserId}
              progressMap={progressMap}
              quizHistory={quizHistory}
              tasks={tasks}
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusTrackerView
              lang={lang}
              theme={theme}
              initialSubject={syllabusSubject}
              progressMap={progressMap}
              onToggleStage={handleToggleStage}
              onSubjectChange={handleSyllabusSubjectChange}
            />
          )}

          {activeTab === 'formulas' && (
            <FormulaVaultView
              lang={lang}
              theme={theme}
              bookmarks={profile.bookmarks}
              onToggleBookmark={handleToggleBookmark}
              srsMasteredIds={profile.srsMasteredIds || []}
              onToggleSrsMastered={handleToggleSrsMastered}
              personalNotes={personalNotes}
              onAddPersonalNote={handleAddPersonalNote}
              onDeletePersonalNote={handleDeletePersonalNote}
            />
          )}

          {activeTab === 'cq' && (
            <CqBankView
              lang={lang}
              theme={theme}
              solvedCqs={profile.solvedCqs || []}
              onToggleSolvedCq={handleToggleSolvedCq}
            />
          )}

          {activeTab === 'mcq' && (
            <McqExamView
              lang={lang}
              theme={theme}
              quizHistory={quizHistory}
              mistakeIds={profile.mistakeIds || []}
              onUpdateMistakeIds={handleUpdateMistakeIds}
              autoStartMistakeExam={autoStartMistakeExam}
              onConsumedMistakeExam={() => setAutoStartMistakeExam(false)}
              onCompleteQuiz={handleCompleteQuiz}
            />
          )}

          {activeTab === 'lab' && <VirtualLabView lang={lang} theme={theme} />}

          {activeTab === 'planner' && (
            <StudyPlannerView
              lang={lang}
              theme={theme}
              tasks={tasks}
              sessions={sessions}
              progressMap={progressMap}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onLogSession={handleLogSession}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              lang={lang}
              theme={theme}
              profile={profile}
              progressMap={progressMap}
              quizHistory={quizHistory}
              sessions={sessions}
              onNavigate={handleNavigate}
              onStartMistakeExam={() => {
                setAutoStartMistakeExam(true);
                handleNavigate('mcq');
              }}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          )}

          {activeTab === 'hub' && (
            <StudentHubView
              lang={lang}
              theme={theme}
              profile={profile}
              isAuthenticated={!!authUserId}
              authUserId={authUserId}
              onAwardXp={handleAwardStudentXp}
            />
          )}

          {activeTab === 'admission' && (
            <AdmissionView
              lang={lang}
              theme={theme}
              profile={profile}
              progressMap={progressMap}
              onNavigate={handleNavigate}
              onAwardXp={handleAwardStudentXp}
            />
          )}

          {activeTab === 'practical' && (
            <PracticalWritingView
              lang={lang}
              theme={theme}
              completedPracticals={profile.completedPracticals || []}
              onTogglePractical={handleTogglePractical}
            />
          )}

          {activeTab === 'gpa' && (
            <GpaCalculatorView lang={lang} theme={theme} />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              lang={lang}
              theme={theme}
              currentProfile={profile}
              isAuthenticated={!!authUserId}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      <Footer
        lang={lang}
        theme={theme}
        isAuthenticated={!!authUserId}
        onNavigate={(t) => handleNavigate(t)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        theme={theme}
        profile={profile}
        isAuthenticated={!!authUserId}
        onAuthSuccess={hydrateFromCloud}
        onSignOut={handleSignOut}
        onUpdateProfileMeta={handleUpdateProfileMeta}
      />

      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        theme={theme}
        onSelectDestination={handleNavigate}
      />
    </div>
  );
}
export default App;
