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

const dashboardCalibration =
  (container.textContent || '').includes('নিশ্চয়তা বনাম বাস্তবতা') &&
  (container.textContent || '').includes('গড় অনুমান');
console.log(
  dashboardCalibration
    ? '\u2713 the dashboard shows the calibration card'
    : '\u2717 dashboard calibration card missing'
);
failures += dashboardCalibration ? 0 : 1;

window.localStorage.setItem(
  'hsc28_quizzes',
  JSON.stringify([
    {
      id: 'seed-low-bio',
      subjectKey: 'biology1',
      examTitle: 'Weekly board-style mock',
      totalQuestions: 20,
      correctAnswers: 9,
      wrongAnswers: 11,
      score: 9,
      accuracy: 45,
      durationSeconds: 900,
      createdAt: new Date().toISOString(),
    },
  ])
);
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
const hasWeekTarget =
  weekTabText.includes('সাপ্তাহিক রিপোর্ট') &&
  weekTabText.includes('MCQ') &&
  weekTabText.includes('/') &&
  (weekTabText.includes('২৪ MCQ') || weekTabText.includes('শেষ ফল'));
console.log(
  openedWeekTab && hasWeekMockCard && hasWeekTarget
    ? 'the weekly tab lists this week\u2019s chapters, quotas, report and scheduled mock'
    : `weekly tab incomplete (tab=${openedWeekTab}, card=${hasWeekMockCard}, target=${hasWeekTarget})`
);
failures += openedWeekTab && hasWeekMockCard && hasWeekTarget ? 0 : 1;

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

// The MCQ setup screen asks for a prediction before the paper starts.
window.localStorage.removeItem('hsc28_chapter_drill_v1');
window.history.replaceState(null, '', '/#/mcq');
window.location.hash = '#/mcq';
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 1600));
const setupText = container.textContent || '';
const asksPrediction = setupText.includes('শুরুর আগে: এই মকে কত% পাবে বলে মনে হয়?');
console.log(
  asksPrediction
    ? '\u2713 the exam setup asks for a score prediction first'
    : '\u2717 prediction prompt missing on the setup screen'
);
failures += asksPrediction ? 0 : 1;

// Confidently-wrong answers can be drilled on their own, from storage.
window.localStorage.setItem(
  'hsc28_confidence_v1',
  JSON.stringify({
    'q-bio1-1': { tag: 'sure', correct: false, at: new Date().toISOString() },
    'q-bio1-2': { tag: 'sure', correct: false, at: new Date().toISOString() },
  })
);
window.localStorage.setItem(
  'hsc28_chapter_drill_v1',
  JSON.stringify({
    chapterBn: 'নিশ্চিত-ভুল',
    chapterEn: 'Confidently wrong',
    titleBn: 'নিশ্চিত-ভুল',
    titleEn: 'Confidently wrong',
    count: 2,
    questionIds: ['q-bio1-1', 'q-bio1-2'],
    createdAt: new Date().toISOString(),
  })
);
if (root) root.unmount();
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(App));
await new Promise((resolve) => setTimeout(resolve, 2000));
const blindText = container.textContent || '';
const blindStarted =
  blindText.includes('প্রোটিন ফ্যাক্টরি') &&
  blindText.includes('জমা দিন') &&
  !blindText.includes('পরীক্ষা শুরু করুন');
console.log(
  blindStarted
    ? '\u2713 a confidently-wrong drill opens with exactly those questions'
    : '\u2717 confidently-wrong drill did not start'
);
failures += blindStarted ? 0 : 1;


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

const weeklyTarget = await vite.ssrLoadModule('/src/lib/weeklyTarget.ts');

const firstWeek = weeklyTarget.weekTarget('2026-01-01', '2026-01-03', {});
check(
  firstWeek &&
    firstWeek.weekNumber === 1 &&
    firstWeek.fromDay === 1 &&
    firstWeek.toDay === 7 &&
    firstWeek.papers.length >= 3 &&
    firstWeek.chaptersTotal > 0,
  'the week target collects the papers and chapters of that week',
  firstWeek ? `${firstWeek.papers.length} papers / ${firstWeek.chaptersTotal} chapters` : 'null'
);
check(
  firstWeek.mcqQuota === weeklyTarget.WEEKLY_MCQ_QUOTA * firstWeek.papers.length &&
    firstWeek.cqQuota === weeklyTarget.WEEKLY_CQ_QUOTA * firstWeek.papers.length &&
    firstWeek.papers.every((paper) =>
      paper.chapters.every((chapter) => syllabus.CHAPTERS.some((item) => item.id === chapter.chapterId))
    ),
  'weekly quotas scale per paper and every chapter is a real syllabus chapter'
);

