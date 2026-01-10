import { computeScores } from '../scoring';
import type { NoteGradeResult } from '../types';

describe('computeScores', () => {
  it('scores hits and flags consistently early timing', () => {
    const noteResults: NoteGradeResult[] = [
      { expectedTime: 0, detectedTime: -30, timingErrorMs: -30, hit: true, barNumber: 1 },
      { expectedTime: 500, detectedTime: 470, timingErrorMs: -30, hit: true, barNumber: 1 },
    ];

    const result = computeScores(noteResults, undefined, 50);

    expect(result.timingScore).toBe(40);
    expect(result.bars[0].score).toBe(40);
    expect(result.feedbackFlags).toContain('early_consistently');
  });

  it('flags missed downbeats across multiple bars', () => {
    const noteResults: NoteGradeResult[] = [
      { expectedTime: 0, detectedTime: null, timingErrorMs: null, hit: false, barNumber: 1 },
      { expectedTime: 1000, detectedTime: null, timingErrorMs: null, hit: false, barNumber: 2 },
    ];

    const result = computeScores(noteResults);

    expect(result.feedbackFlags).toContain('missed_downbeats');
  });
});
