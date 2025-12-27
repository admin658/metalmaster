# Metal Master - Central Knowledge Base

## Overview
Full-stack metal guitar learning platform spanning shared types/schemas, an Express + Supabase API, a Next.js web app, and an Expo mobile app. Core features: riffs/lessons, AlphaTab-based tab playback, speed trainer, daily riffs, achievements, user stats/XP, practice sessions, and AI-driven tone presets.

## Recent Updates (Dec 2025)
- Netlify Functions API layer added (`netlify/functions/health.ts`, `secure-example.ts`) with Supabase-admin auth verification; `netlify.toml` wired for dev/prod and `apiClient` now targets `/.netlify/functions/*`.
- New homepage, top navigation, and login page with industrial/amber theme, session console, and refreshed CTAs.
- Typed API client rewritten (`packages/web/src/lib/apiClient.ts`) to throw on non-2xx, build function URLs, and support bearer tokens; example component `ApiClientExample` shows Supabase JWT usage.
- Guitar grading engine added: `packages/web/src/audio/grading.ts` aligns expected vs played notes with timing/pitch tolerances, coverage, jitter, bias, and overall grade; `GuitarFeedbackEngine` now captures played notes and returns a `GradeSummary`, and `RiffEvaluationResult` surfaces grade/pitch/timing metrics plus miss/extra counts.

## Architecture & Workspaces
- `packages/shared-types` / `shared-validation` / `shared-schemas` - Shared TypeScript models + Zod schemas.
- `packages/api` - Express API using Supabase auth/RLS + Stripe billing hooks; migrations in `db/migrations`.
- `packages/web` - Next.js (App Router) client with AlphaTab, auth flows, billing routes, and practice dashboards.
- `packages/mobile` - Expo RN app with tab playback/pitch detection auth flows.
- `packages/web/src/components/alphatab` - AlphaTab-specific components (published as workspace).
- Submodule: `docs/alphatab` (alphaTab website docs) for reference.

## Feature Highlights
- Learning: lessons/riffs/tabs/jam tracks with progress tracking and practice sessions.
- Progression: XP/level tiers, streaks, achievements, skill scores, practice heatmap, and stats summary endpoints.
- Gameplay: AlphaTab tab player (demo + GP upload), 2D/3D highways, track mixer, loop/count-in, learn mode, and mic-driven grading with pitch/timing scoring.
- Monetization: Stripe checkout/portal routes; subscription status surfaced via `/api/user-stats` and `useSubscription`.
- AI: `/api/tone-settings` uses OpenAI to generate tone presets validated against shared schemas.

## Web (Next.js)
- Tab Lab (`/tab-player`) uses `TabPlayerShell` + `AlphaTabProvider` with a rack layout: TopBar transport, SectionMap with bar-jump, AlphaTabCanvas driven by `useAlphaTab` (scroll snapping, bar tracking, track switching), BottomRack tabs (Practice, Tone, Mixer, Tools), and optional Coach side panel. Demo selector + GP upload sit above the stage.
- Practice session autosave: `usePracticeSession` reads/writes Supabase `practice_sessions` via `supabaseClient` using `(user_id, session_key, track_index)` upsert and restores UI + AlphaTab seek. Requires `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` and the autosave columns from `003_practice_sessions_autosave.sql` (session key, track index, position/loop fields, BPM/speed, active section, rack tab, coach flag, UI jsonb).
- Diagnostics: `/alphatab-test` runs `AlphaTabWrapper` readiness checks (score loaded vs playback ready) with event log.
- Alternate player: `MetalMasterTabPlayer` provides a high-contrast AlphaTab experience with metal theming, track selection, zoom/layout toggles, and colored fret/tuplet styling via `metalTheme.ts`.
- Assets & demos: AlphaTab assets live under `packages/web/public/alphatab`; demo GP files live under `public/tabs` and `public/lessons` (new `lessons_metal-heavy_guitar_exercises.gp4`). `generate:tab-demos` builds `src/app/tab-player/demoFiles.generated.ts` from those folders.
- Profile page pulls `/api/user-stats` + `/api/user-stats/summary` + achievements/stats hooks for level/XP/streak/heatmap cards. `TopUserBadge` shows auth + subscription state; `useSubscription` now hits `/api/user-stats` with the stored token and offers upgrade/portal helpers.
- Styling: monochrome AlphaTab skin in `src/app/alphaTab.css`; global metal theme via `globals.css` + Geist fonts.
- Tab Lab UI tweaks: transport bar is bottom-sticky; section bar adds PM/Accents/Fingering/Rhythm/Strings toggles plus a Std Notation toggle; MIDI Out dropdown enumerates AlphaTab output devices when available; AlphaTab scrolling centers the playhead; custom per-fret note coloring with default fallbacks keeps notation visible.
- Grading UX: `GuitarFeedbackEngine` captures mic input and aligns against expected notes; `grading.ts` scores pitch/timing with jitter/coverage/bias; `RiffEvaluationResult` now displays grade, pitch vs timing accuracy, avg/median offsets, jitter, and miss/extra counts.

