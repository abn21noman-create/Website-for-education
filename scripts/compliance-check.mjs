/** Play/privacy compliance regressions that do not require a live account. */
import { readFile, readdir } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

let failures = 0;
function check(condition, label) {
  console.log(`${condition ? '✓' : '✗'} ${label}`);
  if (!condition) failures += 1;
}

const [mainSource, appSource, edgeSource, migrationSource, policySource, playSource] = await Promise.all([
  readFile(new URL('../src/main.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/delete-account/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/2026-11-07-account-deletion.sql', import.meta.url), 'utf8'),
  readFile(new URL('../PRIVACY.md', import.meta.url), 'utf8'),
  readFile(new URL('../docs/play-data-safety.md', import.meta.url), 'utf8'),
]);

const srcFiles = (await readdir(new URL('../src', import.meta.url), { recursive: true }))
  .filter((name) => /\.(?:ts|tsx)$/.test(name));
const browserSource = (await Promise.all(srcFiles.map((name) =>
  readFile(new URL(`../src/${name}`, import.meta.url), 'utf8')
))).join('\n');

check(
  mainSource.includes('getPublicRoute(window.location.pathname)') &&
  mainSource.includes('publicRoute ?') && mainSource.includes('<AuthGate />'),
  'public legal paths are selected before the authentication gate'
);
check(
  !browserSource.includes('SUPABASE_SERVICE_ROLE_KEY') &&
  edgeSource.includes("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')") &&
  edgeSource.includes('auth.getUser(accessToken)') &&
  edgeSource.includes('verified.user.id') &&
  edgeSource.includes('false,') &&
  !/payload\.(?:userId|user_id)/.test(edgeSource),
  'only the server function has service-role access and it deletes the verified JWT user'
);
check(
  edgeSource.includes("request.method === 'OPTIONS'") &&
  edgeSource.includes('MAX_LAST_SIGN_IN_AGE_MS') &&
  edgeSource.includes("payload.confirmation !== CONFIRMATION") &&
  edgeSource.includes("'Cache-Control': 'no-store'"),
  'deletion endpoint handles CORS, typed confirmation, recent reauthentication and no-store responses'
);
check(
  appSource.includes('pauseSyncUser(deletingUserId);') &&
  !appSource.includes('pauseSyncUser(deletingUserId, true)') &&
  appSource.indexOf('pauseSyncUser(deletingUserId);') < appSource.indexOf('await deleteCurrentAccount(password)') &&
  appSource.includes('resumeSyncUser(deletingUserId)'),
  'deletion pauses writes without losing the retry queue and resumes safely on failure'
);
check(
  migrationSource.includes('BEFORE DELETE ON auth.users') &&
  migrationSource.includes('hsc28_purge_account_before_auth_delete') &&
  migrationSource.includes('ON DELETE CASCADE NOT VALID') &&
  migrationSource.includes('DELETE FROM public.hsc28_admin_allowlist') &&
  migrationSource.includes('SET upvotes =') &&
  migrationSource.includes('TO authenticated USING (true)') &&
  !migrationSource.includes('TO anon, authenticated'),
  'Auth deletion transaction covers private/admin/community data and authenticated-only forum reads'
);
check(
  policySource.includes('https://nokkhotro-hsc-2028.vercel.app/privacy') &&
  policySource.includes('https://nokkhotro-hsc-2028.vercel.app/account-deletion') &&
  policySource.includes('Focus Lock state and the live countdown stay on the device') &&
  policySource.includes('rolling operational retention period') &&
  playSource.includes('Health and fitness') && playSource.includes('service-role key'),
  'public policy and Play worksheet disclose collection, Focus Lock, retention and deletion'
);

const dom = new JSDOM('<!doctype html><html><head><meta name="description"><link rel="canonical" href="http://localhost/"></head><body><div id="root"></div></body></html>', {
  url: 'http://localhost/privacy',
  pretendToBeVisual: true,
});
const { window } = dom;
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;
global.Storage = window.Storage;
global.HTMLElement = window.HTMLElement;
global.Node = window.Node;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.getComputedStyle = window.getComputedStyle;
if (!globalThis.crypto) Object.defineProperty(global, 'crypto', { value: window.crypto, configurable: true });

