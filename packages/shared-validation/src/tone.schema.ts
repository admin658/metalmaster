import { z } from 'zod';

export const TonePresetSchema = z.object({
  name: z.string().min(1),
  distortion: z.number().min(0).max(1),
  irFile: z.string().url().nullable().or(z.literal('')).transform((v) => (v === '' ? null : v)),
  reverb: z.number().min(0).max(1),
  eq: z.object({
    bass: z.number().min(-12).max(12),
    mid: z.number().min(-12).max(12),
    treble: z.number().min(-12).max(12),
  }),
});

export type TonePreset = z.infer<typeof TonePresetSchema>;
