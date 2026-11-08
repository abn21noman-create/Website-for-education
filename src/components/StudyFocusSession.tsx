import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  EyeOff,
  LockKeyhole,
  Maximize2,
  ShieldCheck,
  Timer,
  X,
} from 'lucide-react';
import type { Lang, Theme } from '../types';
import {
  clearFocusSession,
  saveFocusSession,
  type FocusPauseReason,
  type StoredFocusSession,
} from '../lib/focusSession';
import { formatNum } from '../lib/i18n';
import {
  NATIVE_FOCUS_ACTIVE_EVENT,
  NATIVE_FOCUS_LOST_EVENT,
  isNativeAndroidHost,
  readNativeFocusState,
  requestNativeFocusLock,
} from '../lib/nativeFocus';

interface StudyFocusSessionProps {
  lang: Lang;
  theme: Theme;
  initialSession: StoredFocusSession;
  onComplete: (session: StoredFocusSession) => void;
  onClose: () => void;
}

type WakeLockLike = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockLike> };
};

function enterFullscreen(): void {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      void document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen can be unavailable in embedded/iOS browsers. Focus-loss
        // detection still keeps the countdown honest.
      });
    }
  } catch {
    // Keep the session usable when fullscreen is unsupported.
  }
}

function leaveFullscreen(): void {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => {});
    }
  } catch {
    // The browser always keeps its own Escape route.
  }
}

function playCompletionChime(): void {
  try {
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.1, context.currentTime + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + index * 0.16 + 0.45
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * 0.16);
      oscillator.stop(context.currentTime + index * 0.16 + 0.45);
    });
  } catch {
    // Audio may require a separate browser permission; visual completion remains.
  }
}

function pauseMessage(reason: FocusPauseReason | undefined, lang: Lang): string {
  if (lang === 'bn') {
    if (reason === 'reload') return 'পৃষ্ঠা বন্ধ বা রিলোড হয়েছিল—বন্ধ থাকা সময়টি গণনা করা হয়নি।';
    if (reason === 'fullscreen-exit') return 'Fullscreen থেকে বের হওয়ায় timer থেমেছে।';
    if (reason === 'emergency') return 'সেশন বন্ধ করার আগে timer থামানো হয়েছে।';
    if (reason === 'native-lock-pending') {
      return 'Android-এর trusted Screen Pinning অনুমতি নিশ্চিত করলে countdown শুরু হবে।';
    }
    if (reason === 'native-lock-lost') {
      return 'Screen Pinning চালু হয়নি বা খুলে গেছে—বাইরের সময় গণনা করা হয়নি। আবার চালু করে ফিরতে পারো।';
    }
    return 'অন্য tab বা app-এ যাওয়ায় timer থেমেছে—বাইরের সময় পড়ার সময় হিসেবে গণনা হয়নি।';
  }
  if (reason === 'reload') return 'The page was closed or reloaded; time away was not counted.';
  if (reason === 'fullscreen-exit') return 'The timer stopped when fullscreen was exited.';
  if (reason === 'emergency') return 'The timer is paused before ending the session.';
  if (reason === 'native-lock-pending') {
    return 'The countdown starts after you confirm Android’s trusted Screen Pinning prompt.';
  }
  if (reason === 'native-lock-lost') {
    return 'Screen Pinning was declined or released, so time outside was not counted. You can request it again.';
  }
  return 'The timer stopped when another tab or app took focus; time away was not counted.';
}

