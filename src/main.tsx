import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AppRuntimeStatus } from './components/AppRuntimeStatus';
import { AuthGate } from './components/AuthGate';
import { PublicLegalPage } from './components/PublicLegalPages';
import { getPublicRoute } from './lib/publicUrls';
import {
  applyAccessibilityPreferences,
  loadAccessibilityPreferences,
} from './lib/accessibility';

// Restore the chosen appearance before React paints the authentication gate.
// App.tsx keeps this in sync after authentication; doing the first read here
// prevents a signed-out dark-mode student from seeing a light-only flash.
try {
  const dark = JSON.parse(localStorage.getItem('hsc28_soft_theme') || '"light"') === 'dark';
  document.documentElement.classList.toggle('dark', dark);
} catch {
  document.documentElement.classList.remove('dark');
}

// Reading size, contrast and motion are restored in the same pre-paint window,
// so the public login and app shell do not jump after React mounts.
applyAccessibilityPreferences(loadAccessibilityPreferences());

const publicRoute = getPublicRoute(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      {publicRoute ? <PublicLegalPage route={publicRoute} /> : <AuthGate />}
    </AppErrorBoundary>
    {!publicRoute && <AppRuntimeStatus />}
  </StrictMode>
);
