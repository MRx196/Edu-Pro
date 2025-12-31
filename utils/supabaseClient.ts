import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const ENV_FLAG = import.meta.env.VITE_USE_SUPABASE === 'true';

const ENABLED = Boolean(ENV_FLAG && SUPABASE_URL && SUPABASE_ANON_KEY);

if (ENV_FLAG && !ENABLED) {
  console.warn('VITE_USE_SUPABASE is true but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Falling back to IndexedDB.');
}

export const isSupabaseEnabled = () => ENABLED;

export const supabase = ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : (null as unknown as ReturnType<typeof createClient>);
