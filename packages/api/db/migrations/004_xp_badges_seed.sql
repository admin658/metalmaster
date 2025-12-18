-- 004_xp_badges_seed.sql
-- Metal Master: XP + Badges seed + minimal completion tracking
-- Generated: 2025-12-18
-- Notes:
-- 1) Adjust table/column names if your schema differs.
-- 2) This migration is designed to be safe to run multiple times (idempotent-ish).
-- 3) achievements_library may already exist per prior migrations.

begin;

-- 1) Lesson completion tracking (if not already present)
create table if not exists lesson_completions (
  user_id uuid not null references users(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  best_clean_tempo int,
  best_aggro_tempo int,
  primary key (user_id, lesson_id)
);

-- Optional helpful index
create index if not exists idx_lesson_completions_user on lesson_completions(user_id);

-- 2) Achievements / badges library (assumes achievements_library exists; create if not)
create table if not exists achievements_library (
  id text primary key,
  name text not null,
  description text not null,
  category text not null default 'badge',
  icon text,
  points int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- user_achievements table (create if not)
create table if not exists user_achievements (
  user_id uuid not null references users(id) on delete cascade,
  achievement_id text not null references achievements_library(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user on user_achievements(user_id);

-- 3) Seed the 10 badges for Lessons 1–10 (Aggressive “B” set)
-- Using ON CONFLICT DO UPDATE so names/descriptions can be revised without duplicates.
insert into achievements_library (id, name, description, category, icon, points, is_active)
values
  ('B01', 'Iron Wrist I', 'Complete Lesson 3 at clean tempo (Downpicking Endurance).', 'badge', 'iron-wrist', 50, true),
  ('B02', 'Mute Surgeon', 'In Lesson 2, achieve a 5+ perfect-loop streak at clean tempo.', 'badge', 'mute-surgeon', 50, true),
  ('B03', 'Chord Executioner', 'Complete Lesson 4 with zero pauses and zero seeks.', 'badge', 'chord-executioner', 75, true),
  ('B04', 'Gallop Engine', 'Hit aggro tempo in Lesson 5 (Gallop Engine).', 'badge', 'gallop-engine', 75, true),
  ('B05', 'Alternate Assassin', 'In Lesson 6, achieve an 8 perfect-loop streak.', 'badge', 'alternate-assassin', 75, true),
  ('B06', 'Crossing Clean', 'In Lesson 7, achieve a 5+ perfect-loop streak.', 'badge', 'crossing-clean', 50, true),
  ('B07', 'Silence Controller', 'In Lesson 8, achieve a 6+ perfect-loop streak (tight stops).', 'badge', 'silence-controller', 75, true),
  ('B08', 'Burst Certified', 'Hit aggro tempo in Lesson 9 (Speed Bursts).', 'badge', 'burst-certified', 75, true),
  ('B09', 'First Riff Forged', 'Complete Lesson 10 at clean tempo (First Real Metal Riff).', 'badge', 'first-riff-forged', 100, true),
  ('B10', 'Foundations: Steel', 'Complete Lessons 1–10.', 'badge', 'foundations-steel', 150, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  icon = excluded.icon,
  points = excluded.points,
  is_active = excluded.is_active;

-- 4) (Optional) RLS recommendations (commented out)
-- If you want users to be able to read their own achievements via client anon key,
-- enable RLS and add policies accordingly. Otherwise keep server-side reads/writes.
-- alter table lesson_completions enable row level security;
-- alter table user_achievements enable row level security;
-- create policy "user can read own lesson_completions" on lesson_completions
--   for select using (auth.uid() = user_id);
-- create policy "user can read own achievements" on user_achievements
--   for select using (auth.uid() = user_id);

commit;
