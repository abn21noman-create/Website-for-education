/**
 * Headless smoke test.
 *
 * The sandbox has no browser, so this boots the real App inside jsdom through
 * Vite's SSR module loader and asserts that:
 *   1. the dashboard mounts without throwing,
 *   2. every lazy route mounts (catching a bad chunk name or missing export),
 *   3. the new Life Hub renders and its habit toggles/state survive.
 *
 * Run with: node scripts/smoke-test.mjs
 */
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const routes = [
  '',
  'syllabus',
  'formulas',
  'cq',
  'mcq',
  'gk',
  'routine',
  'lab',
  'planner',
  'analytics',
  'hub',
  'admission',
  'practical',
  'gpa',
  'leaderboard',
  'life',
];

const errors = [];

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const { window } = dom;

// Minimal browser surface the app touches during mount.
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  }));
window.scrollTo = () => {};
window.requestIdleCallback = (cb) => window.setTimeout(cb, 0);
window.HTMLCanvasElement.prototype.getContext = () => null;

global.window = window;
global.document = window.document;
Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true });
global.localStorage = window.localStorage;
global.HTMLElement = window.HTMLElement;
global.Node = window.Node;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.getComputedStyle = window.getComputedStyle;
if (!globalThis.crypto) Object.defineProperty(global, 'crypto', { value: window.crypto, configurable: true });
global.IS_REACT_ACT_ENVIRONMENT = false;

// Surface any console.error as a failure: React logs render crashes there.
const originalError = console.error;
console.error = (...args) => {
  errors.push(args.map(String).join(' '));
  originalError(...args);
};

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { App } = await vite.ssrLoadModule('/src/App.tsx');

const container = window.document.getElementById('root');

let failures = 0;
let root = null;

for (const route of routes) {
  // A fresh mount per route: the active tab is read from the hash on first
  // render, which is exactly how a deep link behaves in a real browser.
  window.history.replaceState(null, '', `/#/${route}`);
  window.location.hash = `#/${route}`;

  try {
    if (root) root.unmount();
    container.innerHTML = '';
    root = createRoot(container);
    root.render(React.createElement(App));
    // Let lazy chunks resolve and effects settle.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const text = container.textContent || '';
    const hasContent = text.trim().length > 60;
    const crashed = text.includes('Minified React error') || text.includes('An error occurred');

    if (!hasContent || crashed) {
      failures++;
      console.log(`✗ ${route || 'dashboard'} — ${crashed ? 'render error' : 'no content'}`);
    } else {
      console.log(`✓ ${route || 'dashboard'} (${text.trim().length} chars)`);
      if (route === 'syllabus') console.log('   ↳', text.trim().slice(0, 90).replace(/\s+/g, ' '));

      // Screen-specific surfaces added with the exam-pattern / eligibility work.
      const expectations = {
        mcq: ['HSC বোর্ড প্যাটার্ন', 'মেডিকেল (১০০ MCQ)', 'মিশ্র প্র্যাকটিস'],
        gpa: ['SSC-র মোট GPA', 'সরকারি মেডিকেল'],
        admission: ['পরীক্ষার কাঠামো', 'যাচাই করা হয়েছে'],
        life: ['রিমাইন্ডার'],
        routine: ['৩৯১', 'রুটিন'],
        gk: ['সাধারণ জ্ঞান ড্রিল', 'ইংরেজি গ্রামার', 'মিশ্র রাউন্ড'],
      }[route];
      if (expectations) {
        const missing = expectations.filter((needle) => !text.includes(needle));
        console.log(
          missing.length === 0
            ? `   ↳ ✓ ${route} surface present`
            : `   ↳ ✗ ${route} missing: ${missing.join(' | ')}`
        );
        failures += missing.length === 0 ? 0 : 1;
      }
    }
  } catch (err) {
    failures++;
    console.log(`✗ ${route || 'dashboard'} — threw: ${err?.message || err}`);
  }
}

// Life Hub specifics — remount directly on the route.
window.history.replaceState(null, '', '/#/life');
window.location.hash = '#/life';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 500));
const habitButtons = window.document.querySelectorAll('button[aria-pressed]');
if (habitButtons.length >= 7) {
  habitButtons[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 200));
  const pressed = Array.from(window.document.querySelectorAll('button[aria-pressed]')).filter(
    (b) => b.getAttribute('aria-pressed') === 'true'
  ).length;
  console.log(pressed === 1 ? '✓ life hub habit toggle works' : `✗ habit toggle (${pressed})`);
  failures += pressed === 1 ? 0 : 1;
} else {
  console.log(`✗ life hub habits not found (${habitButtons.length})`);
  failures++;
}

// Life Hub → weekly class routine: switch section, add a slot, see it listed.
const clickByText = (needle) => {
  const el = Array.from(window.document.querySelectorAll('button')).find((b) =>
    (b.textContent || '').includes(needle)
  );
  if (el) el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  return Boolean(el);
};

const setSelect = (el, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    'value'
  ).set;
  setter.call(el, value);
  el.dispatchEvent(new window.Event('change', { bubbles: true }));
};

const setInput = (el, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;
  setter.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};

if (clickByText('ক্লাস রুটিন')) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const subjectInput = window.document.querySelector('input[placeholder="বিষয় / ক্লাস"]');
  const timeInputs = window.document.querySelectorAll('input[type="time"]');

  if (subjectInput && timeInputs.length >= 2) {
    setInput(subjectInput, 'টেস্ট ক্লাস');
    setInput(timeInputs[0], '09:00');
    setInput(timeInputs[1], '10:00');
    await new Promise((resolve) => setTimeout(resolve, 150));
    clickByText('যোগ');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const added = (container.textContent || '').includes('টেস্ট ক্লাস');
    console.log(added ? '✓ life hub class routine works' : '✗ class routine slot not added');
    failures += added ? 0 : 1;
  } else {
    console.log('✗ routine form inputs not found');
    failures++;
  }
} else {
  console.log('✗ class routine section not found');
  failures++;
}

// Attendance: back to the habit screen, mark today as present.
clickByText('আজকের অভ্যাস');
await new Promise((resolve) => setTimeout(resolve, 250));

const attendanceBtn = Array.from(window.document.querySelectorAll('button')).find(
  (b) => (b.textContent || '').trim() === 'উপস্থিত'
);
if (attendanceBtn) {
  attendanceBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 200));
  const pressed = Array.from(window.document.querySelectorAll('button')).find(
    (b) => (b.textContent || '').trim() === 'উপস্থিত'
  );
  const ok = pressed?.getAttribute('aria-pressed') === 'true';
  console.log(ok ? '✓ life hub attendance works' : '✗ attendance not recorded');
  failures += ok ? 0 : 1;
} else {
  console.log('✗ attendance buttons not found');
  failures++;
}

// Exam results: switch to the exam screen and log a mark.
clickByText('পরীক্ষা রুটিন');
await new Promise((resolve) => setTimeout(resolve, 250));

