import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Printer,
  ImageDown,
  Share2,
  Check,
  GraduationCap,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import type {
  ChapterProgressState,
  Lang,
  QuizAttemptRecord,
  StudentProfile,
  StudySessionRecord,
  Theme,
} from '../types';
import { CHAPTERS, getSubjectByKey } from '../data/syllabusData';
import { formatNum, getBoardLabel } from '../lib/i18n';
import {
  LIFE_DATA_EVENT,
  attendanceForMonth,
  daysUntil,
  habitStreak,
  loadLifeData,
  localDateKey,
  subjectResultAverages,
  type LifeData,
} from '../lib/lifeStore';

interface ParentReportCardProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  progressMap: Record<string, ChapterProgressState>;
  quizHistory: QuizAttemptRecord[];
  sessions: StudySessionRecord[];
}

/**
 * A one-page summary a student can hand to a parent, tutor or guardian.
 *
 * Exporting matters more than the on-screen layout, so there are three routes
 * out: a scoped print/PDF, a PNG drawn on a canvas (so it can be sent through
 * Messenger/WhatsApp), and the Web Share API with a plain-text fallback.
 */
export const ParentReportCard: React.FC<ParentReportCardProps> = ({
  lang,
  theme,
  profile,
  progressMap,
  quizHistory,
  sessions,
}) => {
  const bn = lang === 'bn';
  const isDark = theme === 'dark';
  const [life, setLife] = useState<LifeData>(() => loadLifeData());
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const reload = () => setLife(loadLifeData());
    window.addEventListener(LIFE_DATA_EVENT, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(LIFE_DATA_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const stats = useMemo(() => {
    let done = 0;
    CHAPTERS.forEach((c) => {
      const p = progressMap[c.id];
      if (!p) return;
      done += (p.theoryDone ? 1 : 0) + (p.notesDone ? 1 : 0) + (p.mcqDone ? 1 : 0) + (p.cqDone ? 1 : 0);
    });
    const total = CHAPTERS.length * 4;
    const syllabusPct = total > 0 ? Math.round((done / total) * 100) : 0;

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekMinutes = sessions
      .filter((s) => new Date(s.createdAt).getTime() >= weekStart.getTime())
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const attendance = attendanceForMonth(life.attendance);
    const streak = habitStreak(life.habits);

    const upcoming = [
      ...life.deadlines
        .filter((d) => !d.done)
        .map((d) => ({ id: d.id, title: d.title, date: d.date })),
      ...life.exams.map((e) => ({ id: e.id, title: e.title, date: e.date })),
    ]
      .filter((item) => daysUntil(item.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);

    const results = [...life.results]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);

    const weakest = subjectResultAverages(life.results)[0] ?? null;
    const avgAccuracy = quizHistory.length
      ? Math.round(quizHistory.reduce((sum, q) => sum + q.accuracy, 0) / quizHistory.length)
      : 0;

    return {
      syllabusPct,
      studyHours: Math.round(profile.studyMinutes / 60),
      weekHours: Math.round((weekMinutes / 60) * 10) / 10,
      weekMinutes,
      attendance,
      streak,
      upcoming,
      results,
      weakest,
      avgAccuracy,
      quizzes: quizHistory.length,
      dateLabel: new Date().toLocaleDateString(bn ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [progressMap, sessions, life, profile.studyMinutes, quizHistory, bn]);

  const rows = useMemo(
    () => [
      {
        label: bn ? 'সিলেবাস সম্পন্ন' : 'Syllabus covered',
        value: `${formatNum(stats.syllabusPct, lang)}%`,
      },
      { label: bn ? 'মোট XP' : 'Total XP', value: formatNum(profile.xp, lang) },
      {
        label: bn ? 'মোট পড়ার সময়' : 'Total study time',
        value: `${formatNum(stats.studyHours, lang)} ${bn ? 'ঘণ্টা' : 'hrs'}`,
      },
      {
        label: bn ? 'এই সপ্তাহে' : 'This week',
        value: `${formatNum(stats.weekHours, lang)} ${bn ? 'ঘণ্টা' : 'hrs'}`,
      },
      {
        label: bn ? 'MCQ নির্ভুলতা' : 'MCQ accuracy',
        value: stats.quizzes > 0 ? `${formatNum(stats.avgAccuracy, lang)}%` : '—',
      },
      {
        label: bn ? 'কলেজ উপস্থিতি' : 'Attendance',
        value: stats.attendance.marked > 0 ? `${formatNum(stats.attendance.pct, lang)}%` : '—',
      },
      {
        label: bn ? 'অভ্যাস স্ট্রিক' : 'Habit streak',
        value: `${formatNum(stats.streak, lang)} ${bn ? 'দিন' : 'days'}`,
      },
      {
        label: bn ? 'আসন্ন তারিখ' : 'Upcoming dates',
        value: formatNum(stats.upcoming.length, lang),
      },
    ],
    [stats, lang, profile.xp, bn]
  );

  const shareText = useMemo(() => {
    const lines = [
      bn ? 'নক্ষত্র HSC ’28 — অভিভাবক রিপোর্ট' : 'Nokkhotro HSC ’28 — Parent report',
      `${bn ? 'শিক্ষার্থী' : 'Student'}: ${profile.fullName || (bn ? 'শিক্ষার্থী' : 'Student')}`,
      profile.collegeName ? `${bn ? 'প্রতিষ্ঠান' : 'College'}: ${profile.collegeName}` : '',
      `— ${rows.map((r) => `${r.label}: ${r.value}`).join(' | ')}`,
      stats.weakest
        ? `${bn ? 'দুর্বল পত্র' : 'Weakest paper'}: ${
            getSubjectByKey(stats.weakest.subjectKey)?.name[bn ? 'bn' : 'en'] ?? ''
          } (${formatNum(stats.weakest.avg, lang)}%)`
        : '',
      `${bn ? 'তারিখ' : 'Date'}: ${stats.dateLabel}`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [bn, profile.fullName, profile.collegeName, rows, stats, lang]);

  const printReport = () => {
    document.body.classList.add('printing-report');
    const cleanup = () => {
      document.body.classList.remove('printing-report');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  /** Draws the same summary as a 1080×1520 PNG for chat apps. */
  const downloadPng = async () => {
    setBusy(true);
    try {
      const W = 1080;
      const H = 1520;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Bengali glyphs need the webfont to be ready before drawing.
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* fall back to the system Bengali font */
        }
      }

      const font = (weight: number, size: number) =>
        `${weight} ${size}px "Hind Siliguri", "Noto Sans Bengali", "Plus Jakarta Sans", sans-serif`;

      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      ctx.fillStyle = '#eef2fb';
      ctx.fillRect(0, 0, W, H);

      const grad = ctx.createLinearGradient(0, 56, W, 380);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = grad;
      roundRect(56, 56, W - 112, 240, 36);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = font(700, 52);
      ctx.fillText(bn ? 'নক্ষত্র HSC ’28' : 'NOKKHOTRO HSC ’28', 104, 150);
      ctx.font = font(500, 32);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(bn ? 'অভিভাবক রিপোর্ট' : 'Parent report', 104, 205);
      ctx.font = font(400, 24);
      ctx.fillText(stats.dateLabel, 104, 252);

      // Student strip
      ctx.fillStyle = '#ffffff';
      roundRect(56, 328, W - 112, 168, 28);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = font(700, 40);
      ctx.fillText(profile.fullName || (bn ? 'শিক্ষার্থী' : 'Student'), 104, 398);
      ctx.fillStyle = '#64748b';
      ctx.font = font(400, 26);
      ctx.fillText(
        [profile.collegeName, getBoardLabel(profile.board, lang)]
          .filter(Boolean)
          .join(' • ') || (bn ? 'HSC 2028 • বিজ্ঞান' : 'HSC 2028 • Science'),
        104, 448
      );

      // Stat grid
      const colW = (W - 112 - 28) / 2;
      rows.forEach((row, i) => {
        const x = 56 + (i % 2) * (colW + 28);
        const y = 528 + Math.floor(i / 2) * 158;
        ctx.fillStyle = '#ffffff';
        roundRect(x, y, colW, 138, 24);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.font = font(400, 24);
        ctx.fillText(row.label, x + 34, y + 50);
        ctx.fillStyle = '#111827';
        ctx.font = font(700, 44);
        ctx.fillText(row.value, x + 34, y + 106);
      });

      // Footer note
      const footerY = 528 + 4 * 158 + 30;
      ctx.fillStyle = '#ffffff';
      roundRect(56, footerY, W - 112, 150, 24);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.font = font(400, 24);
      ctx.fillText(
        bn
          ? 'এই রিপোর্টটি নক্ষত্র HSC ’28 অ্যাপের নিজস্ব অগ্রগতির ডেটা থেকে স্বয়ংক্রিয়ভাবে তৈরি।'
          : 'Generated automatically from progress recorded in the Nokkhotro HSC ’28 app.',
        96,
        footerY + 58
      );
      ctx.fillStyle = '#64748b';
      ctx.font = font(400, 22);
      ctx.fillText(
        `${bn ? 'ডাউনলোড' : 'Downloaded'}: ${new Date().toLocaleString(bn ? 'bn-BD' : 'en-GB')}`,
        96,
        footerY + 104
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nokkhotro-report-${localDateKey()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      /* Canvas can be blocked in some embedded browsers — printing still works. */
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: bn ? 'নক্ষত্র HSC ’28 — অভিভাবক রিপোর্ট' : 'Nokkhotro HSC ’28 — Parent report',
          text: shareText,
        });
        return;
      }
    } catch {
      /* The user cancelled the share sheet — fall through to copying. */
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* Clipboard blocked; the text is still visible on screen. */
    }
  };

  const card = `rounded-2xl border ${
    isDark ? 'bg-slate-800/60 border-slate-700/65' : 'bg-white/90 border-slate-200/80 card-soft-light'
  }`;
  const sub = isDark ? 'text-slate-400' : 'text-slate-500';
  const head = isDark ? 'text-slate-100' : 'text-slate-900';

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={`text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2 ${head}`}>
            <FileText className="w-4 h-4 text-indigo-500" />
            {bn ? 'অভিভাবক রিপোর্ট' : 'Parent report'}
          </h2>
          <p className={`text-[11px] mt-0.5 ${sub}`}>
            {bn
              ? 'এক পাতার সারসংক্ষেপ — প্রিন্ট, ছবি বা শেয়ার করুন।'
              : 'A one-page summary — print it, save it as an image, or share it.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={printReport}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold ${
              isDark
                ? 'border-slate-700 bg-slate-800/60 text-slate-200'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            {bn ? 'প্রিন্ট / PDF' : 'Print / PDF'}
          </button>
          <button
            onClick={downloadPng}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold disabled:opacity-60 ${
              isDark
                ? 'border-slate-700 bg-slate-800/60 text-slate-200'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <ImageDown className="w-3.5 h-3.5" />
            {busy ? (bn ? 'তৈরি হচ্ছে…' : 'Creating…') : bn ? 'ছবি সেভ' : 'Save image'}
          </button>
          <button
            onClick={share}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold ${
              isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? (bn ? 'কপি হয়েছে' : 'Copied') : bn ? 'শেয়ার' : 'Share'}
          </button>
        </div>
      </div>

      {/* Printable sheet */}
      <div className={`print-report ${card} p-4 sm:p-6`}>
        <div
          className={`rounded-2xl p-4 sm:p-5 text-white ${
            isDark ? 'bg-indigo-600/90' : 'bg-gradient-to-r from-indigo-600 to-sky-500'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-80 print:text-slate-700">
                {bn ? 'নক্ষত্র HSC ’28' : 'NOKKHOTRO HSC ’28'}
              </p>
              <h3 className="text-base sm:text-lg font-extrabold mt-0.5">
                {bn ? 'অভিভাবক রিপোর্ট' : 'Parent report'}
              </h3>
              <p className="text-[11px] opacity-90 mt-1">{stats.dateLabel}</p>
            </div>
            <GraduationCap className="w-8 h-8 opacity-80 shrink-0 print:hidden" />
          </div>

          <div className="mt-3">
            <p className="text-sm font-bold truncate">
              {profile.fullName || (bn ? 'শিক্ষার্থী' : 'Student')}
            </p>
            <p className="text-[11px] opacity-90 truncate">
              {[profile.collegeName, getBoardLabel(profile.board, lang)]
                .filter(Boolean)
                .join(' • ') || (bn ? 'HSC 2028 • বিজ্ঞান বিভাগ' : 'HSC 2028 • Science')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`rounded-xl border p-3 ${
                isDark ? 'border-slate-700/70 bg-slate-900/40' : 'border-slate-200/90 bg-white'
              }`}
            >
              <p className={`text-[10px] font-bold ${sub}`}>{row.label}</p>
              <p className={`text-base font-extrabold tabular-nums mt-0.5 ${head}`}>{row.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div
            className={`rounded-xl border p-3 ${
              isDark ? 'border-slate-700/70' : 'border-slate-200/90'
            }`}
          >
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${sub}`}>
              {bn ? 'সাম্প্রতিক ফলাফল' : 'Recent results'}
            </p>
            {stats.results.length === 0 ? (
              <p className={`text-[11px] ${sub}`}>
                {bn ? 'এখনো কোনো ফলাফল যোগ করা হয়নি।' : 'No results logged yet.'}
              </p>
            ) : (
              <ul className="space-y-1">
                {stats.results.map((r) => (
                  <li key={r.id} className={`flex items-center justify-between gap-2 text-[11px] ${sub}`}>
                    <span className="truncate">{r.title}</span>
                    <span className={`font-bold tabular-nums shrink-0 ${head}`}>
                      {formatNum(Math.round((r.obtained / Math.max(1, r.total)) * 100), lang)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`rounded-xl border p-3 ${
              isDark ? 'border-slate-700/70' : 'border-slate-200/90'
            }`}
          >
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${sub}`}>
              {bn ? 'আসন্ন তারিখ' : 'Upcoming'}
            </p>
            {stats.upcoming.length === 0 ? (
              <p className={`text-[11px] ${sub}`}>
                {bn ? 'আগামী দিনে কোনো ডেডলাইন নেই।' : 'No upcoming deadlines.'}
              </p>
            ) : (
              <ul className="space-y-1">
                {stats.upcoming.map((c) => (
                  <li key={c.id} className={`flex items-center justify-between gap-2 text-[11px] ${sub}`}>
                    <span className="truncate">{c.title}</span>
                    <span className={`font-bold tabular-nums shrink-0 ${head}`}>
                      {formatNum(Math.max(0, daysUntil(c.date)), lang)} {bn ? 'দিন' : 'd'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {stats.weakest && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl border p-2.5 ${
              isDark ? 'border-amber-400/25 bg-amber-500/8' : 'border-amber-200 bg-amber-50/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <p className={`text-[11px] font-semibold ${head}`}>
              {bn ? 'লক্ষ্য রাখুন' : 'Focus'}:{' '}
              {getSubjectByKey(stats.weakest.subjectKey)?.name[bn ? 'bn' : 'en']} —{' '}
              {formatNum(stats.weakest.avg, lang)}% ({formatNum(stats.weakest.count, lang)}{' '}
              {bn ? 'টি ফলাফল' : 'results'})
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-dashed border-slate-300/60">
          <p className={`text-[10px] leading-snug ${sub}`}>
            {bn
              ? 'এই রিপোর্টটি অ্যাপে সংরক্ষিত অগ্রগতির ভিত্তিতে স্বয়ংক্রিয়ভাবে তৈরি।'
              : 'Generated automatically from progress recorded in the app.'}
          </p>
          <div className="hidden sm:flex items-center gap-6 shrink-0">
            <div className={`w-24 border-t pt-1 text-[9px] text-center ${sub}`}>
              {bn ? 'অভিভাবক স্বাক্ষর' : 'Guardian'}
            </div>
            <div className={`w-24 border-t pt-1 text-[9px] text-center ${sub}`}>
              {bn ? 'শিক্ষার্থী স্বাক্ষর' : 'Student'}
            </div>
          </div>
        </div>
      </div>

      <p className={`text-[10px] px-1 flex items-center gap-1.5 ${sub}`}>
        <CalendarClock className="w-3 h-3" />
        {bn
          ? 'প্রিন্ট/PDF শুধু এই কার্ডটাই ছাপবে — বাকি পেজ বাদ যাবে।'
          : 'Print/PDF outputs this card only — the rest of the page is skipped.'}
      </p>
    </section>
  );
};

export default ParentReportCard;
