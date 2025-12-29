/**
 * Grading engine orchestrator for the Metal Master guitar platform.
 * It ties together audio processing and scoring to produce a grading result.
 */

import type { ExpectedNote, PerformanceGradeResult } from "@metalmaster/shared";
import {
  computeScores,
  DEFAULT_TOLERANCE_MS,
  detectOnsets,
  mapOnsetsToNotes,
} from "@metalmaster/shared";

/**
 * Analyze a guitar performance audio and compute grading results.
 * @param audioSamples Float32Array of mono PCM audio data.
 * @param sampleRate Sample rate of the audio data (Hz).
 * @param expectedNotes Array of expected note timings (from AlphaTab/GuitarPro).
 * @param options Optional configuration (tolerance window, song tempo BPM, etc.).
 * @returns PerformanceGradeResult containing scores, note results, bar results, and feedback.
 */
export async function gradePerformance(
  audioSamples: Float32Array,
  sampleRate: number,
  expectedNotes: ExpectedNote[],
  options?: { toleranceMs?: number; bpm?: number },
): Promise<PerformanceGradeResult> {
  const tolerance = options?.toleranceMs ?? DEFAULT_TOLERANCE_MS;
  const bpm = options?.bpm; // tempo of the piece if known (for normalized scoring and feedback)

  // 1. Onset Detection - detect note onset times in the performance audio
  // This may be CPU-intensive. In production, consider offloading to a worker or optimized library.
  const onsetTimes = detectOnsets(audioSamples, sampleRate);

  // 2. Align detected onsets to expected notes
  const noteResults = mapOnsetsToNotes(expectedNotes, onsetTimes, tolerance);

  // 3. Compute scores and aggregate results
  const { bars, timingScore, overallScore, feedbackFlags } = computeScores(noteResults, bpm, tolerance);

  // 4. Assemble the final result object
  const result: PerformanceGradeResult = {
    overallScore,
    timingScore,
    notes: noteResults,
    bars: bars,
    feedbackFlags,
  };

  return result;
}

// OPTIONAL: Future enhancements to the grading engine
// - Pitch detection: After finding onsets, analyze the pitch at each onset to verify correct notes (e.g., via FFT or pitch-tracking algorithm).
// - Technique detection: e.g., palm-mute inference by analyzing note envelope or spectral content to see if the string was muted.
// - Skill-adaptive tolerance: Dynamically adjust the timing tolerance based on player's skill level or song difficulty (tighten for advanced players).
// - Anti-cheese detection: Ensure players are not tricking the system (e.g., making noise to trigger onsets without playing correct notes).
// The architecture allows swapping out the onset detection or scoring logic with more advanced implementations (e.g., using a DSP library or ML model) without changing the API.
