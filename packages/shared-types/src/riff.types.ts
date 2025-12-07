export interface RiffUpdate {
  title?: string;
  description?: string;
  bpm?: number;
  key?: string;
  time_signature?: string;
  genre?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  audio_url?: string;
}
export interface Riff {
  id: string;
  title: string;
  description: string;
  bpm: number;
  time_signature: string;
  key: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  genre: string;
  audio_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiffProgress {
  riff_id: string;
  user_id: string;
  times_practiced: number;
  total_practice_minutes: number;
  last_practiced: string;
  mastery_level: number;
}