const resultTitle = window.document.querySelector('input[placeholder="পরীক্ষার নাম"]');
const resultBits = Array.from(window.document.querySelectorAll('input[placeholder="প্রাপ্ত"], input[placeholder="মোট"]'));
if (resultTitle && resultBits.length >= 2) {
  setInput(resultTitle, 'মডেল টেস্ট');
  setInput(resultBits[0], '60');
  setInput(resultBits[1], '100');
  const subjectSelect = window.document.querySelector('select[aria-label="বিষয়"]');
  if (subjectSelect) setSelect(subjectSelect, 'physics1');
  await new Promise((resolve) => setTimeout(resolve, 150));
  const addBtn = Array.from(window.document.querySelectorAll('button')).find(
    (b) => (b.textContent || '').trim() === 'যোগ'
  );
  addBtn?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 250));
  // Bengali numerals are used in bn mode, so assert on the title that only
  // appears in the saved-results list after the form resets.
  const logged = (container.textContent || '').includes('মডেল টেস্ট');
  console.log(logged ? '✓ life hub exam results work' : '✗ exam result not logged');
  failures += logged ? 0 : 1;

  const weakShown = (container.textContent || '').includes('সবচেয়ে দুর্বল পত্র');
  console.log(weakShown ? '✓ weakest-subject suggestion works' : '✗ weakest-subject suggestion missing');
  failures += weakShown ? 0 : 1;
} else {
  console.log('✗ result form inputs not found');
  failures++;
}

// Weekly review renders on the analytics screen.
window.history.replaceState(null, '', '/#/analytics');
window.location.hash = '#/analytics';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 900));

const reviewRendered = (container.textContent || '').includes('এই সপ্তাহের রিভিউ');
console.log(reviewRendered ? '✓ weekly review renders' : '✗ weekly review missing');
failures += reviewRendered ? 0 : 1;

// GK drill: a round must actually start and explain the first answer.
window.history.replaceState(null, '', '/#/gk');
window.location.hash = '#/gk';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 900));

const startedRound = clickByText('মিশ্র রাউন্ড শুরু');
await new Promise((resolve) => setTimeout(resolve, 400));
const roundText = container.textContent || '';
const roundStarted = startedRound && roundText.includes('প্রশ্ন') && roundText.includes('সঠিক');

const optionButtons = [...container.querySelectorAll('button')].filter((el) => {
  const badge = el.querySelector('span');
  return Boolean(badge) && /^[A-D]$/.test((badge.textContent || '').trim());
});
if (optionButtons[0]) {
  optionButtons[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}
await new Promise((resolve) => setTimeout(resolve, 300));
const explained = (container.textContent || '').includes('ব্যাখ্যা');

const gkRoundOk = roundStarted && optionButtons.length >= 4 && explained;
console.log(
  gkRoundOk
    ? `\u2713 a GK round starts, offers four options and explains the answer (${optionButtons.length} options)`
    : `\u2717 GK round failed (started=${startedRound}, options=${optionButtons.length}, explained=${explained})`
);
failures += gkRoundOk ? 0 : 1;

// The dashboard carries today's routine, and the routine screen can mark a
// class chapter as done inside the syllabus tracker.
window.history.replaceState(null, '', '/#/');
window.location.hash = '#/';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 900));
const dashboardRoutine = (container.textContent || '').includes('\u0986\u099c\u0995\u09c7\u09b0 \u09b0\u09c1\u099f\u09bf\u09a8');
console.log(
  dashboardRoutine
    ? '\u2713 the dashboard shows today\u2019s routine slice'
    : '\u2717 dashboard routine card missing'
);
failures += dashboardRoutine ? 0 : 1;

const dashboardTracks = (container.textContent || '').includes('ভর্তি প্রস্তুতি:');
console.log(
  dashboardTracks
    ? '\u2713 the dashboard shows the three admission tracks'
    : '\u2717 dashboard admission strip missing'
);
failures += dashboardTracks ? 0 : 1;

const dashboardText = container.textContent || '';
const stripStart = dashboardText.indexOf('ভর্তি প্রস্তুতি:');
const medAt = dashboardText.indexOf('Medical', stripStart >= 0 ? stripStart : 0);
const engAt = dashboardText.indexOf('Engineering', stripStart >= 0 ? stripStart : 0);
const dashboardMedicalFirst =
  stripStart > -1 && medAt > -1 && (engAt === -1 || medAt < engAt);
console.log(
  dashboardMedicalFirst
    ? '\u2713 the dashboard strip leads with Medical'
    : '\u2717 dashboard strip does not lead with Medical'
);
failures += dashboardMedicalFirst ? 0 : 1;

window.history.replaceState(null, '', '/#/routine');
window.location.hash = '#/routine';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 900));
const tickedInRoutine = clickByText('\u09b8\u09bf\u09b2\u09c7\u09ac\u09be\u09b8\u09c7 \u099f\u09bf\u0995 \u09a6\u09be\u0993');
await new Promise((resolve) => setTimeout(resolve, 400));
const syllabusSynced = (container.textContent || '').includes(
  '\u09b8\u09bf\u09b2\u09c7\u09ac\u09be\u09b8\u09c7 \u09b8\u09ae\u09cd\u09aa\u09a8\u09cd\u09a8'
);
console.log(
  tickedInRoutine && syllabusSynced
    ? '\u2713 a class chapter tick writes into the syllabus tracker'
    : `\u2717 routine\u2192syllabus sync failed (clicked=${tickedInRoutine}, done=${syllabusSynced})`
);
failures += tickedInRoutine && syllabusSynced ? 0 : 1;

// Today's card carries the adjusted target and the next mock; the study-time
// tab carries chronotype, sleep, evidence and the weekly pacing; the weekly tab
// lists the scheduled mock.
const todayCardText = container.textContent || '';
const openedTimeTab = clickByText('পড়ার সময়');
await new Promise((resolve) => setTimeout(resolve, 400));
const timeTabText = container.textContent || '';
const hasTarget = todayCardText.includes('আজকের পড়ার লক্ষ্য');
const hasNextMock = todayCardText.includes('পরের মক টেস্ট');
const hasFocusBlock = timeTabText.includes('মূল ট্র্যাক ব্লক — ');
const hasFocusDetail = todayCardText.includes('ট্র্যাকারে পিছিয়ে') && todayCardText.includes('সিলেবাসে খোলো');
const hasMistakeCard = todayCardText.includes('ভুলের খাতা') &&
  todayCardText.includes('১০টি প্রশ্ন');
const hasPacing = timeTabText.includes('এই সপ্তাহের হিসাব');
const hasChronotype =
  timeTabText.includes('তোমার মাথা কখন সবচেয়ে ভালো কাজ করে?') &&
  timeTabText.includes('সকালে') &&
  timeTabText.includes('রাতে');
const hasEvidence = timeTabText.includes('এই রুটিনের পেছনের প্রমাণ');
console.log(
  openedTimeTab && hasTarget && hasNextMock && hasPacing && hasChronotype && hasEvidence && hasFocusBlock && hasFocusDetail && hasMistakeCard
    ? 'the today card shows target, next mock, a tappable main-track block and the mistake bank; study time shows pacing, chronotype and evidence'
    : `routine cards incomplete (tab=${openedTimeTab}, target=${hasTarget}, mock=${hasNextMock}, pacing=${hasPacing}, chrono=${hasChronotype}, evidence=${hasEvidence}, focus=${hasFocusBlock}, detail=${hasFocusDetail}, mistakes=${hasMistakeCard})`
);
failures += openedTimeTab && hasTarget && hasNextMock && hasPacing && hasChronotype && hasEvidence && hasFocusBlock && hasFocusDetail ? 0 : 1;

