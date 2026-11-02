/** Execute the actual Vite output as ES modules in jsdom, without rebundling it. */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { SourceTextModule } from 'node:vm';

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
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => errors.push(error));
virtualConsole.on('error', (...args) => errors.push(new Error(args.map(String).join(' '))));
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
const { window } = dom;
window.matchMedia = query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } });
window.scrollTo = () => {};
window.fetch = async () => ({ ok: true });
// Avoid prefetching lazy routes: this check is for the production entry boot.
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
try {
  const mod = await load(resolve(dist, entry.replace(/^\//, '')));
  await mod.link(linker);
  await mod.evaluate();
  await new Promise(resolve => setTimeout(resolve, 500));
  if (errors.length) throw new AggregateError(errors, 'Production boot reported errors');
  if (!window.document.querySelector('#root')?.children.length) throw new Error('Production boot left #root empty');
  if (!window.document.querySelector('#root input[type=email]')) throw new Error('Signed-out production boot did not render the login form');
  if (window.document.querySelector('#root nav')) throw new Error('Signed-out production boot exposed app navigation');
  console.log('PASS: production bundle booted and rendered #root');
} finally {
  dom.window.close();
}
