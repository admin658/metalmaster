# Metal Master - Setup Guide

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Yarn** 4.0+ (npm is not recommended; this project uses Yarn workspaces with node-modules linker)
- **Supabase** account and project
- **Git**

## Important: Yarn Configuration

This project uses **Yarn with `node-modules` linker** for maximum Node.js compatibility. This is already configured in `.yarnrc.yml`:

```yaml
nodeLinker: node-modules
```

This repo does not use Yarn Zero-Installs; `.yarn/cache` is intentionally not committed. Run `yarn install` after cloning to populate `node_modules`.

If you have issues with dependencies after a fresh clone:
```bash
rm -rf node_modules .yarn/cache .yarn/install-state.gz
yarn install
```

## Step 1: Initialize Supabase

1. Go to https://supabase.com and create a new project
2. Get your project credentials:
   - Project URL
   - Anon Key
   - Service Role Key

## Step 2: Create Database Tables

Execute these SQL queries in your Supabase SQL editor:

Tip: for a full schema bootstrap (including Stripe webhook idempotency), run `packages/api/db/all-migrations-idempotent.sql`.

### Users table (auto-created by Supabase Auth)
Already handled by Supabase authentication

### Lessons table
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  difficulty_level VARCHAR(20) NOT NULL,
  duration_minutes INTEGER,
  video_url VARCHAR(500),
  content TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Riffs table
```sql
CREATE TABLE riffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  bpm INTEGER NOT NULL,
  time_signature VARCHAR(10),
  key VARCHAR(20),
  difficulty_level VARCHAR(20) NOT NULL,
  genre VARCHAR(100),
  audio_url VARCHAR(500),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Tabs table
```sql
CREATE TABLE tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riff_id UUID NOT NULL REFERENCES riffs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  format VARCHAR(50),
  tuning VARCHAR(100),
  difficulty_level VARCHAR(20),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Jam Tracks table
```sql
CREATE TABLE jam_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  riff_id UUID REFERENCES riffs(id),
  bpm INTEGER NOT NULL,
  time_signature VARCHAR(10),
  key VARCHAR(20),
  duration_seconds INTEGER,
  audio_url VARCHAR(500) NOT NULL,
  difficulty_level VARCHAR(20),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Jam Sessions table
```sql
CREATE TABLE jam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  jam_track_id UUID NOT NULL REFERENCES jam_tracks(id),
  recording_url VARCHAR(500),
  duration_seconds INTEGER,
  notes TEXT,
  quality_rating INTEGER,
  created_at TIMESTAMP DEFAULT now()
);
```

## Step 3: Environment Configuration

### Root .env.local
Copy `.env.local.example` to `.env.local` in the project root, then add any additional keys you need:
```
# Base template
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mobile (optional)
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### API .env
Create `.env` in `packages/api/`:
```
NODE_ENV=development
PORT=3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CORS_ORIGIN=http://localhost:3000
#
# Comma-separated list. Supports exact origins and optional suffix patterns.
# Examples:
# CORS_ORIGIN=http://localhost:3000,https://app.example.com
# CORS_ORIGIN=*.netlify.app,https://staging.example.com

JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
```

### Web .env
Create `.env.local` in `packages/web/`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

NEXT_PUBLIC_APP_NAME=Metal Master
```

### Mobile .env
Create `.env` in `packages/mobile/`:
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Install Dependencies

```bash
# Install root dependencies
yarn install

# This automatically installs dependencies for all workspaces
```

### Install API Python dependencies (for local dev/testing)

The API package contains Python components for audio analysis. To run the FastAPI audio endpoints and tests, create a Python virtual environment and install `packages/api/requirements.txt`:

```powershell
cd f:\metalmaster\packages\api
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Notes:
- `basic_pitch` is optional for the `/generate-tab` endpoint; if it's not installed the endpoint returns HTTP 501. The tests included with the repo mock `basic_pitch` so they run without the package.
- `soundfile` (pysoundfile) is required to read/write WAV in tests and helper scripts.

### Notes about new UI dependencies

- The web stats UI uses `react-calendar-heatmap` and `recharts`. These were added to `packages/web/package.json`. Running `yarn install` at the repo root will install them automatically.

If you add or change front-end dependencies only for a workspace you can also run:

```powershell
cd f:\metalmaster\packages\web
yarn install
```

## Step 5: Run Development Servers

### Option 1: Run all services concurrently
```bash
yarn dev
```

This starts:
- API on http://localhost:3000
- Web on http://localhost:3001
- Mobile Expo on http://localhost:19000

### Option 2: Run individual services

Terminal 1 - API:
```bash
yarn workspace @metalmaster/api dev
```

