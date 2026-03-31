import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Configuration Missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in the AI Studio Secrets panel.');
}

// We only create the client if the URL is provided to avoid the "supabaseUrl is required" crash.
// If missing, we export a dummy object or handle it in the app.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
