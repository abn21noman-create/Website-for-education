import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

function readLanguage(): 'bn' | 'en' {
  try {
    return JSON.parse(localStorage.getItem('hsc28_lang') || '"bn"') === 'en' ? 'en' : 'bn';
  } catch {
    return 'bn';
  }
}

/**
 * Last-resort recovery screen for render and lazy-chunk failures.
 *
 * Study data is deliberately never cleared here. A reload is enough for a
 * newly activated service worker or a transient chunk failure, while "try
 * again" lets React recover without leaving the current page.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep technical detail in the developer console; never expose stack traces
    // or backend information on the student-facing recovery screen.
    console.error('Nokkhotro UI recovery boundary', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const bn = readLanguage() === 'bn';
    return (
      <main className="app-recovery" role="alert" data-app-error-boundary="true">
        <section className="app-recovery-card">
          <div className="app-recovery-mark" aria-hidden="true">✦</div>
          <p className="app-recovery-kicker">NOKKHOTRO · SAFE RECOVERY</p>
          <h1>{bn ? 'অ্যাপটি ঠিকভাবে দেখানো যায়নি' : 'The app could not be displayed'}</h1>
          <p>
            {bn
              ? 'তোমার পড়াশোনার ডেটা মুছে যায়নি। আবার চেষ্টা করো, অথবা সর্বশেষ সংস্করণ চালু করতে অ্যাপটি রিলোড করো।'
              : 'Your study data has not been deleted. Try again, or reload to open the latest version of the app.'}
          </p>
          <div className="app-recovery-actions">
            <button type="button" onClick={() => this.setState({ hasError: false })}>
              {bn ? 'আবার চেষ্টা করুন' : 'Try again'}
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              {bn ? 'অ্যাপ রিলোড করুন' : 'Reload app'}
            </button>
          </div>
          <small>{bn ? 'লোকাল ও ক্লাউড ডেটা নিরাপদ থাকবে।' : 'Local and cloud data remain safe.'}</small>
        </section>
      </main>
    );
  }
}
