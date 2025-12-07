import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding sample data...');

  // create sample users
  const users = [
    { id: '00000000-0000-0000-0000-000000000001', email: 'teacher@mm.local', username: 'teacher' },
    { id: '00000000-0000-0000-0000-000000000002', email: 'student@mm.local', username: 'student' },
  ];

  for (const u of users) {
    const { error } = await supabase.from('users').upsert(u, { onConflict: 'id' });
    if (error) console.warn('user upsert error', error.message);
  }

  // lessons
  const { error: lerr } = await supabase.from('lessons').upsert([
    {
      id: '00000000-0000-0000-0000-000000010001',
      title: 'Alternate Picking Exercises',
      description: 'Exercises to tighten your alternate picking technique.',
      category: 'technique',
      difficulty_level: 'intermediate',
      duration_minutes: 15,
      instructor_id: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000010002',
      title: 'Minor Pentatonic Lead Patterns',
      description: 'Beginner-friendly pentatonic sequences across the fretboard.',
      category: 'lead',
      difficulty_level: 'beginner',
      duration_minutes: 10,
      instructor_id: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000010003',
      title: 'Syncopated Rhythm Patterns',
      description: 'Groove and palm-muted syncopation for rhythm guitarists.',
      category: 'rhythm',
      difficulty_level: 'intermediate',
      duration_minutes: 12,
      instructor_id: users[0].id,
    }
  ]);
  if (lerr) console.warn('lessons upsert error', lerr.message);

  // riffs
  const { error: rerr } = await supabase.from('riffs').upsert([
    {
      id: '00000000-0000-0000-0000-000000020001',
      title: 'Downpicked Chug',
      description: 'Fast downpicked chug in E standard',
      bpm: 180,
      key: 'E',
      time_signature: '4/4',
      genre: 'thrash',
      difficulty_level: 'advanced',
      created_by: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000020002',
      title: 'Sliding Harmonics Phrase',
      description: 'A short phrase using sliding harmonics and palm muting.',
      bpm: 90,
      key: 'A',
      time_signature: '4/4',
      genre: 'modern-metal',
      difficulty_level: 'intermediate',
      created_by: users[0].id,
    }
  ]);
  if (rerr) console.warn('riffs upsert error', rerr.message);

  // jam tracks
  const { error: jerr } = await supabase.from('jam_tracks').upsert([
    {
      id: '00000000-0000-0000-0000-000000030001',
      title: 'E Minor Groove',
      description: 'Backing track for pentatonic runs',
      bpm: 120,
      key: 'E',
      time_signature: '4/4',
      difficulty_level: 'beginner',
      duration_seconds: 120,
      audio_url: null,
      created_by: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000030002',
      title: 'Blastbeat Tempo',
      description: 'Fast double-kick and tremolo-picked backdrop',
      bpm: 220,
      key: 'D',
      time_signature: '4/4',
      difficulty_level: 'expert',
      duration_seconds: 180,
      audio_url: null,
      created_by: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000030003',
      title: 'Jam Track 1',
      description: 'Heavy metal backing track for jamming',
      bpm: 140,
      key: 'E',
      time_signature: '4/4',
      difficulty_level: 'intermediate',
      duration_seconds: 240,
      audio_url: null,
      created_by: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000030004',
      title: 'Jam Track 2',
      description: 'Fast-paced metal groove',
      bpm: 180,
      key: 'D',
      time_signature: '4/4',
      difficulty_level: 'intermediate',
      duration_seconds: 300,
      audio_url: null,
      created_by: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000030005',
      title: 'Jam Track 3',
      description: 'Melodic metal backing track',
      bpm: 120,
      key: 'A',
      time_signature: '4/4',
      difficulty_level: 'beginner',
      duration_seconds: 270,
      audio_url: null,
      created_by: users[0].id,
    },
    {
      id: '00000000-0000-0000-0000-000000030006',
      title: 'Jam Track 4',
      description: 'Progressive metal exploration',
      bpm: 150,
      key: 'G',
      time_signature: '4/4',
      difficulty_level: 'advanced',
      duration_seconds: 320,
      audio_url: null,
      created_by: users[0].id,
    }
  ]);
  if (jerr) console.warn('jam_tracks upsert error', jerr.message);

  // tabs
  const { error: terr } = await supabase.from('tabs').upsert([
    {
      id: '00000000-0000-0000-0000-000000040001',
      riff_id: '00000000-0000-0000-0000-000000020001',
      title: 'Downpicked Chug - Tab',
      content: 'E|----------------|\nB|----------------|\nG|----------------|\nD|----------------|\nA|--2-2-2-2-2-2--|\nE|0-0-0-0-0-0-0-0|',
      format: 'text',
      created_by: users[0].id,
    },
  ]);
  if (terr) console.warn('tabs upsert error', terr.message);

  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
