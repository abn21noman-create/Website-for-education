import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';
import { isNativeAndroidHost } from '../lib/nativeFocus';

type AppLanguage = 'bn' | 'en';

function readLanguage(): AppLanguage {
  try {
    return JSON.parse(localStorage.getItem('hsc28_lang') || '"bn"') === 'en' ? 'en' : 'bn';
  } catch {
    return 'bn';
  }
}

/**
 * Global connection and PWA-update status.
 *
 * A waiting service worker is activated only after the student accepts the
 * update. This prevents an open, older tab from losing the lazy chunks it still
 * needs when a new deployment replaces the production alias.
 */
export function AppRuntimeStatus() {
  const [lang, setLang] = useState<AppLanguage>(() => readLanguage());
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [restored, setRestored] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [applyingUpdate, setApplyingUpdate] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const observer = new window.MutationObserver(() => setLang(readLanguage()));
    observer.observe(html, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let restoredTimer = 0;
    const onOffline = () => {
      window.clearTimeout(restoredTimer);
      setRestored(false);
      setOffline(true);
    };
    const onOnline = () => {
      setOffline(false);
      setRestored(true);
      window.clearTimeout(restoredTimer);
      restoredTimer = window.setTimeout(() => setRestored(false), 2600);
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.clearTimeout(restoredTimer);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    // The Android APK already contains a versioned, audited copy of every Vite
    // asset. Registering a PWA worker on the appassets origin would add a second
    // stale cache and could leave the native/web bridge versions mismatched.
    if (
      isNativeAndroidHost() ||
      !import.meta.env.PROD ||
      !('serviceWorker' in navigator)
    ) return;

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let updateFoundHandler: (() => void) | null = null;
    let installingStateHandler: (() => void) | null = null;
    let installingWorker: ServiceWorker | null = null;
    let hadController = Boolean(navigator.serviceWorker.controller);

    const offerWaitingWorker = (worker: ServiceWorker | null) => {
      if (!disposed && worker && navigator.serviceWorker.controller) {
        setWaitingWorker(worker);
      }
    };

    const onControllerChange = () => {
      // Every already-controlled tab must move to the matching deployment. On
      // the very first install there is no old controller, so no reload is needed.
      if (hadController) window.location.reload();
      else hadController = true;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && registration) {
        void registration.update().catch(() => {});
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    void navigator.serviceWorker.register('/sw.js').then((nextRegistration) => {
      if (disposed) return;
      registration = nextRegistration;
      offerWaitingWorker(nextRegistration.waiting);

      updateFoundHandler = () => {
        installingWorker = nextRegistration.installing;
        if (!installingWorker) return;
        installingStateHandler = () => {
          if (installingWorker?.state === 'installed') {
            offerWaitingWorker(nextRegistration.waiting || installingWorker);
          }
        };
        installingWorker.addEventListener('statechange', installingStateHandler);
      };
      nextRegistration.addEventListener('updatefound', updateFoundHandler);

      // Expose a tiny closure to the button without storing the whole
      // registration in React state.
      const worker = nextRegistration.waiting;
      if (worker && navigator.serviceWorker.controller) setWaitingWorker(worker);
    }).catch(() => {
      // Offline-first reading must stay usable even when registration fails.
    });

    const activate = (event: Event) => {
      const worker = (event as CustomEvent<ServiceWorker>).detail;
      if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
    };
    window.addEventListener('nokkhotro:activate-update', activate);

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('nokkhotro:activate-update', activate);
      if (registration && updateFoundHandler) {
        registration.removeEventListener('updatefound', updateFoundHandler);
      }
      if (installingWorker && installingStateHandler) {
        installingWorker.removeEventListener('statechange', installingStateHandler);
      }
    };
  }, []);

  const bn = lang === 'bn';

  const applyUpdate = () => {
    if (!waitingWorker) return;
    setApplyingUpdate(true);
    window.dispatchEvent(
      new CustomEvent<ServiceWorker>('nokkhotro:activate-update', { detail: waitingWorker })
    );
  };

  if (!offline && !restored && !waitingWorker) return null;

  return (
    <div className="runtime-status-stack no-print" aria-live="polite" aria-atomic="true">
      {offline && (
        <div className="runtime-status offline" role="status">
          <span className="runtime-status-icon"><CloudOff size={17} /></span>
          <div>
            <strong>{bn ? 'তুমি এখন অফলাইনে' : 'You are offline'}</strong>
            <small>{bn ? 'কাজ ডিভাইসে থাকবে; নেট এলে সিঙ্ক হবে।' : 'Work stays on this device and syncs when connected.'}</small>
          </div>
        </div>
      )}

      {!offline && restored && (
        <div className="runtime-status restored" role="status">
          <span className="runtime-status-icon"><CheckCircle2 size={17} /></span>
          <div>
            <strong>{bn ? 'ইন্টারনেট ফিরে এসেছে' : 'You are back online'}</strong>
            <small>{bn ? 'বাকি কাজগুলো সিঙ্ক হচ্ছে।' : 'Pending work is syncing now.'}</small>
          </div>
        </div>
      )}

      {!offline && waitingWorker && (
        <div className="runtime-status update" role="status">
          <span className="runtime-status-icon"><RefreshCw className={applyingUpdate ? 'animate-spin' : ''} size={17} /></span>
          <div>
            <strong>{bn ? 'নতুন সংস্করণ প্রস্তুত' : 'A new version is ready'}</strong>
            <small>{bn ? 'নিরাপদে আপডেট করতে একবার রিফ্রেশ হবে।' : 'The app will refresh once to update safely.'}</small>
          </div>
          <button type="button" onClick={applyUpdate} disabled={applyingUpdate}>
            {applyingUpdate ? (bn ? 'আপডেট হচ্ছে…' : 'Updating…') : (bn ? 'আপডেট' : 'Update')}
          </button>
        </div>
      )}
    </div>
  );
}
