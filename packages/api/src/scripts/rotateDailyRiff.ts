import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { DailyRiff } from '@metalmaster/shared-types';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function rotateDailyRiff(): Promise<void> {
  try {
    console.log('Starting daily riff rotation...');

    // Get all available riffs
    const { data: riffs, error: riffError } = await supabase
      .from('riffs')
      .select('*');

    if (riffError || !riffs || riffs.length === 0) {
      throw new Error(`Failed to fetch riffs: ${riffError?.message || 'No riffs found'}`);
    }

    console.log(`Found ${riffs.length} available riffs`);

    // Select a random riff
    const randomRiff = riffs[Math.floor(Math.random() * riffs.length)];
    console.log(`Selected random riff: ${randomRiff.id} - ${randomRiff.title}`);

    // Create daily riff entry
    const dailyRiffEntry: DailyRiff = {
      id: crypto.randomUUID(),
      riff_id: randomRiff.id,
      video_url: randomRiff.video_url || '',
      tab_content: randomRiff.tab_content || '',
      description: randomRiff.description || '',
      subgenre: randomRiff.subgenre || 'metal',
      difficulty_level: randomRiff.difficulty_level || 'beginner',
      xp_bonus: Math.floor(Math.random() * 50) + 25, // 25-75 XP bonus
      featured_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    // Insert into daily_riffs table
    const { data: insertedRiff, error: insertError } = await supabase
      .from('daily_riffs')
      .insert([dailyRiffEntry])
      .select();

    if (insertError) {
      throw new Error(`Failed to insert daily riff: ${insertError.message}`);
    }

    console.log('✓ Successfully inserted daily riff');
    console.log(`  ID: ${insertedRiff?.[0]?.id}`);
    console.log(`  Riff ID: ${insertedRiff?.[0]?.riff_id}`);
    console.log(`  Featured Date: ${insertedRiff?.[0]?.featured_date}`);
    console.log(`  XP Bonus: ${insertedRiff?.[0]?.xp_bonus}`);
    console.log('Daily riff rotation completed successfully!');

  } catch (error) {
    console.error('✗ Error rotating daily riff:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

rotateDailyRiff();
