import { z } from 'zod';
import levelsSeed from './xpLevels.seed.json';

const LevelSchema = z.object({
  level: z.number().int().positive(),
  total_xp_required: z.number().int().nonnegative(),
  title: z.string().min(1),
  rewards: z.array(z.string()),
});

export const XpLevelsConfigSchema = z.object({
  version: z.string().min(1),
  curve_name: z.string().min(1),
  max_level: z.number().int().positive(),
  xp_definition: z.string().min(1),
  notes: z.string().optional(),
  levels: z.array(LevelSchema).nonempty(),
});

export type XpLevelsConfig = z.infer<typeof XpLevelsConfigSchema>;
export type XpLevelEntry = z.infer<typeof LevelSchema>;

const parsed = XpLevelsConfigSchema.parse(levelsSeed);
const sortedLevels = [...parsed.levels].sort((a, b) => a.level - b.level);

export const xpLevelsConfig: XpLevelsConfig = {
  ...parsed,
  levels: sortedLevels,
};

export const getLevelForTotalXp = (totalXp: number) => {
  let current = xpLevelsConfig.levels[0];
  for (const levelEntry of xpLevelsConfig.levels) {
    if (totalXp >= levelEntry.total_xp_required) {
      current = levelEntry;
    } else {
      break;
    }
  }
  return current;
};
