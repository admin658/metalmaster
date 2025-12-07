import { z } from 'zod';

export const ToneSettingsSchema = z.object({
  artist: z.string(),
  gear: z.string(),
  amp: z.string(),
  cab: z.string(),
  pedals: z.array(z.string()),
  settings: z.object({
    gain: z.string(),
    bass: z.string(),
    mid: z.string(),
    treble: z.string(),
    presence: z.string().optional(),
    notes: z.string().optional(),
  }),
  description: z.string(),
});

export type ToneSettings = z.infer<typeof ToneSettingsSchema>;
