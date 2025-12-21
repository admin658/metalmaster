import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Keep build-time safe: if envs are missing (e.g. during static export), skip client creation.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
