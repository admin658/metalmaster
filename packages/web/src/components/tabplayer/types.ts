export type RackTab = 'practice' | 'tone' | 'mixer' | 'tools';

export type PlayerStatus = 'stopped' | 'playing' | 'paused';

export type Section = {
  id: string;
  label: string; // e.g. "Verse"
  bars: [number, number]; // inclusive range
};

export type Track = {
  id: string;
  name: string;
  instrument?: string;
};

export type PlayerState = {
  title: string;
  subtitle: string;

  status: PlayerStatus;
  bpm: number;
  timeSig: string; // "4/4"
  speed: number; // 0.5..1.25

  positionSeconds: number;
  durationSeconds: number;
  currentBarNumber: number;

  loopEnabled: boolean;
  loopInSeconds: number | null;
  loopOutSeconds: number | null;

  countInBars: 1 | 2;
  metronomeEnabled: boolean;

  activeTrackId: string;
  tracks: Track[];

  activeSectionId: string;
  sections: Section[];

  rackTab: RackTab;
  coachOpen: boolean;
  coachListening: boolean;
  coachError: string | null;
  coachSamples: number;
  coachHits: number;
  coachAccuracy: number;
  coachLastPitchHz: number | null;
  coachLastMidi: number | null;
  coachExpectedMidis: number[];
  coachBeatWindowMs: number;

  // UI toggles
  focusMode: boolean;
  showPalmMute: boolean;
  showAccents: boolean;
  showFingering: boolean;
  showRhythmHints: boolean;
  showStringNames: boolean;
  showStandardNotation: boolean;

  // XP preview (stub)
  xpPreview: number;
  streak: number;
};
