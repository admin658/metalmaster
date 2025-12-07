# Metal Master - Full-Stack Music Learning Platform

Metal guitar learning platform spanning API, web, and mobile clients. Built with TypeScript, Express, Next.js, Expo, and Supabase.

## Features
- Lessons & Riffs library
- Speed Trainer with BPM progression
- Daily Riff challenges
- Achievements and XP/Stats (heatmap, skill scores)
- Jam Tracks page with bundled MP3s in `packages/web/public/jam` (uses Supabase jam tracks when present)
- Animated flame backdrop + hover flames on nav links
- Tab Player (AlphaTab) with demo/local upload, transport, track selection, and auto-scroll
- Web (Next.js) and Mobile (Expo) clients
- Learn page ships two bundled video lessons (public/IMG_4520.MOV and IMG_4521.MOV) so you always have starter content even if Supabase is empty.

## Project Structure
```
metal-master/
  packages/
    shared-types/       # TypeScript models
    shared-validation/  # Zod schemas
    shared-schemas/     # Buildable schema bundle
    api/                # Express API
    web/                # Next.js app (App Router)
    mobile/             # Expo app
  package.json          # Workspaces
  .env                  # Root env (NEXT_PUBLIC_API_URL, etc.)
```

## Architecture Highlights
- Shared types/schemas consumed by API + clients.
- Express API + Supabase auth/RLS.
- Next.js web app using SWR, AlphaTab tab player, and tone/3D features.
- Expo mobile app with practice and tab playback.

### API (packages/api)
- Auth via Supabase; routes under `/api/*`.
- Key routes: `/api/auth/login`, `/api/auth/signup`, `/api/lessons`, `/api/riffs`, `/api/tabs`, `/api/jam-tracks`, `/api/user-stats`, `/api/tone-settings`, `/api/practice-sessions`, `/api/achievements`, `/api/speed-trainer`, `/api/daily-riff`.
- Default dev port: **3001**.

### Web (packages/web)
- Next.js (App Router), AlphaTab player at `/tab-player`, auth pages at `/auth/login` and `/auth/signup`.
- Jam page `/jam` includes built-in MP3s from `public/jam` plus any Supabase jam tracks, with inline audio controls.
- Animated flames across the site background and flickering hover flames on navigation links.
- Default dev port: **3000**.
 - Tab Player extras: backing track preload for demo tabs, count-in control, learn-mode auto-slowdown on loop wrap, track selection, and synced 2D/3D highways (3D instanced, mobile-disabled).

### Mobile (packages/mobile)
- Expo app with practice, riffs/tabs, and auth.

## Quick Start
Prereqs: Node 18+, Yarn 4+, Supabase project.

1) Install
```bash
yarn install
```

2) Env
```bash
cp .env .env.local # update SUPABASE_URL, SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3) Build shared packages (when types/schemas change)
```bash
yarn workspace @metalmaster/shared-types build
yarn workspace @metalmaster/shared-validation build
yarn workspace @metalmaster/shared-schemas build
```

4) Run dev servers
```bash
yarn workspace @metalmaster/api dev      # http://localhost:3001
yarn workspace @metalmaster/web dev      # http://localhost:3000
# optional: yarn workspace @metalmaster/mobile start
```

5) Verify
- API health: `curl http://localhost:3001/health`
- Web: http://localhost:3000

## Environment Variables
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (default http://localhost:3001/api)
- `PORT` (API only; defaults to 3001)

## Tab Player (Web)
- Page: `/tab-player`
- Demo tabs: `/public/tabs/*.gp3/.gp5`
- Local upload supported
- AlphaTab assets (fonts, scripts, soundfont) served from `/alphatab/` (see `packages/web/public/alphatab/`); soundfont used: `/alphatab/soundfont/sonivox.sf2`
 - Transport controls under the viewport; tracks below (with per-track view/solo/mute/volume); settings include render engine/scale/layout options.
 - Viewer scrolls inside its pane and stays on the active bar during playback. If playback is silent or tabs fail to render, ensure the `/alphatab` assets (alphaTab.js/mjs/worker/worklet, font/, soundfont/) are served and hard-refresh.

## Auth
- Pages: `/auth/login`, `/auth/signup`
- API: `/api/auth/login`, `/api/auth/signup`
- Tokens stored in `localStorage` by `useAuth`.

## Testing
```bash
yarn test
```

## Admin Ops (Supabase)
- Use service_role in Supabase SQL editor for admin changes.
- Example: grant all achievements and set XP/level for a user by email:
```sql
DO $$
DECLARE uid uuid;
BEGIN
  SELECT id INTO uid FROM users WHERE email = 'user@example.com';
  IF uid IS NULL THEN RAISE EXCEPTION 'No user found'; END IF;
  INSERT INTO user_stats (user_id, total_xp, level, level_tier)
  VALUES (uid, 999999, 99, 'Legend')
  ON CONFLICT (user_id) DO UPDATE
    SET total_xp = EXCLUDED.total_xp, level = EXCLUDED.level, level_tier = EXCLUDED.level_tier, updated_at = now();
  INSERT INTO achievements (user_id, name, description, achieved_at, icon, tier, category, xp_reward)
  SELECT uid, al.name, al.description, now(), al.icon, al.tier, al.category, al.xp_reward
  FROM achievements_library al
  ON CONFLICT (user_id, name) DO UPDATE SET achieved_at = now();
END $$;
```

## License
MIT
