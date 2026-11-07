export const ACCESSIBILITY_STORAGE_KEY = 'hsc28_accessibility_v1';
export const ACCESSIBILITY_CHANGE_EVENT = 'hsc28:accessibility-changed';

export type ReadingScale = 'default' | 'large' | 'xlarge';
export type MotionPreference = 'system' | 'reduce';

export interface AccessibilityPreferences {
  version: 1;
  readingScale: ReadingScale;
  highContrast: boolean;
  motion: MotionPreference;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  version: 1,
  readingScale: 'default',
  highContrast: false,
  motion: 'system',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Treat saved preferences as untrusted input. Older, partial or malformed
 * values fall back one field at a time instead of breaking the app shell.
 */
export function normalizeAccessibilityPreferences(
  value: unknown
): AccessibilityPreferences {
  if (!isRecord(value)) return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };

  const readingScale: ReadingScale =
    value.readingScale === 'large' || value.readingScale === 'xlarge'
      ? value.readingScale
      : 'default';
  const motion: MotionPreference = value.motion === 'reduce' ? 'reduce' : 'system';

  return {
    version: 1,
    readingScale,
    highContrast: value.highContrast === true,
    motion,
  };
}

export function loadAccessibilityPreferences(): AccessibilityPreferences {
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    return normalizeAccessibilityPreferences(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
  }
}

/** Apply before React paints as well as after every in-app change. */
export function applyAccessibilityPreferences(
  preferences: AccessibilityPreferences,
  root: HTMLElement = document.documentElement
): void {
  const safe = normalizeAccessibilityPreferences(preferences);
  root.dataset.readingScale = safe.readingScale;
  root.dataset.contrast = safe.highContrast ? 'high' : 'standard';
  root.dataset.motion = safe.motion;
}

function announceChange(preferences: AccessibilityPreferences): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AccessibilityPreferences>(ACCESSIBILITY_CHANGE_EVENT, {
      detail: preferences,
    })
  );
}

/**
 * Returns false only when the browser blocks persistence. The visual choice is
 * still applied for the current tab, and the settings UI explains that state.
 */
export function saveAccessibilityPreferences(
  preferences: AccessibilityPreferences
): boolean {
  const safe = normalizeAccessibilityPreferences(preferences);
  applyAccessibilityPreferences(safe);
  let saved = true;
  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    saved = false;
  }
  announceChange(safe);
  return saved;
}

/** Re-read after account switching, cloud restore or portable backup import. */
export function refreshAccessibilityPreferences(): AccessibilityPreferences {
  const preferences = loadAccessibilityPreferences();
  applyAccessibilityPreferences(preferences);
  announceChange(preferences);
  return preferences;
}
