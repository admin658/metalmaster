/**
 * Creates a maxed-out Metal Master test account with:
 * - Supabase Auth user (email verified)
 * - Profile row in `users`
 * - Juiced stats in `user_stats` (pro sub, max XP/level/streak)
 * - All achievements duplicated to this user
 *
 * Run with: npx tsx packages/api/scripts/createTestMaxAccount.ts
 *
 * Override defaults with env:
 * TEST_ACCOUNT_EMAIL, TEST_ACCOUNT_PASSWORD, TEST_ACCOUNT_USERNAME
 * TEST_ACCOUNT_STREAK_DAYS, TEST_ACCOUNT_TOTAL_XP
 */
import 'dotenv/config';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.env.TEST_ACCOUNT_EMAIL || 'hero@mm.test';
const password = process.env.TEST_ACCOUNT_PASSWORD || 'Test!234';
const username = process.env.TEST_ACCOUNT_USERNAME || 'Shred Legend';
const streakDays = Number(process.env.TEST_ACCOUNT_STREAK_DAYS || 180);
const totalXp = Number(process.env.TEST_ACCOUNT_TOTAL_XP || 999_999);

async function ensureAuthUser() {
  // Supabase admin SDK doesn't have a direct getUserByEmail, so list and match.
  const listed = await supabase.auth.admin.listUsers();
  const existing = listed.data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    console.log(`✓ Auth user exists: ${email}`);
    return existing.id;
  }

  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (created.error || !created.data.user) {
    throw created.error || new Error('Failed to create auth user');
  }

  console.log(`✓ Created auth user ${email}`);
  return created.data.user.id;
}

async function upsertProfile(userId: string) {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, email, username }, { onConflict: 'id' });

  if (error) throw error;
  console.log('✓ Upserted profile row');
}

async function upsertStats(userId: string) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: userId,
        total_xp: totalXp,
        subscription_status: 'pro',
        level: 99,
        level_tier: 'Legend',
        total_practice_minutes: 10_000,
        total_lessons_completed: 150,
        total_riffs_completed: 150,
        current_streak_days: streakDays,
        longest_streak_days: Math.max(streakDays, 365),
        accuracy_score: 100,
        speed_score: 100,
        rhythm_score: 100,
        tone_knowledge_score: 100,
        last_active_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
  console.log('✓ Upserted maxed stats');
}

async function awardAllAchievements(userId: string) {
  // Treat rows with user_id IS NULL as the library to copy from.
  const { data: library, error: libErr } = await supabase
    .from('achievements')
    .select('*')
    .is('user_id', null);

  if (libErr) throw libErr;

  const { data: alreadyEarned, error: earnedErr } = await supabase
    .from('achievements')
    .select('name')
    .eq('user_id', userId);

  if (earnedErr) throw earnedErr;

  const earnedNames = new Set((alreadyEarned || []).map((a: any) => a.name));
  const toInsert =
    library
      ?.filter((ach: any) => !earnedNames.has(ach.name))
      .map((ach: any) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        name: ach.name,
        description: ach.description,
        achieved_at: new Date().toISOString(),
        icon: ach.icon,
        tier: ach.tier,
        category: ach.category,
        xp_reward: ach.xp_reward,
      })) || [];

  if (!toInsert.length) {
    console.log('✓ All achievements already awarded');
    return;
  }

  const { error } = await supabase.from('achievements').insert(toInsert);
  if (error) throw error;

  console.log(`✓ Awarded ${toInsert.length} achievements`);
}

async function main() {
  console.log(`Creating maxed test account for ${email}...`);
  const userId = await ensureAuthUser();
  await upsertProfile(userId);
  await upsertStats(userId);
  await awardAllAchievements(userId);
  console.log('Done. Login with the provided email/password.');
}

main().catch((err) => {
  console.error('Failed to create test account:', err);
  process.exit(1);
});
