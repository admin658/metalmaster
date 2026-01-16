import analyzeTone from '../packages/ai-tone-assistant/src/toneAnalyzer';

const sample = "Hey team, I'm sending the report. Thanks!";
const res = analyzeTone(sample, 'formal');
console.log(JSON.stringify(res, null, 2));
