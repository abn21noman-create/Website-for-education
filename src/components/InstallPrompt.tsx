import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import type { Lang, Theme } from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'hsc28_install_prompt_dismissed';

/**
 * "Install the app" nudge for phones.
 *
 * Students often study in short bursts, sometimes offline. Installing the PWA
 * puts the app on the home screen and makes the service worker cache reliable.
 * The banner only appears when the browser explicitly offers installation, it
 * never covers the bottom tab bar, and a dismissal is remembered forever.
 */
export const InstallPrompt: React.FC<{ lang: Lang; theme: Theme }> = ({ lang, theme }) => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const isDark = theme === 'dark';
  const bn = lang === 'bn';

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      // Give the student a few seconds of reading before asking anything.
      window.setTimeout(() => setVisible(true), 8000);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') setVisible(false);
    } catch {
      /* The prompt can be rejected by the browser; nothing to recover. */
    }
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div
      className={`no-print fixed left-3 right-3 bottom-[68px] z-30 md:hidden rounded-2xl border p-3 shadow-lg animate-toast ${
        isDark ? 'bg-slate-800/97 border-slate-700 text-slate-100' : 'bg-white/98 border-slate-200 text-slate-800'
      }`}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          <Download className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold leading-tight">
            {bn ? 'হোম স্ক্রিনে যোগ করুন' : 'Add to home screen'}
          </p>
          <p className={`text-[10px] leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {bn ? 'অফলাইনেও পড়া যাবে, অ্যাপের মতো খুলবে।' : 'Works offline and opens like an app.'}
          </p>
        </div>
        <button
          onClick={install}
          className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg ${
            isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
          }`}
        >
          {bn ? 'ইনস্টল' : 'Install'}
        </button>
        <button
          onClick={dismiss}
          aria-label={bn ? 'বন্ধ করুন' : 'Dismiss'}
          className={`shrink-0 p-1.5 rounded-lg ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
