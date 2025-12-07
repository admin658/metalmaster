export type SessionType = 'lesson' | 'riff_practice' | 'jam_session' | 'speed_trainer' | 'free_play';

export interface PracticeSession {
  id: string;
  user_id: string;
  session_type: SessionType;
  related_riff_id?: string;
  related_lesson_id?: string;
  related_jam_track_id?: string;
  duration_seconds: number;
  xp_earned: number;
  accuracy_percentage?: number;
  notes?: string;
  started_at: string;
  completed_at: string;
}

export interface PracticeSessionStats {
  total_sessions: number;
  total_practice_minutes: number;
  average_session_duration_minutes: number;
  most_common_session_type: SessionType;
  xp_earned_this_week: number;
  xp_earned_today: number;
}
