import type { LifeData } from './lifeStore';

/**
 * Local reminders.
 *
 * There is no push server, so this is deliberately honest: reminders are
 * computed from the student's own Life Hub data and surfaced when the app
 * opens, plus an app-icon badge where the platform supports it. No fake
 * "we will notify you at 8pm" promises.
 */

export type ReminderKind = 'exam' | 'deadline' | 'study';

export interface StudyReminder {
  id: string;
  kind: ReminderKind;
  title: { bn: string; en: string };
  detail: { bn: string; en: string };
  /** ISO date (yyyy-mm-dd). */
  date: string;
  /** Whole days from today (0 = today, negative = past). */
  daysAway: number;
}

const NOTIFIED_KEY = 'hsc28_reminder_log_v1';

export function daysUntil(iso: string, now: Date = new Date()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return Number.POSITIVE_INFINITY;
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

/**
 * Upcoming items worth surfacing, soonest first.
 *
 * Deadlines stay visible for a month, exams for a fortnight, and a gentle
 * daily study nudge is added when nothing else is close.
 */
export function buildReminders(data: LifeData, now: Date = new Date()): StudyReminder[] {
  const items: StudyReminder[] = [];

  data.deadlines
    .filter((d) => !d.done)
    .forEach((d) => {
      const days = daysUntil(d.date, now);
      if (days >= 0 && days <= 30) {
        items.push({
          id: `deadline-${d.id}`,
          kind: 'deadline',
          title: { bn: d.title, en: d.title },
          detail: {
            bn: `${d.category === 'admission' ? 'ভর্তি আবেদন' : d.category === 'exam' ? 'পরীক্ষা' : d.category === 'scholarship' ? 'বৃত্তি' : d.category === 'fee' ? 'ফি' : 'কাজ'} • ${d.date}`,
            en: `${d.category} • ${d.date}`,
          },
          date: d.date,
          daysAway: days,
        });
      }
    });

  data.exams.forEach((e) => {
    const days = daysUntil(e.date, now);
    if (days >= 0 && days <= 14) {
      items.push({
        id: `exam-${e.id}`,
        kind: 'exam',
        title: { bn: e.title, en: e.title },
        detail: {
          bn: `${e.date}${e.time ? ` • ${e.time}` : ''}`,
          en: `${e.date}${e.time ? ` • ${e.time}` : ''}`,
        },
        date: e.date,
        daysAway: days,
      });
    }
  });

  items.sort((a, b) => a.daysAway - b.daysAway || a.date.localeCompare(b.date));

  const nothingClose = items.length === 0 || items[0].daysAway > 1;
  if (nothingClose) {
    items.push({
      id: 'study-daily',
      kind: 'study',
      title: { bn: 'আজ ১০ মিনিট পড়া', en: '10 minutes of study today' },
      detail: {
        bn: '১০টি MCQ বা ৫টি সূত্র — ছোট করে শুরু করলেই হয়ে যায়',
        en: '10 MCQs or 5 formulas — starting small is enough',
      },
      date: now.toISOString().slice(0, 10),
      daysAway: 0,
    });
  }

  return items;
}

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function notificationPermission(): PermissionState {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  return Notification.permission as PermissionState;
}

export async function askNotificationPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as PermissionState;
  } catch {
    return 'unsupported';
  }
}

function alreadyNotified(id: string, today: string): boolean {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    const log = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return log[id] === today;
  } catch {
    return false;
  }
}

function markNotified(id: string, today: string): void {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    const log = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    log[id] = today;
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(log));
  } catch {
    /* ignore quota/blocked storage */
  }
}

/**
 * Fires at most one notification per item per day, and only for things that
 * are due within two days — no notification spam for a deadline three weeks
 * out.
 */
export function notifyDue(
  reminders: StudyReminder[],
  lang: 'bn' | 'en' = 'bn',
  now: Date = new Date()
): number {
  if (notificationPermission() !== 'granted') return 0;
  const today = now.toISOString().slice(0, 10);
  let sent = 0;

  reminders
    .filter((r) => r.daysAway <= 1 && !alreadyNotified(r.id, today))
    .slice(0, 3)
    .forEach((r) => {
      try {
        const title =
          lang === 'bn' ? r.title.bn : r.title.en;
        const body = lang === 'bn' ? r.detail.bn : r.detail.en;
        new Notification(title, {
          body,
          tag: r.id,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        });
        markNotified(r.id, today);
        sent += 1;
      } catch {
        /* some browsers require a service worker; ignore silently */
      }
    });

  return sent;
}

/** App-icon badge (Android/Chrome, some launchers). */
export async function syncAppBadge(count: number): Promise<void> {
  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }) : null;
  if (!nav) return;
  try {
    if (count > 0 && nav.setAppBadge) await nav.setAppBadge(count);
    else if (nav.clearAppBadge) await nav.clearAppBadge();
  } catch {
    /* unsupported or permission denied */
  }
}
