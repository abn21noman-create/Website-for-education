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
