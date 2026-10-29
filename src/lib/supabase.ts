import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ougxoabibdvlaehsilfw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Z3hvYWJpYmR2bGFlaHNpbGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODU3NjAsImV4cCI6MjEwODc2MTc2MH0.zbvuWLBZXN9sYzw1huEuJxe4LgANxHBxLa4cAlVnWTo';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'nokkhotro_hsc28_auth',
  },
});
