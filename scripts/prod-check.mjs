/** Execute the actual Vite output as ES modules in jsdom, without rebundling it. */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { SourceTextModule } from 'node:vm';
import { spawnSync } from 'node:child_process';

const dist = resolve('dist');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
const entry = html.match(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/)?.[1];
if (!entry) throw new Error('No module entry in dist/index.html; run npm run build first');
// The manual theme toggle must override the OS color scheme in the built CSS.
const cssPath = html.match(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/)?.[1];
if (!cssPath) throw new Error('No production stylesheet found');
const css = await readFile(resolve(dist, cssPath.replace(/^\//, '')), 'utf8');
if (!css.includes(':where(.dark,.dark *)')) throw new Error('Production dark variants do not follow the manual theme class');
if (!css.includes('hind-siliguri-bengali-')) throw new Error('Production Bengali font is missing');

// Keep the deployment and first-load font surface bounded to Bengali + Latin.
const assetFiles = await readdir(resolve(dist, 'assets'));
const fontFiles = assetFiles.filter(file => /\.woff2?$/.test(file));
if (fontFiles.length > 16) throw new Error(`Font bundle regressed to ${fontFiles.length} files`);
if (fontFiles.some(file => /(?:cyrillic|greek|vietnamese|latin-ext)/.test(file))) {
  throw new Error('Production contains an unused font language subset');
}

// Deployment headers are part of the security boundary, not optional hosting
// documentation. Keep them under the same production check as the app bundle.
const vercel = JSON.parse(await readFile(resolve('vercel.json'), 'utf8'));
const allHeaders = (vercel.headers || []).flatMap(rule => rule.headers || []);
const headerValue = key => allHeaders.find(header => header.key.toLowerCase() === key.toLowerCase())?.value || '';
const csp = headerValue('Content-Security-Policy');
if (!csp.includes("default-src 'self'") || !csp.includes("frame-ancestors 'none'") || !csp.includes('https://*.supabase.co')) {
  throw new Error('Production Content-Security-Policy is missing a required boundary');
}
for (const header of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
  if (!headerValue(header)) throw new Error(`Production security header missing: ${header}`);
}

const sw = await readFile(resolve(dist, 'sw.js'), 'utf8');
const installSection = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('message'"));
if (/self\.skipWaiting\s*\(/.test(installSection)) throw new Error('Service worker still activates over an open app without consent');
if (!sw.includes("event.data?.type === 'SKIP_WAITING'") || !sw.includes('url.origin !== self.location.origin')) {
  throw new Error('Service-worker update or same-origin cache guard is missing');
}

async function bootProduction(url) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  virtualConsole.on('error', (...args) => errors.push(new Error(args.map(String).join(' '))));
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const { window } = dom;
  window.matchMedia = query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } });
  window.scrollTo = () => {};
  window.fetch = async () => ({ ok: true });
  // Avoid prefetching lazy study routes: this check is for production entry boot.
  window.requestIdleCallback = () => 0;
  window.HTMLCanvasElement.prototype.getContext = () => null;
  window.addEventListener('error', event => errors.push(event.error || new Error(event.message)));
  window.addEventListener('unhandledrejection', event => errors.push(event.reason));
  const context = dom.getInternalVMContext();
  const modules = new Map();
  async function load(path) {
    const file = resolve(path);
    if (relative(dist, file).startsWith('..')) throw new Error(`Module outside dist: ${file}`);
    if (!modules.has(file)) {
      const source = await readFile(file, 'utf8');
      modules.set(file, new SourceTextModule(source, {
        context, identifier: file,
        initializeImportMeta(meta) { meta.url = `http://localhost/${relative(dist, file)}`; },
        importModuleDynamically: async (specifier, parent) => {
          const mod = await load(resolve(dirname(parent.identifier), specifier));
          if (mod.status === 'unlinked') await mod.link(linker);
          if (mod.status === 'linked') await mod.evaluate();
          return mod;
        },
      }));
    }
    return modules.get(file);
  }
  async function linker(specifier, parent) { return load(resolve(dirname(parent.identifier), specifier)); }

  const mod = await load(resolve(dist, entry.replace(/^\//, '')));
  await mod.link(linker);
  await mod.evaluate();
  await new Promise(resolve => setTimeout(resolve, 700));
  if (errors.length) throw new AggregateError(errors, `Production boot reported errors at ${url}`);
  if (!window.document.querySelector('#root')?.children.length) throw new Error(`Production boot left #root empty at ${url}`);
  return { dom, window };
}

async function verifyRoute(route) {
  const url = route === 'privacy'
    ? 'http://localhost/privacy'
    : route === 'deletion'
      ? 'http://localhost/account-deletion'
      : 'http://localhost/';
  const boot = await bootProduction(url);
  try {
    if (route === 'home') {
      if (!boot.window.document.querySelector('#root input[type=email]')) throw new Error('Signed-out production boot did not render the login form');
      if (boot.window.document.querySelector('#root nav.premium-sidebar')) throw new Error('Signed-out production boot exposed app navigation');
      console.log('PASS: signed-out production bundle rendered the authentication gate');
      return;
    }

    const text = boot.window.document.querySelector('#root')?.textContent || '';
    if (route === 'privacy') {
      if (!text.includes('Your study space. Your data.') || !text.includes('Focus Lock stays local')) {
        throw new Error('Public production privacy route did not render its substantive policy');
      }
      if (boot.window.document.querySelector('#root input[type=email]')) throw new Error('Privacy route was blocked by authentication');
      console.log('PASS: production /privacy is public and substantive');
      return;
    }

    if (!text.includes('Delete your account and associated data') || !text.includes('What will be deleted')) {
      throw new Error('Public production account-deletion route did not render its deletion flow');
    }
    if (!boot.window.document.querySelector('#root input[type=email]')) {
      throw new Error('Public account-deletion route is not actionable while signed out');
    }
    console.log('PASS: production /account-deletion exposes owner verification and deletion initiation');
  } finally {
    boot.dom.window.close();
  }
}

const childRoute = process.env.NOKKHOTRO_PROD_CHECK_ROUTE;
if (childRoute) {
  await verifyRoute(childRoute);
} else {
  // vm.SourceTextModule dynamic-import caches are process-scoped in Node. Run
  // each clean-path boot in an isolated child so every check mirrors a fresh
  // browser navigation and cannot share a React module instance across realms.
  for (const route of ['home', 'privacy', 'deletion']) {
    const result = spawnSync(
      process.execPath,
      [...process.execArgv, process.argv[1]],
      {
        cwd: process.cwd(),
        env: { ...process.env, NOKKHOTRO_PROD_CHECK_ROUTE: route },
        stdio: 'inherit',
      }
    );
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
