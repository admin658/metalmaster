export type DailyRiffFrequency = 'free_weekly' | 'subscriber_daily';

export interface DailyRiff {
  id: string;
  riff_id: string;
  video_url: string;
  tab_content: string;
  description: string;
  subgenre: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xp_bonus: number;
  featured_date: string;
  frequency?: DailyRiffFrequency;
  created_at: string;
}

export interface DailyRiffCompletion {
  id: string;
  user_id: string;
  daily_riff_id: string;
  completed_at: string;
  xp_earned: number;
  bonus_earned: boolean; // true if completed within 24 hours
}

export interface UserDailyRiffStats {
  completed_today: boolean;
  days_completed_streak: number;
  total_completed: number;
  next_riff_date: string;
  current_frequency?: DailyRiffFrequency;
}
