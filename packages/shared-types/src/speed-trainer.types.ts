export type ExerciseType = 'metronome' | 'chugging' | 'tremolo' | 'downpicking' | 'sweep_picking' | 'tapping';

export interface SpeedTrainerSession {
  id: string;
  user_id: string;
  riff_id?: string;
  exercise_type: ExerciseType;
  starting_bpm: number;
  ending_bpm: number;
  current_bpm: number;
  target_bpm: number;
  duration_seconds: number;
  accuracy_percentage: number;
  notes?: string;
  auto_increment_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeedTrainerProgress {
  exercise_type: ExerciseType;
  personal_best_bpm: number;
  average_bpm: number;
  total_sessions: number;
  last_session_date: string;
  improvement_trend: number; // percentage improvement over last 7 days
}
