import analyzeTone from '../src/toneAnalyzer';

describe('ai-tone-assistant legacy test (converted)', () => {
  test('analyzeTone returns an example', () => {
    const sample = "Hey team, I'm sending the report. Thanks!";
    const res = analyzeTone(sample);
    expect(res.example.length).toBeGreaterThan(0);
  });
});
