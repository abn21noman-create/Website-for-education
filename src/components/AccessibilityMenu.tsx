import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Accessibility,
  Check,
  Contrast,
  Gauge,
  RotateCcw,
  Type,
  X,
} from 'lucide-react';
import type { Lang, Theme } from '../types';
import {
  ACCESSIBILITY_CHANGE_EVENT,
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  applyAccessibilityPreferences,
  loadAccessibilityPreferences,
  normalizeAccessibilityPreferences,
  saveAccessibilityPreferences,
  type AccessibilityPreferences,
  type ReadingScale,
} from '../lib/accessibility';

interface AccessibilityMenuProps {
  lang: Lang;
  theme?: Theme;
  triggerClassName?: string;
  showLabel?: boolean;
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * A single display-preferences dialog shared by signed-out, student and admin
 * shells. It is portalled to <body> so header-specific button CSS cannot leak
 * into the modal controls.
 */
export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  lang,
  theme,
  triggerClassName = '',
  showLabel = false,
}) => {
  const bn = lang === 'bn';
  const isDark = theme
    ? theme === 'dark'
    : typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() =>
    loadAccessibilityPreferences()
  );
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'blocked'>('idle');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    applyAccessibilityPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    const onPreferenceChange = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      const next = normalizeAccessibilityPreferences(detail);
      setPreferences(next);
      applyAccessibilityPreferences(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== ACCESSIBILITY_STORAGE_KEY) return;
      const next = loadAccessibilityPreferences();
      setPreferences(next);
      applyAccessibilityPreferences(next);
    };
    window.addEventListener(ACCESSIBILITY_CHANGE_EVENT, onPreferenceChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ACCESSIBILITY_CHANGE_EVENT, onPreferenceChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (saveState === 'idle') return;
    const timer = window.setTimeout(() => setSaveState('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  const update = (patch: Partial<AccessibilityPreferences>) => {
    const next = normalizeAccessibilityPreferences({ ...preferences, ...patch });
    setPreferences(next);
    setSaveState(saveAccessibilityPreferences(next) ? 'saved' : 'blocked');
  };

  const setReadingScale = (readingScale: ReadingScale) => update({ readingScale });

  const triggerLabel = bn ? 'পড়া ও অ্যাক্সেসিবিলিটি' : 'Reading and accessibility';

  const dialog = open ? (
    <div
      className={`accessibility-overlay ${isDark ? 'is-dark' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        className="accessibility-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="accessibility-dialog-head">
          <div className="accessibility-dialog-mark" aria-hidden="true">
            <Accessibility size={21} />
          </div>
          <div>
            <p className="accessibility-kicker">
              {bn ? 'নিজের মতো করে পড়ুন' : 'MAKE IT COMFORTABLE'}
            </p>
            <h2 id={titleId}>{triggerLabel}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="accessibility-close"
            onClick={() => setOpen(false)}
            aria-label={bn ? 'সেটিংস বন্ধ করুন' : 'Close settings'}
          >
            <X size={19} />
          </button>
        </div>

        <p id={descriptionId} className="accessibility-description">
          {bn
            ? 'লেখা, কনট্রাস্ট ও অ্যানিমেশন বদলান। লগইন করলে পছন্দটি আপনার ক্লাউড ভল্টেও সেভ হবে।'
            : 'Adjust text, contrast and motion. When signed in, this preference is also saved in your cloud vault.'}
        </p>

        <div className="accessibility-setting">
          <div className="accessibility-setting-copy">
            <span className="accessibility-setting-icon"><Type size={17} /></span>
            <div>
              <h3>{bn ? 'পড়ার আকার' : 'Reading size'}</h3>
              <p>{bn ? 'পুরো ইন্টারফেসটি আরামদায়ক আকারে দেখুন' : 'Scale the whole interface to a comfortable size'}</p>
            </div>
          </div>
          <div
            className="accessibility-segmented accessibility-size-options"
            role="group"
            aria-label={bn ? 'পড়ার আকার বাছাই করুন' : 'Choose reading size'}
          >
            {([
              ['default', bn ? 'স্বাভাবিক' : 'Default', 'A'],
              ['large', bn ? 'বড়' : 'Large', 'A+'],
              ['xlarge', bn ? 'আরও বড়' : 'Larger', 'A++'],
            ] as const).map(([value, label, sample]) => (
              <button
                type="button"
                key={value}
                aria-pressed={preferences.readingScale === value}
                onClick={() => setReadingScale(value)}
              >
                <strong>{sample}</strong>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="accessibility-setting accessibility-setting-row">
          <div className="accessibility-setting-copy">
            <span className="accessibility-setting-icon"><Contrast size={17} /></span>
            <div>
              <h3>{bn ? 'উচ্চ কনট্রাস্ট' : 'High contrast'}</h3>
              <p>{bn ? 'হালকা লেখা ও বর্ডার আরও স্পষ্ট করুন' : 'Make muted text and boundaries clearer'}</p>
            </div>
          </div>
          <button
            type="button"
            className="accessibility-switch"
            role="switch"
            aria-checked={preferences.highContrast}
            onClick={() => update({ highContrast: !preferences.highContrast })}
          >
            <span aria-hidden="true" />
            <span className="sr-only">
              {preferences.highContrast
                ? (bn ? 'উচ্চ কনট্রাস্ট চালু' : 'High contrast on')
                : (bn ? 'উচ্চ কনট্রাস্ট বন্ধ' : 'High contrast off')}
            </span>
          </button>
        </div>

        <div className="accessibility-setting">
          <div className="accessibility-setting-copy">
            <span className="accessibility-setting-icon"><Gauge size={17} /></span>
            <div>
              <h3>{bn ? 'অ্যানিমেশন' : 'Motion'}</h3>
              <p>{bn ? 'ডিভাইসের সেটিং মানুন, অথবা নড়াচড়া কমান' : 'Follow your device, or reduce movement further'}</p>
            </div>
          </div>
          <div
            className="accessibility-segmented accessibility-motion-options"
            role="group"
            aria-label={bn ? 'অ্যানিমেশন পছন্দ' : 'Motion preference'}
          >
            <button
              type="button"
              aria-pressed={preferences.motion === 'system'}
              onClick={() => update({ motion: 'system' })}
            >
              {bn ? 'ডিভাইস অনুযায়ী' : 'Use device setting'}
            </button>
            <button
              type="button"
              aria-pressed={preferences.motion === 'reduce'}
              onClick={() => update({ motion: 'reduce' })}
            >
              {bn ? 'নড়াচড়া কম' : 'Reduce motion'}
            </button>
          </div>
        </div>

        <div className="accessibility-dialog-footer">
          <button
            type="button"
            className="accessibility-reset"
            onClick={() => {
              const next = { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
              setPreferences(next);
              setSaveState(saveAccessibilityPreferences(next) ? 'saved' : 'blocked');
            }}
          >
            <RotateCcw size={15} />
            {bn ? 'ডিফল্টে ফিরুন' : 'Reset defaults'}
          </button>
          <button
            type="button"
            className="accessibility-done"
            onClick={() => setOpen(false)}
          >
            <Check size={15} />
            {bn ? 'শেষ' : 'Done'}
          </button>
        </div>

        <p
          className={`accessibility-save-status ${saveState}`}
          role="status"
          aria-live="polite"
        >
          {saveState === 'saved'
            ? (bn ? 'পছন্দটি সেভ হয়েছে।' : 'Preference saved.')
            : saveState === 'blocked'
              ? (bn
                  ? 'এখন প্রয়োগ হয়েছে, তবে ব্রাউজার স্থায়ীভাবে সেভ করতে দেয়নি।'
                  : 'Applied for now, but the browser blocked permanent storage.')
              : '\u00a0'}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`accessibility-trigger ${triggerClassName}`.trim()}
        onClick={() => setOpen(true)}
        aria-label={triggerLabel}
        title={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Accessibility size={17} aria-hidden="true" />
        {showLabel && <span>{triggerLabel}</span>}
      </button>
      {dialog && typeof document !== 'undefined' ? createPortal(dialog, document.body) : null}
    </>
  );
};

export default AccessibilityMenu;