export const StudyFocusSession: React.FC<StudyFocusSessionProps> = ({
  lang,
  theme,
  initialSession,
  onComplete,
  onClose,
}) => {
  const [session, setSession] = useState(initialSession);
  const [completed, setCompleted] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const confirmEndRef = useRef(false);
  const lastTickRef = useRef(Date.now());
  const fullscreenSeenRef = useRef(Boolean(document.fullscreenElement));
  // A very short grace absorbs the browser's own fullscreen transition without
  // giving a meaningful window in which away time could be counted.
  const blurGraceUntilRef = useRef(Date.now() + 350);
  const wakeLockRef = useRef<WakeLockLike | null>(null);
  const previousTitleRef = useRef(document.title);
  const nativeHost = useMemo(() => isNativeAndroidHost(), []);
  const isDark = theme === 'dark';
  const running = session.status === 'running' && !completed;
  const topics = lang === 'bn' ? session.topicsBn : session.topicsEn;

  const pause = useCallback((reason: FocusPauseReason) => {
    setSession((current) => {
      if (current.status !== 'running') return current;
      return {
        ...current,
        status: 'paused',
        pauseReason: reason,
        interruptions: current.interruptions + 1,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const resumeCountdown = useCallback(() => {
    blurGraceUntilRef.current = Date.now() + 300;
    lastTickRef.current = Date.now();
    setSession((current) => {
      if (
        current.status === 'running' ||
        current.remainingSeconds <= 0 ||
        completedRef.current
      ) return current;
      return {
        ...current,
        status: 'running',
        pauseReason: undefined,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const markNativeLockLost = useCallback(() => {
    if (completedRef.current) return;
    setSession((current) => {
      if (current.status === 'paused' && current.pauseReason === 'native-lock-lost') {
        return current;
      }
      return {
        ...current,
        status: 'paused',
        pauseReason: 'native-lock-lost',
        interruptions: current.interruptions + (current.status === 'running' ? 1 : 0),
        updatedAt: Date.now(),
      };
    });
  }, []);

  const releaseWakeLock = useCallback(() => {
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (lock) void lock.release().catch(() => {});
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      const wakeLock = (navigator as WakeLockNavigator).wakeLock;
      if (!wakeLock || document.hidden) return;
      releaseWakeLock();
      wakeLockRef.current = await wakeLock.request('screen');
    } catch {
      // Screen wake lock is a progressive enhancement.
    }
  }, [releaseWakeLock]);

  // Keep keyboard focus inside the full-screen study surface and restore the
  // page cleanly when the session is dismissed.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !overlayRef.current) return;
      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) {
        event.preventDefault();
        overlayRef.current.focus();
        return;
      }
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

    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      releaseWakeLock();
      document.title = previousTitleRef.current;
    };
  }, [releaseWakeLock]);

  // Switching tabs, opening another app, or leaving an entered fullscreen mode
  // never earns study time. Browsers cannot block those actions, so pausing is
  // the honest enforceable boundary.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause('tab-hidden');
    };
    const onBlur = () => {
      if (Date.now() >= blurGraceUntilRef.current) pause('window-blur');
    };
    const onFullscreen = () => {
      if (document.fullscreenElement) {
        fullscreenSeenRef.current = true;
      } else if (fullscreenSeenRef.current) {
        pause('fullscreen-exit');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('blur', onBlur);
    };
  }, [pause]);

  // Android is authoritative about whether Lock Task/Screen Pinning is really
  // active. The countdown starts only after confirmation and pauses immediately
  // when pinning is rejected, manually released, or otherwise lost.
  useEffect(() => {
    if (!nativeHost) return;

    const onNativeActive = () => {
      // Treat the event as a wake-up signal, not proof: synchronously verify the
      // OS-reported state before allowing any countdown time to accrue.
      if (
        readNativeFocusState()?.state !== 'active' ||
        document.hidden ||
        confirmEndRef.current ||
        completedRef.current
      ) return;
      resumeCountdown();
    };
    const onNativeLost = () => markNativeLockLost();

    window.addEventListener(NATIVE_FOCUS_ACTIVE_EVENT, onNativeActive);
    window.addEventListener(NATIVE_FOCUS_LOST_EVENT, onNativeLost);

    const mountedAt = Date.now();
    const reconcile = () => {
      const latest = readNativeFocusState();
      if (latest?.state === 'active') onNativeActive();
      else if (latest && !latest.requested && Date.now() - mountedAt >= 1_000) {
        markNativeLockLost();
      }
    };
    reconcile();

    // Reconcile continuously because an Android system prompt can outlive the
    // lazy React mount, and native evaluateJavascript delivery may be delayed
    // while the Activity is paused. Idempotent state setters keep this cheap.
    const reconcileTimer = window.setInterval(reconcile, 350);

    return () => {
      window.clearInterval(reconcileTimer);
      window.removeEventListener(NATIVE_FOCUS_ACTIVE_EVENT, onNativeActive);
      window.removeEventListener(NATIVE_FOCUS_LOST_EVENT, onNativeLost);
    };
  }, [markNativeLockLost, nativeHost, resumeCountdown]);

  useEffect(() => {
    if (!running) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [running]);

  useEffect(() => {
    if (!running) {
      releaseWakeLock();
      return;
    }
    lastTickRef.current = Date.now();
    void requestWakeLock();
    const id = window.setInterval(() => {
      if (nativeHost && readNativeFocusState()?.state !== 'active') {
        // Fail closed before subtracting elapsed time. This closes the small gap
        // between a manual unpin and Android's asynchronous loss event.
        markNativeLockLost();
        return;
      }
      if (document.hidden) {
        pause('tab-hidden');
        return;
      }
      const now = Date.now();
      const elapsedMs = now - lastTickRef.current;
      // A long scheduling gap usually means the page was frozen/backgrounded
      // before visibility events arrived. Do not count that gap as study.
      if (elapsedMs > 2500) {
        pause('tab-hidden');
        return;
      }
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      if (elapsedSeconds < 1) return;
      lastTickRef.current += elapsedSeconds * 1000;
      setSession((current) => ({
        ...current,
        remainingSeconds: Math.max(0, current.remainingSeconds - elapsedSeconds),
        updatedAt: now,
      }));
    }, 250);
    return () => window.clearInterval(id);
  }, [markNativeLockLost, nativeHost, pause, releaseWakeLock, requestWakeLock, running]);

  useEffect(() => {
    if (confirmEnd) {
      overlayRef.current?.querySelector<HTMLButtonElement>('.study-focus-confirm button')?.focus();
    }
  }, [confirmEnd]);

  useEffect(() => {
    if (completed || session.remainingSeconds <= 0) return;
    saveFocusSession(session);
  }, [completed, session]);

  useEffect(() => {
    if (session.remainingSeconds > 0 || completedRef.current) return;
    completedRef.current = true;
    confirmEndRef.current = false;
    setCompleted(true);
    setConfirmEnd(false);
    clearFocusSession();
    releaseWakeLock();
    leaveFullscreen();
    playCompletionChime();
    onComplete({ ...session, status: 'paused', remainingSeconds: 0, updatedAt: Date.now() });
  }, [onComplete, releaseWakeLock, session]);

  useEffect(() => {
    if (completed) {
      document.title = lang === 'bn' ? 'ফোকাস শেষ ✓ — নক্ষত্র' : 'Focus complete ✓ — Nokkhotro';
      return;
    }
    const minutes = String(Math.floor(session.remainingSeconds / 60)).padStart(2, '0');
    const seconds = String(session.remainingSeconds % 60).padStart(2, '0');
    document.title = `${minutes}:${seconds} · ${lang === 'bn' ? 'ফোকাস' : 'Focus'}`;
  }, [completed, lang, session.remainingSeconds]);

  const resume = () => {
    confirmEndRef.current = false;
    setConfirmEnd(false);

    if (nativeHost) {
      const state = readNativeFocusState();
      if (state?.state === 'active') {
        resumeCountdown();
        return;
      }

      setSession((current) => ({
        ...current,
        status: 'paused',
        pauseReason: 'native-lock-pending',
        updatedAt: Date.now(),
      }));
      const accepted = requestNativeFocusLock(
        session.durationMinutes * 60,
        `${session.subjectEn} — ${session.chapterEn}`
      );
      if (!accepted) markNativeLockLost();
      return;
    }

    enterFullscreen();
    resumeCountdown();
  };

  const askToEnd = () => {
    confirmEndRef.current = true;
    pause('emergency');
    setConfirmEnd(true);
  };

  const abandon = () => {
    clearFocusSession();
    releaseWakeLock();
    leaveFullscreen();
    onClose();
  };

  const totalSeconds = session.durationMinutes * 60;
  const completedSeconds = Math.max(0, totalSeconds - session.remainingSeconds);
  const progress = Math.min(1, completedSeconds / totalSeconds);
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const mm = String(Math.floor(session.remainingSeconds / 60)).padStart(2, '0');
  const ss = String(session.remainingSeconds % 60).padStart(2, '0');
  const statusText = useMemo(() => {
    if (completed) return lang === 'bn' ? 'সময় শেষ—এখন তুমি মুক্ত' : 'Time is up—you are free to leave';
    if (running && nativeHost) {
      return lang === 'bn' ? 'Android Screen Pinning চালু · ফোকাস সুরক্ষিত' : 'Android Screen Pinning active · focus protected';
    }
    if (running) return lang === 'bn' ? 'ফোকাস চালু · বাইরে গেলে timer থামবে' : 'Focus active · leaving pauses the timer';
    return lang === 'bn' ? 'ফোকাস থেমে আছে' : 'Focus is paused';
  }, [completed, lang, nativeHost, running]);

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-focus-title"
      data-study-focus-session="true"
      data-focus-status={completed ? 'complete' : session.status}
      className={`study-focus-overlay ${isDark ? 'is-dark' : ''} ${completed ? 'is-complete' : ''}`}
    >
      <div className="study-focus-ambient ambient-one" aria-hidden="true" />
      <div className="study-focus-ambient ambient-two" aria-hidden="true" />

      <header className="study-focus-topbar">
        <div className="study-focus-brand">
          <span><LockKeyhole size={18} aria-hidden="true" /></span>
          <div>
            <strong>{lang === 'bn' ? 'নক্ষত্র ফোকাস' : 'Nokkhotro Focus'}</strong>
            <small>{statusText}</small>
          </div>
        </div>
        {!completed && (
          <button type="button" className="study-focus-emergency" onClick={askToEnd}>
            <X size={15} aria-hidden="true" />
            {lang === 'bn' ? 'জরুরি বন্ধ' : 'Emergency exit'}
          </button>
        )}
      </header>

      <main className="study-focus-shell">
        {completed ? (
          <section className="study-focus-complete" aria-live="polite">
            <span className="study-focus-complete-icon">
              <CheckCircle2 size={42} aria-hidden="true" />
            </span>
            <span className="study-focus-kicker">
              {lang === 'bn' ? 'FOCUS BLOCK COMPLETE' : 'FOCUS BLOCK COMPLETE'}
            </span>
            <h1 id="study-focus-title">
              {lang === 'bn' ? 'আজকের এই পড়া শেষ!' : 'This study block is complete!'}
            </h1>
            <p>
              {lang === 'bn'
                ? `${formatNum(session.durationMinutes, lang)} মিনিট ${session.chapterBn} পড়া স্টাডি লগে যোগ হয়েছে। এখন চাইলে বিরতি নিতে বা পরের পড়া শুরু করতে পারো।`
                : `${session.durationMinutes} minutes on ${session.chapterEn} was added to your study log. You can now take a break or start the next block.`}
            </p>
            <div className="study-focus-complete-topics">
              {topics.map((topic) => (
                <span key={topic}><Check size={13} aria-hidden="true" /> {topic}</span>
              ))}
            </div>
            <button type="button" className="study-focus-primary" onClick={onClose}>
              {lang === 'bn' ? 'শেষ করুন ও ফিরে যান' : 'Finish and return'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </section>
        ) : (
          <>
            <section className="study-focus-heading">
              <span className="study-focus-kicker">
                {lang === 'bn' ? 'আজ বই থেকে এইটুকুই' : 'YOUR TEXTBOOK BOUNDARY'}
              </span>
              <h1 id="study-focus-title">
                {lang === 'bn' ? session.chapterBn : session.chapterEn}
              </h1>
              <p>
                {lang === 'bn' ? session.subjectBn : session.subjectEn} ·{' '}
                {formatNum(topics.length, lang)} {lang === 'bn' ? 'টি topic' : topics.length === 1 ? 'topic' : 'topics'} ·{' '}
                {formatNum(session.durationMinutes, lang)} {lang === 'bn' ? 'মিনিট' : 'minutes'}
              </p>
            </section>

            <div className="study-focus-grid">
              <section className="study-focus-clock" aria-label={statusText}>
                <div className="study-focus-ring">
                  <svg viewBox="0 0 220 220" aria-hidden="true">
                    <circle className="study-focus-ring-track" cx="110" cy="110" r={radius} />
                    <circle
                      className="study-focus-ring-value"
                      cx="110"
                      cy="110"
                      r={radius}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                  <div>
                    <Timer size={19} aria-hidden="true" />
                    <strong role="timer" aria-label={`${mm} minutes ${ss} seconds remaining`}>
                      {formatNum(`${mm}:${ss}`, lang)}
                    </strong>
                    <span>{lang === 'bn' ? 'বাকি সময়' : 'remaining'}</span>
                  </div>
                </div>
                <div className={`study-focus-live-status ${running ? 'is-running' : 'is-paused'}`}>
                  <i aria-hidden="true" />
                  {running
                    ? lang === 'bn' ? 'Countdown চলছে' : 'Countdown running'
                    : lang === 'bn' ? 'Countdown থেমেছে' : 'Countdown paused'}
                </div>
                {session.interruptions > 0 && (
                  <small>
                    {lang === 'bn'
                      ? `${formatNum(session.interruptions, lang)} বার বাইরে যাওয়া ধরা পড়েছে`
                      : `${session.interruptions} focus interruption${session.interruptions === 1 ? '' : 's'} detected`}
                  </small>
                )}
              </section>

              <section className="study-focus-scope">
                <div className="study-focus-scope-head">
                  <span><BookOpen size={18} aria-hidden="true" /></span>
                  <div>
                    <small>{lang === 'bn' ? 'মূল বইয়ের বিষয়সীমা' : 'TEXTBOOK SCOPE'}</small>
                    <h2>
                      {lang === 'bn'
                        ? `${formatNum(topics.length, lang)}টি topic শেষ করবে`
                        : `Finish ${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}`}
                    </h2>
                  </div>
                </div>
                <ol>
                  {topics.map((topic, index) => (
                    <li key={`${index}-${topic}`}>
                      <span>{formatNum(index + 1, lang)}</span>
                      <p>{topic}</p>
                    </li>
                  ))}
                </ol>
                <p className="study-focus-page-note">
                  {lang === 'bn'
                    ? 'বইয়ের সংস্করণে পৃষ্ঠা বদলাতে পারে, তাই ভুল page number না দিয়ে সঠিক topic boundary দেখানো হয়েছে।'
                    : 'Page numbers vary by textbook edition, so the exact topic boundary is shown instead of inventing a page range.'}
                </p>
              </section>
            </div>

            {!running && !confirmEnd && (
              <section className="study-focus-paused" role="status" aria-live="assertive">
                <span><EyeOff size={25} aria-hidden="true" /></span>
                <div>
                  <strong>
                    {nativeHost
                      ? lang === 'bn' ? 'Screen Pinning প্রয়োজন' : 'Screen Pinning required'
                      : lang === 'bn' ? 'Timer থেমেছে' : 'Timer paused'}
                  </strong>
                  <p>{pauseMessage(session.pauseReason, lang)}</p>
                </div>
                <button type="button" onClick={resume}>
                  {nativeHost
                    ? <LockKeyhole size={16} aria-hidden="true" />
                    : <Maximize2 size={16} aria-hidden="true" />}
                  {nativeHost
                    ? lang === 'bn' ? 'Screen Pinning চালু করুন' : 'Turn on Screen Pinning'
                    : lang === 'bn' ? 'Fullscreen-এ ফিরে চালু করুন' : 'Resume in fullscreen'}
                </button>
              </section>
            )}

            {confirmEnd && (
              <section className="study-focus-confirm" role="alertdialog" aria-labelledby="focus-end-title">
                <span><AlertTriangle size={24} aria-hidden="true" /></span>
                <div>
                  <strong id="focus-end-title">
                    {lang === 'bn' ? 'সেশনটি সত্যিই বাদ দেবে?' : 'End this session early?'}
                  </strong>
                  <p>
                    {lang === 'bn'
                      ? 'অসম্পূর্ণ সময় স্টাডি লগে যোগ হবে না। জরুরি দরকার না হলে আবার ফোকাসে ফিরে যাও।'
                      : 'Incomplete time will not be added to the study log. Resume unless this is urgent.'}
                  </p>
                </div>
                <div>
                  <button type="button" onClick={resume}>
                    {lang === 'bn' ? 'না, ফিরে যাই' : 'Resume focus'}
                  </button>
                  <button type="button" onClick={abandon}>
                    {lang === 'bn' ? 'হ্যাঁ, সেশন বাদ দিন' : 'End without saving'}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {!completed && (
        <footer className="study-focus-footer">
          <ShieldCheck size={17} aria-hidden="true" />
          <p>
            {nativeHost
              ? lang === 'bn'
                ? 'Android-এর trusted Screen Pinning অন্য app-এ অনিচ্ছাকৃত যাওয়া আটকায়। সাধারণ ফোনে Android-এর confirmation ও manual unpin সবসময় থাকে; pinning খুললে countdown সঙ্গে সঙ্গে থামবে। কোনো activity server-এ পাঠানো হয় না।'
                : 'Android’s trusted Screen Pinning prevents accidental app switching. On personal devices, Android always keeps its confirmation and manual-unpin controls; releasing pinning immediately pauses the countdown. No activity is sent to a server.'
              : lang === 'bn'
                ? 'Browser অন্য app বন্ধ করতে পারে না। তাই অন্য tab/app-এ গেলে বা fullscreen ছাড়লে countdown থামবে; ফিরে এসে চালু না করা পর্যন্ত সময় কমবে না। কোনো activity server-এ পাঠানো হয় না।'
                : 'A browser cannot block other apps. Instead, switching tabs/apps or leaving fullscreen pauses the countdown until you explicitly resume. No activity is sent to a server.'}
          </p>
        </footer>
      )}
    </div>
  );
};

export default StudyFocusSession;
