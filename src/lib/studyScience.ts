/**
 * Study-science layer for the routine.
 *
 * Everything here is a rule that has real evidence behind it, and each rule
 * carries the claim + source + how sure we are, so the UI can show *why* the
 * timetable looks the way it does instead of asserting it.
 *
 * 1. Spaced retrieval — reviewing on day 1, 3, 7 and 21 after learning beats
 *    one long session (Ebbinghaus; Cepeda et al. 2006 meta-analysis).
 * 2. Interleaving — mixing problem types beats blocking them, measured on
 *    delayed tests in maths (Rohrer & Taylor 2007/2010; Brunmair & Richter
 *    2019 found a smaller average effect, so we treat it as "useful, not magic").
 * 3. Breaks — short breaks protect attention during long tasks (Ariga &
 *    Lleras 2011); the exact 90-minute cycle is a heuristic, not a law.
 * 4. Sleep — adolescents do better on 8–10 h, and around 8 h looks best for
 *    maths and science (AASM consensus; Shanghai study of 54,102 students).
 */

export const SPACED_INTERVALS = [1, 3, 7, 21] as const;

export type Chronotype = 'morning' | 'neutral' | 'evening';

export interface EvidenceNote {
  id: string;
  claimBn: string;
  claimEn: string;
  sourceBn: string;
  sourceEn: string;
  strength: 'strong' | 'moderate' | 'heuristic';
}

export const EVIDENCE: EvidenceNote[] = [
  {
    id: 'spacing',
    claimBn: 'একবার লম্বা পড়ার বদলে ১, ৩, ৭ ও ২১ দিন পরে ছোট ছোট রিভিশন অনেক বেশি মনে থাকে।',
    claimEn: 'Reviewing after 1, 3, 7 and 21 days beats one long session for the same hours.',
    sourceBn: 'স্পেসিং ইফেক্ট — Cepeda et al. (2006) মেটা-অ্যানালাইসিস, Ebbinghaus থেকে শুরু',
    sourceEn: 'Spacing effect — Cepeda et al. (2006) meta-analysis, back to Ebbinghaus',
    strength: 'strong',
  },
  {
    id: 'interleaving',
    claimBn: 'একই ধরনের প্রশ্ন পরপর না করে মিশিয়ে সলভ করলে এক সপ্তাহ পরে পরীক্ষায় ফল ভালো হয় — যদিও তখন কঠিন লাগে।',
    claimEn: 'Mixing problem types beats blocking them on delayed tests, even though it feels harder while practising.',
    sourceBn: 'Rohrer & Taylor (2007, 2010); Brunmair & Richter (2019): গণিতে গড় প্রভাব মাঝারি',
    sourceEn: 'Rohrer & Taylor (2007, 2010); Brunmair & Richter (2019): moderate average effect in maths',
    strength: 'moderate',
  },
  {
    id: 'breaks',
    claimBn: '৪৫–৫০ মিনিট একটানা পড়ে ১০ মিনিট বিরতি নিলে খেয়াল ধরে রাখা সহজ হয়; স্ক্রিন নয়, একটু হাঁটা ভালো।',
    claimEn: 'A 10-minute break after 45–50 minutes protects attention; movement beats screens.',
    sourceBn: 'Ariga & Lleras (2011); Albulescu et al. (2022) মাইক্রো-ব্রেক মেটা-অ্যানালাইসিস',
    sourceEn: 'Ariga & Lleras (2011); Albulescu et al. (2022) micro-break meta-analysis',
    strength: 'moderate',
  },
  {
    id: 'sleep',
    claimBn: 'কিশোরদের জন্য ৮–১০ ঘণ্টা ঘুম; প্রায় ৮ ঘণ্টা গণিত ও বিজ্ঞানে সবচেয়ে ভালো, আর ঘুমের আগের ১ ঘণ্টায় নতুন কিছু না পড়াই ভালো।',
    claimEn: 'Adolescents need 8–10 h; around 8 h looks best for maths and science, and the last hour before bed is for rest, not new material.',
    sourceBn: 'AASM কনসেনসাস (Paruthi et al. 2016); সাংহাই ৫৪,১০২ শিক্ষার্থীর গবেষণা (2025)',
    sourceEn: 'AASM consensus (Paruthi et al. 2016); Shanghai study of 54,102 students (2025)',
    strength: 'strong',
  },
  {
    id: 'ultradian',
    claimBn: '৯০ মিনিটের ফোকাস-চক্র একটা কাজের হিউরিস্টিক — বিরতিটাই আসল লাভ, তাই ব্লক বড় না করে ভাগ করা হয়েছে।',
    claimEn: 'The 90-minute focus cycle is a useful heuristic; the break is the part with evidence.',
    sourceBn: 'Kleitman-এর BRAC ধারণা; আধুনিক রিভিউতে সময়কাল ব্যক্তি-ভেদে ভিন্ন',
    sourceEn: 'Kleitman’s BRAC idea; modern reviews find the period varies between people',
    strength: 'heuristic',
  },
];

