import {
  TabBeat,
  TabLoopSection,
  TabMeasure,
  TabMixerState,
  TabSong,
  TabTimeSignature,
} from './tab-player.types';

const DEFAULT_BEATS_PER_BAR = 4;

const sortBeats = (beats: TabBeat[]): TabBeat[] =>
  [...beats].sort((a, b) => a.timeSeconds - b.timeSeconds);

const synthesizeBeats = (song: TabSong, beatDuration: number): TabBeat[] => {
  const totalBeats = Math.max(1, Math.ceil(song.durationSeconds / beatDuration));
  const trackId = song.tracks[0]?.id ?? 'track-0';

  return Array.from({ length: totalBeats }).map((_, idx) => {
    const timeSeconds = idx * beatDuration;
    return {
      id: `beat-${idx}`,
      timeSeconds,
      durationSeconds: beatDuration,
      measureIndex: Math.floor(idx / DEFAULT_BEATS_PER_BAR),
      beatIndex: idx % DEFAULT_BEATS_PER_BAR,
      trackId,
      notes: [],
    } satisfies TabBeat;
  });
};

const buildMeasuresFromBeats = (
  beats: TabBeat[],
  timeSignature: TabTimeSignature | undefined,
  totalDuration: number,
  beatDuration: number
): TabMeasure[] => {
  if (!beats.length) return [];

  const grouped: Record<number, TabBeat[]> = {};
  beats.forEach((beat) => {
    grouped[beat.measureIndex] = grouped[beat.measureIndex] || [];
    grouped[beat.measureIndex].push(beat);
  });

  return Object.entries(grouped).map(([idx, beatsInMeasure]) => {
    const sorted = sortBeats(beatsInMeasure);
    const startSeconds = sorted[0]?.timeSeconds ?? 0;
    const endSeconds =
      (sorted[sorted.length - 1]?.timeSeconds ?? totalDuration) + beatDuration;

    return {
      index: Number(idx),
      startSeconds,
      endSeconds,
      timeSignature,
      beats: sorted,
    };
  });
};

export interface TabSyncEngine {
  beats: TabBeat[];
  measures: TabMeasure[];
  beatDuration: number;
  getActiveBeat: (timeSeconds: number) => TabBeat | null;
  getNextBeatTime: (timeSeconds: number) => number | null;
  getPreviousBeatTime: (timeSeconds: number) => number | null;
  snapToBeat: (timeSeconds: number) => number;
  progress: (timeSeconds: number) => number;
}

export const createTabSyncEngine = (song: TabSong): TabSyncEngine => {
  const beatDuration = 60 / Math.max(song.bpm, 1);
  const beats = sortBeats(
    song.beats && song.beats.length ? song.beats : synthesizeBeats(song, beatDuration)
  );
  const measures =
    song.measures && song.measures.length
      ? song.measures
      : buildMeasuresFromBeats(beats, song.timeSignature, song.durationSeconds, beatDuration);

  const getActiveBeat = (timeSeconds: number): TabBeat | null => {
    for (let i = beats.length - 1; i >= 0; i -= 1) {
      const beat = beats[i];
      if (timeSeconds + 1e-3 >= beat.timeSeconds) {
        return beat;
      }
    }
    return null;
  };

  const getNextBeatTime = (timeSeconds: number): number | null => {
    const next = beats.find((b) => b.timeSeconds > timeSeconds + 1e-3);
    return next ? next.timeSeconds : null;
  };

  const getPreviousBeatTime = (timeSeconds: number): number | null => {
    for (let i = beats.length - 1; i >= 0; i -= 1) {
      const beat = beats[i];
      if (beat.timeSeconds < timeSeconds - 1e-3) return beat.timeSeconds;
    }
    return null;
  };

  const snapToBeat = (timeSeconds: number): number => {
    if (!beats.length) return timeSeconds;
    let closest = beats[0];
    let minDelta = Math.abs(timeSeconds - closest.timeSeconds);

    for (let i = 1; i < beats.length; i += 1) {
      const beat = beats[i];
      const delta = Math.abs(timeSeconds - beat.timeSeconds);
      if (delta < minDelta) {
        closest = beat;
        minDelta = delta;
      } else if (beat.timeSeconds > timeSeconds && delta > minDelta) {
        break;
      }
    }
    return closest.timeSeconds;
  };

  const progress = (timeSeconds: number): number => {
    if (!Number.isFinite(song.durationSeconds) || song.durationSeconds <= 0) return 0;
    const clamped = Math.max(0, Math.min(song.durationSeconds, timeSeconds));
    return clamped / song.durationSeconds;
  };

  return {
    beats,
    measures,
    beatDuration,
    getActiveBeat,
    getNextBeatTime,
    getPreviousBeatTime,
    snapToBeat,
    progress,
  };
};

export const enforceLoopBoundaries = (
  timeSeconds: number,
  loop: TabLoopSection | undefined,
  durationSeconds: number
): number => {
  if (!loop || loop.startSeconds == null || loop.endSeconds == null) return timeSeconds;
  if (loop.endSeconds <= loop.startSeconds) return timeSeconds;

  if (timeSeconds > loop.endSeconds) {
    return loop.startSeconds;
  }
  if (timeSeconds < loop.startSeconds) {
    return loop.startSeconds;
  }
  return Math.min(timeSeconds, durationSeconds);
};

export const createMixerState = (song: TabSong): TabMixerState => ({
  channels: song.tracks.map((track) => ({
    trackId: track.id,
    volume: track.volume ?? 1,
    isMuted: track.isMuted ?? false,
    isSoloed: track.isSoloed ?? false,
  })),
});

export const toggleSoloOnMixer = (mixer: TabMixerState, trackId: string): TabMixerState => ({
  channels: mixer.channels.map((channel) =>
    channel.trackId === trackId
      ? { ...channel, isSoloed: !channel.isSoloed }
      : channel
  ),
});

export const toggleMuteOnMixer = (mixer: TabMixerState, trackId: string): TabMixerState => ({
  channels: mixer.channels.map((channel) =>
    channel.trackId === trackId
      ? { ...channel, isMuted: !channel.isMuted }
      : channel
  ),
});

export const deriveChannelGains = (mixer: TabMixerState): Record<string, number> => {
  const hasSolo = mixer.channels.some((c) => c.isSoloed);
  const gains: Record<string, number> = {};

  mixer.channels.forEach((channel) => {
    const baseVolume = channel.volume ?? 1;
    const mutedBySolo = hasSolo && !channel.isSoloed;
    const isMuted = channel.isMuted || mutedBySolo;
    gains[channel.trackId] = isMuted ? 0 : baseVolume;
  });

  return gains;
};
