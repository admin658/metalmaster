import '../src/env';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnon = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnon);

async function run() {
  const email = 'demo.student2@mm.test';
  const password = 'Demo!1234';

  console.log('Signing in as', email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Sign in error:', error.message);
    process.exit(1);
  }

  const token = data.session?.access_token;
  if (!token) {
    console.error('No access token returned');
    process.exit(1);
  }

  console.log('Access token obtained (truncated):', token.slice(0, 40) + '...');

  const targets = [
    { name: 'Next app', url: 'http://localhost:3000/api/user-stats' },
    { name: 'API server', url: 'http://localhost:3001/api/user-stats' },
  ];

  for (const t of targets) {
    try {
      console.log(`\nCalling ${t.name} -> ${t.url}`);
      const res = await globalThis.fetch(t.url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      console.log(`Status: ${res.status}`);
      console.log('Response:', text);
    } catch (e) {
      console.error('Request failed', e);
    }
  }
}

run().catch((e) => {
  console.error('failed', e);
  process.exit(1);
});
