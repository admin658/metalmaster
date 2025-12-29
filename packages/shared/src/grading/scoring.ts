/**
 * Scoring and analysis logic for guitar performance grading.
 * This module provides functions to detect note onsets, align them to expected notes, and compute timing scores.
 */

import { BarGradeResult, ExpectedNote, NoteGradeResult } from "./types";

// Default parameters for analysis
export const DEFAULT_TOLERANCE_MS = 50; // default timing tolerance window in ms for a hit
const FRAME_SIZE = 1024; // FFT frame size or energy window size
const HOP_SIZE = 512; // hop length for analysis (50% overlap if frame=1024)
const SAMPLE_RATE_BASE = 44100; // assumed standard sample rate for normalization (use actual sampleRate when known)
// NOTE: FRAME_SIZE and HOP_SIZE are chosen as reasonable defaults; these can be tuned or made configurable.

// Helper function: simple onset detection using energy flux
export function detectOnsets(audioData: Float32Array, sampleRate: number): number[] {
  // Compute short-time energy for each frame and then detect significant increases (onsets).
  const hop = HOP_SIZE;
  const frameSize = FRAME_SIZE;
  const dataLength = audioData.length;
  if (dataLength < frameSize) {
    return []; // audio too short to detect anything
  }

  // Compute energy for each frame
  const energy: number[] = [];
  let sumPrev = 0;
  // Compute energy of first frame
  for (let i = 0; i < frameSize; i++) {
    const sample = audioData[i];
    sumPrev += sample * sample;
  }
  energy.push(sumPrev);
  // Slide window across the audio with given hop size
  for (let offset = hop; offset + frameSize <= dataLength; offset += hop) {
    // Compute energy for frame [offset, offset+frameSize)
    let sum = 0;
    for (let i = 0; i < frameSize; i++) {
      const sample = audioData[offset + i];
      sum += sample * sample;
    }
    energy.push(sum);
    // We could optimize by reusing previous sum (subtract leaving part, add new part),
    // but for clarity and MVP simplicity, use direct computation.
  }

  // Compute novelty function (half-wave rectified energy difference)
  const novelty: number[] = new Array(energy.length);
  novelty[0] = 0; // no onset at the very start by definition
  for (let i = 1; i < energy.length; i++) {
    const diff = energy[i] - energy[i - 1];
    novelty[i] = diff > 0 ? diff : 0;
  }

  // Determine a threshold for onset picking (e.g., some factor of average novelty)
  const avgNovelty = novelty.reduce((a, b) => a + b, 0) / novelty.length;
  const threshold = avgNovelty * 2; // e.g. two times average energy increase as a basic threshold
  // (Threshold tuning may be needed for distorted guitar; in a production system, use adaptive threshold or spectral analysis)

  // Pick peaks in novelty above threshold
  const onsetFrames: number[] = [];
  for (let i = 1; i < novelty.length - 1; i++) {
    if (novelty[i] > threshold && novelty[i] > novelty[i - 1] && novelty[i] >= novelty[i + 1]) {
      onsetFrames.push(i);
      // We consider `i` a peak if it's a local max above threshold.
      // No refractory period is enforced here; very fast notes may result in closely spaced onsets.
    }
  }

  // Convert frame indices to time in milliseconds
  const onsetTimes: number[] = onsetFrames.map((frameIndex) => {
    const timeSec = (frameIndex * hop) / sampleRate;
    return timeSec * 1000;
  });
  return onsetTimes;
}

/**
 * Align detected onset times to expected notes within a tolerance window.
 * Returns a list of NoteGradeResult for each expected note in order.
 */
export function mapOnsetsToNotes(
  expectedNotes: ExpectedNote[],
  detectedOnsets: number[],
  toleranceMs: number = DEFAULT_TOLERANCE_MS,
): NoteGradeResult[] {
  const noteResults: NoteGradeResult[] = [];
  let onsetIndex = 0;
  for (const expNote of expectedNotes) {
    const expectedTime = expNote.time;
    let detectedTime: number | null = null;
    let hit = false;
    let timingError: number | null = null;

    // Advance the onsetIndex to skip any detected onsets that are too early for this note
    while (onsetIndex < detectedOnsets.length && detectedOnsets[onsetIndex] < expectedTime - toleranceMs) {
      // This onset is earlier than the allowed window for the current expected note, skip it as an extraneous or matched to a previous note.
      onsetIndex++;
    }
    // Now check if the current onset is within the tolerance window for the expected note
    if (onsetIndex < detectedOnsets.length && Math.abs(detectedOnsets[onsetIndex] - expectedTime) <= toleranceMs) {
      // We have an onset within the acceptable window of this expected note
      detectedTime = detectedOnsets[onsetIndex];
      hit = true;
      timingError = detectedTime - expectedTime; // in ms, negative if early, positive if late
      onsetIndex++; // consume this onset for this note and move to next
    } else {
      // No onset found in the allowed window, this note is considered missed
      detectedTime = null;
      hit = false;
      timingError = null;
      // (We do not advance onsetIndex here, as the onset at onsetIndex might belong to a later note if it's beyond this note's window)
    }

    noteResults.push({
      expectedTime: expectedTime,
      detectedTime: detectedTime,
      timingErrorMs: timingError,
      hit: hit,
      barNumber: expNote.barNumber,
    });
  }
  return noteResults;
}

