import { OpenAI } from 'openai';
import { ToneSettingsSchema } from '@metalmaster/shared-validation';
import type { ToneSettings } from '@metalmaster/shared-types';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Gets structured tone settings for a given artist and gear using GPT.
 * @param artist - The artist name
 * @param gear - The gear description
 * @returns Structured tone info
 */
export async function getToneSettings(artist: string, gear: string): Promise<ToneSettings> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Tone settings service is unavailable.');
  }

  const prompt = `You are a metal guitar tone assistant. Given the artist "${artist}" and gear "${gear}", return a JSON object with: artist, gear, amp, cab, pedals (array), settings (gain, bass, mid, treble, presence, notes), and a description. Example:
{
  "artist": "Metallica",
  "gear": "ESP LTD, Mesa Boogie Dual Rectifier",
  "amp": "Mesa Boogie Dual Rectifier",
  "cab": "Mesa 4x12",
  "pedals": ["Tube Screamer", "Noise Gate"],
  "settings": { "gain": "7", "bass": "6", "mid": "5", "treble": "7", "presence": "6", "notes": "Slight scoop" },
  "description": "Classic Metallica rhythm tone with tight low end and scooped mids."
}
Respond ONLY with valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [
      { role: 'system', content: 'You are a metal guitar tone assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  // Extract and parse JSON from GPT response
  const raw = completion.choices[0]?.message?.content?.trim() || '';
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error('Failed to parse GPT response as JSON');
  }

  // Validate with Zod
  const tone = ToneSettingsSchema.safeParse(parsed);
  if (!tone.success) {
    throw new Error('Invalid tone settings format: ' + JSON.stringify(tone.error.issues));
  }

  return tone.data;
}
