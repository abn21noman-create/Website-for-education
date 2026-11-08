/**
 * Narrow adapter for the audited Android host.
 *
 * The browser build deliberately keeps working when this object is absent. The
 * Android bridge can only request/release Android's documented Lock Task mode;
 * it does not expose arbitrary native APIs to the bundled web application.
 */

export const NATIVE_FOCUS_ACTIVE_EVENT = 'nokkhotro:native-focus-active';
export const NATIVE_FOCUS_LOST_EVENT = 'nokkhotro:native-focus-lost';

interface NokkhotroNativeBridge {
  getCapabilities: () => string;
  getFocusState: () => string;
  startFocusSession: (durationSeconds: number, label: string) => string;
  stopFocusSession: () => boolean;
}

declare global {
  interface Window {
    NokkhotroNative?: NokkhotroNativeBridge;
  }
}

export interface NativeHostCapabilities {
  platform: 'android';
  bridgeVersion: 1;
  focusLock: true;
  lockTask: true;
  managedKiosk: boolean;
  appVersion: string;
}

export interface NativeFocusState {
  state: 'active' | 'inactive';
  requested: boolean;
  lockTaskMode: number;
  managedKiosk: boolean;
}

function getBridge(): NokkhotroNativeBridge | null {
  if (typeof window === 'undefined') return null;
  const bridge = window.NokkhotroNative;
  if (
    !bridge ||
    typeof bridge.getCapabilities !== 'function' ||
    typeof bridge.getFocusState !== 'function' ||
    typeof bridge.startFocusSession !== 'function' ||
    typeof bridge.stopFocusSession !== 'function'
  ) {
    return null;
  }
  return bridge;
}

function parseObject(raw: string): Record<string, unknown> | null {
  if (typeof raw !== 'string' || raw.length > 2_000) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function getNativeHostCapabilities(): NativeHostCapabilities | null {
  const bridge = getBridge();
  if (!bridge) return null;
  try {
    const value = parseObject(bridge.getCapabilities());
    if (
      !value ||
      value.platform !== 'android' ||
      value.bridgeVersion !== 1 ||
      value.focusLock !== true ||
      value.lockTask !== true ||
      typeof value.managedKiosk !== 'boolean' ||
      typeof value.appVersion !== 'string'
    ) {
      return null;
    }
    return {
      platform: 'android',
      bridgeVersion: 1,
      focusLock: true,
      lockTask: true,
      managedKiosk: value.managedKiosk,
      appVersion: value.appVersion.slice(0, 80),
    };
  } catch {
    return null;
  }
}

export function isNativeAndroidHost(): boolean {
  return getNativeHostCapabilities() !== null;
}

export function readNativeFocusState(): NativeFocusState | null {
  const bridge = getBridge();
  if (!bridge) return null;
  try {
    const value = parseObject(bridge.getFocusState());
    if (
      !value ||
      (value.state !== 'active' && value.state !== 'inactive') ||
      typeof value.requested !== 'boolean' ||
      typeof value.lockTaskMode !== 'number' ||
      !Number.isInteger(value.lockTaskMode) ||
      typeof value.managedKiosk !== 'boolean'
    ) {
      return null;
    }
    return {
      state: value.state,
      requested: value.requested,
      lockTaskMode: value.lockTaskMode,
      managedKiosk: value.managedKiosk,
    };
  } catch {
    return null;
  }
}

/** Returns true when a valid native host accepted the request for processing. */
export function requestNativeFocusLock(durationSeconds: number, label: string): boolean {
  const bridge = getBridge();
  if (
    !bridge ||
    !getNativeHostCapabilities() ||
    !Number.isInteger(durationSeconds) ||
    durationSeconds < 60 ||
    durationSeconds > 2 * 60 * 60
  ) return false;
  try {
    // Kotlin validates again. Keep this boundary small even if app data is bad.
    const raw = bridge.startFocusSession(
      durationSeconds,
      label.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 160)
    );
    return parseObject(raw)?.accepted === true;
  } catch {
    return false;
  }
}

/** Best-effort release; safe to call in the normal browser build. */
export function releaseNativeFocusLock(): boolean {
  const bridge = getBridge();
  if (!bridge || !getNativeHostCapabilities()) return false;
  try {
    bridge.stopFocusSession();
    return true;
  } catch {
    return false;
  }
}
