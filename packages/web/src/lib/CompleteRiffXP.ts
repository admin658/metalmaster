import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = url && anonKey ? createClient(url, anonKey) : null;

export async function completeRiffXP(riffId: string, accuracy: number) {
  if (!supabase) {
    throw new Error('Supabase client is not configured; set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');

  const xp = Math.round(accuracy * 2);

  await supabase.from('practice_sessions').insert({
    user_id: user.id,
    riff_id: riffId,
    accuracy,
    xp_earned: xp,
  });

  await supabase
    .from('user_stats')
    .update({
      xp,
    })
    .eq('user_id', user.id);

  return xp;
}