Terminal 2 - Web:
```bash
yarn workspace @metalmaster/web dev
```

Terminal 3 - Mobile:
```bash
yarn workspace @metalmaster/mobile start
```

Note: the mobile app now includes a `Stats` tab in the bottom navigation. Open the Expo app or simulator after `yarn workspace @metalmaster/mobile start` and you should see a `Stats` tab alongside Home/Learn/Riffs/Jam/Profile.

## Step 6: Verify Setup

1. **API**: Visit http://localhost:3000/health
   - Should return: `{ status: "ok", timestamp: "..." }`

4. **API audio endpoints (dev)**: With the API running, you can test the new audio endpoints:

```powershell
# Analyze onset/tempo
curl.exe -X POST -F "file=@C:\path\to\your_audio.wav" http://localhost:3000/analyze

# Generate tab (requires basic_pitch installed for real prediction; otherwise 501)
curl.exe -X POST -F "file=@C:\path\to\your_audio.wav" http://localhost:3000/generate-tab
```

2. **Web**: Visit http://localhost:3001
   - Should load the Metal Master home page

3. **Mobile**: Use Expo Go or emulator
   - Scan the QR code from terminal

## Testing Authentication

1. Go to http://localhost:3001/auth/signup
2. Create a test account
3. You should be able to login and view lessons/riffs/jam tracks

## Troubleshooting

### "Cannot find module 'express'" or Similar Module Errors

This usually means Yarn dependencies aren't linked properly:

```bash
# Clear all caches and reinstall
rm -rf node_modules .yarn/cache .yarn/install-state.gz
yarn install

# Rebuild native modules (esbuild, sharp)
yarn rebuild
```

If the error persists, verify `.yarnrc.yml` has `nodeLinker: node-modules` and NOT `nodeLinker: pnp`.

### Port Already in Use
If port 3000 or 3001 is already in use:
```bash
# Change API port
API_PORT=3001 yarn workspace @metalmaster/api dev

# Change web port
yarn workspace @metalmaster/web dev -- -p 3002
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Running Python tests for API audio endpoints

From `packages/api` after activating the Python venv and installing requirements:

```powershell
cd f:\metalmaster\packages\api
pytest -q
```

The test `test_generate_tab.py` generates a short WAV at runtime and mocks `basic_pitch` so it runs quickly in CI without GPU or `basic_pitch` installed.

### Supabase Connection Issues
- Verify URL and keys are correct
- Check that Supabase project is active
- Ensure firewall isn't blocking connections

### TypeScript Errors or Build Failures

Run a full workspace build to see all errors:
```bash
yarn workspaces foreach -p -R -t run build
```

Fix duplicate type exports in `packages/shared-types/src/*.types.ts` (each exported name should only appear once).

### Tailwind CSS Classes Not Found

Ensure `tailwind.config.js` uses CommonJS export (`module.exports`) and the `content` glob includes all template files.

## Database Seeding (Optional)

Add sample data to Supabase using the SQL editor:

```sql
INSERT INTO riffs (title, description, bpm, time_signature, key, difficulty_level, genre, created_by)
VALUES (
  'Master of Puppets Riff',
  'Classic thrash metal riff',
  180,
  '4/4',
  'E',
  'intermediate',
  'Thrash Metal',
  '00000000-0000-0000-0000-000000000000'
);

INSERT INTO jam_tracks (title, description, bpm, time_signature, key, duration_seconds, audio_url, difficulty_level, created_by)
VALUES (
  'Metal Backing Track 1',
  'Perfect for practicing scales',
  160,
  '4/4',
  'D',
  120,
  'https://example.com/audio.mp3',
  'intermediate',
  '00000000-0000-0000-0000-000000000000'
);
```

## Stripe Webhook Event Cleanup (Optional)

The webhook idempotency table can grow over time. You can periodically remove old rows by running:

```sql
DELETE FROM stripe_webhook_events
WHERE received_at < now() - interval '90 days';
```

For a ready-to-run script (and optional pg_cron schedule), see:
`packages/api/db/maintenance/stripe_webhook_events_cleanup.sql`

## Production Build

### Build all packages
```bash
yarn build
```

### Deploy API
```bash
cd packages/api
yarn build
yarn start
```

### Deploy Web
```bash
cd packages/web
yarn build
yarn start
```

### Deploy Mobile
```bash
cd packages/mobile
eas build --platform ios
eas build --platform android
```

## Next Steps

1. Add global styles/theming
2. Implement upload functionality for audio/videos
3. Add user progress tracking
4. Create instructor dashboard
5. Add real-time collaboration features
6. Implement payment/subscription system