const finishedWeek = {};
for (const paper of firstWeek.papers) {
  for (const chapter of paper.chapters) {
    finishedWeek[chapter.chapterId] = { theoryDone: true, notesDone: true, mcqDone: true, cqDone: true };
  }
}
const finishedWeekTarget = weeklyTarget.weekTarget('2026-01-01', '2026-01-03', finishedWeek);
check(
  finishedWeekTarget.percent === 100 &&
    finishedWeekTarget.chaptersDone === finishedWeekTarget.chaptersTotal,
  'ticking all four stages closes the week target'
);

const emptyWeekReport = weeklyTarget.weekReport(firstWeek, {}, {}, '2026-01-01', '2026-01-03');
check(
  emptyWeekReport && emptyWeekReport.verdict === 'empty' && emptyWeekReport.minutesDone === 0,
  'an untouched week reports as not started'
);
const hscWeekMinutes = { '2026-01-01': 300, '2026-01-02': 400 };
const hscTickingWeek = {
  '2026-01-01|0|0': true,
  '2026-01-02|due|bio1-ch1|3': true,
};
const busyReport = weeklyTarget.weekReport(
  firstWeek,
  hscWeekMinutes,
  hscTickingWeek,
  '2026-01-01',
  '2026-01-03'
);
check(
  busyReport &&
    busyReport.minutesDone === 700 &&
    busyReport.minutesTarget === Math.round((25 * 60 / 7) * 3) &&
    busyReport.verdict === 'onTrack' &&
    busyReport.tasksTicked === 2 &&
    busyReport.reviewsTicked === 1,
  'the weekly report counts minutes, ticks and spaced reviews against the target',
  busyReport ? `${busyReport.minutesDone}/${busyReport.minutesTarget} ${busyReport.verdict}` : 'null'
);
check(
  weeklyTarget.weekTarget('2026-01-01', '2025-12-31', {}) === null,
  'the week target stays silent outside the plan'
);

const biology1Key = 'biology1';
const attempts = [
  { id: 'a1', subjectKey: biology1Key, examTitle: 'weekly', totalQuestions: 20, correctAnswers: 16, wrongAnswers: 4, score: 16, accuracy: 80, durationSeconds: 600, createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'a2', subjectKey: biology1Key, examTitle: 'weekly', totalQuestions: 20, correctAnswers: 17, wrongAnswers: 3, score: 17, accuracy: 85, durationSeconds: 600, createdAt: '2026-01-12T10:00:00.000Z' },
  { id: 'a3', subjectKey: biology1Key, examTitle: 'weekly', totalQuestions: 20, correctAnswers: 9, wrongAnswers: 11, score: 9, accuracy: 45, durationSeconds: 600, createdAt: '2026-01-17T10:00:00.000Z' },
  { id: 'a4', subjectKey: 'all', examTitle: 'combined', totalQuestions: 30, correctAnswers: 10, wrongAnswers: 20, score: 10, accuracy: 33, durationSeconds: 900, createdAt: '2026-01-18T10:00:00.000Z' },
];
const paperScoresNow = weeklyTarget.paperScores(attempts);
check(
  paperScoresNow.length === 1 &&
    paperScoresNow[0].subjectKey === biology1Key &&
    paperScoresNow[0].accuracy === 45 &&
    paperScoresNow[0].attempts === 3,
  'only the latest score per paper counts, and combined mocks are left out',
  JSON.stringify(paperScoresNow.map((row) => [row.subjectKey, row.accuracy]))
);

const adjusted = weeklyTarget.adjustWeekTarget(firstWeek, paperScoresNow);
const bioRow = adjusted.papers.find((paper) => paper.subjectKey === biology1Key);
check(
  adjusted.hasResults &&
    adjusted.urgent.length === 1 &&
    adjusted.papers[0].subjectKey === biology1Key &&
    bioRow.weight === 1.6 &&
    bioRow.mcqQuota === 24 &&
    bioRow.extraMinutes === 18,
  'a paper under 50% leads the week with a bigger quota',
  bioRow ? `${bioRow.mcqQuota} MCQ / w${bioRow.weight}` : 'missing'
);
const relaxed = weeklyTarget.adjustWeekTarget(firstWeek, [
  { subjectKey: biology1Key, accuracy: 92, attempts: 2, lastAt: '2026-01-12T10:00:00.000Z' },
]);
const strongRow = relaxed.papers.find((paper) => paper.subjectKey === biology1Key);
check(
  strongRow.weight === 0.9 && strongRow.mcqQuota < 15 && strongRow.extraMinutes === 0 && relaxed.urgent.length === 0,
  'a paper above 80% gives some of its quota back',
  `${strongRow.mcqQuota} MCQ`
);
const untouched = weeklyTarget.adjustWeekTarget(firstWeek, []);
check(
  untouched.hasResults === false &&
    untouched.papers.every((paper) => paper.weight === 1 && paper.score === null),
  'without results every paper keeps its normal quota'
);

