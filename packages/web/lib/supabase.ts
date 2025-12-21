import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Avoid throwing during SSG if envs are absent; consumers should guard against null.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
