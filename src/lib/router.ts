import { ActiveTab, SubjectKey } from '../types';

/**
 * Hash-based routing.
 *
 * The app is a static SPA: `vercel.json` rewrites every path to `/index.html`,
 * but the active view lives in React state. Without a URL contract, a deep link
 * like `/virtual-lab` opened the Dashboard and nothing was shareable or
 * bookmarkable. Hash routing fixes that without needing any server rewrite
 * rules — the fragment never reaches the server, so it also works on the
 * `file://` protocol and on any static host.
 */

export const TAB_SLUGS: Record<ActiveTab, string> = {
  dashboard: '',
  syllabus: 'syllabus',
  formulas: 'formulas',
  cq: 'cq',
  mcq: 'mcq',
  lab: 'lab',
  planner: 'planner',
  analytics: 'analytics',
  hub: 'hub',
  admission: 'admission',
  practical: 'practical',
  gpa: 'gpa',
  leaderboard: 'leaderboard',
};

const SLUG_TO_TAB: Record<string, ActiveTab> = Object.entries(
  TAB_SLUGS
).reduce<Record<string, ActiveTab>>((acc, [tab, slug]) => {
  if (slug) acc[slug] = tab as ActiveTab;
  return acc;
}, {});

/** Slugs that must never be treated as a syllabus subject. */
const RESERVED = new Set(Object.keys(SLUG_TO_TAB));

export interface RouteTarget {
  tab: ActiveTab;
  /** Raw subject slug from `#/syllabus/<subject>`; validate before use. */
  subjectSlug?: string;
}

/**
 * Parses a location hash into a route. Anything unrecognised falls back to the
 * dashboard, so a stale or hand-edited link can never blank the app.
 */
export function parseRoute(hash: string): RouteTarget {
  const raw = (hash || '').replace(/^#/, '').replace(/^\/+/, '').trim();
  if (!raw) return { tab: 'dashboard' };

  const [first, second] = raw.split('/');
  const slug = (first || '').toLowerCase();

  if (slug === 'dashboard') return { tab: 'dashboard' };

  const tab = SLUG_TO_TAB[slug];
  if (!tab) return { tab: 'dashboard' };

  const subjectSlug = second ? second.toLowerCase() : undefined;
  return subjectSlug ? { tab, subjectSlug } : { tab };
}

/** Builds the canonical hash for a destination. */
export function buildHash(tab: ActiveTab, subject?: SubjectKey | 'all'): string {
  const slug = TAB_SLUGS[tab] || TAB_SLUGS.dashboard;
  if (tab === 'syllabus' && subject && subject !== 'all') {
    return `#/${slug}/${subject}`;
  }
  return slug ? `#/${slug}` : '#/';
}

/** True when the given hash already points at this destination. */
export function isCurrentRoute(
  hash: string,
  tab: ActiveTab,
  subject?: SubjectKey | 'all'
): boolean {
  return (hash || '') === buildHash(tab, subject);
}