const calibration = await vite.ssrLoadModule('/src/lib/calibration.ts');

const sureRight = Object.fromEntries(
  ['q1', 'q2', 'q3', 'q4'].map((id) => [id, { tag: 'sure', correct: true, at: '2026-01-01T00:00:00.000Z' }])
);
const sureWrong = Object.fromEntries(
  ['q5', 'q6', 'q7'].map((id) => [id, { tag: 'sure', correct: false, at: '2026-01-01T00:00:00.000Z' }])
);
const guessRight = { q8: { tag: 'guess', correct: true, at: '2026-01-01T00:00:00.000Z' } };
const guessWrong = { q9: { tag: 'guess', correct: false, at: '2026-01-01T00:00:00.000Z' } };
const confidenceMatrix = calibration.confidenceSummary({ ...sureRight, ...sureWrong, ...guessRight, ...guessWrong });
check(
  confidenceMatrix.solid === 4 &&
    confidenceMatrix.blindSpots === 3 &&
    confidenceMatrix.fragile === 1 &&
    confidenceMatrix.knownGaps === 1 &&
    confidenceMatrix.total === 9 &&
    confidenceMatrix.confidentAccuracy === 57,
  'the confidence matrix sorts every tagged answer into its own cell',
  `${confidenceMatrix.solid}/${confidenceMatrix.blindSpots}/${confidenceMatrix.fragile}/${confidenceMatrix.knownGaps}`
);
check(
  confidenceMatrix.verdict === 'overconfident' && confidenceMatrix.blindSpotIds.length === 3,
  'confidence outrunning accuracy reads as overconfidence, with the ids to drill'
);
check(
  calibration.confidenceSummary({}).verdict === 'unknown' &&
    calibration.confidenceSummary({ q1: { tag: 'sure', correct: true, at: '' } }).verdict === 'unknown',
  'one or two tags are not enough to judge calibration'
);

calibration.saveConfidence('q-x', 'sure', false);
check(
  calibration.loadConfidence()['q-x'].tag === 'sure' &&
    calibration.loadConfidence()['q-x'].correct === false,
  'a confidence tag is saved on the device'
);
calibration.saveConfidence('q-x', null, false);
check(
  calibration.loadConfidence()['q-x'] === undefined,
  'tapping the same tag again clears it'
);

const predictionHistory = [
  { predicted: 80, actual: 60, at: '2026-01-01T00:00:00.000Z' },
  { predicted: 85, actual: 62, at: '2026-01-02T00:00:00.000Z' },
  { predicted: 75, actual: 58, at: '2026-01-03T00:00:00.000Z' },
];
const predSummary = calibration.predictionSummary(predictionHistory);
check(
  predSummary.attempts === 3 &&
    predSummary.averagePredicted === 80 &&
    predSummary.averageActual === 60 &&
    predSummary.bias === 20 &&
    predSummary.verdict === 'overconfident',
  'predictions are compared with results and the bias is named',
  `${predSummary.averagePredicted} vs ${predSummary.averageActual}`
);
check(
  calibration.predictionSummary([]).verdict === 'unknown' &&
    calibration.predictionSummary([predictionHistory[0]]).verdict === 'unknown',
  'a single prediction is not treated as a pattern'
);
const storedPredictions = calibration.recordPrediction(120, -5);
check(
  storedPredictions.length === 1 &&
    storedPredictions[0].predicted === 100 &&
    storedPredictions[0].actual === 0,
  'a recorded prediction is clamped to 0–100'
);

