import { ComponentType, lazy } from 'react';
import type { ActiveTab } from '../types';

/**
 * Route-level code splitting.
 *
 * Before this module every screen — plus the whole 1,700-line MCQ bank — sat in
 * the first JavaScript bundle, so a 3G phone had to download ~1 MB before the
 * dashboard could paint. Each view now lives in its own chunk that is fetched
 * the first time the student opens it.
 *
 * `preloadRoute` lets the UI warm a chunk while the finger is still moving
 * (touch/hover on a nav item, or an idle callback), so the split stays
 * invisible: by the time the tap lands the chunk is already in the browser
 * cache and the screen appears instantly.
 */

function lazyNamed<T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  name: K
) {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[name] as unknown as ComponentType<any> };
  });
}

const loaders = {
  syllabus: () => import('../components/SyllabusTrackerView'),
  formulas: () => import('../components/FormulaVaultView'),
  cq: () => import('../components/CqBankView'),
  mcq: () => import('../components/McqExamView'),
  lab: () => import('../components/VirtualLabView'),
  planner: () => import('../components/StudyPlannerView'),
  analytics: () => import('../components/AnalyticsView'),
  hub: () => import('../components/StudentHubView'),
  admission: () => import('../components/AdmissionView'),
  practical: () => import('../components/PracticalWritingView'),
  gpa: () => import('../components/GpaCalculatorView'),
  leaderboard: () => import('../components/LeaderboardView'),
  life: () => import('../components/LifeHubView'),
} as const;

export const LazySyllabusTrackerView = lazyNamed(loaders.syllabus, 'SyllabusTrackerView');
export const LazyFormulaVaultView = lazyNamed(loaders.formulas, 'FormulaVaultView');
export const LazyCqBankView = lazyNamed(loaders.cq, 'CqBankView');
export const LazyMcqExamView = lazyNamed(loaders.mcq, 'McqExamView');
export const LazyVirtualLabView = lazyNamed(loaders.lab, 'VirtualLabView');
export const LazyStudyPlannerView = lazyNamed(loaders.planner, 'StudyPlannerView');
export const LazyAnalyticsView = lazyNamed(loaders.analytics, 'AnalyticsView');
export const LazyStudentHubView = lazyNamed(loaders.hub, 'StudentHubView');
export const LazyAdmissionView = lazyNamed(loaders.admission, 'AdmissionView');
export const LazyPracticalWritingView = lazyNamed(loaders.practical, 'PracticalWritingView');
export const LazyGpaCalculatorView = lazyNamed(loaders.gpa, 'GpaCalculatorView');
export const LazyLeaderboardView = lazyNamed(loaders.leaderboard, 'LeaderboardView');
export const LazyLifeHubView = lazyNamed(loaders.life, 'LifeHubView');

/**
 * Modals are split too: the command palette pulls the whole chapter, formula
 * and CQ indexes with it, which used to sit in the dashboard's chunk.
 */
export const LazyCommandPaletteModal = lazyNamed(
  () => import('../components/CommandPaletteModal'),
  'CommandPaletteModal'
);
export const LazyAuthModal = lazyNamed(
  () => import('../components/AuthModal'),
  'AuthModal'
);
export const preloadCommandPalette = () =>
  import('../components/CommandPaletteModal').catch(() => undefined);
export const preloadAuthModal = () =>
  import('../components/AuthModal').catch(() => undefined);

/** Fetch (but do not render) the chunk for a destination. Safe to call twice. */
export function preloadRoute(tab: ActiveTab): void {
  const loader = loaders[tab as keyof typeof loaders];
  if (!loader) return;
  void loader().catch(() => {
    /* A failed prefetch must never break navigation — the real render retries. */
  });
}

/** Warm the screens a student is most likely to open next, without blocking. */
export function preloadLikelyRoutes(): void {
  const run = () => {
    preloadRoute('syllabus');
    preloadRoute('mcq');
    preloadRoute('formulas');
  };
  if (typeof window === 'undefined') return;
  const idle = (window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (idle) idle(run, { timeout: 2500 });
  else window.setTimeout(run, 1800);
}