const vite = await createServer({
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
  appType: 'custom',
  logLevel: 'error',
});
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const urls = await vite.ssrLoadModule('/src/lib/publicUrls.ts');
const pages = await vite.ssrLoadModule('/src/components/PublicLegalPages.tsx');
const accountDeletion = await vite.ssrLoadModule('/src/lib/accountDeletion.ts');

check(
  urls.getPublicRoute('/privacy') === 'privacy' &&
  urls.getPublicRoute('/privacy/') === 'privacy' &&
  urls.getPublicRoute('/account-deletion') === 'account-deletion' &&
  urls.getPublicRoute('/') === null,
  'only the two clean public paths bypass normal authentication'
);

const container = document.getElementById('root');
let root = createRoot(container);
root.render(React.createElement(pages.PrivacyPolicyPage));
await new Promise((resolve) => setTimeout(resolve, 80));
check(
  container.textContent.includes('Your study space. Your data.') &&
  container.textContent.includes('No ads or sale of personal data') &&
  container.textContent.includes('Focus Lock stays local') &&
  container.querySelector(`a[href="${urls.ACCOUNT_DELETION_URL}"]`) &&
  document.querySelector('link[rel="canonical"]').href === urls.PRIVACY_POLICY_URL,
  'signed-out Privacy Policy renders collection, no-ads, Focus Lock and deletion disclosures'
);
root.unmount();
container.innerHTML = '';

const signedOutClient = {
  auth: {
    async getSession() { return { data: { session: null }, error: null }; },
    onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
    async signInWithPassword() { return { data: { session: null }, error: new Error('invalid login credentials') }; },
    async signOut() { return { error: null }; },
  },
};
const signedOutFactory = async () => signedOutClient;
window.history.replaceState(null, '', '/account-deletion');
root = createRoot(container);
root.render(React.createElement(pages.AccountDeletionPage, { clientFactory: signedOutFactory }));
await new Promise((resolve) => setTimeout(resolve, 100));
check(
  container.textContent.includes('Delete your account and associated data') &&
  container.textContent.includes('Only the account owner can initiate deletion') &&
  container.textContent.includes('What will be deleted') &&
  !!container.querySelector('input[type="email"]') &&
  !container.textContent.includes('instructions only'),
  'public deletion route is an actionable signed-out owner-verification flow'
);
root.unmount();
container.innerHTML = '';

const { AuthModal } = await vite.ssrLoadModule('/src/components/AuthModal.tsx');
const syntheticProfile = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'student@example.invalid',
  fullName: 'Synthetic Student',
  collegeName: 'Example College',
  board: 'Jashore',
  targetGoal: 'BUET / Engineering',
  avatarColor: '#4f46e5',
  xp: 10,
  chaptersMastered: 0,
  quizzesTaken: 0,
  bestAccuracy: 0,
  studyMinutes: 0,
  streakDays: 1,
  bookmarks: [], solvedCqs: [], mistakeIds: [], srsMasteredIds: [], completedPracticals: [],
  leaderboardVisible: false,
};
root = createRoot(container);
root.render(React.createElement(AuthModal, {
  isOpen: true,
  onClose() {},
  lang: 'en', theme: 'light', profile: syntheticProfile, isAuthenticated: true,
  async onAuthSuccess() {}, async onSignOut() {}, async onClearStudyData() {},
  async onDeleteAccount() {}, async onUpdateProfileMeta() {},
}));
await new Promise((resolve) => setTimeout(resolve, 60));
const openFullDeletion = [...container.querySelectorAll('button')].find((button) =>
  button.textContent.includes('Permanently delete account and all associated data')
);
openFullDeletion?.click();
await new Promise((resolve) => setTimeout(resolve, 40));
const inAppDeleteButton = [...container.querySelectorAll('button')].find((button) =>
  button.textContent.includes('Yes, permanently delete my account')
);
check(
  container.textContent.includes('Reset study data only — keep my account') &&
  !!container.querySelector('input[type="password"][autocomplete="current-password"]') &&
  !!container.querySelector('input[placeholder="DELETE"]') &&
  !!container.querySelector('input[type="checkbox"]') &&
  inAppDeleteButton?.disabled === true,
  'in-app reset and full deletion are distinct, with password, typed phrase and acknowledgement gates'
);
root.unmount();
container.innerHTML = '';

