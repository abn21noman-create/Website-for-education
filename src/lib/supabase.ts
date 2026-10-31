import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazily created Supabase client.
 *
 * `@supabase/supabase-js` is ~58 kB gzipped. Importing it statically put it in
 * the first bundle, so every phone paid for it before the dashboard could
 * paint — even students who never sign in. The module is now pulled with a
 * dynamic `import()` the first time the app actually talks to the backend
 * (session restore, sign-in, or a queued sync write), which happens after the
 * first paint has already happened.
 *
 * `import type` above is erased at build time, so the types stay exact without
 * dragging the runtime back into the main chunk.
 */

const DEFAULT_SUPABASE_URL = 'https://ougxoabibdvlaehsilfw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Z3hvYWJpYmR2bGFlaHNpbGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODU3NjAsImV4cCI6MjEwODc2MTc2MH0.zbvuWLBZXN9sYzw1huEuJxe4LgANxHBxLa4cAlVnWTo';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
let pending: Promise<SupabaseClient> | null = null;

/** Resolves the shared client, creating it on first use. */
export function getSupabase(): Promise<SupabaseClient> {
  if (client) return Promise.resolve(client);
  if (!pending) {
    pending = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'nokkhotro_hsc28_auth',
        },
      });
      return client;
    });
  }
  return pending;
}

/** The client if it has already been created — never triggers a download. */
export function peekSupabase(): SupabaseClient | null {
  return client;
}