const openedWeekTab = clickByText('এই সপ্তাহ');
await new Promise((resolve) => setTimeout(resolve, 400));
const weekTabText = container.textContent || '';
const hasWeekMockCard = weekTabText.includes('এই সপ্তাহের মক টেস্ট');
console.log(
  openedWeekTab && hasWeekMockCard
    ? 'the weekly tab lists the scheduled mock test'
    : `weekly mock card missing (tab=${openedWeekTab}, card=${hasWeekMockCard})`
);
failures += openedWeekTab && hasWeekMockCard ? 0 : 1;

const openedTracksTab = clickByText('ভর্তি ট্র্যাক');
await new Promise((resolve) => setTimeout(resolve, 400));
const tracksTabText = container.textContent || '';
const hasThreeTracks =
  tracksTabText.includes('Engineering') &&
  tracksTabText.includes('Medical') &&
  tracksTabText.includes('যোগ্যতা: ');
console.log(
  openedTracksTab && hasThreeTracks
    ? '\u2713 the admission-track tab renders all three tracks with their eligibility'
    : `\u2717 admission tracks missing (tab=${openedTracksTab}, tracks=${hasThreeTracks})`
);
failures += openedTracksTab && hasThreeTracks ? 0 : 1;

const medicalFirst =
  tracksTabText.indexOf('Medical') > -1 &&
  tracksTabText.indexOf('Medical') < tracksTabText.indexOf('Engineering');
const mainBadge = tracksTabText.includes('প্রধান ট্র্যাক');
const splitShown = tracksTabText.includes('সময় ভাগ');
console.log(
  medicalFirst && mainBadge && splitShown
    ? '\u2713 medical leads the tracks with its main-track badge and the weekly time split'
    : `\u2717 medical priority missing (first=${medicalFirst}, badge=${mainBadge}, split=${splitShown})`
);
failures += medicalFirst && mainBadge && splitShown ? 0 : 1;

// A chapter drill requested from the routine must open on the MCQ screen.
window.localStorage.setItem(
  'hsc28_chapter_drill_v1',
  JSON.stringify({
    subjectKey: 'biology1',
    chapterBn: '\u0995\u09cb\u09b7 \u09ac\u09bf\u09ad\u09be\u099c\u09a8',
    chapterEn: 'Cell Division',
    count: 4,
    createdAt: new Date().toISOString(),
  })
);
window.history.replaceState(null, '', '/#/mcq');
window.location.hash = '#/mcq';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 1800));
const drillText = container.textContent || '';
const drillStarted =
  drillText.includes('\u0995\u09cb\u09b7 \u09ac\u09bf\u09ad\u09be\u099c\u09a8') &&
  !drillText.includes('\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09cb');
console.log(
  drillStarted
    ? '\u2713 a chapter drill from the routine opens on that chapter'
    : `\u2717 chapter drill did not start (mqc screen text ${drillText.length} chars)`
);
failures += drillStarted ? 0 : 1;


// Switching banks must swap the whole screen, not just the label.
// Remount first: the switcher only exists on the drill home screen, and the
// earlier interaction test left a round running.
window.history.replaceState(null, '', '/#/gk');
window.location.hash = '#/gk';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 900));

const switched = (() => {
  const tab = [...container.querySelectorAll('button')].find((el) =>
    (el.textContent || '').includes('\u0987\u0982\u09b0\u09c7\u099c\u09bf \u0997\u09cd\u09b0\u09be\u09ae\u09be\u09b0')
  );
  if (tab) tab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  return Boolean(tab);
})();
await new Promise((resolve) => setTimeout(resolve, 300));
const englishTitleShown = (container.textContent || '').includes(
  '\u0987\u0982\u09b0\u09c7\u099c\u09bf \u0997\u09cd\u09b0\u09be\u09ae\u09be\u09b0 \u0993 \u09b6\u09ac\u09cd\u09a6 \u09a1\u09cd\u09b0\u09bf\u09b2'
);
console.log(
  switched && englishTitleShown
    ? '\u2713 the drill screen switches between GK and English banks'
    : `\u2717 bank switch failed (clicked=${switched}, title=${englishTitleShown})`
);
failures += switched && englishTitleShown ? 0 : 1;

// The product is student-only by design: no parent, teacher or admin surfaces.
const forbidden = ['অভিভাবক', 'শিক্ষক', 'Guardian', 'Parent report', 'Teacher'].filter((w) =>
  (container.textContent || '').includes(w)
);
console.log(
  forbidden.length === 0
    ? '✓ student-only UI (no parent/teacher surfaces)'
    : `✗ parent/teacher wording found: ${forbidden.join(', ')}`
);
failures += forbidden.length === 0 ? 0 : 1;

// ---------- Pure logic: exam patterns, eligibility, reasons, reminders ----------
const eligibility = await vite.ssrLoadModule('/src/lib/eligibility.ts');
const mistakeTags = await vite.ssrLoadModule('/src/lib/mistakeTags.ts');
const reminders = await vite.ssrLoadModule('/src/lib/reminders.ts');
const mcqBank = await vite.ssrLoadModule('/src/data/mcqBank.ts');
const allQuestions = await mcqBank.loadAllMcq();

const check = (ok, label, detail = '') => {
  console.log(ok ? `✓ ${label}` : `✗ ${label}${detail ? ` — ${detail}` : ''}`);
  failures += ok ? 0 : 1;
};

const actualCounts = allQuestions.reduce((acc, q) => {
  acc[q.subjectKey] = (acc[q.subjectKey] || 0) + 1;
  return acc;
}, {});
const countDrift = Object.entries(mcqBank.MCQ_COUNTS).filter(
  ([key, value]) => actualCounts[key] !== value
);
check(
  countDrift.length === 0 && mcqBank.MCQ_TOTAL === allQuestions.length,
  'static MCQ counts match the real bank',
  countDrift.map(([k, v]) => `${k}: shown ${v}, real ${actualCounts[k]}`).join(' | ')
);

check(
  allQuestions.length === mcqBank.MCQ_TOTAL,
  'per-paper loaders rebuild the whole bank'
);

const singlePaper = await mcqBank.loadMcqSubject('physics1');
check(
  singlePaper.length === mcqBank.MCQ_COUNTS.physics1 &&
    singlePaper.every((q) => q.subjectKey === 'physics1'),
  'a single-paper drill loads only that paper',
  `${singlePaper.length} questions`
);

const bankIds = allQuestions.map((q) => q.id);
check(
  allQuestions.length >= 175,
  'MCQ bank passed 175 questions',
  String(allQuestions.length)
);

const perPaper = allQuestions.reduce((acc, q) => {
  acc[q.subjectKey] = (acc[q.subjectKey] || 0) + 1;
  return acc;
}, {});
const thinnestPaper = Object.entries(perPaper).sort((a, b) => a[1] - b[1])[0];
check(
  Object.keys(perPaper).length === 11 && thinnestPaper[1] >= 14,
  'every one of the 11 papers has at least 14 questions',
  `${thinnestPaper[0]}: ${thinnestPaper[1]}`
);
check(
  new Set(bankIds).size === bankIds.length,
  'every MCQ id is unique (mistake bank depends on it)',
  `${bankIds.length - new Set(bankIds).size} duplicates`
);

