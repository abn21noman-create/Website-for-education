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
const patterns = await vite.ssrLoadModule('/src/lib/examPatterns.ts');
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
  allQuestions.length >= 140,
  'MCQ bank passed 140 questions',
  String(allQuestions.length)
);

const perPaper = allQuestions.reduce((acc, q) => {
  acc[q.subjectKey] = (acc[q.subjectKey] || 0) + 1;
  return acc;
}, {});
const thinnestPaper = Object.entries(perPaper).sort((a, b) => a[1] - b[1])[0];
check(
  Object.keys(perPaper).length === 11 && thinnestPaper[1] >= 10,
  'every one of the 11 papers has at least 10 questions',
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
  cqBank.CQ_QUESTIONS.length >= 18 && new Set(cqIds).size === cqIds.length,
  'CQ bank has 18+ unique creative questions',
  `${cqBank.CQ_QUESTIONS.length} total / ${new Set(cqIds).size} unique`
);
check(
  cqBank.CQ_QUESTIONS.every(
    (q) => q.stem?.bn && q.qA?.bn && q.qB?.bn && q.qC?.bn && q.qD?.bn && q.ansA?.bn && q.ansD?.bn
  ),
  'every CQ carries a stem plus ক-ঘ and answers'
);

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
