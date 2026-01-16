import analyzeTone, { detectTone } from '../src/toneAnalyzer';

describe('ai-tone-assistant - analyzer', () => {
  test('detects casual tone with emoji and contractions', () => {
    const text = "hey! i'm so hyped 😄";
    const detected = detectTone(text as any as string);
    expect(detected.tone).toBe('casual');
    expect(detected.score).toBeGreaterThan(0.5);
  });

  test('rewrite to formal', () => {
    const sample = "Hey team, I'm sending the report. Thanks!";
    const res = analyzeTone(sample, 'formal');
    expect(res.detected).toBe('formal');
    expect(res.example).toMatch(/I am/);
  });
});
