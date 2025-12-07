import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrations = [
    'db/migrations/001_init.sql',
    'db/migrations/002_metal_master_schema.sql',
    'db/migrations/003_ai_feedback_results.sql',
    'db/migrations/004_daily_riff.sql',
  ];

  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration);
    console.log(`Running migration: ${migration}`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf-8');
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        console.error(`Error in ${migration}:`, error.message);
      } else {
        console.log(`✓ ${migration} completed`);
      }
    } catch (err) {
      console.error(`Error reading ${migration}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('Migration process complete');
}

runMigrations().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
