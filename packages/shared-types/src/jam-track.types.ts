export interface JamTrackUpdate {
  title?: string;
  description?: string;
  riff_id?: string;
  bpm?: number;
  time_signature?: string;
  key?: string;
  duration_seconds?: number;
  audio_url?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
export interface JamTrack {
  id: string;
  title: string;
  description: string;
  riff_id?: string;
  bpm: number;
  time_signature: string;
  key: string;
  duration_seconds: number;
  audio_url?: string | null;
  backing_tracks?: BackingTrack[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BackingTrack {
  id: string;
  jam_track_id: string;
  name: string;
  audio_url: string;
  instrument: 'drums' | 'bass' | 'rhythm' | 'full';
  volume: number; // 0..1
}

export interface JamSession {
  id: string;
  user_id: string;
  jam_track_id: string;
  recording_url?: string;
  duration_seconds: number;
  notes?: string;
  quality_rating?: number;
  created_at: string;
}
