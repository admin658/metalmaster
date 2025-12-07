import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !anonKey) {
  // It's okay to run without these during type-check, but runtime requires them.
  // Consumers should provide env vars in `.env.local` or deployment.
}

export const supabase = createClient(url, anonKey);
