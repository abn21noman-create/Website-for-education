import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CalendarDays, Check } from 'lucide-react';
import type { Lang, Theme } from '../types';
import type { LifeData } from '../lib/lifeStore';
import { formatNum } from '../lib/i18n';
import {
  askNotificationPermission,
  buildReminders,
  notificationPermission,
  notifyDue,
  PermissionState,
  syncAppBadge,
} from '../lib/reminders';

interface ReminderCardProps {
  data: LifeData;
  lang: Lang;
  theme: Theme;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ data, lang, theme }) => {
  const isDark = theme === 'dark';
  const [permission, setPermission] = useState<PermissionState>(() => notificationPermission());

  const reminders = useMemo(() => buildReminders(data), [data]);
  const dueSoon = reminders.filter((r) => r.daysAway <= 1);

  // Keep the icon badge honest and fire the once-a-day nudge (if allowed).
  useEffect(() => {
    void syncAppBadge(dueSoon.length);
    if (permission === 'granted') notifyDue(reminders, lang);
    // `reminders` is rebuilt from `data`; re-running on the same day is a no-op
    // because each item is logged per day.
  }, [reminders, permission, lang, dueSoon.length]);

  const dayLabel = (days: number) => {
    if (days <= 0) return lang === 'bn' ? 'আজ' : 'today';
    if (days === 1) return lang === 'bn' ? 'আগামীকাল' : 'tomorrow';
    return lang === 'bn'
      ? `${formatNum(days, lang)} দিন বাকি`
      : `in ${days} days`;
  };

  return (
    <section
      className={`p-4 sm:p-5 rounded-2xl border ${
        isDark
          ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
          : 'bg-white/95 border-slate-200/80 card-soft-light'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2
          className={`text-sm font-extrabold flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          <BellRing className="w-4 h-4 text-indigo-500" />
          <span>{lang === 'bn' ? 'রিমাইন্ডার' : 'Reminders'}</span>
        </h2>
        {dueSoon.length > 0 && (
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/25">
            {lang === 'bn'
              ? `${formatNum(dueSoon.length, lang)}টি নিকটে`
              : `${dueSoon.length} due soon`}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {reminders.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className={`flex items-start gap-2.5 rounded-xl border p-3 ${
              r.kind === 'study'
                ? isDark
                  ? 'border-emerald-400/25 bg-emerald-500/10'
                  : 'border-emerald-200 bg-emerald-50/70'
                : r.daysAway <= 1
                ? isDark
                  ? 'border-amber-400/30 bg-amber-500/10'
                  : 'border-amber-200 bg-amber-50/80'
                : isDark
                ? 'border-slate-700/70 bg-slate-900/40'
                : 'border-slate-200/85 bg-slate-50/70'
            }`}
          >
            <CalendarDays
              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                r.kind === 'exam' ? 'text-rose-500' : 'text-indigo-500'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold leading-snug">{r.title[lang]}</div>
              <div
                className={`text-[11px] mt-0.5 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {r.detail[lang]}
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded ${
                r.daysAway <= 1
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {dayLabel(r.daysAway)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3">
        {permission === 'granted' ? (
          <div className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300">
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {lang === 'bn'
                ? 'নোটিফিকেশন চালু আছে — অ্যাপ খুললে দিনে একবার মনে করিয়ে দেবে।'
                : 'Notifications are on — you get one nudge a day when the app opens.'}
            </span>
          </div>
        ) : permission === 'denied' ? (
          <div className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'ব্রাউজারে নোটিফিকেশন বন্ধ আছে — সেটিংস থেকে চালু করতে হবে। উপরের তালিকাটা তবুও কাজ করবে।'
              : 'Notifications are blocked in the browser — enable them in site settings. The list above still works.'}
          </div>
        ) : permission === 'unsupported' ? (
          <div className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'এই ব্রাউজারে নোটিফিকেশন নেই — হোম স্ক্রিনে অ্যাপটি যোগ করলে ভালো কাজ করে।'
              : 'This browser has no notification support — adding the app to your home screen works better.'}
          </div>
        ) : (
          <button
            type="button"
            onClick={async () => {
              const next = await askNotificationPermission();
              setPermission(next);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ফোনে রিমাইন্ডার চালু করুন' : 'Turn on phone reminders'}</span>
          </button>
        )}
      </div>
    </section>
  );
};
