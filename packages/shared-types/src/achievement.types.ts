export type AchievementType = 'badge' | 'milestone' | 'skill_unlock';
export type BadgeId = 'downpicking_demon' | 'sweep_sorcerer' | 'djent_machine' | 'black_metal_blizzard' | 'power_metal_paladin' | 'speed_merchant' | 'rhythm_warrior' | 'tone_master';

export interface Achievement {
  id: string;
  badge_id: BadgeId;
  name: string;
  description: string;
  icon_url: string;
  type: AchievementType;
  xp_multiplier: number; // e.g., 1.25 for 25% bonus
  requirements?: Record<string, any>;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress_percentage?: number; // for in-progress achievements
}

export interface AchievementProgress {
  achievement_id: string;
  badge_id: BadgeId;
  name: string;
  progress_percentage: number;
  earned: boolean;
  earned_date?: string;
}
