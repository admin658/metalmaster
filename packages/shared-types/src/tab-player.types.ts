// Metal Master - Tab Player Shared Types

export interface TabTimeSignature {
  numerator: number;
  denominator: number;
}

export interface TabTrack {
  id: string;
  name: string;
  tuning?: string;
  isPercussion?: boolean;
  isMuted?: boolean;
  isSoloed?: boolean;
  /**
   * Optional URL for a track stem or isolated instrument audio.
   * When provided, the mixer can control this stem independently.
   */
  stemUrl?: string;
  /**
   * Default gain (0-1) for the track when loaded into the mixer.
   */
  volume?: number;
  /**
   * Optional pan position (-1..1). Not all platforms support this yet.
   */
  pan?: number;
}

export interface TabBeatNote {
  string: number;
  fret: number;
}

export interface TabBeat {
  id: string;
  timeSeconds: number;
  durationSeconds: number;
  measureIndex: number;
  beatIndex: number;
  trackId: string;
  isRest?: boolean;
  isAccent?: boolean;
  notes: TabBeatNote[];
}

export interface TabMeasure {
  index: number;
  startSeconds: number;
  endSeconds: number;
  timeSignature?: TabTimeSignature;
  beats: TabBeat[];
}

export interface TabSection {
  id: string;
  name: string;
  startSeconds: number;
  endSeconds: number;
}

export interface TabSong {
  id: string;
  title: string;
  artist?: string;
  bpm: number;
  durationSeconds: number;
  tracks: TabTrack[];
  /**
   * Optional pre-parsed measure grid. Used for precise highlighting.
   */
  measures?: TabMeasure[];
  /**
   * Optional flattened beat list for quick lookups.
   */
  beats?: TabBeat[];
  /**
   * Optional structural markers for UX (next/previous section buttons).
   */
  sections?: TabSection[];
  timeSignature?: TabTimeSignature;
}

/**
 * Used by the UI layer to describe simple A/B loop points.
 * Times are in seconds and may be null if not set.
 */
export interface TabLoopSection {
  startSeconds: number | null;
  endSeconds: number | null;
}

/**
 * UI-only state snapshot that can be useful for debugging or
 * persisting player settings in localStorage later.
 */
export interface TabPlayerState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  selectedTrackId: string | null;
  loop: TabLoopSection;
  isLoopEnabled: boolean;
  soloedTrackIds?: string[];
  mutedTrackIds?: string[];
}

export interface TabMixerChannel {
  trackId: string;
  volume: number;
  isMuted: boolean;
  isSoloed: boolean;
}

export interface TabMixerState {
  channels: TabMixerChannel[];
}