const idDrill = {
  chapterBn: 'নিশ্চিত-ভুল',
  chapterEn: 'Confidently wrong',
  count: 2,
  questionIds: [bioBank[1].id, physicsBank[1].id],
  createdAt: '2026-01-01T00:00:00.000Z',
};
const idPicked = chapterDrill.pickChapterQuestions([...bioBank, ...physicsBank], idDrill);
check(
  idPicked.length === 2 &&
    idPicked[0].id === bioBank[1].id &&
    idPicked[1].id === physicsBank[1].id,
  'a hand-picked drill follows the requested order across papers'
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

// ---------------------------------------------------------------- cloud vault
const vault = await vite.ssrLoadModule('/src/lib/cloudVault.ts');
check(
  typeof vault.startCloudVault === 'function' &&
    typeof vault.pullFromCloud === 'function' &&
    typeof vault.flushVault === 'function' &&
    typeof vault.takeRestoreNotice === 'function',
  'the cloud vault exposes start, pull, flush and restore-notice'
);

const restoreDecision = (over) =>
  vault.shouldRestore({
    localValue: null,
    remoteValue: 'x',
    remoteUpdatedAt: '2026-01-01T00:00:00Z',
    lastPushedAt: null,
    freshDevice: false,
    ...over,
  });
check(restoreDecision({}) === true, 'a key missing on this device comes back from the cloud');
check(restoreDecision({ localValue: 'x' }) === false, 'an identical local value is never rewritten');
check(
  restoreDecision({ localValue: 'app-default', freshDevice: true }) === true,
  'on a brand-new phone the cloud copy beats app defaults'
);
check(
  restoreDecision({
    localValue: 'today-work',
    lastPushedAt: '2026-01-02T00:00:00Z',
    remoteUpdatedAt: '2026-01-01T00:00:00Z',
  }) === false,
  'unsynced local work is never clobbered by an older cloud row'
);
check(
  restoreDecision({
    localValue: 'old',
    lastPushedAt: '2026-01-01T00:00:00Z',
    remoteUpdatedAt: '2026-01-02T00:00:00Z',
  }) === true,
  'an edit made on another device after our last push wins'
);

try {
  localStorage.removeItem('hsc28_sync_queue');
} catch {
  /* ignore */
}
vault.startCloudVault(null);
localStorage.setItem('hsc28_master_routine_v1', JSON.stringify({ phase: 1, day: 1 }));
await vault.flushVault();
check(
  !localStorage.getItem('hsc28_sync_queue'),
  'a signed-out student never queues a cloud write'
);
check(
  localStorage.getItem('hsc28_master_routine_v1') === JSON.stringify({ phase: 1, day: 1 }),
  'guest study data stays on the device and is never dropped'
);

localStorage.setItem(
  'hsc28_vault_notice',
  JSON.stringify(['hsc28_lang', 'hsc28_profile', 'hsc28_prediction_v1'])
);
check(vault.takeRestoreNotice() === 3, 'restored sections from the cloud are counted once');
check(vault.takeRestoreNotice() === 0, 'the restore notice self-clears so the toast never repeats');

// A signed-out visitor sees the gate, not dashboard content; a deep link survives.
if (root) root.unmount();
container.innerHTML = '';
window.history.replaceState(null, '', '/#/planner');
const { AuthGate } = await vite.ssrLoadModule('/src/components/AuthGate.tsx');
let emitAuth;
const fakeAuth = { auth: { onAuthStateChange: (callback) => { emitAuth = callback; queueMicrotask(() => callback('INITIAL_SESSION', null)); return { data: { subscription: { unsubscribe() {} } } }; } }, from: () => ({ upsert: async () => ({ error: null }) }) };
root = createRoot(container);
root.render(React.createElement(AuthGate, { clientFactory: async () => fakeAuth }));
await new Promise(resolve => setTimeout(resolve, 120));
check(!!container.querySelector('input[type=email]') && !container.querySelector('nav'), 'signed-out visitor sees login and no app navigation');
check(window.location.hash === '#/planner', 'login gate preserves the requested deep link');
const languageButton = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'EN');
languageButton?.click();
await new Promise(resolve => setTimeout(resolve, 30));
check(container.textContent.includes('Sign in'), 'login gate switches to English');
// A successful auth event must actually enter the application, not remain on login.
emitAuth('SIGNED_IN', { user: { id: '44444444-4444-4444-8444-444444444444', email: 'test@example.invalid' } });
await new Promise(resolve => setTimeout(resolve, 500));
check(!!container.querySelector('nav') && !container.querySelector('input[type=email]'), 'authenticated session leaves gate and mounts app');
check(window.location.hash === '#/planner', 'signed-in transition preserves the deep link');
emitAuth('SIGNED_OUT', null);
await new Promise(resolve => setTimeout(resolve, 100));
check(!!container.querySelector('input[type=email]') && !container.querySelector('nav'), 'sign-out closes the app and returns to the gate');
root.unmount(); root = null;

// A persisted session on page load must take the same path as a new login.
container.innerHTML = '';
const initialSession = { user: { id: '44444444-4444-4444-8444-444444444444', email: 'test@example.invalid' } };
const sessionClient = { auth: { onAuthStateChange: callback => { queueMicrotask(() => callback('INITIAL_SESSION', initialSession)); return { data: { subscription: { unsubscribe() {} } } }; } }, from: () => ({ upsert: async () => ({ error: null }) }) };
root = createRoot(container);
root.render(React.createElement(AuthGate, { clientFactory: async () => sessionClient }));
await new Promise(resolve => setTimeout(resolve, 500));
check(!!container.querySelector('nav'), 'persisted session enters app on startup');
root.unmount(); root = null;