/**
 * Compute per-bar aggregate results and overall scores from note results.
 * Applies scoring rules to derive timing scores and feedback flags.
 */
export function computeScores(
  noteResults: NoteGradeResult[],
  bpm?: number,
  toleranceMs: number = DEFAULT_TOLERANCE_MS,
): { bars: BarGradeResult[]; timingScore: number; overallScore: number; feedbackFlags: string[] } {
  // Group note results by bar
  const barsMap: Map<number, BarGradeResult> = new Map();
  for (const note of noteResults) {
    const barNum = note.barNumber;
    if (!barsMap.has(barNum)) {
      barsMap.set(barNum, {
        barNumber: barNum,
        notes: [],
        hitCount: 0,
        missCount: 0,
        score: 0,
      });
    }
    const barResult = barsMap.get(barNum)!;
    barResult.notes.push(note);
    if (note.hit) {
      barResult.hitCount++;
    } else {
      barResult.missCount++;
    }
  }
  // Compute bar scores and prepare bars array (sorted by bar number)
  const bars: BarGradeResult[] = [];
  let totalNoteCount = 0;
  let totalScoreSum = 0; // sum of note scores (fractions) for overall
  for (const [, barResult] of barsMap) {
    // Calculate timing score for each note in this bar (0-1 range fraction)
    let barScoreSum = 0;
    for (const note of barResult.notes) {
      let noteScoreFrac = 0;
      if (note.hit && note.timingErrorMs !== null) {
        // If BPM is provided, normalize error to tempo (relative to quarter note length) for scoring
        if (bpm) {
          const beatLengthMs = 60000 / bpm;
          // Define a reference fractional tolerance across tempos (e.g., tolerance at 120 BPM as baseline)
          const refBeatLength = 60000 / 120; // reference BPM 120
          const thresholdFraction = toleranceMs / refBeatLength;
          // thresholdFraction is typically 0.1 if toleranceMs=50 and ref=120 BPM.
          const errorFraction = Math.abs(note.timingErrorMs) / beatLengthMs;
          noteScoreFrac = Math.max(0, 1 - errorFraction / thresholdFraction);
        } else {
          // No BPM given, use absolute tolerance for score
          noteScoreFrac = Math.max(0, 1 - Math.abs(note.timingErrorMs) / toleranceMs);
        }
      } else {
        // Missed note -> 0 score fraction
        noteScoreFrac = 0;
      }
      barScoreSum += noteScoreFrac;
    }
    // Average note score in this bar and scale to 0-100
    const barNoteCount = barResult.notes.length;
    const barScoreFraction = barNoteCount > 0 ? barScoreSum / barNoteCount : 0;
    barResult.score = Math.round(barScoreFraction * 100);
    // Update overall accumulators
    totalNoteCount += barNoteCount;
    totalScoreSum += barScoreSum;
    bars.push(barResult);
  }
  // Sort bars by bar number
  bars.sort((a, b) => a.barNumber - b.barNumber);

  // Compute overall timing score (average of all note scores) and overallScore
  const overallFraction = totalNoteCount > 0 ? totalScoreSum / totalNoteCount : 0;
  const timingScore = Math.round(overallFraction * 100);
  const overallScore = timingScore; // Currently overallScore is the same as timingScore (only timing factor considered)

  // Determine feedback flags
  const feedbackFlags: string[] = [];
  // Calculate average timing error (ms) for hit notes to gauge early/late tendency
  let sumErrorMs = 0;
  let countHits = 0;
  for (const note of noteResults) {
    if (note.hit && note.timingErrorMs !== null) {
      sumErrorMs += note.timingErrorMs;
      countHits++;
    }
  }
  const avgErrorMs = countHits > 0 ? sumErrorMs / countHits : 0;
  const EARLY_LATE_THRESHOLD = 20; // ms threshold to consider consistently early/late
  if (countHits > 0) {
    if (avgErrorMs < -EARLY_LATE_THRESHOLD) {
      feedbackFlags.push("early_consistently");
    } else if (avgErrorMs > EARLY_LATE_THRESHOLD) {
      feedbackFlags.push("late_consistently");
    }
  }
  if (bpm && bpm >= 180) {
    // High tempo song feedback
    if (countHits > 0 && avgErrorMs < -EARLY_LATE_THRESHOLD) {
      feedbackFlags.push("rushes_at_high_bpm");
    }
    // (If consistently late at high BPM, we could add a different flag, e.g., "struggles_at_high_bpm", but not specified.)
  }
  // Missed downbeats: check if the first note of bars (downbeat) were often missed
  let missedDownbeatsCount = 0;
  for (const bar of bars) {
    // Identify if there's an expected note on the downbeat of this bar (assume first note in barResult with expectedTime equal to bar start)
    // Here we simply consider the first note in the barResult; in a complete implementation, we'd know the exact beat timings.
    if (bar.notes.length > 0) {
      const firstNote = bar.notes[0];
      // If the first expected note of the bar was at the bar start and was missed:
      // (Assume expectedTime % barLength == 0 for downbeat note. We don't explicitly have bar start time here.)
      // For MVP, we'll approximate by checking if it's the first note in the bar and whether it's a hit.
      if (!firstNote.hit) {
        missedDownbeatsCount++;
      }
    }
  }
  if (missedDownbeatsCount >= 2) {
    feedbackFlags.push("missed_downbeats");
  }

  return { bars, timingScore, overallScore, feedbackFlags };
}