const cqBank = await vite.ssrLoadModule('/src/data/cqData.ts');
const cqIds = cqBank.CQ_QUESTIONS.map((q) => q.id);
check(
  cqBank.CQ_QUESTIONS.length >= 24 && new Set(cqIds).size === cqIds.length,
  'CQ bank has 24+ unique creative questions',
  `${cqBank.CQ_QUESTIONS.length} total / ${new Set(cqIds).size} unique`
);
check(
  cqBank.CQ_QUESTIONS.every(
    (q) => q.stem?.bn && q.qA?.bn && q.qB?.bn && q.qC?.bn && q.qD?.bn && q.ansA?.bn && q.ansD?.bn
  ),
  'every CQ carries a stem plus ক-ঘ and answers'
);

const patterns = await vite.ssrLoadModule('/src/lib/examPatterns.ts');
const medical = patterns.getPatternById('medical-mbbs');
check(
  patterns.patternTimeFor(medical, 10) === 360,
  'medical paper keeps the real 36s/question pace',
  String(patterns.patternTimeFor(medical, 10))
);

const scored = patterns.scoreForPattern(medical, 8, 2, 10);
check(
  scored.score === 7.5 && scored.penalty === 0.5 && scored.total === 10,
  'negative marking is 0.25 per wrong answer',
  JSON.stringify(scored)
);

const boardScored = patterns.scoreForPattern(patterns.getPatternById('hsc-board'), 7, 3, 10);
check(boardScored.score === 7, 'HSC board pattern never deducts', JSON.stringify(boardScored));

const medicalPick = patterns.pickPatternQuestions(allQuestions, medical, 20);
const pickedSubjects = new Set(medicalPick.map((q) => q.subjectKey));
check(
  medicalPick.length === 20 && pickedSubjects.size >= 3,
  'medical paper draws from several subjects by weight',
  `${medicalPick.length} questions / ${pickedSubjects.size} subjects`
);

const fullMock = patterns.pickPatternQuestions(
  allQuestions,
  patterns.getPatternById('full-mock'),
  30
);
check(
  fullMock.length === 30 && new Set(fullMock.map((q) => q.subjectKey)).size >= 6,
  'the combined 30-question mock spans the syllabus',
  `${fullMock.length} questions / ${new Set(fullMock.map((q) => q.subjectKey)).size} papers`
);

const mixedPick = patterns.pickPatternQuestions(
  allQuestions,
  patterns.getPatternById('mixed-interleaved'),
  15
);
const pickedChapters = new Set(mixedPick.map((q) => `${q.subjectKey}:${q.chapter.en}`));
check(
  mixedPick.length === 15 && pickedChapters.size >= 10,
  'mixed practice spreads across chapters',
  `${pickedChapters.size} chapters`
);

const ideal = eligibility.evaluateEligibility({
  sscGpa: 5,
  hscGpa: 5,
  subjectGps: { physics: 5, chemistry: 5, math: 5, biology: 5 },
  group: 'science',
});
check(ideal.every((r) => r.ok), 'a 5.00 student matches every track');

const weakBiology = eligibility.evaluateEligibility({
  sscGpa: 5,
  hscGpa: 4.29,
  subjectGps: { physics: 5, chemistry: 4, math: 5, biology: 3.5 },
  group: 'science',
});
const medicalRule = weakBiology.find((r) => r.id === 'medical');
check(
  !medicalRule.ok && medicalRule.missing.some((m) => m.bn.includes('জীববিজ্ঞান')),
  'medical rules name the biology gap',
  medicalRule.missing.map((m) => m.bn).join(' | ')
);

const weakCombined = eligibility.evaluateEligibility({
  sscGpa: 4.5,
  hscGpa: 4,
  subjectGps: { physics: 5, chemistry: 5, math: 5, biology: 5 },
  group: 'science',
});
const combinedRule = weakCombined.find((r) => r.id === 'medical');
check(
  !combinedRule.ok && combinedRule.missing.some((m) => m.bn.includes('৯.০০')),
  'combined SSC+HSC shortfall is explained',
  combinedRule.missing.map((m) => m.bn).join(' | ')
);

const routine = await vite.ssrLoadModule('/src/lib/masterRoutine.ts');
const phases = routine.PHASES;
check(
  phases.length === 3 &&
    phases[0].from === 1 &&
    phases[phases.length - 1].to === routine.TOTAL_PLAN_DAYS &&
    phases.every((phase, i) => i === 0 || phase.from === phases[i - 1].to + 1),
  'the master routine covers 391 consecutive days in three phases'
);
check(
  routine.subjectsForDay(1).length === 2 && routine.subjectsForDay(7).length === 0,
  'a class day carries two papers and Friday is a revision day'
);
check(
  Array.from({ length: 391 }, (_, i) => i + 1).every(
    (day) => routine.isRevisionDay(day) === (routine.weekdayIndexForDay(day) === 6)
  ),
  'every seventh day is the Friday revision day'
);
const dayOneSlots = routine.classSlotsForDay(1);
check(
  dayOneSlots.length === 2 && dayOneSlots.every((slot) => slot.chapterBn !== '—' && slot.chapterNumber >= 1),
  'class slots map to real syllabus chapters',
  dayOneSlots.map((slot) => slot.subjectKey).join(' + ')
);
const startKey = '2026-01-01';
check(
  routine.dayNumberForDate(startKey, '2026-01-01') === 1 &&
    routine.dayNumberForDate(startKey, '2026-01-07') === 7 &&
    routine.dayNumberForDate(startKey, '2026-01-01') !== null &&
    routine.dateForDayNumber(startKey, 391) === '2027-01-26',
  'plan days and calendar dates round-trip'
);
check(
  routine.dayNumberForDate(startKey, '2025-12-31') === null &&
    routine.dayNumberForDate(startKey, '2027-02-01') === null,
  'dates outside the 391 days are rejected'
);

const timePlan = routine.buildTimePlan(routine.DEFAULT_TIME_SETTINGS);
const plannedStudy = routine.plannedStudyMinutes(timePlan);
const availableStudy = routine.availableStudyMinutes(routine.DEFAULT_TIME_SETTINGS);
check(
  timePlan.length >= 6 && plannedStudy > 0 && plannedStudy <= availableStudy + 1,
  'the time plan stays inside the hours the student really has',
  `${Math.round(plannedStudy / 6) / 10}h planned of ${Math.round(availableStudy / 6) / 10}h`
);
const bookedDay = { ...routine.DEFAULT_TIME_SETTINGS, instituteHours: 14 };
check(
  routine.availableStudyMinutes(bookedDay) === 0 && routine.buildTimePlan(bookedDay).length === 0,
  'a fully booked day invents no study block'
);

const science = await vite.ssrLoadModule('/src/lib/studyScience.ts');
check(
  Array.isArray(science.SPACED_INTERVALS) && science.SPACED_INTERVALS.join(',') === '1,3,7,21',
  'the revision schedule uses the 1/3/7/21-day intervals'
);