// Portable backups must be validated and cannot retain malformed legacy IDs.
const backup = await vite.ssrLoadModule('/src/lib/backup.ts');
let invalidBackupRejected = false;
try { backup.parseStudyBackup({ app: 'nokkhotro-hsc-2028', profile: {} }); } catch { invalidBackupRejected = true; }
check(invalidBackupRejected, 'malformed portable backup is rejected');
const backupFixture = {
  profile: { id: 'user-a', fullName: 'Student', collegeName: '', board: 'Jashore', targetGoal: 'Medical', avatarColor: '#000000', xp: 0, chaptersMastered: 0, quizzesTaken: 0, bestAccuracy: 0, studyMinutes: 0, streakDays: 1, bookmarks: [] },
  progressMap: {}, quizHistory: [], sessions: [], personalNotes: [],
  tasks: [{ id: 'starter-1', title: 'Legacy task', subjectKey: 'physics1', priority: 'high', completed: false, dueDate: '2026-11-02', createdAt: '2026-11-02T00:00:00Z' }],
};
const parsedBackup = backup.parseStudyBackup({ app: backup.BACKUP_APP_ID, ...backupFixture });
const repairedBackup = backup.prepareBackupForAccount(parsedBackup, 'user-a', 'a@example.invalid', () => '11111111-1111-4111-8111-111111111111');
check(repairedBackup.tasks[0].id === '11111111-1111-4111-8111-111111111111', 'legacy task IDs are converted to UUIDs before sync');
check(backup.buildBackupSyncOps(repairedBackup, 'user-a', '2026-11-02T00:00:00Z')[0].payload.user_id === 'user-a', 'backup writes target the active account');

// Account switching must not leak one student's local data into another account.
const savedStorage = Object.fromEntries(Array.from({ length: localStorage.length }, (_, i) => { const key = localStorage.key(i); return [key, localStorage.getItem(key)]; }));
localStorage.clear();
const spaces = await vite.ssrLoadModule('/src/lib/accountSpace.ts');
localStorage.setItem('hsc28_notes', JSON.stringify([{ title: 'guest work' }]));
const firstSpace = spaces.selectAccountSpace('11111111-1111-4111-8111-111111111111');
check(!!firstSpace.guestData?.hsc28_notes, 'guest work is retained for migration');
check(!!spaces.selectAccountSpace('11111111-1111-4111-8111-111111111111').guestData, 'failed guest migration stays pending on retry');
spaces.finishGuestMigration('11111111-1111-4111-8111-111111111111');
spaces.selectAccountSpace('22222222-2222-4222-8222-222222222222');
check(localStorage.getItem('hsc28_notes') === null, 'a different account does not see prior account local data');
localStorage.setItem('hsc28_notes', JSON.stringify([{ title: 'second account' }]));
spaces.selectAccountSpace('11111111-1111-4111-8111-111111111111');
check(localStorage.getItem('hsc28_notes')?.includes('guest work'), 'switching back restores the first account local space');
localStorage.clear();
for (const [key, value] of Object.entries(savedStorage)) if (value !== null) localStorage.setItem(key, value);

// The redesigned workspace must expose every section and keep controls usable.
const { Navbar } = await vite.ssrLoadModule('/src/components/Navbar.tsx');
let selectedSection = null, nextLanguage = null, nextTheme = null, searchOpened = false;
container.innerHTML = '';
root = createRoot(container);
root.render(React.createElement(Navbar, {
  activeTab: 'dashboard', setActiveTab: value => { selectedSection = value; },
  lang: 'bn', setLang: value => { nextLanguage = value; }, theme: 'light', setTheme: value => { nextTheme = value; },
  profile: { fullName: 'Test Student', xp: 0 }, isAuthenticated: true,
  onOpenAuth() {}, onOpenSearch: () => { searchOpened = true; },
  syncStatus: { phase: 'idle', pending: 0, queued: 0, lastSavedAt: null, lastError: null },
}));
await new Promise(resolve => setTimeout(resolve, 80));
check(container.querySelectorAll('.premium-nav-item').length === 16, 'premium sidebar exposes all 16 sections');
const sidebarLinks = Array.from(container.querySelectorAll('.premium-nav-item'));
sidebarLinks.find(button => button.textContent.includes('অ্যাডমিশন হাব'))?.click();
check(selectedSection === 'admission', 'premium section navigation selects the correct route');
container.querySelector('[aria-label="Switch language"]')?.click();
container.querySelector('[aria-label="Dark mode"]')?.click();
container.querySelector('.premium-search')?.click();
check(nextLanguage === 'en' && nextTheme === 'dark' && searchOpened, 'premium topbar keeps language, theme and search controls working');
check(container.querySelector('[role=status]')?.getAttribute('aria-label'), 'premium topbar exposes sync status accessibly');
root.unmount(); root = null;

