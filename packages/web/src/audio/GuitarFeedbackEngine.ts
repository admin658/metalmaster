import usePitchDetection from '../hooks/usePitchDetection';

export interface ExpectedNote {
  time: number;
  midi: number;
}

export function createFeedbackEngine(expected: ExpectedNote[]) {
  const { start, detectPitch } = usePitchDetection();

  async function begin() {
    await start();
  }

  function evaluate(currentTime: number) {
    const pitch = detectPitch();
    if (!pitch) return null;

    const midi = Math.round(12 * (Math.log2(pitch / 440)) + 69);

    const target = expected.find((n) => Math.abs(n.time - currentTime) < 0.15);

    if (!target) return null;

    const correct = Math.abs(target.midi - midi) <= 1;

    return {
      pitch,
      midi,
      correct,
      expected: target.midi,
    };
  }

  return { begin, evaluate };
}
