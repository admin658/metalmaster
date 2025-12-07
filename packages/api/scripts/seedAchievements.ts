/**
 * Metal Master Achievement Seed Script
 * Run: npx ts-node packages/api/scripts/seedAchievements.ts
 */

import { createClient } from "@supabase/supabase-js";
import { achievementsArraySchema } from "@metalmaster/shared-schemas/achievements";

// Load env
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const achievements = achievementsArraySchema.parse([
  // ---- BRONZE ----
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "First Blood",
    description: "Complete your very first lesson in Metal Master.",
    icon: "🔥",
    tier: "bronze",
    category: "progression",
    xp_reward: 50
  },
  {
    id: "11111111-1111-1111-1111-111111111112",
    name: "Wake the Dead",
    description: "Finish your first practice session using Speed Trainer.",
    icon: "💀",
    tier: "bronze",
    category: "practice",
    xp_reward: 50
  },
  {
    id: "11111111-1111-1111-1111-111111111113",
    name: "Riff Initiate",
    description: "Complete your first Riff of the Day.",
    icon: "🎸",
    tier: "bronze",
    category: "daily",
    xp_reward: 75
  },
  {
    id: "11111111-1111-1111-1111-111111111114",
    name: "Rhythm Recruit",
    description: "Practice for a total of 30 minutes.",
    icon: "⏱️",
    tier: "bronze",
    category: "practice",
    xp_reward: 100
  },
  {
    id: "11111111-1111-1111-1111-111111111115",
    name: "The Chug Begins",
    description: "Perform your first downpicking practice session.",
    icon: "⚒️",
    tier: "bronze",
    category: "technique",
    xp_reward: 75
  },

  // ---- SILVER ----
  {
    id: "22222222-2222-2222-2222-222222222221",
    name: "Downpicking Demon",
    description: "Achieve 140 BPM in the Downpicking Trainer.",
    icon: "👹",
    tier: "silver",
    category: "technique",
    xp_reward: 200
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Alternate Picking Adept",
    description: "Reach 180 BPM with clean accuracy.",
    icon: "⚡",
    tier: "silver",
    category: "technique",
    xp_reward: 200
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    name: "Master of Streaks",
    description: "Maintain a 7-day Daily Riff streak.",
    icon: "🔥",
    tier: "silver",
    category: "daily",
    xp_reward: 250
  },
  {
    id: "22222222-2222-2222-2222-222222222224",
    name: "Hour of Power",
    description: "Accumulate 1 total hour of practice time.",
    icon: "⏳",
    tier: "silver",
    category: "practice",
    xp_reward: 200
  },
  {
    id: "22222222-2222-2222-2222-222222222225",
    name: "Metal Scholar",
    description: "Complete 10 total lessons.",
    icon: "📘",
    tier: "silver",
    category: "progression",
    xp_reward: 200
  },

  // ---- GOLD ----
  {
    id: "33333333-3333-3333-3333-333333333331",
    name: "Tremolo Titan",
    description: "Reach 220 BPM tremolo picking with consistent timing.",
    icon: "🔥⚡",
    tier: "gold",
    category: "technique",
    xp_reward: 350
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    name: "Palm-Mute Punisher",
    description: "Achieve a “Great” or above score on palm-mute accuracy in AI Feedback.",
    icon: "💀🎤",
    tier: "gold",
    category: "ai_feedback",
    xp_reward: 300
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Shred Scholar",
    description: "Complete 25 total lessons.",
    icon: "📙",
    tier: "gold",
    category: "progression",
    xp_reward: 350
  },
  {
    id: "33333333-3333-3333-3333-333333333334",
    name: "Metronome Slayer",
    description: "Complete 50 Speed Trainer sessions.",
    icon: "⏱️⚔️",
    tier: "gold",
    category: "practice",
    xp_reward: 300
  },
  {
    id: "33333333-3333-3333-3333-333333333335",
    name: "Thrash Veteran",
    description: "Master 5 full thrash-style riffs.",
    icon: "🤘",
    tier: "gold",
    category: "genre",
    xp_reward: 400
  },

  // ---- LEGENDARY ----
  {
    id: "44444444-4444-4444-4444-444444444441",
    name: "Djent Machine",
    description: "Achieve 16th-note chugs at 180 BPM with high accuracy.",
    icon: "🎛️",
    tier: "legendary",
    category: "technique",
    xp_reward: 500
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    name: "The Unbroken",
    description: "Maintain a 30-day Daily Riff streak.",
    icon: "🔥🔥🔥",
    tier: "legendary",
    category: "daily",
    xp_reward: 600
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    name: "The Warlock of Warmups",
    description: "Complete 100 Speed Trainer sessions.",
    icon: "📿",
    tier: "legendary",
    category: "practice",
    xp_reward: 500
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Harmonic Sorcerer",
    description: "Score “Excellent” on harmonic clarity in AI Feedback.",
    icon: "✨💀",
    tier: "legendary",
    category: "ai_feedback",
    xp_reward: 650
  },
  {
    id: "44444444-4444-4444-4444-444444444445",
    name: "Riffmaster Supreme",
    description: "Master 20 full riffs of any style.",
    icon: "👑🎸",
    tier: "legendary",
    category: "progression",
    xp_reward: 700
  },

  // ---- MYTHIC ----
  {
    id: "55555555-5555-5555-5555-555555555551",
    name: "Shred Overlord",
    description: "Reach Level 50 in your Metal Master profile.",
    icon: "👑🔥",
    tier: "mythic",
    category: "progression",
    xp_reward: 1000
  },
  {
    id: "55555555-5555-5555-5555-555555555552",
    name: "The Eternal Flame",
    description: "Maintain a 100-day streak.",
    icon: "🔥🩸",
    tier: "mythic",
    category: "daily",
    xp_reward: 1500
  },
  {
    id: "55555555-5555-5555-5555-555555555553",
    name: "The God of Thunder",
    description: "Achieve 250 BPM alternate or tremolo picking.",
    icon: "⚡⚡⚡",
    tier: "mythic",
    category: "technique",
    xp_reward: 1800
  },
  {
    id: "55555555-5555-5555-5555-555555555554",
    name: "The Grand Necromancer",
    description: "Achieve top-tier accuracy in ALL AI-measured technique categories.",
    icon: "💀📜",
    tier: "mythic",
    category: "ai_feedback",
    xp_reward: 2000
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "The Final Riff",
    description: "Master 50 full riffs across all genres.",
    icon: "🩸🗡️",
    tier: "mythic",
    category: "progression",
    xp_reward: 2500
  }
]);

async function run() {
  console.log("Seeding achievements...");

  // Clear table if needed
  const { error: delErr } = await supabase
    .from("achievements")
    .delete()
    .neq("id", "");

  if (delErr) {
    console.error("Error clearing table:", delErr);
    process.exit(1);
  }

  const { error } = await supabase.from("achievements").insert(achievements);

  if (error) {
    console.error("Seed insert error:", error);
    process.exit(1);
  }

  console.log("Achievements seeded successfully.");
}

run();