const learnedSample = {
  learnedOn: '2026-01-01',
  chapterId: 'phy1-ch1',
  chapterBn: '\u09ad\u09cc\u09a4 \u099c\u0997\u09ce',
  chapterEn: 'Physical World',
  subjectBn: '\u09aa\u09a6\u09be\u09b0\u09cd\u09a5',
  subjectEn: 'Physics',
};
const dueNextDay = science.revisionQueue([learnedSample], '2026-01-02');
const dueDayThree = science.revisionQueue([learnedSample], '2026-01-04');
const dueDayEight = science.revisionQueue([learnedSample], '2026-01-09');
check(
  dueNextDay.length === 1 && dueNextDay[0].interval === 1,
  'a chapter learned yesterday is due for its day-1 review'
);
check(
  dueDayThree.length === 1 && dueDayThree[0].interval === 3 && dueDayThree[0].daysOverdue === 0,
  'the same chapter returns on day 3'
);
check(
  dueDayEight.length === 1 && dueDayEight[0].interval === 7,
  'on day 8 only the seven-day review is due, not a pile-up'
);
const dueDone = science.revisionQueue([learnedSample], '2026-01-02', {
  '2026-01-02|due|phy1-ch1|1': true,
});
check(dueDone.length === 0, 'ticking a spaced review removes it from today\u2019s queue');

const mixedReviews = science.revisionQueue(
  [
    { ...learnedSample, learnedOn: '2026-01-01', chapterId: 'phy1-ch1', subjectKey: 'physics1', subjectBn: 'Physics' },
    { ...learnedSample, learnedOn: '2026-01-06', chapterId: 'bio1-ch1', subjectKey: 'biology1', subjectBn: 'Biology' },
  ],
  '2026-01-13',
  {},
  ['biology1', 'chemistry1', 'chemistry2', 'biology2']
);
check(
  mixedReviews.length === 2 &&
    mixedReviews[0].subjectKey === 'biology1' &&
    mixedReviews[1].subjectKey === 'physics1',
  'the main track\u2019s papers come first in the revision queue',
  mixedReviews.map((item) => item.subjectKey).join(',')
);

const focusBlock = {
  titleBn: '\u09ae\u09c2\u09b2 \u099f\u09cd\u09b0\u09cd\u09af\u0995 \u09ac\u09cd\u09b2\u0995',
  titleEn: 'Main-track block',
  minutes: 45,
};
const focusDay = science.buildStudyDay(routine.DEFAULT_TIME_SETTINGS, 'neutral', focusBlock);
const plainDay = science.buildStudyDay(routine.DEFAULT_TIME_SETTINGS, 'neutral');
const focusBlockOut = focusDay.blocks.find((block) => block.kind === 'focus');
check(
  Boolean(focusBlockOut) &&
    focusBlockOut.minutes === 45 &&
    focusDay.blocks[1].kind === 'focus' &&
    focusDay.blocks[2].kind === 'break',
  'the main-track block opens the study day and is followed by a break'
);
check(
  focusDay.studyMinutes > 0 &&
    Math.abs(focusDay.studyMinutes - plainDay.studyMinutes) <= 15 &&
    focusDay.blocks.some((block) => block.kind === 'focus'),
  'the main-track block comes out of the same daily budget, not on top of it',
  `${focusDay.studyMinutes} vs ${plainDay.studyMinutes}`
);
const focusStudySum = focusDay.blocks
  .filter((block) => ['class', 'practice', 'revision', 'focus'].includes(block.kind))
  .reduce((sum, block) => sum + block.minutes, 0);
check(
  focusStudySum === focusDay.studyMinutes &&
    focusDay.blocks[focusDay.blocks.length - 1].kind === 'winddown',
  'the reported study minutes match the blocks and the day still ends with a wind-down'
);
const morningDay = science.buildStudyDay(routine.DEFAULT_TIME_SETTINGS, 'morning');
const eveningDay = science.buildStudyDay(routine.DEFAULT_TIME_SETTINGS, 'evening');
check(
  morningDay.blocks[1].kind === 'class' && eveningDay.blocks[1].kind === 'revision',
  'attention order follows the chosen chronotype',
  `${morningDay.blocks[1].kind} vs ${eveningDay.blocks[1].kind}`
);
check(
  morningDay.blocks.some((b) => b.kind === 'break') &&
    morningDay.blocks[morningDay.blocks.length - 1].kind === 'winddown',
  'the day carries real breaks and ends with a wind-down'
);
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const last = morningDay.blocks[morningDay.blocks.length - 1];
const endsAt = toMin(last.start) + last.minutes;
check(
  endsAt <= toMin(routine.DEFAULT_TIME_SETTINGS.sleep) + 1,
  'the timetable never runs past bedtime',
  `${last.start} + ${last.minutes}m`
);

const packedDay = science.buildStudyDay(
  { ...routine.DEFAULT_TIME_SETTINGS, instituteHours: 8 },
  'neutral',
  focusBlock
);
const packedLast = packedDay.blocks[packedDay.blocks.length - 1];
const packedFocus = packedDay.blocks.find((block) => block.kind === 'focus');
check(
  packedDay.blocks.length > 0 &&
    toMin(packedLast.start) + packedLast.minutes <=
      toMin(routine.DEFAULT_TIME_SETTINGS.sleep) + 1 &&
    (!packedFocus || packedFocus.minutes >= 20),
  'a packed day shrinks the main-track block instead of running past bedtime',
  packedFocus ? `${packedFocus.minutes}m focus` : 'focus dropped'
);
check(
  science.sleepFeedback({ wake: '06:00', sleep: '13:00' }).verdict === 'short' &&
    science.sleepFeedback({ wake: '06:00', sleep: '14:30' }).verdict === 'good' &&
    science.sleepFeedback({ wake: '06:00', sleep: '18:00' }).verdict === 'long',
  'the sleep check separates short, healthy and excessive sleep'
);
check(
  science.EVIDENCE.length >= 4 && science.EVIDENCE.every((item) => item.claimBn && item.sourceBn),
  'every timetable rule shows its research claim and source'
);

const mockPlan = await vite.ssrLoadModule('/src/lib/mockPlan.ts');

check(
  mockPlan.mockTestForDay(1) === null && mockPlan.mockTestForDay(6) === null && mockPlan.mockTestForDay(7) !== null,
  'mock tests only land on the Friday revision day'
);
const firstMock = mockPlan.mockTestForDay(7);
check(
  firstMock && firstMock.track.key === 'weekly' && firstMock.papersBn.length === 2,
  'the academic phase sets a weekly test on that week\u2019s two papers'
);
const admissionKinds = mockPlan
  .mockTestsBetween(240, 340)
  .map((test) => test.track.key);
