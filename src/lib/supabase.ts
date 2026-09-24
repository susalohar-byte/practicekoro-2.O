import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/utils/envGate';

// PracticeKoro Production Supabase credentials
// Supabase anon key is the public client key intended for browsers.
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  !supabaseUrl.startsWith('http') ||
  supabaseUrl.includes('your-project-ref') ||
  supabaseUrl.includes('placeholder')
) {
  throw new Error(
    'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (see .env.example).'
  );
}

export const isDemoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

export const isSupabaseConfigured = !isDemoModeEnabled;

// Create client with active Supabase configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Central compatibility boundary until generated Database types are refreshed from Supabase.
export const supabaseRuntime = supabase as unknown as SupabaseClient;
