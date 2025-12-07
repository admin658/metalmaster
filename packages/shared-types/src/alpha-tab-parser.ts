import {
  TabBeat,
  TabBeatNote,
  TabMeasure,
  TabSong,
  TabTimeSignature,
  TabTrack,
} from './tab-player.types';

export interface AlphaTabBeatLike {
  id?: string;
  /** Milliseconds from the start of the measure (or absolute if measureIndex provided) */
  start?: number;
  /** Milliseconds */
  duration?: number;
  measureIndex?: number;
  beatIndex?: number;
  trackId?: string;
  isRest?: boolean;
  isAccent?: boolean;
  notes?: TabBeatNote[];
}

export interface AlphaTabMeasureLike {
  start?: number; // milliseconds
  numerator?: number;
  denominator?: number;
  beats: AlphaTabBeatLike[];
}

export interface AlphaTabTrackLike {
  id?: string;
  name?: string;
  tuning?: string;
  isPercussion?: boolean;
  stemUrl?: string;
  volume?: number;
  pan?: number;
}

export interface AlphaTabScoreLike {
  id?: string;
  title?: string;
  artist?: string;
  bpm: number;
  duration: number; // milliseconds
  tracks: AlphaTabTrackLike[];
  measures?: AlphaTabMeasureLike[];
  beats?: AlphaTabBeatLike[];
  timeSignature?: TabTimeSignature;
}

const toSeconds = (ms: number | undefined, fallback: number): number =>
  typeof ms === 'number' && Number.isFinite(ms) ? ms / 1000 : fallback;

const resolveTracks = (tracks: AlphaTabTrackLike[]): TabTrack[] =>
  tracks.map((track, idx) => ({
    id: track.id ?? `track-${idx}`,
    name: track.name ?? `Track ${idx + 1}`,
    tuning: track.tuning,
    isPercussion: track.isPercussion,
    stemUrl: track.stemUrl,
    volume: track.volume,
    pan: track.pan,
    isMuted: false,
    isSoloed: false,
  }));

const createBeat = ({
  beat,
  beatDurationSec,
  measureIndex,
  beatIndex,
  measureStartSeconds,
  trackId,
}: {
  beat: AlphaTabBeatLike;
  beatDurationSec: number;
  measureIndex: number;
  beatIndex: number;
  measureStartSeconds: number;
  trackId: string;
}): TabBeat => {
  const timeSeconds = toSeconds(beat.start, measureStartSeconds + beatIndex * beatDurationSec);

  return {
    id: beat.id ?? `m${measureIndex}-b${beatIndex}`,
    timeSeconds,
    durationSeconds: toSeconds(beat.duration, beatDurationSec),
    measureIndex,
    beatIndex,
    trackId: beat.trackId ?? trackId,
    isRest: beat.isRest,
    isAccent: beat.isAccent,
    notes: beat.notes ?? [],
  };
};

export const parseAlphaTabScore = (
  score: AlphaTabScoreLike,
  overrides?: Partial<TabSong>
): TabSong => {
  const beatDurationSec = 60 / Math.max(score.bpm || overrides?.bpm || 120, 1);
  const tracks = resolveTracks(score.tracks);
  const firstTrackId = tracks[0]?.id ?? 'track-0';

  let beats: TabBeat[] = [];
  let measures: TabMeasure[] = [];

  if (score.measures && score.measures.length) {
    score.measures.forEach((measure, measureIndex) => {
      const measureStartSeconds = toSeconds(measure.start, measureIndex * beatDurationSec * 4);
      const ts: TabTimeSignature | undefined =
        measure.numerator && measure.denominator
          ? { numerator: measure.numerator, denominator: measure.denominator }
          : score.timeSignature;

      const beatsInMeasure = (measure.beats || []).map((beat, beatIdx) =>
        createBeat({
          beat,
          beatDurationSec,
          measureIndex,
          beatIndex: beatIdx,
          measureStartSeconds,
          trackId: beat.trackId ?? firstTrackId,
        })
      );

      beats.push(...beatsInMeasure);
      const lastBeat = beatsInMeasure[beatsInMeasure.length - 1];
      const endSeconds = lastBeat
        ? lastBeat.timeSeconds + lastBeat.durationSeconds
        : measureStartSeconds + beatDurationSec * 4;

      measures.push({
        index: measureIndex,
        startSeconds: measureStartSeconds,
        endSeconds,
        timeSignature: ts,
        beats: beatsInMeasure,
      });
    });
  } else if (score.beats && score.beats.length) {
    beats = score.beats.map((beat, idx) => {
      const measureIndex = beat.measureIndex ?? Math.floor(idx / 4);
      const beatIndex = beat.beatIndex ?? idx % 4;
      const measureStartSeconds = measureIndex * beatDurationSec * 4;
      return createBeat({
        beat,
        beatDurationSec,
        measureIndex,
        beatIndex,
        measureStartSeconds,
        trackId: beat.trackId ?? firstTrackId,
      });
    });
  }

  const durationSeconds = toSeconds(score.duration, overrides?.durationSeconds ?? 0);

  return {
    id: overrides?.id ?? score.id ?? 'alpha-tab-song',
    title: score.title ?? overrides?.title ?? 'Untitled Tab',
    artist: score.artist ?? overrides?.artist,
    bpm: overrides?.bpm ?? score.bpm,
    durationSeconds: durationSeconds > 0 ? durationSeconds : overrides?.durationSeconds ?? 0,
    tracks,
    measures: overrides?.measures ?? measures,
    beats: overrides?.beats ?? beats,
    sections: overrides?.sections,
    timeSignature: overrides?.timeSignature ?? score.timeSignature,
  };
};
