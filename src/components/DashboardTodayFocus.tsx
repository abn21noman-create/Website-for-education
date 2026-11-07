import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  Check,
  Clock3,
  RotateCcw,
} from 'lucide-react';
import type {
  ActiveTab,
  ChapterProgressState,
  Lang,
  SubjectKey,
  Theme,
} from '../types';
import { getSubjectByKey } from '../data/syllabusData';
import {
  CLASS_TASKS,
  REVISION_TASKS,
  classSlotsForDay,
  dayNumberForDate,
  isRevisionDay,
  revisionQueue,
  toDateKey,
} from '../lib/masterRoutine';
import { upcomingMocks } from '../lib/mockPlan';
import {
  learnedChapters,
  loadRoutineState,
  revisionTaskKey,
  taskKey,
} from '../lib/routineStore';
import { allTrackReadiness, tracksByPriority } from '../lib/trackProgress';
import { formatNum } from '../lib/i18n';
import { SubjectIcon } from './SubjectIcon';

const LazyDashboardReminderCard = React.lazy(async () => {
  const module = await import('./DashboardReminderCard');
  return { default: module.DashboardReminderCard };
});

interface DashboardTodayFocusProps {
  lang: Lang;
  theme: Theme;
  progressMap: Record<string, ChapterProgressState>;
  onNavigate: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
}

/**
 * The first actionable surface on the dashboard. It combines today's two
 * chapters, routine completion and contextual reminders so a student does not
 * have to scroll past analytics or hunt through separate modules to begin.
 */
