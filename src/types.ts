export type Lang = 'bn' | 'en';
export type Theme = 'dark' | 'light';
export type ActiveTab =
  | 'dashboard'
  | 'syllabus'
  | 'formulas'
  | 'cq'
  | 'mcq'
  | 'lab'
  | 'planner'
  | 'analytics'
  | 'hub'
  | 'admission'
  | 'practical'
  | 'gpa'
  | 'leaderboard';

export type SubjectKey =
  | 'physics1'
  | 'physics2'
  | 'chemistry1'
  | 'chemistry2'
  | 'math1'
  | 'math2'
  | 'biology1'
  | 'biology2'
  | 'ict'
  | 'bangla'
  | 'english';

export interface BilingualText {
  bn: string;
  en: string;
}

export interface ChapterItem {
  id: string;
  subjectKey: SubjectKey;
  chapterNumber: number;
  title: BilingualText;
  highYield: boolean;
  keyTopics: BilingualText;
}

export interface SubjectInfo {
  key: SubjectKey;
  code: string;
  name: BilingualText;
  shortName: BilingualText;
  paper: BilingualText;
  category: 'science' | 'compulsory';
  color: string;
  bgLight: string;
  bgDark: string;
  iconName: string;
}

export interface ChapterProgressState {
  theoryDone: boolean;
  notesDone: boolean;
  mcqDone: boolean;
  cqDone: boolean;
}

export interface FormulaCard {
  id: string;
  subjectKey: SubjectKey;
  chapterTitle: BilingualText;
  title: BilingualText;
  formula: string;
  explanation: BilingualText;
  examTip: BilingualText;
  boardTag: string;
}

export interface CqQuestionItem {
  id: string;
  subjectKey: SubjectKey;
  chapter: BilingualText;
  boardTag: BilingualText;
  stem: BilingualText;
  qA: BilingualText;
  qB: BilingualText;
  qC: BilingualText;
  qD: BilingualText;
  ansA: BilingualText;
  ansB: BilingualText;
  ansC: BilingualText;
  ansD: BilingualText;
}

export interface PersonalNote {
  id: string;
  subjectKey: SubjectKey;
  chapterTitle: string;
  title: string;
  content: string;
  formula: string;
  createdAt: string;
}

export interface McqQuestion {
  id: string;
  subjectKey: SubjectKey;
  chapter: BilingualText;
  question: BilingualText;
  options: [BilingualText, BilingualText, BilingualText, BilingualText];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: BilingualText;
  boardTag: BilingualText;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttemptRecord {
  id: string;
  subjectKey: SubjectKey | 'all';
  examTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  accuracy: number;
  durationSeconds: number;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectKey: SubjectKey;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate: string;
  createdAt: string;
}

export interface StudySessionRecord {
  id: string;
  subjectKey: SubjectKey;
  durationMinutes: number;
  note: string;
  createdAt: string;
}

export interface StudentDoubtReply {
  id: string;
  doubtId: string;
  authorName: string;
  collegeName: string;
  content: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface StudentDoubtPost {
  id: string;
  authorName: string;
  collegeName: string;
  board: string;
  subjectKey: SubjectKey;
  title: string;
  details: string;
  upvotes: number;
  solved: boolean;
  createdAt: string;
  replies: StudentDoubtReply[];
}

export interface StudentProfile {
  id: string;
  email?: string;
  fullName: string;
  collegeName: string;
  board: string;
  targetGoal: string;
  avatarColor: string;
  xp: number;
  chaptersMastered: number;
  quizzesTaken: number;
  bestAccuracy: number;
  studyMinutes: number;
  streakDays: number;
  bookmarks: string[];
  solvedCqs?: string[];
  mistakeIds?: string[];
  srsMasteredIds?: string[];
  completedPracticals?: string[];
  isDemo?: boolean;
}