const userId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
localStorage.clear();
sessionStorage.clear();
localStorage.setItem('nokkhotro_local_owner_v1', userId);
localStorage.setItem('hsc28_profile', JSON.stringify({ id: userId, fullName: 'Synthetic Student' }));
localStorage.setItem('hsc28_tasks', '["private"]');
localStorage.setItem(`nokkhotro_local_space_v1_${userId}`, '{"hsc28_tasks":"[]"}');
localStorage.setItem(`nokkhotro_local_space_v1_${otherId}`, '{"hsc28_tasks":"[1]"}');
localStorage.setItem('hsc28_sync_queue', JSON.stringify([
  { userId, key: 'deleted-op' },
  { userId: otherId, key: 'other-op' },
]));
localStorage.setItem('nokkhotro_hsc28_auth', 'synthetic-session');

const sequence = [];
let invokedBody = null;
const deletionClient = {
  auth: {
    async getUser() {
      sequence.push('getUser');
      return { data: { user: { id: userId, email: 'student@example.invalid' } }, error: null };
    },
    async signInWithPassword(credentials) {
      sequence.push('reauth');
      return { data: { user: { id: userId, email: credentials.email }, session: {} }, error: null };
    },
    async signOut() { sequence.push('signOut'); return { error: null }; },
  },
  functions: {
    async invoke(name, options) {
      sequence.push(name);
      invokedBody = options.body;
      return { data: { deleted: true }, error: null };
    },
  },
};
const deletedResult = await accountDeletion.deleteCurrentAccount('correct password', async () => deletionClient);
const remainingQueue = JSON.parse(localStorage.getItem('hsc28_sync_queue') || '[]');
check(
  deletedResult.userId === userId &&
  sequence.join(',') === 'getUser,reauth,delete-account,signOut' &&
  invokedBody.confirmation === 'DELETE_MY_ACCOUNT' &&
  !('userId' in invokedBody) &&
  localStorage.getItem('hsc28_profile') === null &&
  localStorage.getItem(`nokkhotro_local_space_v1_${userId}`) === null &&
  localStorage.getItem(`nokkhotro_local_space_v1_${otherId}`) !== null &&
  remainingQueue.length === 1 && remainingQueue[0].userId === otherId &&
  localStorage.getItem('nokkhotro_hsc28_auth') === null,
  'confirmed deletion reauthenticates, sends no target ID, clears only that account and signs out locally'
);

localStorage.setItem(`nokkhotro_local_space_v1_${userId}`, '{"hsc28_tasks":"[\"retry\"]"}');
localStorage.setItem('hsc28_sync_queue', JSON.stringify([
  { userId, key: 'retry-op' },
  { userId: otherId, key: 'other-op' },
]));
let invokedAfterBadPassword = false;
const badPasswordClient = {
  auth: {
    async getUser() { return { data: { user: { id: userId, email: 'student@example.invalid' } }, error: null }; },
    async signInWithPassword() { return { data: { user: null }, error: new Error('Invalid login credentials') }; },
  },
  functions: { async invoke() { invokedAfterBadPassword = true; return { data: { deleted: true }, error: null }; } },
};
let badPasswordCode = '';
try {
  await accountDeletion.deleteCurrentAccount('wrong', async () => badPasswordClient);
} catch (error) {
  badPasswordCode = error.code;
}
check(
  badPasswordCode === 'invalid_password' &&
  !invokedAfterBadPassword &&
  localStorage.getItem(`nokkhotro_local_space_v1_${userId}`) !== null &&
  JSON.parse(localStorage.getItem('hsc28_sync_queue') || '[]').some((item) => item.userId === userId),
  'an incorrect current password cannot reach the endpoint or erase retryable local work'
);

await vite.close();
dom.window.close();
console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
