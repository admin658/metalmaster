export type SkillCategory = 'accuracy' | 'speed' | 'rhythm_consistency' | 'tone_knowledge';
export type SubscriptionStatus = 'free' | 'pro' | 'trial' | 'lifetime';

export interface UserStats {
  user_id: string;
  total_xp: number;
  level: number;
  level_tier: LevelTier;
  total_practice_minutes: number;
  total_lessons_completed: number;
  current_streak_days: number;
  longest_streak_days: number;
  accuracy_score: number; // 0-100
  speed_score: number; // 0-100
  rhythm_score: number; // 0-100
  tone_knowledge_score: number; // 0-100
  updated_at: string;
  subscription_status: SubscriptionStatus;
}

export type LevelTier = 'Novice' | 'Acolyte' | 'Hammerhand' | 'Thrash Apprentice' | 'Riff Adept' | 'Blackened Knight' | 'Djent Architect' | 'Shred Overlord';

export interface UserPracticeHeatmap {
  user_id: string;
  date: string; // YYYY-MM-DD
  practice_minutes: number;
  lessons_completed: number;
  riffs_completed: number;
  xp_earned: number;
}

export interface SkillCategoryStats {
  category: SkillCategory;
  current_score: number;
  last_updated: string;
  progress_last_7_days: number; // percentage
}

export interface UserLevelUpNotification {
  user_id: string;
  previous_level: number;
  new_level: number;
  new_tier: LevelTier;
  xp_gained: number;
  timestamp: string;
}
