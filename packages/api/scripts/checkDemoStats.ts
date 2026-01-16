import '../src/env';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const emails = ['demo.student1@mm.test', 'demo.student2@mm.test', 'demo.instructor@mm.test'];

  for (const email of emails) {
    console.log(`\nChecking ${email}`);
    // find auth user
    const listed = await supabase.auth.admin.listUsers();
    const user = listed.data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      console.log('  Auth user not found');
      continue;
    }
    console.log(`  Auth id: ${user.id}`);

    const { data: profile, error: pErr } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    if (pErr) console.log('  users row error', pErr.message);
    console.log('  profile:', profile || 'none');

    const { data: stats, error: sErr } = await supabase.from('user_stats').select('*').eq('user_id', user.id).maybeSingle();
    if (sErr) console.log('  user_stats error', sErr.message);
    console.log('  stats:', stats || 'none');
  }
}

check().catch((e) => {
  console.error('failed', e);
  process.exit(1);
});
