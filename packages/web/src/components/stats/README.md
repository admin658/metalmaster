# Stats components (Web)

Short docs for the web stats components added under `packages/web/src/components/stats/`.

Components
- `UserHeatmap.tsx` — calendar heatmap (uses `react-calendar-heatmap`).
  - Fetches `/api/user-stats/heatmap` via SWR by default.
  - Expected data: `Array<{ date: string; count: number }>` where `date` is `YYYY-MM-DD`.
  - Props: `{ className?: string }`.

- `SkillProgressBars.tsx` — vertical bars rendered with `recharts`.
  - Fetches `/api/user-stats/skills` via SWR by default.
  - Expected data: `{ accuracy: number, speed: number, rhythm: number, toneKnowledge: number }` with numbers in `0..1`.
  - Props: `{ className?: string }`.

- `AchievementBadgesGrid.tsx` — gallery of achievement badges.
  - Fetches `/api/achievements/library` and `/api/achievements` (user earned) via SWR by default.
  - Expected library item shape: `{ id: string, name: string, iconUrl?: string, xpMultiplier?: number }`.
  - Expected earned shape: `string[]` (array of earned achievement ids) or objects with `id`/`achievement_id`.
  - Props: `{ className?: string }`.

- `StatsOverview.tsx` — composition view that dynamically imports the three components (client-only).
  - No props. This is the component used by the test page at `src/app/stats/page.tsx`.

Notes
- Dependencies: `react-calendar-heatmap` and `recharts` were added to `packages/web/package.json`. Run `yarn install` at the repo root after pulling changes.
- The components use SWR and dynamic imports to avoid SSR issues. If you want to pass data from server components/pages, pass props to the components instead of letting them fetch.

Quick test
- Start the web dev server and open `/stats`:
```powershell
cd f:\metalmaster
yarn workspace @metalmaster/web dev
```

If your API endpoints return different shapes/field names, adapt the mapping inside the components or provide props with normalized data.
