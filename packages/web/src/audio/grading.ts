export type ExpectedNote = {
  time: number; // seconds from song start
  midi: number; // MIDI note number (integer)
};

export type PlayedNote = {
  time: number; // seconds from song start
  midi: number;
  freqHz?: number;
};

export type MatchedNote = {
  expected: ExpectedNote;
  played: PlayedNote;
  deltaMs: number; // played - expected in milliseconds
  pitchError: number; // semitone diff (played - expected)
  onTime: boolean;
  pitchCorrect: boolean;
};

export type GradeOptions = {
  /**
   * Maximum time distance (ms) to consider a played note as the match for an expected note.
   */
  timingToleranceMs?: number;
  /**
   * Threshold (ms) for counting a note as on-time in the score.
   */
  onTimeMs?: number;
  /**
   * Allowed pitch delta (in semitones) for a note to be considered correct.
   */
  pitchToleranceSemitones?: number;
};

export type GradeSummary = {
  matches: MatchedNote[];
  misses: ExpectedNote[];
  extras: PlayedNote[];
  pitchAccuracyPct: number;
  timingAccuracyPct: number;
  noteCorrectnessPct: number;
  coveragePct: number;
  avgTimingErrorMs: number;
  meanOffsetMs: number;
  medianTimingErrorMs: number;
  timingJitterMs: number;
  gradePercent: number;
  totalExpected: number;
  totalDetected: number;
  extraNoteCount: number;
};

const defaults: Required<GradeOptions> = {
  timingToleranceMs: 200,
  onTimeMs: 90,
  pitchToleranceSemitones: 0.75,
};

export function gradePerformance(expected: ExpectedNote[], played: PlayedNote[], opts?: GradeOptions): GradeSummary {
  const options = { ...defaults, ...(opts || {}) };
  const sortedExpected = [...expected].sort((a, b) => a.time - b.time);
  const sortedPlayed = [...played].sort((a, b) => a.time - b.time);

  const used = new Set<number>();
  const matches: MatchedNote[] = [];
  const misses: ExpectedNote[] = [];

  sortedExpected.forEach((exp) => {
    let bestIdx = -1;
    let bestDeltaMs = Infinity;

    for (let i = 0; i < sortedPlayed.length; i++) {
      if (used.has(i)) continue;
      const deltaMs = (sortedPlayed[i].time - exp.time) * 1000;
      const absDelta = Math.abs(deltaMs);
      if (absDelta > options.timingToleranceMs) {
        if (sortedPlayed[i].time > exp.time && deltaMs > options.timingToleranceMs) break;
        continue;
      }
      if (absDelta < Math.abs(bestDeltaMs)) {
        bestDeltaMs = deltaMs;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      used.add(bestIdx);
      const playedNote = sortedPlayed[bestIdx];
      const pitchError = playedNote.midi - exp.midi;
      const pitchCorrect = Math.abs(pitchError) <= options.pitchToleranceSemitones;
      const onTime = Math.abs(bestDeltaMs) <= options.onTimeMs;
      matches.push({
        expected: exp,
        played: playedNote,
        deltaMs: bestDeltaMs,
        pitchError,
        onTime,
        pitchCorrect,
      });
    } else {
      misses.push(exp);
    }
  });

  const extras = sortedPlayed.filter((_, idx) => !used.has(idx));

  const timingDeltas = matches.map((m) => m.deltaMs);
  const timingAbs = timingDeltas.map((d) => Math.abs(d));
  const avgTimingErrorMs = timingAbs.length ? mean(timingAbs) : 0;
  const meanOffsetMs = timingDeltas.length ? mean(timingDeltas) : 0;
  const medianTimingErrorMs = timingDeltas.length ? median(timingDeltas) : 0;
  const timingJitterMs = timingDeltas.length ? stddev(timingDeltas) : 0;

  const pitchCorrectCount = matches.filter((m) => m.pitchCorrect).length;
  const timingOnTimeCount = matches.filter((m) => m.onTime).length;
  const combinedCorrectCount = matches.filter((m) => m.pitchCorrect && m.onTime).length;

  const totalExpected = sortedExpected.length;
  const pitchAccuracyPct = totalExpected ? (pitchCorrectCount / totalExpected) * 100 : 0;
  const timingAccuracyPct = totalExpected ? (timingOnTimeCount / totalExpected) * 100 : 0;
  const noteCorrectnessPct = totalExpected ? (combinedCorrectCount / totalExpected) * 100 : 0;
  const coveragePct = totalExpected ? (matches.length / totalExpected) * 100 : 0;

  const gradePercent = clamp(
    0.45 * noteCorrectnessPct + 0.25 * pitchAccuracyPct + 0.2 * timingAccuracyPct + 0.1 * coveragePct,
    0,
    100,
  );

  return {
    matches,
    misses,
    extras,
    pitchAccuracyPct,
    timingAccuracyPct,
    noteCorrectnessPct,
    coveragePct,
    avgTimingErrorMs,
    meanOffsetMs,
    medianTimingErrorMs,
    timingJitterMs,
    gradePercent,
    totalExpected,
    totalDetected: sortedPlayed.length,
    extraNoteCount: extras.length,
  };
}

function mean(nums: number[]): number {
  return nums.length ? nums.reduce((sum, n) => sum + n, 0) / nums.length : 0;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function stddev(nums: number[]): number {
  if (nums.length <= 1) return 0;
  const mu = mean(nums);
  const variance = mean(nums.map((n) => (n - mu) ** 2));
  return Math.sqrt(variance);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