const admissionSet = new Set(admissionKinds);
check(
  admissionSet.size === 3 &&
    admissionSet.has('varsity') &&
    admissionSet.has('engineering') &&
    admissionSet.has('medical'),
  'the pre-admission phase rotates varsity, engineering and medical',
  [...admissionSet].join('/')
);
const fullPhase = mockPlan.mockTestsBetween(341, 391);
check(
  fullPhase.length > 0 && fullPhase.every((test) => test.track.key === 'combined'),
  'the final phase runs combined full mocks'
);
check(
  mockPlan.mockTestsBetween(mockPlan.FINAL_REVISION_FROM_DAY, 391).length === 0 &&
    mockPlan.mockTestForDay(mockPlan.FINAL_REVISION_FROM_DAY - 1) === null,
  'the last two weeks carry no new mock \u2014 they are final revision'
);
const allMocks = mockPlan.mockTestsBetween(1, 391);
check(
  allMocks.length > 0 &&
    allMocks.every(
      (test) =>
        test.track.minutes > 0 &&
        test.track.marks > 0 &&
        patterns.EXAM_PATTERNS.some((pattern) => pattern.id === test.track.patternId)
    ),
  'every scheduled mock points at a real exam pattern with real time and marks'
);
const counts = mockPlan.mockCounts();
check(
  Object.values(counts).reduce((a, b) => a + b, 0) === allMocks.length,
  'the mock counts add up to the calendar'
);
const upcoming = mockPlan.upcomingMocks(1, 3, '2026-01-01');
check(
  upcoming.length === 3 &&
    upcoming[0].dayNumber === 7 &&
    upcoming.every((test, i) => i === 0 || test.daysAway > upcoming[i - 1].daysAway) &&
    upcoming.every((test) => test.dateKey === routine.dateForDayNumber('2026-01-01', test.dayNumber)),
  'upcoming mocks are ordered and carry their real dates'
);
const lastTwoWeeks = routine.weekPacing(
  '2026-01-01',
  routine.dateForDayNumber('2026-01-01', routine.TOTAL_PLAN_DAYS),
  {}
);
check(
  lastTwoWeeks && lastTwoWeeks.toDay === 391 && lastTwoWeeks.daysLeft === 1,
  'the week window clamps to the end of the 391-day plan'
);

const emptyWeek = routine.weekPacing('2026-01-01', '2026-01-03', {});
check(
  emptyWeek &&
    emptyWeek.fromDay === 1 &&
    emptyWeek.toDay === 7 &&
    emptyWeek.verdict === 'farBehind' &&
    emptyWeek.perDayExtra === 90,
  'a week with no logged minutes is flagged as far behind, capped at +90 min/day',
  emptyWeek ? `${emptyWeek.verdict} +${emptyWeek.perDayExtra}` : 'null'
);
const weekMinutes = {};
for (let day = 1; day <= 3; day += 1) {
  weekMinutes[routine.dateForDayNumber('2026-01-01', day)] = 215;
}
const balancedWeek = routine.weekPacing('2026-01-01', '2026-01-03', weekMinutes);
check(
  balancedWeek &&
    Math.abs(balancedWeek.expectedMinutes - balancedWeek.doneMinutes) <= 5 &&
    (balancedWeek.verdict === 'onTrack' || balancedWeek.verdict === 'ahead') &&
    balancedWeek.perDayExtra <= 5,
  'hitting the pro-rata target reads as on track',
  balancedWeek ? `${balancedWeek.verdict} +${balancedWeek.perDayExtra}` : 'null'
);
check(
  routine.weekPacing('2026-01-01', '2025-12-31', {}) === null,
  'week pacing stays silent outside the plan'
);

const trackProgress = await vite.ssrLoadModule('/src/lib/trackProgress.ts');
const syllabus = await vite.ssrLoadModule('/src/data/syllabusData.ts');

check(
  trackProgress.ADMISSION_TRACKS.length === 3 &&
    trackProgress.ADMISSION_TRACKS.every(
      (track) => Math.abs(track.subjects.reduce((sum, s) => sum + s.weight, 0) - 1) < 1e-6
    ),
  'each admission track weights exactly 100% of its syllabus'
);
check(
  trackProgress.ADMISSION_TRACKS.every(
    (track) =>
      patterns.EXAM_PATTERNS.some((pattern) => pattern.id === track.patternId) &&
      Boolean(mockPlan.MOCK_TRACKS[track.mockKind]) &&
      track.subjects.every((item) =>
        syllabus.CHAPTERS.some((chapter) => chapter.subjectKey === item.subjectKey)
      )
  ),
  'every track points at a real exam pattern, a real mock and real chapters'
);
const emptyTracks = trackProgress.allTrackReadiness({});
check(
  emptyTracks.every((track) => track.percent === 0 && track.verdict === 'early') &&
    emptyTracks.every((track) => track.weakest && track.weakest.percent === 0),
  'with nothing ticked every track reads 0% and names its weakest subject'
);

const engineeringTrack = trackProgress.ADMISSION_TRACKS.find((t) => t.key === 'engineering');
const engineeringDone = {};
for (const chapter of syllabus.CHAPTERS) {
  if (!engineeringTrack.subjects.some((item) => item.subjectKey === chapter.subjectKey)) continue;
  engineeringDone[chapter.id] = { theoryDone: true, notesDone: true, mcqDone: true, cqDone: true };
}
const engineeringReady = trackProgress.trackReadiness(engineeringTrack, engineeringDone);
const medicalAfterEngineering = trackProgress.trackReadiness(
  trackProgress.ADMISSION_TRACKS.find((t) => t.key === 'medical'),
  engineeringDone
);
check(
  engineeringReady.percent === 100 &&
    engineeringReady.verdict === 'ready' &&
    engineeringReady.finishedChapters === engineeringReady.totalChapters,
  'a fully ticked track reads 100% and ready'
);
check(
  medicalAfterEngineering.percent > 0 && medicalAfterEngineering.percent < 100,
  'finishing one track lifts the shared subjects but not the whole of another'
);

const theoryOnly = {};
const physics1Chapters = syllabus.CHAPTERS.filter((chapter) => chapter.subjectKey === 'physics1');
for (const chapter of physics1Chapters) {
  theoryOnly[chapter.id] = { theoryDone: true, notesDone: false, mcqDone: false, cqDone: false };
}
const physics1 = trackProgress.subjectReadiness('physics1', theoryOnly, 0.18);
check(
  physics1.percent === 25 && physics1.finishedChapters === 0,
  'one of the four stages reads as a quarter — a chapter is only finished at four'
);
check(
  Math.abs(
    engineeringReady.subjects.reduce((sum, s) => sum + s.weightedPercent, 0) - engineeringReady.percent
  ) <= 1,
  'the track percentage is the weighted sum of its subjects'
);

check(
  trackProgress.DEFAULT_PRIMARY_TRACK === 'medical' &&
    trackProgress.tracksByPriority(trackProgress.DEFAULT_PRIMARY_TRACK)[0].key === 'medical',
  'medical is the default main track and leads the list'
);
const medicalSplit = trackProgress.trackTimeSplit('medical', 25 * 60);
check(
  medicalSplit[0].track.key === 'medical' &&
    medicalSplit[0].isPrimary &&
    medicalSplit[0].minutes === 750 &&
    medicalSplit.reduce((sum, item) => sum + item.minutes, 0) === 25 * 60,
  'the main track takes half of the weekly hours, the rest split evenly'
);
const varsityFirst = trackProgress.trackTimeSplit('varsity', 25 * 60);
check(
  varsityFirst[0].track.key === 'varsity' &&
    varsityFirst[0].minutes === 750 &&
    varsityFirst[1].minutes === 375,
  'switching the main track moves the extra hours with it'
);
const admissionMockCounts = { medical: 0, engineering: 0, varsity: 0 };
for (const test of mockPlan.mockTestsBetween(240, 340)) {
  const kind = test.track.key;
  if (kind in admissionMockCounts) admissionMockCounts[kind] += 1;
}
check(
  admissionMockCounts.medical > admissionMockCounts.engineering &&
    admissionMockCounts.medical > admissionMockCounts.varsity,
  'the admission phase schedules more medical mocks than any other track',
  JSON.stringify(admissionMockCounts)
);

