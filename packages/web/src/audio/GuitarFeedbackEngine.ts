import usePitchDetection from '../hooks/usePitchDetection';
import { gradePerformance, type ExpectedNote, type GradeOptions, type GradeSummary, type PlayedNote } from './grading';

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

    const midi = Math.round(12 * (Math.log2(pitch / 440)) + 69);
    const sample: PlayedNote = { time: currentTime, midi, freqHz: pitch };

    if (!lastCaptured || Math.abs(sample.time - lastCaptured.time) > 0.04 || sample.midi !== lastCaptured.midi) {
      playedNotes.push(sample);
      lastCaptured = sample;
    }

    const target = expected.find((n) => Math.abs(n.time - currentTime) < matchWindowSeconds);

    if (!target) return null;

    const correct = Math.abs(target.midi - midi) <= 1;

    return {
      pitch,
      midi,
      correct,
      expected: target.midi,
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
