# Metal Master — Architecture

## Overview

Metal Master is a TypeScript monorepo for teaching metal guitar. It includes an Express REST API (Supabase-backed), a Next.js web client (App Router), an Expo React Native mobile client, and AI/audio analysis services. The repo uses Yarn workspaces and three shared packages — `@metalmaster/shared-types`, `@metalmaster/shared-validation`, and `@metalmaster/shared-schemas` — as the single source of truth for types and runtime schemas. `shared-schemas` is a buildable workspace package (compiles TypeScript to CommonJS in `dist/`) that contains focused Zod schema files (for example `achievements`) consumable by other packages. A TypeScript seed script is available at `packages/api/scripts/seedAchievements.ts` to populate the `achievements` table.

## Packages

- **Root**: workspace orchestration and scripts (`yarn dev`, `yarn build`, `yarn test`).
- **packages/shared-types**: TypeScript type definitions (User, Riff, DailyRiff, UserStats, ApiResponse<T>, etc.).
- **packages/shared-validation**: Zod schemas mapped to shared types; used in API route validation.
- **packages/api**: Express REST API with Supabase integration, DB migrations in `db/migrations`, server scripts in `src/scripts`, and AI helper Python code used in development.
- **packages/web**: Next.js (App Router) client, SWR hooks (in `src/hooks`), typed API client `src/lib/apiClient.ts`, UI components `src/components` and pages under `src/app`.
- **packages/mobile**: Expo React Native client that shares types and validation; uses secure token storage.
- **packages/ai-services**: Model-backed AI helpers (audio-analysis, tab-generator, tone-assistant) for analysis and content generation.

## API Routes (high level)

- **Auth**
  - `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/refresh`
- **Users**
  - `GET /api/users/profile`, `PATCH /api/users/profile`
- **Lessons**
  - CRUD: `GET /api/lessons`, `GET /api/lessons/:id`, `POST/PATCH/DELETE`
- **Riffs & Tabs**
  - `GET /api/riffs`, `GET /api/riffs/:id`, riff CRUD; tab CRUD under `/api/tabs`
- **Daily Riff**
  - `GET /api/daily-riff/today`, `GET /api/daily-riff/list`, `POST /api/daily-riff/complete`, `GET /api/daily-riff/stats`
- **Speed Trainer**
  - `POST /api/speed-trainer/sessions`, `GET /api/speed-trainer/sessions`, `GET /api/speed-trainer/progress`
- **Achievements**
  - `GET /api/achievements/library`, `GET /api/achievements/user`, `GET /api/achievements/progress`
- **User Stats**
  - `GET /api/user-stats`, `GET /api/user-stats/summary`, `GET /api/user-stats/heatmap`, `GET /api/user-stats/skills`
- **Practice Sessions**
  - `POST /api/practice-sessions`, `GET /api/practice-sessions`, `GET /api/practice-sessions/stats`

## Database Schema (core & feature tables)

### Core tables
- `users`: id, email, username, profile metadata
- `lessons`: id, title, content, difficulty, metadata
- `riffs`: id, title, tab_id(s), video_url, technique tags, subgenre
- `tabs`: id, riff_id, content (formats)
- `jam_tracks`: id, url, tempo, key, tags

### Feature tables (introduced in migrations/005_features.sql)
- `speed_trainer_sessions`: session_id, user_id, bpm, duration, accuracy, created_at
- `daily_riffs`: id, riff_id, featured_date, xp_bonus, metadata (video_url/tab_content), created_at
- `daily_riff_completions`: id, user_id, daily_riff_id, completed_at, xp_awarded
- `achievements_library`: achievement_id, name, icon, criteria, xp_reward
- `user_achievements`: id, user_id, achievement_id, earned_at, progress
- `user_stats`: user_id, xp, level, tier, skill_scores (json), last_updated
- `user_practice_heatmap`: user_id, date, seconds_practiced (or intensity)
- `practice_sessions`: id, user_id, session_type, duration, details(json), created_at

### Access control

Row-Level Security (RLS) is enabled for user-owned tables; policies check `auth.uid()` or `current_setting('jwt.claims.user_id')::uuid` against `user_id` to restrict reads/writes to the owning user.

## AI Services & Integration

- **Development helpers**: `packages/api/ai_feedback_api.py` exposes dev endpoints like `POST /analyze` (tempo/onset detection via `librosa`) and `POST /generate-tab` (uses `basic_pitch` if available) for audio analysis.
- **AI packages**: `packages/ai-services/audio-analysis`, `packages/ai-services/tab-generator`, `packages/ai-services/tone-assistant` contain logic for feature extraction, tab generation, and tone recommendations.
- **Workflow**: audio uploaded to API → queued or handled by AI service → results persisted to DB or returned to client. For production, run AI services as separate worker(s) or services behind queues.

## AI Tone Assistant
- **getToneSettings(artist, gear)**: Node utility in `packages/api/src/utils/getToneSettings.ts`.
  - Sends prompt to GPT-4 for metal guitar tone settings.
  - Validates response with Zod schema.
  - Returns structured amp/cab/pedals/settings info for use in tone features and API routes.

## Guitar Tab Rendering
- **GuitarTabRenderer**: React component in `packages/web/src/components/GuitarTabRenderer.tsx`.
  - Uses VexFlow to render guitar tab notation inside a styled SVG/canvas div.
  - Accepts structured tab data and displays measures, notes, and fret/string positions visually.
  - Requires `vexflow` package (installed in web workspace).

## Conventions & Runtime

- Standard API response: `{ success, data?, error?, meta: { timestamp, version } }` (see `packages/shared-types/src/api.types.ts`).
- Zod validation: schemas in `packages/shared-validation` used by routes; Zod errors normalized with `code: 'VALIDATION_ERROR'`.
- Auth: Supabase JWT tokens; middleware in `packages/api/src/middleware/auth.ts` validates tokens and sets `req.user`.
- Client: web uses SWR hooks (`packages/web/src/hooks/useApi.ts`) wired to a typed `apiClient` (`packages/web/src/lib/apiClient.ts`) with strict type safety (e.g., `ApiResponse<UserStats>` in `useSubscription`); mobile uses secure store for tokens.

## Tooling & Run Steps

- Install: `yarn install` (root)
- Build order: `yarn workspace @metalmaster/shared-types build` → `@metalmaster/shared-validation build` → `@metalmaster/shared-schemas build` → `@metalmaster/api build` → `@metalmaster/web build`
- Dev: `yarn dev` runs API, web, and mobile concurrently
- Run rotation script: `yarn workspace @metalmaster/api ts-node src/scripts/rotateDailyRiff.ts`
- Apply DB migrations: run SQL files in `packages/api/db/migrations/` in order or use the project's migration tooling.

## Operational Notes & Recommendations

- Schedule `rotateDailyRiff.ts` as a cron job or use Supabase `pg_cron` for automatic daily rotation.
- Add seed SQL for `achievements_library` (8 sample badges) and include a migration to insert them.
- For production AI workloads, move audio analysis to dedicated workers with queueing (e.g., Redis + workers) to avoid blocking the API.
- Add CI (GitHub Actions) to run TypeScript checks and Jest per package, and ensure Python AI tests run in the required environment when needed.

---

If you want this exported somewhere else (a different filename, or committed automatically and pushed), tell me where and I will do that next.