## API & Data
- Express routes (high level): auth (login/signup/logout/refresh), tone-settings (OpenAI), speed-trainer, daily-riff, achievements, user-stats (+summary), practice-sessions, XP awards (`/api/xp/award`, `/api/xp/tick`), tabs/riffs/lessons/jam-tracks, billing (`/billing/create-checkout-session`, `/billing/create-portal-session`, Stripe webhook).
- Next.js API (`packages/web/src/app/api`): standardized responses (`_lib/responses.ts`); user-stats routes upsert a Supabase `users` row then seed `user_stats` with defaults when missing (requires service-role key). Summary endpoint aggregates today/week heatmap rows.
- Billing routes require `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY`, and `APP_URL` for redirect URLs.
- XP anti-cheese: base XP is zeroed for inactivity (activity gap > 20s or active ratio < 0.35); micro-loop and seek penalties apply; diminishing returns after 20/45 min per lesson apply to base XP only.

## Database Schema & Migrations
- Migrations: `001_base_schema.sql` (users, lessons, riffs, tabs, jam_tracks/sessions, progress tables, xp_events, achievements, tone_presets, ai_feedback_results), `002_feature_tables.sql` (speed_trainer_sessions, daily_riffs/completions, achievements_library + user_achievements, user_stats with billing fields, user_practice_heatmap, practice_sessions), `003_practice_sessions_autosave.sql` (adds autosave-friendly columns/defaults to practice_sessions, relaxes duration/start/completion NOT NULLs with defaults, adds `(user_id, session_key, track_index)` unique key, and creates a user RLS read/write policy), and `004_xp_badges.sql` (lesson completions, XP metadata support, and badge seeds for lessons 1–10).
- `db/all-migrations.sql` concatenates all migrations for Supabase SQL console runs. `run-migrations.ts` sequentially executes them via Supabase RPC `exec`; requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` and an `exec(sql text)` function in the DB.
- RLS remains enabled on speed_trainer_sessions, daily_riff_completions, user_achievements, user_stats, user_practice_heatmap, practice_sessions (with the new user RW policy).

## Tab Player Stack (AlphaTab)
- `useAlphaTab` wires AlphaTabApi with scroll snapping, loop/playback speed syncing, bar-to-section mapping, and context-registered controls (play/pause/stop, seek, bar jump, track load). `AlphaTabContext` exposes controls to UI components.
- UI shell pieces: `TopBar` (transport, BPM/speed sliders, loop), `SectionMap` (bar-accurate jumps), `MainStage` (AlphaTabCanvas + overlay toggles), `BottomRack` tabs (Practice: loop setters/speed slider; Tone: preset/amp stubs; Mixer: track select/mute/solo/transpose; Tools: tuning/util stubs), `CoachPanel` (stub metrics/notes).
- Persistence expectations: `usePracticeSession` upserts/loads `practice_sessions` columns (`session_key`, `track_index`, `session_type`, `position_seconds`, `speed`, `bpm`, `loop_enabled`, `loop_in_seconds`, `loop_out_seconds`, `active_section_id`, `current_bar_number`, `rack_tab`, `coach_open`, `ui jsonb`) with a unique key on `(user_id, session_key, track_index)`; migration `003_practice_sessions_autosave.sql` provisions these columns and constraints.
- Supporting pieces: `AlphaTabWrapper` ensures assets (alphaTab.js, fonts, soundfont) load and surfaces readiness events; `/alphatab-test` exercises it. `alphaTab.css` supplies a monochrome skin; `metalTheme.ts` provides a colored "metal" theme for custom renderers.

## Tooling & Config
- Next.js config now offered in TS (`next.config.ts`) using `@coderline/alphatab-webpack` with `assetOutputDir: public/alphatab` to ensure fonts/soundfonts are emitted.
- Script: `yarn workspace @metalmaster/web run generate:tab-demos` regenerates demo GP metadata.
- AlphaTab docs reference lives in `docs/alphatab` (git submodule).
- XP rules/lessons: `packages/shared-validation/src/xpRules.seed.json` (validated by Zod in `xpBadgesConfig.ts`); level curve: `packages/shared-validation/src/xpLevels.seed.json` (via `xpLevelsConfig.ts`).
- Lesson 1-10 badges are seeded in `packages/api/db/migrations/004_xp_badges.sql` and awarded via `/api/xp/award`.

## Mobile
- Expo app (React Native 0.81 / Expo SDK 54) with tab playback, pitch detection, auth, and practice flows; Supabase creds supplied via `.env.example` (includes NEXT_PUBLIC_* fallbacks for web parity).

## Ports & Environment
- Web dev: `http://localhost:3000`; API dev: `http://localhost:3001` (adjust `NEXT_PUBLIC_API_URL` as needed).
- Env keys: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (for migrations + server routes), `SUPABASE_ANON_KEY` (client), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY` (tone), `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY`, `APP_URL`, `JWT_SECRET`/`SESSION_SECRET` for the API.

## TODO / Known Gaps
- `run-migrations.ts` depends on a Supabase RPC `exec(sql text)` helper that is not defined in the migrations; create it or run the SQL manually.
- Tab Lab UI has stubs (metronome toggle, tone strip, utilities, coach metrics). Hook to audio engine/AlphaTab events and real tone chain when ready.
- User-stats routes require the service-role key in web API env; without it, initial stat creation will fail with SERVICE_ROLE_REQUIRED.
