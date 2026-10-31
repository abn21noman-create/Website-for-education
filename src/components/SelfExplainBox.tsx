import React, { useEffect, useRef, useState } from 'react';
import { Check, PenLine, X } from 'lucide-react';
import type { Lang, Theme } from '../types';
import { loadSelfNotes, saveSelfNote, SELF_NOTE_LIMIT } from '../lib/selfNotes';

interface SelfExplainBoxProps {
  questionId: string;
  lang: Lang;
  theme: Theme;
}

/**
 * "Explain it in your own words" — collapsed by default so the answer sheet
 * stays scannable, and saved to the device as you type.
 */
export const SelfExplainBox: React.FC<SelfExplainBoxProps> = ({
  questionId,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const stored = loadSelfNotes()[questionId] ?? '';
  const [open, setOpen] = useState(stored.length > 0);
  const [text, setText] = useState(stored);
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const onChange = (value: string) => {
    setText(value);
    setSaved(false);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      saveSelfNote(questionId, value);
      setSaved(true);
    }, 500);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
          isDark
            ? 'border-slate-700 text-slate-300 hover:border-indigo-400'
            : 'border-slate-200 text-slate-600 hover:border-indigo-300 bg-white'
        }`}
      >
        <PenLine className="w-3 h-3" />
        <span>
          {stored.length > 0
            ? lang === 'bn'
              ? 'নিজের লেখা ব্যাখ্যা দেখো'
              : 'Read your own explanation'
            : lang === 'bn'
            ? 'নিজের ভাষায় ব্যাখ্যা লেখো'
            : 'Explain it in your own words'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl border space-y-2 ${
        isDark ? 'bg-slate-900/55 border-slate-700/80' : 'bg-indigo-50/40 border-indigo-200/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold flex items-center gap-1.5">
          <PenLine className="w-3 h-3 text-indigo-500" />
          <span>{lang === 'bn' ? 'কেন এই উত্তরটি সঠিক?' : 'Why is this the answer?'}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (timer.current) window.clearTimeout(timer.current);
            saveSelfNote(questionId, text);
            setOpen(false);
          }}
          aria-label={lang === 'bn' ? 'বন্ধ করো' : 'Close'}
          className={`p-1 rounded-md cursor-pointer ${
            isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white text-slate-500'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        maxLength={SELF_NOTE_LIMIT}
        rows={3}
        placeholder={
          lang === 'bn'
            ? 'নিজের ভাষায় ১–২ লাইনে লেখো — বইয়ের বাক্য নকল না করে।'
            : 'One or two lines in your own words — not copied from the book.'
        }
        className={`w-full text-xs rounded-lg border p-2.5 outline-none resize-y ${
          isDark
            ? 'bg-slate-900/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-400'
            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400'
        }`}
      />

      <div className="flex items-center justify-between gap-2 text-[10px] font-mono opacity-65">
        <span>
          {saved && text.trim().length > 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              {lang === 'bn' ? 'এই ডিভাইসে সংরক্ষিত' : 'saved on this device'}
            </span>
          ) : (
            <span>{lang === 'bn' ? 'নিজে লেখা মনে রাখতে সাহায্য করে' : 'writing helps you remember'}</span>
          )}
        </span>
        <span>
          {text.length}/{SELF_NOTE_LIMIT}
        </span>
      </div>
    </div>
  );
};
