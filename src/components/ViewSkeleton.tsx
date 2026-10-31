import React from 'react';
import type { Lang, Theme } from '../types';

/**
 * Shown while a lazily split screen chunk downloads. It mirrors the shape of a
 * typical module (title bar + cards) so the layout does not jump when the real
 * view arrives, and it keeps a spinner off the screen for the common case where
 * the chunk is already cached.
 */
export const ViewSkeleton: React.FC<{ lang: Lang; theme: Theme }> = ({ lang, theme }) => {
  const isDark = theme === 'dark';
  const block = isDark ? 'bg-slate-800/70' : 'bg-white/80';
  const line = isDark ? 'bg-slate-700/70' : 'bg-slate-200/90';

  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">{lang === 'bn' ? 'লোড হচ্ছে…' : 'Loading…'}</span>

      <div className={`rounded-2xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200/80 bg-white/70'}`}>
        <div className={`h-5 w-40 rounded-lg ${line}`} />
        <div className={`mt-3 h-3 w-64 max-w-full rounded ${line}`} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800' : 'border-slate-200/80'} ${block}`}>
            <div className={`h-3 w-16 rounded ${line}`} />
            <div className={`mt-3 h-6 w-24 rounded ${line}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${isDark ? 'border-slate-800' : 'border-slate-200/80'} ${block}`}>
            <div className={`h-4 w-1/2 rounded ${line}`} />
            <div className={`mt-3 h-3 w-full rounded ${line}`} />
            <div className={`mt-2 h-3 w-4/5 rounded ${line}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