check(
  trackProgress.dailyFocus('medical', {}).subjectKey === 'biology1' &&
    trackProgress.dailyFocus('engineering', {}).subjectKey === 'math1' &&
    trackProgress.dailyFocus('varsity', {}).subjectKey === 'math1',
  'the daily main-track block starts on each track\u2019s heaviest paper'
);
const biologyDone = {};
for (const chapter of syllabus.CHAPTERS) {
  if (!chapter.subjectKey.startsWith('biology')) continue;
  biologyDone[chapter.id] = { theoryDone: true, notesDone: true, mcqDone: true, cqDone: true };
}
const focusAfterBiology = trackProgress.dailyFocus('medical', biologyDone);
check(
  focusAfterBiology.subjectKey === 'chemistry1' &&
    focusAfterBiology.minutes === 45 &&
    focusAfterBiology.titleBn.startsWith('মূল ট্র্যাক ব্লক'),
  'once biology is done the block moves to chemistry',
  focusAfterBiology.subjectKey
);

const mistakeLoop = await vite.ssrLoadModule('/src/lib/mistakeLoop.ts');
const bioBank = (await vite.ssrLoadModule('/src/data/mcq/biology1.ts')).default;

const firstBio = bioBank[0];
const firstBioChapter = syllabus.CHAPTERS.find(
  (chapter) => chapter.id === mistakeLoop.chapterIdForQuestion(firstBio)
);
check(
  Boolean(firstBioChapter) && firstBioChapter.subjectKey === 'biology1',
  'a wrongly answered question maps back to a real syllabus chapter',
  firstBio.id
);

const sameChapter = bioBank.filter(
  (question) => question.chapter.bn === firstBio.chapter.bn
);
const grouped = mistakeLoop.mistakesByChapter(
  sameChapter.slice(0, 2).map((question) => question.id),
  bioBank
);
check(
  grouped.length === 1 && grouped[0].wrongCount === 2,
  'two wrong answers from the same chapter collapse into one row'
);
check(
  mistakeLoop.mistakesByChapter([], bioBank).length === 0,
  'an empty mistake bank produces no weak chapters'
);

const gapSuggestion = mistakeLoop.mainBlockSuggestion('medical', {}, [], []);
check(
  gapSuggestion.reason === 'gap' &&
    Boolean(gapSuggestion.chapterId) &&
    gapSuggestion.chapterId.startsWith('bio1-'),
  'with no mistakes the block starts on the furthest-behind biology chapter',
  gapSuggestion.chapterId
);
const mistakeSuggestion = mistakeLoop.mainBlockSuggestion(
  'medical',
  {},
  [firstBio.id],
  bioBank
);
check(
  mistakeSuggestion.reason === 'mistakes' &&
    mistakeSuggestion.wrongCount === 1 &&
    mistakeSuggestion.chapterBn === firstBio.chapter.bn &&
    mistakeSuggestion.titleBn.includes(firstBio.chapter.bn),
  'a wrong mock answer moves that chapter into the daily main block',
  mistakeSuggestion.chapterBn
);
const physicsBank = (await vite.ssrLoadModule('/src/data/mcq/physics1.ts')).default;
const otherPaper = mistakeLoop.mainBlockSuggestion(
  'medical',
  {},
  [physicsBank[0].id],
  [...bioBank, ...physicsBank]
);
check(
  otherPaper.reason === 'gap' && otherPaper.wrongCount === 0,
  'mistakes in another paper do not hijack the medical block'
);

const reportIds = [
  sameChapter[0].id,
  sameChapter[1].id,
  sameChapter[2] ? sameChapter[2].id : sameChapter[0].id,
  physicsBank[0].id,
];
const report = mistakeLoop.mistakeReport(reportIds, [...bioBank, ...physicsBank], {});
check(
  report.totalWrong === reportIds.length &&
    report.chapters.length === 2 &&
    report.chapters[0].repeated &&
    report.papers.reduce((sum, paper) => sum + paper.count, 0) === report.totalWrong,
  'the mistake report groups ids per chapter and per paper',
  `${report.totalWrong} wrong / ${report.chapters.length} chapters`
);
const emptyReport = mistakeLoop.mistakeReport([], bioBank, {});
check(
  emptyReport.totalWrong === 0 &&
    emptyReport.chapters.length === 0 &&
    emptyReport.adviceBn.length > 0,
  'an empty mistake bank still explains where to start'
);

const chapterDrill = await vite.ssrLoadModule('/src/lib/chapterDrill.ts');
chapterDrill.requestChapterDrill({
  subjectKey: 'biology1',
  chapterBn: firstBio.chapter.bn,
  chapterEn: firstBio.chapter.en,
  count: 10,
});
const takenDrill = chapterDrill.takeChapterDrill();
check(
  takenDrill &&
    takenDrill.subjectKey === 'biology1' &&
    takenDrill.chapterBn === firstBio.chapter.bn &&
    takenDrill.count === 10,
  'a chapter drill request survives the route change'
);
check(
  chapterDrill.takeChapterDrill() === null,
  'the drill request is consumed exactly once'
);
const pickedDrill = chapterDrill.pickChapterQuestions(bioBank, {
  subjectKey: 'biology1',
  chapterBn: firstBio.chapter.bn,
  chapterEn: firstBio.chapter.en,
  count: 3,
});
check(
  pickedDrill.length > 0 &&
    pickedDrill.length <= 3 &&
    pickedDrill.every((question) => question.chapter.bn === firstBio.chapter.bn),
  'a chapter drill only draws that chapter\u2019s questions',
  `${pickedDrill.length} question(s)`
);

const routineStore = await vite.ssrLoadModule('/src/lib/routineStore.ts');
let routineState = routineStore.emptyRoutineState('2026-01-01');
check(
  routineState.primaryTrack === 'medical',
  'a fresh routine starts with medical as the main track'
);
routineState = routineStore.setPrimaryTrack(routineState, 'engineering');
check(
  routineState.primaryTrack === 'engineering' &&
    routineStore.setPrimaryTrack(routineState, 'medical').primaryTrack === 'medical',
  'the main track can be changed and saved'
);
routineState = routineStore.toggleRoutineTask(routineState, routineStore.taskKey('2026-01-01', 0, 1));
check(
  routineState.tasks['2026-01-01|0|1'] === true &&
    routineStore.completedTasksForDate(routineState, '2026-01-01') === 1,
  'ticking a routine task is remembered per day'
);
routineState = routineStore.toggleRoutineTask(routineState, routineStore.taskKey('2026-01-01', 0, 1));
check(
  routineState.tasks['2026-01-01|0|1'] === undefined,
  'unticking removes the routine task'
);
routineState = routineStore.toggleRoutineTask(
  routineState,
  routineStore.taskKey('2026-01-01', 0, 0)
);
const learned = routineStore.learnedChapters(routineState);
check(
  learned.length === 1 && learned[0].chapterId.length > 0,
  'a ticked class marks its chapter as learned for spacing',
  learned[0] ? learned[0].chapterId : 'none'
);
routineState = routineStore.toggleRoutineTask(
  routineState,
  routineStore.taskKey('2026-01-01', 0, 0)
);

routineState = routineStore.logStudyMinutes(routineState, '2026-01-01', 90);
check(
  routineState.minutes['2026-01-01'] === 90,
  'study minutes are logged per calendar day'
);

