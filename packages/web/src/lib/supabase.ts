import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Avoid build-time explosions when env vars aren't present; callers should null-check.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
