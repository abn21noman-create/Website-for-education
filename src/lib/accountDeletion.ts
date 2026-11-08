import type { SupabaseClient } from '@supabase/supabase-js';
import { clearDeletedAccountSpace } from './accountSpace';
import { getSupabase } from './supabase';

export const ACCOUNT_DELETION_FUNCTION = 'delete-account';
export const ACCOUNT_DELETION_CONFIRMATION = 'DELETE_MY_ACCOUNT';

export type AccountDeletionErrorCode =
  | 'not_authenticated'
  | 'email_unavailable'
  | 'invalid_password'
  | 'reauthentication_required'
  | 'service_unavailable'
  | 'deletion_failed';

export class AccountDeletionError extends Error {
  readonly code: AccountDeletionErrorCode;

  constructor(code: AccountDeletionErrorCode) {
    super(code);
    this.name = 'AccountDeletionError';
    this.code = code;
  }
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : '';
}

async function functionErrorCode(error: unknown): Promise<string> {
  const candidate = error as { context?: unknown } | null;
  const context = candidate?.context;
  if (typeof Response !== 'undefined' && context instanceof Response) {
    try {
      const body = await context.clone().json() as { code?: unknown };
      return typeof body.code === 'string' ? body.code : '';
    } catch {
      // Fall through to the stable client-side error mapping below.
    }
  }
  return '';
}

/** Remove the local Supabase session only after the server confirms deletion. */
function clearLocalAuthStorage(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('nokkhotro_hsc28_auth')) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage may be disabled. Supabase's in-memory session is still signed out.
  }
}

/**
 * Reauthenticate with the account's current password, then ask the protected
 * Edge Function to delete only the user represented by the verified JWT. The
 * browser never receives a service-role credential or a target user ID.
 */
export async function deleteCurrentAccount(
  password: string,
  clientFactory: () => Promise<SupabaseClient> = getSupabase
): Promise<{ userId: string }> {
  const client = await clientFactory();
  const { data: current, error: currentError } = await client.auth.getUser();
  if (currentError || !current.user) throw new AccountDeletionError('not_authenticated');
  if (!current.user.email) throw new AccountDeletionError('email_unavailable');

  const userId = current.user.id;
  const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({
    email: current.user.email,
    password,
  });
  if (signInError || !signedIn.user || signedIn.user.id !== userId) {
    const text = errorText(signInError);
    throw new AccountDeletionError(
      /fetch|network|offline|timeout/i.test(text) ? 'service_unavailable' : 'invalid_password'
    );
  }

  const { data, error } = await client.functions.invoke(ACCOUNT_DELETION_FUNCTION, {
    body: { confirmation: ACCOUNT_DELETION_CONFIRMATION },
  });

  if (error) {
    const code = await functionErrorCode(error);
    if (code === 'reauthentication_required') {
      throw new AccountDeletionError('reauthentication_required');
    }
    if (/fetch|network|offline|timeout/i.test(errorText(error))) {
      throw new AccountDeletionError('service_unavailable');
    }
    throw new AccountDeletionError('deletion_failed');
  }
  if (!data || data.deleted !== true) throw new AccountDeletionError('deletion_failed');

  // The live account is already gone. From this point cleanup is best-effort
  // and must never turn a successful server deletion into a misleading error.
  try { clearDeletedAccountSpace(userId); } catch { /* storage can be blocked */ }
  try { sessionStorage.removeItem('hsc28_vault_reloaded'); } catch { /* ignored */ }
  try { await client.auth.signOut({ scope: 'local' }); } catch { /* Auth row is gone */ }
  clearLocalAuthStorage();

  return { userId };
}

export function accountDeletionErrorMessage(
  error: unknown,
  lang: 'bn' | 'en'
): string {
  const code = error instanceof AccountDeletionError ? error.code : 'deletion_failed';
  const bn = lang === 'bn';
  const messages: Record<AccountDeletionErrorCode, { bn: string; en: string }> = {
    not_authenticated: {
      bn: 'সেশনটি আর সক্রিয় নেই। আবার লগইন করে চেষ্টা করুন।',
      en: 'Your session is no longer active. Sign in and try again.',
    },
    email_unavailable: {
      bn: 'এই অ্যাকাউন্টে পাসওয়ার্ড পুনরায় যাচাই করার মতো ইমেইল নেই। সহায়তায় যোগাযোগ করুন।',
      en: 'This account has no email available for password verification. Contact support.',
    },
    invalid_password: {
      bn: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়। অ্যাকাউন্ট মোছা হয়নি।',
      en: 'The current password is incorrect. The account was not deleted.',
    },
    reauthentication_required: {
      bn: 'নিরাপত্তার জন্য আবার পাসওয়ার্ড লিখে চেষ্টা করুন।',
      en: 'For security, enter your password again and retry.',
    },
    service_unavailable: {
      bn: 'সার্ভারে পৌঁছানো যায়নি। ইন্টারনেট পরীক্ষা করুন; এই অবস্থায় অ্যাকাউন্ট মোছা নিশ্চিত করা যায়নি।',
      en: 'The server could not be reached. Check your connection; account deletion could not be confirmed.',
    },
    deletion_failed: {
      bn: 'অ্যাকাউন্ট মোছা নিশ্চিত করা যায়নি। আবার লগইন করা যায় কি না পরীক্ষা করুন, তারপর পুনরায় চেষ্টা করুন বা সহায়তায় যোগাযোগ করুন।',
      en: 'Account deletion could not be confirmed. Check whether sign-in still works, then retry or contact support.',
    },
  };
  return messages[code][bn ? 'bn' : 'en'];
}