export const DashboardTodayFocus: React.FC<DashboardTodayFocusProps> = ({
  lang,
  theme,
  progressMap,
  onNavigate,
}) => {
  const isDark = theme === 'dark';
  const [routine] = useState(loadRoutineState);
  const todayKey = toDateKey(new Date());
  const dayNumber = dayNumberForDate(routine.startDate, todayKey);
  const slots = dayNumber ? classSlotsForDay(dayNumber) : [];
  const revisionDay = dayNumber ? isRevisionDay(dayNumber) : false;
  const dueReviews = revisionQueue(learnedChapters(routine), todayKey, routine.tasks);
  const nextMock = dayNumber
    ? upcomingMocks(dayNumber, 1, routine.startDate)[0] ?? null
    : null;

  const slotProgress = slots.map((slot, slotIndex) => ({
    ...slot,
    completed: CLASS_TASKS.reduce(
      (count, _task, taskIndex) =>
        count + (routine.tasks[taskKey(todayKey, slotIndex, taskIndex)] ? 1 : 0),
      0
    ),
  }));
  const completedSteps = revisionDay
    ? REVISION_TASKS.reduce(
        (count, _task, taskIndex) =>
          count + (routine.tasks[revisionTaskKey(todayKey, taskIndex)] ? 1 : 0),
        0
      )
    : slotProgress.reduce((sum, slot) => sum + slot.completed, 0);
  const totalSteps = revisionDay
    ? REVISION_TASKS.length
    : slotProgress.length * CLASS_TASKS.length;
  const todayMinutes = Math.max(0, Number(routine.minutes[todayKey] || 0));

  const admissionTracks = useMemo(() => {
    const byKey = new Map(
      allTrackReadiness(progressMap).map((track) => [track.track.key, track])
    );
    return tracksByPriority(routine.primaryTrack)
      .map((track) => byKey.get(track.key))
      .filter((track): track is NonNullable<typeof track> => Boolean(track));
  }, [progressMap, routine.primaryTrack]);

  const dailyStudy = useMemo(() => {
    if (revisionDay) {
      return {
        title: {
          bn: 'আজ সাপ্তাহিক রিভিশন',
          en: 'Weekly revision today',
        },
        detail: {
          bn: 'নোট, ভুল প্রশ্ন ও সাপ্তাহিক মডেল টেস্ট শেষ করুন',
          en: 'Finish notes, mistake review and the weekly mock',
        },
      };
    }
    if (slotProgress.length > 0) {
      return {
        title: {
          bn: `আজকের ${formatNum(slotProgress.length, 'bn')}টি পড়া প্রস্তুত`,
          en: `${slotProgress.length} study blocks ready today`,
        },
        detail: {
          bn: slotProgress
            .map((slot) => `${slot.subjectBn}: ${slot.chapterBn}`)
            .join(' • '),
          en: slotProgress
            .map((slot) => `${slot.subjectEn}: ${slot.chapterEn}`)
            .join(' • '),
        },
      };
    }
    return {
      title: {
        bn: 'আজকের রুটিন ঠিক করুন',
        en: 'Set today’s routine',
      },
      detail: {
        bn: 'Day 1-এর তারিখ ঠিক করলেই আজকের অধ্যায় এখানে দেখা যাবে',
        en: 'Set the Day 1 date to see today’s chapters here',
      },
    };
  }, [revisionDay, slotProgress]);

  const startToday = () => {
    const firstIncomplete = slotProgress.find(
      (slot) => slot.completed < CLASS_TASKS.length
    );
    if (firstIncomplete) {
      onNavigate('syllabus', firstIncomplete.subjectKey);
      return;
    }
    onNavigate('routine');
  };

  return (
    <section
      data-dashboard-today-priority="true"
      className={`dashboard-today-priority ${isDark ? 'is-dark' : ''}`}
      aria-labelledby="dashboard-today-heading"
    >
      <div className="dashboard-today-heading">
        <div>
          <span className="dashboard-today-kicker">
            <i aria-hidden="true" />
            {lang === 'bn' ? 'অ্যাপ খুলেই আজকের ফোকাস' : 'YOUR FIRST STOP TODAY'}
          </span>
          <h2 id="dashboard-today-heading">
            {lang === 'bn' ? 'আজ কী পড়বে?' : 'What should you study today?'}
          </h2>
          <p>
            {lang === 'bn'
              ? 'আজকের অধ্যায়, বাকি রিভিশন ও জরুরি রিমাইন্ডার—সব এক জায়গায়।'
              : 'Today’s chapters, due reviews and urgent reminders—all in one place.'}
          </p>
        </div>
        <div className="dashboard-today-actions">
          {dayNumber && (
            <span className="dashboard-today-day">
              Day {formatNum(dayNumber, lang)} / 391
            </span>
          )}
          <button type="button" onClick={() => onNavigate('routine')}>
            {lang === 'bn' ? 'পুরো রুটিন' : 'Full routine'}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="dashboard-today-grid">
        <div className="dashboard-today-study" data-today-study-list="true">
          <div className="dashboard-today-study-head">
            <div>
              <span>{lang === 'bn' ? 'আজকের রুটিন' : "TODAY'S ROUTINE"}</span>
              <strong>
                {revisionDay
                  ? lang === 'bn' ? 'রিভিশন ও সাপ্তাহিক পরীক্ষা' : 'Revision & weekly test'
                  : slotProgress.length > 0
                    ? lang === 'bn'
                      ? `${formatNum(slotProgress.length, lang)}টি অধ্যায় • প্রথমটি এখন শুরু করুন`
                      : `${slotProgress.length} chapters • start with the first`
                    : lang === 'bn' ? 'আজকের পড়া সেট করা নেই' : 'No study blocks set today'}
              </strong>
            </div>
            {totalSteps > 0 && (
              <span className="dashboard-today-progress-label">
                {formatNum(completedSteps, lang)} / {formatNum(totalSteps, lang)}{' '}
                {lang === 'bn' ? 'ধাপ' : 'steps'}
              </span>
            )}
          </div>

          {dayNumber === null ? (
            <div className="dashboard-today-empty">
              <CalendarClock size={22} aria-hidden="true" />
              <div>
                <strong>{lang === 'bn' ? 'রুটিনের তারিখ আপডেট করুন' : 'Update your routine date'}</strong>
                <p>
                  {lang === 'bn'
                    ? 'মাস্টার রুটিনে Day 1 বসালে প্রতিবার ঢুকেই আজকের দুইটি পড়া দেখতে পাবেন।'
                    : 'Set Day 1 in the master routine to see today’s two study blocks whenever you open the app.'}
                </p>
              </div>
              <button type="button" onClick={() => onNavigate('routine')}>
                {lang === 'bn' ? 'তারিখ ঠিক করুন' : 'Set date'}
              </button>
            </div>
          ) : revisionDay ? (
            <div className="dashboard-today-revision">
              <span className="dashboard-today-revision-icon">
                <RotateCcw size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>{lang === 'bn' ? 'আজ নতুন অধ্যায় নয়' : 'No new chapter today'}</strong>
                <p>
                  {lang === 'bn'
                    ? 'এই সপ্তাহের নোট, ভুল প্রশ্ন ও গুরুত্বপূর্ণ প্রশ্ন রিভিশন করে সাপ্তাহিক পরীক্ষা দিন।'
                    : 'Review this week’s notes, mistakes and high-yield questions, then take the weekly test.'}
                </p>
              </div>
              <button type="button" onClick={() => onNavigate('routine')}>
                {lang === 'bn' ? 'চেকলিস্ট খুলুন' : 'Open checklist'}
              </button>
            </div>
          ) : (
            <ol className="dashboard-today-slots">
              {slotProgress.map((slot, index) => {
                const subject = getSubjectByKey(slot.subjectKey);
                const done = slot.completed === CLASS_TASKS.length;
                return (
                  <li key={`${slot.subjectKey}-${slot.chapterId}-${index}`} data-today-study-slot="true">
                    <div className="dashboard-today-slot-top">
                      <span className={`dashboard-today-slot-icon tone-${index + 1}`}>
                        <SubjectIcon name={subject.iconName} className="w-4 h-4" />
                      </span>
                      <span className="dashboard-today-order">
                        {done
                          ? <><Check size={12} aria-hidden="true" /> {lang === 'bn' ? 'শেষ' : 'Done'}</>
                          : index === 0
                            ? lang === 'bn' ? '১ · প্রথমে' : '1 · First'
                            : lang === 'bn' ? '২ · এরপর' : '2 · Next'}
                      </span>
                    </div>
                    <p>{lang === 'bn' ? slot.subjectBn : slot.subjectEn}</p>
                    <h3>{lang === 'bn' ? slot.chapterBn : slot.chapterEn}</h3>
                    <div className="dashboard-today-slot-progress">
                      <div
                        role="progressbar"
                        aria-label={
                          lang === 'bn'
                            ? `${slot.subjectBn} অধ্যায়ের কাজ`
                            : `${slot.subjectEn} chapter tasks`
                        }
                        aria-valuemin={0}
                        aria-valuemax={CLASS_TASKS.length}
                        aria-valuenow={slot.completed}
                      >
                        <span
                          style={{ width: `${(slot.completed / CLASS_TASKS.length) * 100}%` }}
                        />
                      </div>
                      <small>
                        {formatNum(slot.completed, lang)} / {formatNum(CLASS_TASKS.length, lang)}{' '}
                        {lang === 'bn' ? 'কাজ' : 'tasks'}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('syllabus', slot.subjectKey)}
                      aria-label={
                        lang === 'bn'
                          ? `${slot.subjectBn}: ${slot.chapterBn} খুলুন`
                          : `Open ${slot.subjectEn}: ${slot.chapterEn}`
                      }
                    >
                      {lang === 'bn' ? 'অধ্যায় খুলুন' : 'Open chapter'}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="dashboard-today-study-footer">
            <div className="dashboard-today-signals">
              {dueReviews.length > 0 ? (
                <button type="button" onClick={() => onNavigate('routine')}>
                  <RotateCcw size={14} aria-hidden="true" />
                  {lang === 'bn'
                    ? `${formatNum(dueReviews.length, lang)}টি রিভিশন বাকি`
                    : `${dueReviews.length} reviews due`}
                </button>
              ) : (
                <span>
                  <Check size={14} aria-hidden="true" />
                  {lang === 'bn' ? 'আজ কোনো পুরোনো রিভিশন বাকি নেই' : 'No old review is due today'}
                </span>
              )}
              <span>
                <Clock3 size={14} aria-hidden="true" />
                {lang === 'bn'
                  ? `আজ ${formatNum(todayMinutes, lang)} মিনিট লগ হয়েছে`
                  : `${todayMinutes} minutes logged today`}
              </span>
            </div>
            <button
              type="button"
              className="dashboard-today-start"
              onClick={startToday}
            >
              {lang === 'bn'
                ? slotProgress.some((slot) => slot.completed < CLASS_TASKS.length)
                  ? 'এখন পড়া শুরু করুন'
                  : 'রুটিন খুলুন'
                : slotProgress.some((slot) => slot.completed < CLASS_TASKS.length)
                  ? 'Start studying now'
                  : 'Open routine'}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="dashboard-today-reminders">
          <React.Suspense
            fallback={
              <div
                className="dashboard-today-reminder-loading"
                aria-label={lang === 'bn' ? 'আজকের রিমাইন্ডার লোড হচ্ছে' : 'Loading today’s reminders'}
              >
                <BellRing size={20} aria-hidden="true" />
              </div>
            }
          >
            <LazyDashboardReminderCard
              lang={lang}
              theme={theme}
              onNavigate={onNavigate}
              dailyStudy={dailyStudy}
              onStartStudy={startToday}
            />
          </React.Suspense>
        </div>
      </div>

      <div className="dashboard-today-meta">
        <div className="dashboard-today-tracks">
          <span>{lang === 'bn' ? 'ভর্তি প্রস্তুতি:' : 'Admission prep:'}</span>
          {admissionTracks.map((track) => (
            <span key={track.track.key}>
              <strong>
                {lang !== 'bn' && track.track.key === routine.primaryTrack ? '★ ' : ''}
                {lang === 'bn' ? track.track.nameBn : track.track.nameEn}
              </strong>{' '}
              <em
                className={
                  track.percent >= 65
                    ? 'is-good'
                    : track.percent >= 35
                      ? 'is-mid'
                      : 'is-low'
                }
              >
                {formatNum(track.percent, lang)}%
              </em>
            </span>
          ))}
          <button type="button" onClick={() => onNavigate('routine')}>
            {lang === 'bn' ? 'ট্র্যাক দেখুন' : 'View tracks'}
          </button>
        </div>

        {nextMock && (
          <div className="dashboard-today-mock">
            <CalendarClock size={14} aria-hidden="true" />
            <span>
              {lang === 'bn'
                ? nextMock.daysAway === 0
                  ? `আজ মক টেস্ট: ${nextMock.track.nameBn}`
                  : `পরের মক: ${nextMock.track.nameBn} · ${formatNum(nextMock.daysAway, lang)} দিন পরে`
                : nextMock.daysAway === 0
                  ? `Mock today: ${nextMock.track.nameEn}`
                  : `Next mock: ${nextMock.track.nameEn} · in ${nextMock.daysAway} d`}
            </span>
            <small>
              {lang === 'bn'
                ? `${formatNum(nextMock.track.minutes, lang)} মি · ${formatNum(nextMock.track.marks, lang)} নম্বর`
                : `${nextMock.track.minutes} min · ${nextMock.track.marks} marks`}
            </small>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardTodayFocus;
