export type Tone =
  | 'formal'
  | 'casual'
  | 'friendly'
  | 'professional'
  | 'sarcastic'
  | 'empathetic'
  | 'neutral';

export interface AnalyzeResult {
  detected: Tone;
  score: number; // 0-1 confidence
  suggestions: string[];
  example: string; // rewritten example in detected tone or requested tone
}

function containsContractions(text: string) {
  return /\b(can't|don't|won't|i'm|we're|they're|it's|that's|there's|you're)\b/i.test(text);
}

function containsEmojis(text: string) {
  return /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u.test(text);
}

function avgSentenceLength(text: string) {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!sentences.length) return 0;
  const total = sentences.reduce((acc, s) => acc + s.split(/\s+/).filter(Boolean).length, 0);
  return total / sentences.length;
}

export function detectTone(text: string): { tone: Tone; score: number } {
  const lower = text.toLowerCase();
  const exclam = (text.match(/!/g) || []).length;
  const contractions = containsContractions(text);
  const emojis = containsEmojis(text);
  const avgLen = avgSentenceLength(text);

  // Simple heuristic rules
  if (emojis || exclam > 2 || (contractions && avgLen < 10)) {
    return { tone: 'casual', score: 0.75 };
  }

  if (exclam === 1 && contractions) {
    return { tone: 'friendly', score: 0.7 };
  }

  if (/\b(sincerely|regards|best|kind regards|yours)\b/.test(lower) || avgLen > 20) {
    return { tone: 'formal', score: 0.8 };
  }

  if (/\b(awesome|lol|omg|bruh)\b/.test(lower)) {
    return { tone: 'sarcastic', score: 0.6 };
  }

  if (/\b(i understand|i'm sorry|i'm afraid)\b/.test(lower)) {
    return { tone: 'empathetic', score: 0.8 };
  }

  if (/\b(team|we will|please find|as per)\b/.test(lower)) {
    return { tone: 'professional', score: 0.75 };
  }

  return { tone: 'neutral', score: 0.6 };
}

function rewriteForTone(text: string, tone: Tone): string {
  // Very small, deterministic rewrites for initial scaffolding
  switch (tone) {
    case 'formal':
      return text
        .replace(/\bI'm\b/gi, 'I am')
        .replace(/\bcan't\b/gi, 'cannot')
        .replace(/\bthanks\b/gi, 'thank you')
        .replace(/!+/g, '.')
        .trim();
    case 'casual':
      return text
        .replace(/\bregards\b/gi, 'cheers')
        .replace(/cannot/gi, "can't")
        .replace(/\bsincerely\b/gi, 'best')
        .trim();
    case 'friendly':
      return text.replace(/\.$/, '!').trim();
    case 'professional':
      return text
        .replace(/\bhey\b/gi, 'Hello')
        .replace(/\bthanks\b/gi, 'Thank you')
        .trim();
    case 'empathetic':
      return 'I understand — ' + text.replace(/^./, (s) => s.toLowerCase()).trim();
    case 'sarcastic':
      return text + ' (yeah, right)';
    default:
      return text.trim();
  }
}

export function analyzeTone(text: string, targetTone?: Tone): AnalyzeResult {
  const detected = detectTone(text);
  const tone = targetTone ?? detected.tone;
  const example = rewriteForTone(text, tone);

  const suggestions: string[] = [];
  if (detected.tone !== tone) {
    suggestions.push(`Consider rewriting to a ${tone} tone.`);
  }

  if (detected.score < 0.65)
    suggestions.push('Tone detection confidence is low — consider clarifying intent.');

  if (tone === 'formal') suggestions.push('Avoid contractions and casual slang.');
  if (tone === 'casual')
    suggestions.push('Use contractions, emojis, or shorter sentences for friendliness.');

  return {
    detected: tone,
    score: Math.min(1, detected.score + 0.05),
    suggestions,
    example,
  };
}

export default analyzeTone;
