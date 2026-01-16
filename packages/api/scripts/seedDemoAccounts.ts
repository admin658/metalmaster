import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import '../src/env';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

type DemoSpec = {
  email: string;
  password?: string;
  username: string;
  totalXp?: number;
  streakDays?: number;
  level?: number;
  level_tier?: string;
  achievements?: string[]; // names from the library
};

const DEMOS: DemoSpec[] = [
  {
    email: 'demo.student1@mm.test',
    password: 'Demo!1234',
    username: 'Demo Student 1',
    totalXp: 1200,
    streakDays: 3,
    level: 4,
    level_tier: 'Apprentice',
    achievements: ['First Lesson', 'Daily Streak 3'],
  },
  {
    email: 'demo.student2@mm.test',
    password: 'Demo!1234',
    username: 'Demo Student 2',
    totalXp: 5600,
    streakDays: 15,
    level: 10,
    level_tier: 'Adept',
    achievements: ['First Lesson', '10 Lessons Completed'],
  },
  {
    email: 'demo.instructor@mm.test',
    password: 'Demo!1234',
    username: 'Demo Instructor',
    totalXp: 25000,
    streakDays: 120,
    level: 35,
    level_tier: 'Veteran',
    achievements: ['First Lesson', 'Course Creator', '100 Lessons Completed'],
  },
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function chooseRandomSubset<T>(arr: T[], maxItems: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const count = randInt(0, Math.min(maxItems, copy.length));
  return copy.slice(0, count);
}

async function ensureAuthUser(email: string, password: string | undefined, username: string) {
  const listed = await supabase.auth.admin.listUsers();
  const existing = listed.data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) return existing.id;

  const created = await supabase.auth.admin.createUser({
    email,
    password: password || crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { username },
  });

  if (created.error || !created.data.user) {
    throw created.error || new Error('Failed to create auth user');
  }

  return created.data.user.id;
}

async function upsertProfile(userId: string, email: string, username: string) {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, email, username }, { onConflict: 'id' });
  if (error) throw error;
}

async function upsertStats(userId: string, spec: DemoSpec) {
  const now = new Date().toISOString();
  // Fill in sensible random defaults when not provided in the spec
  const totalXp = spec.totalXp ?? randInt(0, 50_000);
  const level = spec.level ?? Math.max(1, Math.floor(Math.log2(totalXp + 1)));
  const level_tier =
    spec.level_tier ?? (level > 30 ? 'Veteran' : level > 10 ? 'Adept' : 'Beginner');
  const subscription_status =
    (spec as any).subscription_status ?? (Math.random() < 0.08 ? 'pro' : 'free');
  const current_streak_days = spec.streakDays ?? randInt(0, 60);
  const longest_streak_days = Math.max(
    current_streak_days,
    randInt(current_streak_days, Math.max(current_streak_days, 365))
  );
  const total_practice_minutes = (spec as any).total_practice_minutes ?? randInt(5, 10_000);
  const total_lessons_completed = (spec as any).total_lessons_completed ?? randInt(0, 500);
  const total_riffs_completed = (spec as any).total_riffs_completed ?? randInt(0, 500);
  const accuracy_score = (spec as any).accuracy_score ?? randInt(40, 100);
  const speed_score = (spec as any).speed_score ?? randInt(30, 100);
  const rhythm_score = (spec as any).rhythm_score ?? randInt(30, 100);
  const tone_knowledge_score = (spec as any).tone_knowledge_score ?? randInt(20, 100);

  const { error } = await supabase.from('user_stats').upsert(
    // Only include columns that exist in the current schema. Some installs
    // may not have `total_riffs_completed`, which previously caused PostgREST
    // schema-cache errors. Check existence and conditionally include it.
    (() => {
      const base: any = {
        user_id: userId,
        total_xp: totalXp,
        level,
        level_tier,
        subscription_status,
        current_streak_days,
        longest_streak_days,
        total_practice_minutes,
        total_lessons_completed,
        accuracy_score,
        speed_score,
        rhythm_score,
        tone_knowledge_score,
        last_active_at: now,
        updated_at: now,
      };

      return base;
    })(),
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

async function awardAchievementsByName(userId: string, names: string[] | undefined) {
  // Fetch the achievements library (rows with user_id IS NULL)
  const { data: library, error: libErr } = await supabase
    .from('achievements')
    .select('*')
    .is('user_id', null);
  if (libErr) throw libErr;

  if (!library || !library.length) return;

  let chosen: any[] = [];
  if (names && names.length) {
    const map = new Map<string, any>();
    for (const a of library) map.set(a.name, a);
    for (const n of names) {
      const lib = map.get(n);
      if (lib) chosen.push(lib);
    }
  } else {
    // pick a random subset of up to 6 badges from the library
    chosen = chooseRandomSubset(library, 6) as any[];
  }

  const toInsert = chosen.map((lib) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    name: lib.name,
    description: lib.description,
    achieved_at: new Date().toISOString(),
    icon: lib.icon,
    tier: lib.tier,
    category: lib.category,
    xp_reward: lib.xp_reward,
  }));

  if (!toInsert.length) return;
  const { error } = await supabase.from('achievements').insert(toInsert);
  if (error) throw error;
}

async function processDemo(spec: DemoSpec) {
  console.log(`\nCreating demo account ${spec.email}`);
  const userId = await ensureAuthUser(spec.email, spec.password, spec.username);
  await upsertProfile(userId, spec.email, spec.username);
  await upsertStats(userId, spec);
  await awardAchievementsByName(userId, spec.achievements);
  console.log(`✓ Demo account ready: ${spec.email} (id: ${userId})`);
}

async function main() {
  console.log('Seeding demo accounts...');
  for (const d of DEMOS) {
    try {
      await processDemo(d);
    } catch (err) {
      console.error('Failed for', d.email, err);
    }
  }
  console.log('All demo accounts processed.');
}

main().catch((err) => {
  console.error('Seeder failed', err);
  process.exit(1);
});