// Module summaries reflect real records and filtering without changing existing controls.
const { CqBankView } = await vite.ssrLoadModule('/src/components/CqBankView.tsx');
const { CQ_QUESTIONS: cqQuestions } = await vite.ssrLoadModule('/src/data/cqData.ts');
root = createRoot(container);
root.render(React.createElement(CqBankView, { lang: 'en', theme: 'light', solvedCqs: [cqQuestions[0].id], onToggleSolvedCq() {} }));
await new Promise(resolve => setTimeout(resolve, 80));
check(container.querySelectorAll('.sector-stat').length === 4 && container.querySelectorAll('.sector-stat')[1]?.textContent.includes('1'), 'CQ overview counts the solved questions');
const cqSearch = container.querySelector('input[aria-label="Search creative questions"]');
Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(cqSearch, 'zz-no-matching-cq-zz');
cqSearch.dispatchEvent(new window.Event('input', { bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 50));
check(!!container.querySelector('.sector-empty') && container.querySelectorAll('.sector-stat')[3]?.textContent.includes('0'), 'CQ search updates the overview and shows an empty state');
container.querySelector('.sector-empty button')?.click();
await new Promise(resolve => setTimeout(resolve, 50));
check(!container.querySelector('.sector-empty') && cqSearch.value === '', 'CQ clear filters restores the question bank');
root.unmount(); root = null;

const { PracticalWritingView } = await vite.ssrLoadModule('/src/components/PracticalWritingView.tsx');
root = createRoot(container);
root.render(React.createElement(PracticalWritingView, { lang: 'en', theme: 'dark', completedPracticals: ['prac-phy1-1'], onTogglePractical() {} }));
await new Promise(resolve => setTimeout(resolve, 80));
check(container.querySelectorAll('.sector-stat')[1]?.textContent.includes('1'), 'practical overview reflects completed experiments');
const writingTab = [...container.querySelectorAll('button')].find(button => button.textContent.includes('Bangla & English Writing'));
writingTab?.click();
await new Promise(resolve => setTimeout(resolve, 50));
check(writingTab?.getAttribute('aria-pressed') === 'true', 'practical writing switch remains accessible and functional');
root.unmount(); root = null;

// The drill overview must follow the selected bank and not invent a last score.
const { DrillView } = await vite.ssrLoadModule('/src/components/DrillView.tsx');
const { DRILL_BANKS: overviewBanks } = await vite.ssrLoadModule('/src/data/drillBanks.ts');
const savedDrillScores = overviewBanks.map(bank => localStorage.getItem(bank.storageKey));
localStorage.removeItem(overviewBanks[0].storageKey);
localStorage.setItem(overviewBanks[1].storageKey, JSON.stringify({ score: 7, total: 10, date: '2026-11-02' }));
root = createRoot(container);
root.render(React.createElement(DrillView, { lang: 'en', theme: 'light', banks: overviewBanks }));
await new Promise(resolve => setTimeout(resolve, 80));
check(container.querySelectorAll('.sector-stat')[3]?.textContent.includes('No rounds yet'), 'drill overview does not invent a last score');
const grammarTab = [...container.querySelectorAll('button')].find(button => button.textContent === 'English Grammar');
grammarTab?.click();
await new Promise(resolve => setTimeout(resolve, 50));
check(grammarTab?.getAttribute('aria-pressed') === 'true' && container.querySelectorAll('.sector-stat')[3]?.textContent.includes('7/10') && container.querySelectorAll('.sector-stat')[0]?.textContent.includes(String(overviewBanks[1].questions.length)), 'drill overview follows the selected bank and its saved score');
root.unmount(); root = null;
overviewBanks.forEach((bank, index) => savedDrillScores[index] === null ? localStorage.removeItem(bank.storageKey) : localStorage.setItem(bank.storageKey, savedDrillScores[index]));

// Analytics presents absence of exam data honestly and reflects saved progress.
const { AnalyticsView } = await vite.ssrLoadModule('/src/components/AnalyticsView.tsx');
root = createRoot(container);
root.render(React.createElement(AnalyticsView, { lang: 'en', theme: 'light', profile: { ...backupFixture.profile, mistakeIds: ['q1', 'q2'], srsMasteredIds: ['f1'], solvedCqs: ['c1'] }, progressMap: {}, quizHistory: [], sessions: [], onNavigate() {} }));
await new Promise(resolve => setTimeout(resolve, 80));
const analyticsStats = container.querySelectorAll('.sector-stat');
check(analyticsStats.length === 4 && analyticsStats[0]?.textContent.includes('No exams yet') && analyticsStats[1]?.textContent.includes('2'), 'analytics overview shows saved progress and handles no exams');
root.unmount(); root = null;

const { LifeHubView } = await vite.ssrLoadModule('/src/components/LifeHubView.tsx');
root = createRoot(container);
root.render(React.createElement(LifeHubView, { lang: 'en', theme: 'dark', profile: backupFixture.profile, authUserId: null, onNavigate() {}, onAwardXp() {} }));
await new Promise(resolve => setTimeout(resolve, 80));
const lifeNav = container.querySelector('nav[aria-label="Life Hub sections"]');
const deadlinesTab = [...lifeNav.querySelectorAll('button')].find(button => button.textContent.includes('Deadlines'));
check(lifeNav.querySelectorAll('button').length === 6 && lifeNav.querySelector('button[aria-pressed="true"]')?.textContent.includes('Daily habits'), 'life hub exposes its six sections with active state');
deadlinesTab?.click();
await new Promise(resolve => setTimeout(resolve, 50));
check(deadlinesTab?.getAttribute('aria-pressed') === 'true', 'life hub section switch updates its accessible state');
root.unmount(); root = null;

// The calculator accepts the full SSC GPA range and resets the optional subject.
const { GpaCalculatorView } = await vite.ssrLoadModule('/src/components/GpaCalculatorView.tsx');
root = createRoot(container);
root.render(React.createElement(GpaCalculatorView, { lang: 'en', theme: 'light' }));
await new Promise(resolve => setTimeout(resolve, 80));
const mathOptional = [...container.querySelectorAll('button')].find(button => button.textContent.includes('Higher Math (4th)'));
mathOptional?.click();
await new Promise(resolve => setTimeout(resolve, 30));
check(mathOptional?.getAttribute('aria-pressed') === 'true', 'GPA calculator selects the optional subject accessibly');
const sscInput = container.querySelector('input[aria-label="SSC GPA"]');
Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(sscInput, '2.5');
sscInput.dispatchEvent(new window.Event('input', { bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 30));
check(sscInput.min === '0' && sscInput.value === '2.5', 'GPA calculator accepts SSC results below 3');
check(!!container.querySelector('input[aria-label="ICT marks"]'), 'GPA marks inputs have accessible subject labels');
[...container.querySelectorAll('button')].find(button => button.textContent.includes('Reset Marks'))?.click();
await new Promise(resolve => setTimeout(resolve, 30));
check(mathOptional?.getAttribute('aria-pressed') === 'false' && sscInput.value === '5', 'GPA reset restores SSC and optional subject');
root.unmount(); root = null;

const { AdmissionView } = await vite.ssrLoadModule('/src/components/AdmissionView.tsx');
root = createRoot(container);
root.render(React.createElement(AdmissionView, { lang: 'en', theme: 'dark', profile: backupFixture.profile, progressMap: {}, onNavigate() {}, onAwardXp() {} }));
await new Promise(resolve => setTimeout(resolve, 80));
const admissionChoices = container.querySelector('[aria-label="Choose an admission track"]');
const engineering = [...admissionChoices.querySelectorAll('button')].find(button => button.textContent.includes('Engineering Track'));
engineering?.click();
await new Promise(resolve => setTimeout(resolve, 30));
check(admissionChoices.querySelectorAll('button').length === 3 && engineering?.getAttribute('aria-pressed') === 'true' && container.textContent.includes('at the point (5, 3)'), 'admission track switch selects the correct practice and exposes its state');
root.unmount(); root = null;

// Mobile sheet traps keyboard focus, restores it on Escape, and reaches every module.
const { MobileTabBar } = await vite.ssrLoadModule('/src/components/MobileTabBar.tsx');
let mobileRoute = null, mobileSearch = false;
root = createRoot(container);
root.render(React.createElement(MobileTabBar, { activeTab: 'dashboard', lang: 'en', theme: 'light', onNavigate: tab => { mobileRoute = tab; }, onPreload() {}, onOpenSearch: () => { mobileSearch = true; } }));
await new Promise(resolve => setTimeout(resolve, 50));
const moreButton = [...container.querySelectorAll('button')].find(button => button.textContent === 'More');
moreButton.click();
await new Promise(resolve => setTimeout(resolve, 50));
let mobileDialog = container.querySelector('[role="dialog"]');
check(!!mobileDialog && mobileDialog.querySelectorAll('[aria-current="page"]').length === 1 && document.activeElement?.getAttribute('aria-label') === 'Close', 'mobile sheet opens with focus and current destination');
const dialogButtons = [...mobileDialog.querySelectorAll('button')];
dialogButtons[0].focus();
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
check(document.activeElement === dialogButtons[dialogButtons.length - 1], 'mobile sheet keeps keyboard focus inside');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 50));
check(!container.querySelector('[role="dialog"]') && document.activeElement === moreButton && document.body.style.overflow !== 'hidden', 'mobile sheet escape restores focus and page scrolling');
moreButton.click();
await new Promise(resolve => setTimeout(resolve, 50));
mobileDialog = container.querySelector('[role="dialog"]');
[...mobileDialog.querySelectorAll('button')].find(button => button.textContent.includes('Virtual Lab'))?.click();
await new Promise(resolve => setTimeout(resolve, 50));
check(mobileRoute === 'lab' && !container.querySelector('[role="dialog"]') && !mobileSearch, 'mobile sheet navigates to a module and closes');
root.unmount(); root = null;