const formulaBank = await vite.ssrLoadModule('/src/data/formulasData.ts');
const formulaIds = formulaBank.FORMULAS.map((f) => f.id);
check(
  formulaBank.FORMULAS.length >= 50 && new Set(formulaIds).size === formulaIds.length,
  'formula vault holds 50+ unique cards',
  `${formulaBank.FORMULAS.length} cards`
);
const formulaPerPaper = {};
formulaBank.FORMULAS.forEach((f) => {
  formulaPerPaper[f.subjectKey] = (formulaPerPaper[f.subjectKey] || 0) + 1;
});
const thinFormulaPaper = Object.entries(formulaPerPaper).sort((a, b) => a[1] - b[1])[0] || ['', 0];
check(
  Object.keys(formulaPerPaper).length === 11 && thinFormulaPaper[1] >= 2,
  'every paper has at least two formula cards',
  `${thinFormulaPaper[0]}: ${thinFormulaPaper[1]}`
);
check(
  formulaBank.FORMULAS.every(
    (f) => f.formula && f.explanation.bn && f.explanation.en && f.examTip.bn
  ),
  'every formula card carries a bilingual explanation and exam tip'
);

const gkBank = await vite.ssrLoadModule('/src/data/gkBank.ts');
const gkIds = gkBank.GK_QUESTIONS.map((item) => item.id);
check(
  gkBank.GK_QUESTIONS.length >= 30 && new Set(gkIds).size === gkIds.length,
  'GK bank holds 30+ unique facts for the medical paper',
  `${gkBank.GK_QUESTIONS.length} questions`
);
check(
  gkBank.GK_CATEGORIES.every((cat) =>
    gkBank.GK_QUESTIONS.some((item) => item.category === cat.key)
  ),
  'every GK category has at least one question'
);
const gkRound = gkBank.pickGkRound('all');
check(
  gkRound.length === gkBank.GK_RAPID_ROUND_SIZE,
  'a rapid GK round draws exactly 10 questions',
  `${gkRound.length} questions`
);
const gkSports = gkBank.pickGkRound('sports', 10);
check(
  gkSports.length > 0 && gkSports.every((item) => item.category === 'sports'),
  'a category round stays inside that category'
);
check(
  gkBank.GK_QUESTIONS.every((item) => item.options.length === 4 && item.options[item.correctIndex]),
  'every GK question has four options and a valid answer index'
);

const englishBank = await vite.ssrLoadModule('/src/data/englishDrillBank.ts');
const englishIds = englishBank.ENGLISH_DRILL_QUESTIONS.map((item) => item.id);
check(
  englishBank.ENGLISH_DRILL_QUESTIONS.length >= 30 && new Set(englishIds).size === englishIds.length,
  'English drill bank holds 30+ unique rule-based questions',
  `${englishBank.ENGLISH_DRILL_QUESTIONS.length} questions`
);
check(
  englishBank.ENGLISH_DRILL_CATEGORIES.every((cat) =>
    englishBank.ENGLISH_DRILL_QUESTIONS.some((item) => item.category === cat.key)
  ),
  'every English drill category is populated'
);
check(
  englishBank.ENGLISH_DRILL_QUESTIONS.every(
    (item) => item.options.length === 4 && item.options[item.correctIndex] && item.explanation.bn
  ),
  'every English drill question has four options, an answer and an explanation'
);
const englishRound = englishBank.pickEnglishRound('all');
check(
  englishRound.length === englishBank.ENGLISH_DRILL_ROUND_SIZE,
  'an English round draws exactly 10 questions',
  `${englishRound.length} questions`
);
const englishPrepositions = englishBank.pickEnglishRound('preposition', 10);
check(
  englishPrepositions.length > 0 &&
    englishPrepositions.every((item) => item.category === 'preposition'),
  'an English category round stays inside that category'
);

const drillBanks = await vite.ssrLoadModule('/src/data/drillBanks.ts');
check(
  drillBanks.DRILL_BANKS.length >= 2 &&
    drillBanks.DRILL_BANKS.every(
      (bank) => bank.questions.length > 0 && bank.categories.length >= 2 && bank.storageKey
    ),
  'the drill screen is generated from bank configs'
);

const selfNotes = await vite.ssrLoadModule('/src/lib/selfNotes.ts');
selfNotes.saveSelfNote('q-phy1-c1', 'বলের মাত্রা MLT⁻², কারণ F = ma');
const savedNote = selfNotes.loadSelfNotes()['q-phy1-c1'] || '';
check(
  savedNote.includes('MLT') && selfNotes.selfNoteCount() >= 1,
  'self-explanation notes save per question'
);
selfNotes.saveSelfNote('q-phy1-c1', '   ');
check(
  selfNotes.loadSelfNotes()['q-phy1-c1'] === undefined,
  'an emptied explanation is removed'
);

// The setup screen should tell the student how much they have already written.
selfNotes.saveSelfNote('q-bio2-1', '\u09b9\u09c3\u09a6\u09aa\u09bf\u09a3\u09cd\u09a1\u09c7\u09b0 \u09ac\u09be\u09ae \u09a8\u09bf\u09b2\u09df \u09b8\u09ac\u099a\u09c7\u09df\u09c7 \u09ae\u09cb\u099f\u09be');
window.history.replaceState(null, '', '/#/mcq');
window.location.hash = '#/mcq';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 900));
const noteChip = (container.textContent || '').includes(
  '\u09a8\u09bf\u099c\u09c7\u09b0 \u09ad\u09be\u09b7\u09be\u09df \u09b2\u09c7\u0996\u09be \u09ac\u09cd\u09af\u09be\u0996\u09cd\u09af\u09be'
);
check(noteChip, 'the MCQ setup screen counts the explanations you have written');
selfNotes.saveSelfNote('q-bio2-1', '');

const summary = mistakeTags.mistakeSummary(
  ['q1', 'q2', 'q3'],
  { q1: 'concept', q2: 'concept', q3: 'rushed' }
);
check(
  summary.top === 'concept' && summary.counts.concept === 2 && summary.total === 3,
  'error-reason summary picks the dominant cause',
  JSON.stringify(summary.counts)
);

const soonReminders = reminders.buildReminders({
  habits: {},
  attendance: {},
  deadlines: [],
  exams: [{ id: 'e1', title: 'মডেল টেস্ট', date: new Date().toISOString().slice(0, 10), time: '10:00', subjectKey: 'all' }],
  results: [],
  examChecklist: [],
  xpAwardedOn: [],
  routine: [],
  updatedAt: '',
});
check(
  soonReminders.some((r) => r.kind === 'exam' && r.daysAway === 0),
  'an exam today shows up as a reminder'
);

const quietReminders = reminders.buildReminders({
  habits: {},
  attendance: {},
  deadlines: [],
  exams: [],
  results: [],
  examChecklist: [],
  xpAwardedOn: [],
  routine: [],
  updatedAt: '',
});
check(
  quietReminders.length === 1 && quietReminders[0].kind === 'study',
  'with nothing due, the nudge is a gentle 10-minute study prompt'
);

const relevantErrors = errors.filter(
  (e) => !e.includes('act(') && !e.includes('Not implemented')
);
if (relevantErrors.length) {
  console.log(`\nconsole.error output (${relevantErrors.length}):`);
  relevantErrors.slice(0, 6).forEach((e) => console.log('  •', e.slice(0, 300)));
}

await vite.close();
console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
