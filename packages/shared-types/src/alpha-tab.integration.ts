import { parseAlphaTabScore, AlphaTabScoreLike } from './alpha-tab-parser';
import type { TabSong, TabTimeSignature, TabTrack } from './tab-player.types';

const extractTimeSignature = (score: any): TabTimeSignature | undefined => {
  const ts = score?.masterBars?.[0]?.timeSignature ?? score?.timeSignature;
  if (!ts) return undefined;
  const numerator = ts.numerator ?? ts[0];
  const denominator = ts.denominator ?? ts[1];
  if (!numerator || !denominator) return undefined;
  return { numerator, denominator };
};

const mapTracks = (score: any): TabTrack[] => {
  const tracks = Array.isArray(score?.tracks) ? score.tracks : [];
  return tracks.map((track: any, idx: number) => ({
    id: String(track.id ?? `track-${idx}`),
    name: track.name ?? `Track ${idx + 1}`,
    tuning: Array.isArray(track.tuning) ? track.tuning.join(' ') : track.tuning,
    isPercussion: Boolean(track.isPercussion),
    stemUrl: track.stemUrl,
    volume: track.playbackInfo?.volume ?? track.volume,
    pan: track.playbackInfo?.pan ?? track.pan,
    isMuted: Boolean(track.isMuted),
    isSoloed: Boolean(track.isSoloed),
  }));
};

/**
 * Convert an alphaTab score object into the shared TabSong shape.
 * This is intentionally defensive: when beats/measures are missing,
 * downstream sync utilities will synthesize beats using BPM/duration.
 */
export const alphaTabScoreToTabSong = (score: any): TabSong => {
  const tracks = mapTracks(score);
  const timeSignature = extractTimeSignature(score);
  const bpm =
    score?.tempo ??
    score?.playbackInfo?.tempo ??
    score?.playerState?.tempo ??
    score?.tempoViewModel?.tempo ??
    120;

  const alphaShape: AlphaTabScoreLike = {
    id: score?.id ?? score?.title ?? 'alpha-tab-score',
    title: score?.title ?? 'Untitled Tab',
    artist: score?.artist,
    bpm,
    duration: score?.duration ?? score?.playbackDuration ?? 0,
    tracks: tracks.map((track) => ({
      id: track.id,
      name: track.name,
      tuning: track.tuning,
      isPercussion: track.isPercussion,
      stemUrl: track.stemUrl,
      volume: track.volume,
      pan: track.pan,
    })),
    measures: (score?.masterBars ?? []).map((bar: any, idx: number) => ({
      start: bar.start ?? idx * (60000 / Math.max(bpm, 1)) * 4,
      numerator: bar.timeSignature?.numerator,
      denominator: bar.timeSignature?.denominator,
      beats: [],
    })),
    timeSignature,
  };

  return parseAlphaTabScore(alphaShape, {
    title: alphaShape.title,
    artist: alphaShape.artist,
    bpm: alphaShape.bpm,
    durationSeconds: typeof score?.duration === 'number' ? score.duration / 1000 : undefined,
    tracks,
    timeSignature,
  });
};