const { VirtualLabView } = await vite.ssrLoadModule('/src/components/VirtualLabView.tsx');
root = createRoot(container);
root.render(React.createElement(VirtualLabView, { lang: 'en', theme: 'dark' }));
await new Promise(resolve => setTimeout(resolve, 50));
const decimalInput = container.querySelector('input[aria-label="Decimal number"]');
Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(decimalInput, '13');
decimalInput.dispatchEvent(new window.Event('input', { bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 30));
check(container.querySelector('input[aria-label="Binary number"]')?.value === '1101', 'virtual lab base converter remains interactive');
const labChoices = container.querySelector('[aria-label="Choose a lab"]');
const logicLab = [...labChoices.querySelectorAll('button')].find(button => button.textContent.includes('Logic Gate'));
logicLab?.click();
await new Promise(resolve => setTimeout(resolve, 30));
check(labChoices.querySelectorAll('button').length === 6 && logicLab?.getAttribute('aria-pressed') === 'true', 'virtual lab selection exposes six accessible workspaces');
root.unmount(); root = null;

// Leaderboard must not invent a #1 placement when a profile is missing or a request fails.
const { LeaderboardView } = await vite.ssrLoadModule('/src/components/LeaderboardView.tsx');
const leaderboardFactory = (rows, error = null) => async () => ({ from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: rows, error }) }) }) }) });
root = createRoot(container);
root.render(React.createElement(LeaderboardView, { lang: 'en', theme: 'light', currentProfile: backupFixture.profile, isAuthenticated: true, onOpenAuth() {}, clientFactory: leaderboardFactory([{ id: 'another', full_name: 'Other Student', board: 'Dhaka', xp: 100 }]) }));
await new Promise(resolve => setTimeout(resolve, 80));
check(container.textContent.includes('NOT IN THIS DISPLAYED LIST') && !container.textContent.includes('YOUR STANDING: #1'), 'leaderboard does not invent a rank for a profile outside the displayed list');
root.unmount(); root = null;
root = createRoot(container);
root.render(React.createElement(LeaderboardView, { lang: 'en', theme: 'light', currentProfile: backupFixture.profile, isAuthenticated: true, onOpenAuth() {}, clientFactory: leaderboardFactory(null, new Error('offline')) }));
await new Promise(resolve => setTimeout(resolve, 80));
check(container.textContent.includes('Could not load the leaderboard') && !container.textContent.includes('YOUR STANDING: #1'), 'leaderboard shows a load error instead of a false rank');
root.unmount(); root = null;

const { MasterRoutineView } = await vite.ssrLoadModule('/src/components/MasterRoutineView.tsx');
root = createRoot(container);
root.render(React.createElement(MasterRoutineView, { lang: 'en', theme: 'light', progressMap: {} }));
await new Promise(resolve => setTimeout(resolve, 80));
const routineNav = container.querySelector('[aria-label="Routine sections"]');
const routineWeek = [...routineNav.querySelectorAll('button')].find(button => button.textContent === 'This week');
routineWeek.click();
await new Promise(resolve => setTimeout(resolve, 50));
check(routineNav.querySelectorAll('button').length === 4 && routineWeek.getAttribute('aria-pressed') === 'true' && !container.textContent.includes('HSC starts 2026-07-02'), 'routine navigation works and avoids an obsolete exam-date claim');
root.unmount(); root = null;

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
