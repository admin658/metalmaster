# Stats components (Mobile)

Docs for the mobile stats components under `packages/mobile/src/components/stats/`.

Components
- `HeatmapGrid.tsx` — lightweight custom grid for last 30 days.
  - Props: `{ data?: Array<{ date: string; practice_minutes?: number }> }`.
  - Renders a small grid of colored squares; color intensity is derived from `practice_minutes`.

- `SkillProgressBars.tsx` — simple native progress bars.
  - Props: `{ skills?: Array<{ category: string; current_score: number }> }` where `current_score` is 0–100.
  - No external deps required.

- `AchievementBadgesGrid.tsx` — badges gallery with locked/unlocked state.
  - Props: `{ library?: Array<{ id: string; name: string; iconUrl?: string; xpMultiplier?: number }>, earnedIds?: string[] }`.
  - Shows `Locked` vs `xN XP` for unlocked badges.

Usage
- The app includes `packages/mobile/src/screens/StatsScreen.tsx` which already wires these components to the app hooks:
  - `useUserHeatmap(start, end)` → feed to `HeatmapGrid`
  - `useUserSkills()` → feed to `SkillProgressBars`
  - `useAchievementsLibrary()` + `useAchievements()` → feed to `AchievementBadgesGrid`

Running locally
- Start Expo and open the app (Stats tab is added to bottom tabs):
```powershell
cd f:\metalmaster
yarn workspace @metalmaster/mobile start
```

Customization
- Convert inline styles to `nativewind` classes if you prefer Tailwind-like styling in RN.
- The components are intentionally dependency-free to keep the mobile bundle small; swap in charting libraries if you need animated charts.
