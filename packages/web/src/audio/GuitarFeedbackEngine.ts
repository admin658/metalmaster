import usePitchDetection from '../hooks/usePitchDetection';
import {
  gradePerformance,
  type ExpectedNote,
  type GradeOptions,
  type GradeSummary,
  type PlayedNote,
} from './grading';

export type { ExpectedNote, GradeOptions, GradeSummary, PlayedNote } from './grading';

export function createFeedbackEngine(expected: ExpectedNote[]) {
  const { start, detectPitch } = usePitchDetection();
  const playedNotes: PlayedNote[] = [];
  let lastCaptured: PlayedNote | null = null;
  const matchWindowSeconds = 0.24; // generous window; final scoring uses tighter on-time threshold

  async function begin() {
    await start();
  }

  function evaluate(currentTime: number) {
    const pitch = detectPitch();
    if (!pitch) return null;
    // Keep fractional MIDI values (in semitones) — don't round here so grading
    // can apply fine-grained pitch tolerances. Store freqHz for debugging.
    const midi = 12 * Math.log2(pitch / 440) + 69;
    const sample: PlayedNote = { time: currentTime, midi, freqHz: pitch };

    // Improve deduplication: treat notes as the same if they're very close in
    // time and pitch (within small thresholds). Using exact equality caused
    // repeated captures when using fractional MIDI values.
    const isNewCapture =
      !lastCaptured ||
      Math.abs(sample.time - lastCaptured.time) > 0.04 ||
      Math.abs(sample.midi - lastCaptured.midi) > 0.35;

    if (isNewCapture) {
      playedNotes.push(sample);
      lastCaptured = sample;
    }

    const idx = expected.findIndex((n) => Math.abs(n.time - currentTime) < matchWindowSeconds);

    if (idx === -1) return null;

    const target = expected[idx];
    const pitchError = midi - target.midi; // semitone difference (fractional)
    const correct = Math.abs(pitchError) <= 1;

    return {
      pitch,
      midi,
      correct,
      expected: target.midi,
      expectedIndex: idx,
      pitchError,
      played: sample,
    };
  }

  function summarize(options?: GradeOptions): GradeSummary {
    return gradePerformance(expected, playedNotes, options);
  }

  function reset() {
    playedNotes.length = 0;
    lastCaptured = null;
  }

  return { begin, evaluate, summarize, reset };
}