export const SLEEP_MIN_HOURS = 8;
export const SLEEP_MAX_HOURS = 10;

export interface SleepFeedback {
  hours: number;
  verdict: 'short' | 'good' | 'long' | 'unknown';
  messageBn: string;
  messageEn: string;
}

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function sleepFeedback(settings: { wake: string; sleep: string }): SleepFeedback {
  const raw = minutesOf(settings.sleep) - minutesOf(settings.wake);
  const minutes = raw > 0 ? raw : raw + 1440;
  if (!minutes) {
    return {
      hours: 0,
      verdict: 'unknown',
      messageBn: 'ঘুমানোর ও ওঠার সময় দাও, তারপর হিসাব দেখাবে।',
      messageEn: 'Set your wake and sleep times to see the sleep check.',
    };
  }
  const hours = Math.round((minutes / 60) * 10) / 10;
  if (hours < SLEEP_MIN_HOURS) {
    return {
      hours,
      verdict: 'short',
      messageBn: `${hours} ঘণ্টা ঘুম কম — ৮ ঘণ্টার নিচে নামলে গণিত ও বিজ্ঞানে ফল পড়ে। রাত জেগে পড়ার চেয়ে ঘুমটাই বেশি লাভ দেয়।`,
      messageEn: `${hours} h is short — below 8 h, maths and science scores suffer. Protecting sleep beats a late-night session.`,
    };
  }
  if (hours <= SLEEP_MAX_HOURS) {
    return {
      hours,
      verdict: 'good',
      messageBn: `${hours} ঘণ্টা — ঠিক আছে। ঘুমের আগের ১ ঘণ্টা নতুন কিছু না পড়ে শুধু হালকা রিভিশনে রাখো।`,
      messageEn: `${hours} h — good. Keep the last hour before bed for light review, not new material.`,
    };
  }
  return {
    hours,
    verdict: 'long',
    messageBn: `${hours} ঘণ্টা ঘুম বেশ বেশি — ১০ ঘণ্টার বেশি ঘুমালে ফলাফলে লাভ কমে যায়।`,
    messageEn: `${hours} h is above the recommended range; gains flatten past 10 h.`,
  };
}

// ── Spaced revision queue ────────────────────────────────────────────────

export interface LearnedItem {
  /** Date the chapter was first studied (YYYY-MM-DD). */
  learnedOn: string;
  chapterId: string;
  /** Lets the main track's papers jump the revision queue. */
  subjectKey?: string;
  chapterBn: string;
  chapterEn: string;
  subjectBn: string;
  subjectEn: string;
}

export interface RevisionDue {
  key: string;
  interval: number;
  daysOverdue: number;
  chapterId: string;
  subjectKey?: string;
  chapterBn: string;
  chapterEn: string;
  subjectBn: string;
  subjectEn: string;
}

