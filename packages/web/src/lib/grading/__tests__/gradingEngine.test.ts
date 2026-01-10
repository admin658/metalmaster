import { gradePerformance } from '../gradingEngine';
import { computeScores, detectOnsets, mapOnsetsToNotes } from '@metalmaster/shared';

jest.mock('@metalmaster/shared', () => ({
  computeScores: jest.fn(),
  detectOnsets: jest.fn(),
  mapOnsetsToNotes: jest.fn(),
  DEFAULT_TOLERANCE_MS: 50,
}));

describe('gradePerformance', () => {
  it('wires onset detection, mapping, and scoring', async () => {
    const noteResults = [
      {
        expectedTime: 0,
        detectedTime: 10,
        timingErrorMs: 10,
        hit: true,
        barNumber: 1,
      },
    ];

    (detectOnsets as jest.Mock).mockReturnValue([10]);
    (mapOnsetsToNotes as jest.Mock).mockReturnValue(noteResults);
    (computeScores as jest.Mock).mockReturnValue({
      bars: [],
      timingScore: 88,
      overallScore: 88,
      feedbackFlags: ['late_consistently'],
    });

    const result = await gradePerformance(new Float32Array([0, 1, 0, 1]), 44100, [
      { time: 0, barNumber: 1 },
    ]);

    expect(detectOnsets).toHaveBeenCalled();
    expect(mapOnsetsToNotes).toHaveBeenCalledWith([{ time: 0, barNumber: 1 }], [10], 50);
    expect(computeScores).toHaveBeenCalledWith(noteResults, undefined, 50);
    expect(result.timingScore).toBe(88);
    expect(result.feedbackFlags).toContain('late_consistently');
  });
});