function dayDiff(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/**
 * Reviews due today (or overdue) for every chapter already studied.
 *
 * A chapter learned on day D comes back on D+1, D+3, D+7 and D+21. Anything
 * missed keeps showing up until it is ticked, because a skipped review is
 * exactly the forgetting the schedule exists to prevent.
 */
export function revisionQueue(
  items: LearnedItem[],
  todayKey: string,
  doneKeys: Record<string, boolean> = {},
  prioritySubjectKeys: string[] = []
): RevisionDue[] {
  const due: RevisionDue[] = [];
  items.forEach((item) => {
    SPACED_INTERVALS.forEach((interval) => {
      const gap = dayDiff(item.learnedOn, todayKey);
      if (gap < interval) return;
      const key = `${todayKey}|due|${item.chapterId}|${interval}`;
      if (doneKeys[key]) return;
      // An overdue review stays on the list, but only for one extra cycle.
      if (gap > interval * 2) return;
      due.push({
        key,
        interval,
        daysOverdue: gap - interval,
        chapterId: item.chapterId,
        subjectKey: item.subjectKey,
        chapterBn: item.chapterBn,
        chapterEn: item.chapterEn,
        subjectBn: item.subjectBn,
        subjectEn: item.subjectEn,
      });
    });
  });
  // The main track's papers come first, then whatever is most overdue.
  const priority = new Set(prioritySubjectKeys);
  return due.sort((a, b) => {
    const aPriority = a.subjectKey ? priority.has(a.subjectKey) : false;
    const bPriority = b.subjectKey ? priority.has(b.subjectKey) : false;
    if (aPriority !== bPriority) return aPriority ? -1 : 1;
    return b.daysOverdue - a.daysOverdue;
  });
}

// ── The day itself ───────────────────────────────────────────────────────

export type StudyBlockKind =
  | 'class'
  | 'practice'
  | 'revision'
  | 'break'
  | 'life'
  | 'institute'
  | 'winddown'
  | 'focus';

export interface StudyBlock {
  id: string;
  titleBn: string;
  titleEn: string;
  start: string;
  minutes: number;
  kind: StudyBlockKind;
  whyBn?: string;
  whyEn?: string;
}

/**
 * One daily block reserved for the student's main track (Medical by default).
 * It is a real, named block so the timetable shows the priority instead of
 * leaving it as advice.
 */
export interface StudyFocus {
  titleBn: string;
  titleEn: string;
  minutes: number;
  whyBn?: string;
  whyEn?: string;
}

export interface StudySettings {
  wake: string;
  sleep: string;
  instituteHours: number;
  commuteHours: number;
  lifeHours: number;
}

function clockText(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(2, '0')}`;
}

/** Wind-down is never study: the hour before bed is for rest. */
export const WIND_DOWN_MINUTES = 40;
const BREAK_MINUTES = 10;
const LONG_BREAK_MINUTES = 20;
const MIN_BLOCK = 20;

interface Activity {
  kind: 'class' | 'practice' | 'revision';
  weight: number;
  titleBn: string;
  titleEn: string;
  whyBn: string;
  whyEn: string;
}

function activitiesFor(chronotype: Chronotype): Activity[] {
  const twoClasses: Activity[] = [
    {
      kind: 'class',
      weight: 1,
      titleBn: 'ক্লাস ১ — নতুন অধ্যায় (সবচেয়ে কঠিনটা আগে)',
      titleEn: 'Class 1 — new chapter (hardest first)',
      whyBn: 'নতুন শেখা সবচেয়ে বেশি মনোযোগ চায়, তাই দিনের সবচেয়ে তাজা সময়ে রাখা হয়েছে।',
      whyEn: 'New learning needs the freshest attention, so it goes into the sharpest slot.',
    },
    {
      kind: 'class',
      weight: 1,
      titleBn: 'ক্লাস ২ — নতুন অধ্যায়',
      titleEn: 'Class 2 — new chapter',
      whyBn: 'দুই ক্লাসের মাঝে ১০ মিনিট বিরতি — একটানা পড়ার চেয়ে খেয়াল বেশি ধরে।',
      whyEn: 'A 10-minute break sits between the two classes to protect attention.',
    },
  ];
  const practice: Activity = {
    kind: 'practice',
    weight: 0.9,
    titleBn: 'মিশ্র সলভিং — আগের অধ্যায়ের প্রশ্ন মিলিয়ে',
    titleEn: 'Mixed solving — interleave earlier chapters',
    whyBn: 'একই ধরনের প্রশ্ন পরপর না করে মিশিয়ে সলভ করলে পরে পরীক্ষায় ফল ভালো হয় (interleaving)।',
    whyEn: 'Interleaving problem types beats blocking them on delayed tests.',
  };
  const retrieval: Activity = {
    kind: 'revision',
    weight: 0.6,
    titleBn: 'স্পেসড রিভিউ — আজ যেগুলোর দিন',
    titleEn: 'Spaced review — whatever fell due today',
    whyBn: '১/৩/৭/২১ দিনের রিভিউ মিস করলে ভুলে যাওয়াটাই স্বাভাবিক — এটাই প্ল্যানের মূল অংশ।',
    whyEn: 'The 1/3/7/21-day reviews are the core of the plan; skipping them is where forgetting starts.',
  };

  if (chronotype === 'morning') return [twoClasses[0], twoClasses[1], practice, retrieval];
  if (chronotype === 'evening') return [retrieval, twoClasses[0], twoClasses[1], practice];
  return [twoClasses[0], practice, twoClasses[1], retrieval];
}

export interface StudyDay {
  blocks: StudyBlock[];
  studyMinutes: number;
  sleepCheck: SleepCallbackShape;
}

type SleepCallbackShape = ReturnType<typeof sleepFeedback>;

/**
 * Builds a day that fits the hours the student actually has.
 *
 * Rules encoded: hard material first (or last for evening types), a 10-minute
 * break between blocks, a longer movement break after two blocks, a 40-minute
 * wind-down before bed, and never more study time than the awake window minus
 * commitments allows.
 */
export function buildStudyDay(
  settings: StudySettings,
  chronotype: Chronotype = 'neutral',
  focus?: StudyFocus
): StudyDay {
  const awakeRaw = minutesOf(settings.sleep) - minutesOf(settings.wake);
  const awake = awakeRaw > 0 ? awakeRaw : awakeRaw + 1440;
  const blocked = (settings.instituteHours + settings.commuteHours + settings.lifeHours) * 60;

  const WAKE_MINUTES = 30;
  const activityCount = activitiesFor(chronotype).length + (focus ? 1 : 0);
  const BREAK_BUDGET = Math.max(0, activityCount - 1) * BREAK_MINUTES + LONG_BREAK_MINUTES;
  const usable = Math.max(0, awake - blocked - WIND_DOWN_MINUTES - WAKE_MINUTES - BREAK_BUDGET);

  const sleepCheck = sleepFeedback(settings);
  if (usable < MIN_BLOCK) {
    return { blocks: [], studyMinutes: 0, sleepCheck };
  }

  // Drop the lowest-priority activity until the remaining ones fit.
  const activities = activitiesFor(chronotype);
  while (activities.length > 1 && usable < activities.length * MIN_BLOCK) {
    activities.pop();
  }

  // The main-track block comes out of the same budget, before the rest is split.
  const normalBlocks = activities.length;
  const focusMinutes =
    focus && usable >= (normalBlocks + 1) * MIN_BLOCK
      ? Math.min(focus.minutes, usable - normalBlocks * MIN_BLOCK)
      : 0;
  const studyBudget = usable - focusMinutes;

  const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0) || 1;
  const sizes = activities.map((activity) =>
    Math.max(MIN_BLOCK, Math.round((studyBudget * activity.weight) / totalWeight))
  );
  let overflow = sizes.reduce((a, b) => a + b, 0) - studyBudget;
  while (overflow > 0) {
    const longest = sizes.indexOf(Math.max(...sizes));
    const cut = Math.min(overflow, sizes[longest] - MIN_BLOCK);
    if (cut <= 0) break;
    sizes[longest] -= cut;
    overflow -= cut;
  }

  const blocks: StudyBlock[] = [];
  let cursor = minutesOf(settings.wake);
  const push = (block: Omit<StudyBlock, 'start'>) => {
    blocks.push({ ...block, start: clockText(cursor) });
    cursor += block.minutes;
  };

  push({
    id: 'wake',
    titleBn: 'ঘুম থেকে উঠে প্রস্তুতি ও হালকা নাশতা',
    titleEn: 'Wake up, get ready, light breakfast',
    minutes: WAKE_MINUTES,
    kind: 'life',
  });

  let studyMinutes = 0;
  let blockCount = 0;

  // Main-track block first: the freshest slot, and the one the student asked
  // to prioritise.
  if (focus && focusMinutes > 0) {
    push({
      id: 'focus',
      titleBn: focus.titleBn,
      titleEn: focus.titleEn,
      minutes: focusMinutes,
      kind: 'focus',
      whyBn: focus.whyBn,
      whyEn: focus.whyEn,
    });
    studyMinutes += focusMinutes;
    blockCount += 1;
    push({
      id: 'break-focus',
      titleBn: 'ছোট বিরতি — উঠে একটু নড়াচড়া',
      titleEn: 'Short break — stand and move',
      minutes: BREAK_MINUTES,
      kind: 'break',
      whyBn: 'বিরতিতে স্ক্রিন নয় — নড়াচড়া করলে মনোযোগ ফিরতে সময় কম লাগে।',
      whyEn: 'Keep breaks screen-free; movement restores attention faster.',
    });
  }

  activities.forEach((activity, index) => {
    const minutes = sizes[index];
    push({
      id: `study-${index}`,
      titleBn: activity.titleBn,
      titleEn: activity.titleEn,
      minutes,
      kind: activity.kind,
      whyBn: activity.whyBn,
      whyEn: activity.whyEn,
    });
    studyMinutes += minutes;
    blockCount += 1;

    const isLast = index === activities.length - 1;
    if (!isLast) {
      const longBreak = blockCount === 2;
      push({
        id: `break-${index}`,
        titleBn: longBreak ? 'বড় বিরতি — একটু হাঁটা' : 'ছোট বিরতি — উঠে একটু নড়াচড়া',
        titleEn: longBreak ? 'Long break — take a short walk' : 'Short break — stand and move',
        minutes: longBreak ? LONG_BREAK_MINUTES : BREAK_MINUTES,
        kind: 'break',
        whyBn: 'বিরতিতে স্ক্রিন নয় — নড়াচড়া করলে মনোযোগ ফিরতে সময় কম লাগে।',
        whyEn: 'Keep breaks screen-free; movement restores attention faster.',
      });
    }

    // School / college sits after the second study block.
    if (blockCount === 2 && !isLast) {
      if (settings.instituteHours > 0) {
        push({
          id: 'institute',
          titleBn: 'স্কুল / কলেজ / কোচিং',
          titleEn: 'School, college or coaching',
          minutes: Math.round(settings.instituteHours * 60),
          kind: 'institute',
        });
      }
      if (settings.commuteHours > 0) {
        push({
          id: 'commute',
          titleBn: 'যাতায়াত',
          titleEn: 'Commute',
          minutes: Math.round(settings.commuteHours * 60),
          kind: 'life',
        });
      }
      push({
        id: 'life',
        titleBn: 'খাওয়া, নামাজ ও বিশ্রাম',
        titleEn: 'Meals, prayer and rest',
        minutes: Math.round(settings.lifeHours * 60),
        kind: 'life',
      });
    }
  });

  push({
    id: 'winddown',
    titleBn: 'ঘুমের প্রস্তুতি — শুধু হালকা রিভিশন, নতুন কিছু নয়',
    titleEn: 'Wind-down — light review only, no new material',
    minutes: WIND_DOWN_MINUTES,
    kind: 'winddown',
    whyBn: 'ঘুমই নতুন শেখা মজবুত করে; শেষ মুহূর্তে নতুন অধ্যায় শুরু করলে সেটা নষ্ট হয়।',
    whyEn: 'Sleep does the consolidation; starting new material this late undercuts it.',
  });

  return { blocks, studyMinutes, sleepCheck };
}

export function plannedStudyMinutesOf(blocks: StudyBlock[]): number {
  return blocks
    .filter((block) => block.kind === 'class' || block.kind === 'practice' || block.kind === 'revision')
    .reduce((sum, block) => sum + block.minutes, 0);
}

export function availableStudyMinutesOf(settings: StudySettings): number {
  const awakeRaw = minutesOf(settings.sleep) - minutesOf(settings.wake);
  const awake = awakeRaw > 0 ? awakeRaw : awakeRaw + 1440;
  const blocked = (settings.instituteHours + settings.commuteHours + settings.lifeHours) * 60;
  return Math.max(0, awake - blocked - WIND_DOWN_MINUTES);
}
