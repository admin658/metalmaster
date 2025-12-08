# Metal Master - Central Knowledge Base

## Overview

Full-stack metal guitar learning platform with shared types/schemas, an Express + Supabase API, a Next.js web app, and an Expo mobile app. Features include riffs/lessons, tab playback, speed trainer, daily riffs, achievements, stats/XP, and tone/amp tools.

## Architecture (High Level)

- Shared: TypeScript models + Zod schemas reused by API and clients.
- API: Express REST (`/api/*`), Supabase auth/RLS, Stripe billing hooks.
- Web: Next.js (App Router), AlphaTab tab player, Tone/3D visuals, auth UI.
- Mobile: Expo app with practice, tabs, pitch detection, and auth.

## Packages

- `packages/shared-types` - TypeScript models.
- `packages/shared-validation` - Zod schemas.
- `packages/shared-schemas` - Buildable schema bundle.
- `packages/api` - Express API (Supabase auth, routes, middleware, migrations).
- `packages/web` - Next.js web client (App Router).
- `packages/mobile` - Expo React Native client.
- `packages/ai-services` - AI helpers (audio analysis, tone assistant).

## Key Features

- Speed Trainer, Daily Riff, Achievements, User Stats/XP, Practice Sessions.
- AI Tone Settings (`/api/tone-settings`) with shared schemas/types.
- Tab Player: AlphaTab renderer, transport, track mixer, demo + local upload.
- Play modes: playback-only vs mic-enabled grading (Rate My Shred).
- MIDI-only playback path with Tone synth + amp chain; WebMIDI output hook.
- Rocksmith-style visuals (2D/3D highways) on web; tab renderer on mobile.
- Pitch detection and feedback (web + mobile pitchy wrapper).

## API (not exhaustive)

- `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/refresh`.
- `/api/tone-settings` (POST) - GPT-backed tone presets.
- `/api/speed-trainer` - Sessions CRUD, progress stats.
- `/api/daily-riff` - Today/list/complete/stats.
- `/api/achievements` - Library, user achievements, progress.
- `/api/user-stats` - Stats, summary, skills, heatmap.
- `/api/practice-sessions` - CRUD + summary.
- `/api/tabs`, `/api/riffs`, `/api/lessons`, `/api/jam-tracks`.

## Web Highlights

- Tab Player page `/tab-player`: AlphaTab renderer, transport directly under the viewport, compact settings/file pickers, tracks panel below. Demo tabs in `public/tabs`; supports `.gp3/.gp4/.gp5/.gpx` upload.
- AlphaTab integration feeds TabSong + sync engine; WebMIDI out hook; Tone amp chain.
- Amp sim preset panel; 2D/3D highways; AI feedback hooks.
- Auth pages at `/auth/login` and `/auth/signup` (legacy `/login` and `/signup` removed).
- Jam page `/jam` merges Supabase jam tracks with the bundled MP3s in `packages/web/public/jam`, rendering inline audio controls for each track.
- Site-wide animated flame backdrop plus flickering flame hover effect on navigation links.
- Homepage + Learn/Jam/Riffs use the new "Metal Master" hero aesthetic (gradients, display font, CTA chips) with refreshed grids and media-aware cards. Achievements/Profile are restyled with gradient cards, tabbed Achievements view, and richer stat tiles. Speed Trainer now matches the aesthetic with hero, ramp controls, and gradient stat cards. Auth screens pick up the hero/gradient card treatment. Daily Riff refreshed with gradient hero/cards; Practice History and Stats restyled to the same system. Tab Player and Pricing now use the new hero/gradient layout with updated cards.

## Mobile Highlights

- Tab player with loop/speed/mixer and synced tab view.
- Tab renderer shows measure markers and tap-to-scrub.
- Pitch detection via pitchy service.

## Shared Types & Schemas

- Types: lessons, riffs/tabs, jam tracks, speed trainer, daily riff, achievements, user stats, practice sessions, tone presets, tab-player models.
- Schemas: Zod mirrors + helpers (`api.schemas.ts`, `tone.schemas.ts`, `tone.schema.ts`).

## Data & Infra

- Supabase Postgres with RLS; migrations under `packages/api/db/migrations`.
- Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY` (tone), and web/mobile NEXT_PUBLIC/SUPABASE vars. API requires `JWT_SECRET` and `SESSION_SECRET` (long random strings) set in `packages/api/.env` and in deployed API env.
- Billing: Stripe webhook under `/api/billing/webhook`.
- Jam tracks available via Supabase table `jam_tracks`, with local fallback assets in `packages/web/public/jam`.

## Admin SQL Recipes (Supabase, service_role)

- Grant max XP/Legend tier and award all achievements to a user by email:

```sql
DO $$
DECLARE uid uuid;
BEGIN
  SELECT id INTO uid FROM users WHERE email = 'user@example.com';
  IF uid IS NULL THEN RAISE EXCEPTION 'No user found'; END IF;

  INSERT INTO user_stats (user_id, total_xp, level, level_tier)
  VALUES (uid, 999999, 99, 'Legend')
  ON CONFLICT (user_id) DO UPDATE
    SET total_xp = EXCLUDED.total_xp,
        level = EXCLUDED.level,
        level_tier = EXCLUDED.level_tier,
        updated_at = now();

  INSERT INTO achievements (user_id, name, description, achieved_at, icon, tier, category, xp_reward)
  SELECT uid, al.name, al.description, now(), al.icon, al.tier, al.category, al.xp_reward
  FROM achievements_library al
  ON CONFLICT (user_id, name) DO UPDATE SET achieved_at = now();
END $$;
```

- Revoke a specific achievement (DELETE or clear achieved_at):

```sql
DELETE FROM achievements a
USING users u
WHERE a.user_id = u.id AND u.email = 'user@example.com' AND a.name = 'Legend';
-- or
UPDATE achievements a SET achieved_at = NULL
FROM users u
WHERE a.user_id = u.id AND u.email = 'user@example.com' AND a.name = 'Legend';
```

- Reset XP/level to baseline:

```sql
INSERT INTO user_stats (user_id, total_xp, level, level_tier)
SELECT u.id, 0, 1, 'Novice' FROM users u WHERE u.email = 'user@example.com'
ON CONFLICT (user_id) DO UPDATE
  SET total_xp = EXCLUDED.total_xp,
      level = EXCLUDED.level,
      level_tier = EXCLUDED.level_tier,
      updated_at = now();
```

- Add "Beta Tester" to achievements_library if missing:

```sql
INSERT INTO achievements_library (name, description, icon, tier, category, xp_reward)
SELECT 'Beta Tester', 'Early testing legend', 'beta_tester.png', 'Bronze', 'milestone', 25
WHERE NOT EXISTS (SELECT 1 FROM achievements_library WHERE name = 'Beta Tester');
```

## Ports & Dev URLs

- API dev default: `http://localhost:3001` (`/api/*`).
- Web dev default: `http://localhost:3000`.
- Set `NEXT_PUBLIC_API_URL=<your_api_url>
## Tab Player Layout (Current)

- Top: AlphaTab viewport full width with transport directly beneath.
- Below: Compact panels for settings/file selectors and tracks.
- Demo tabs: `public/tabs/metallica-mercyful_fate.gp3`, `metallica-master_of_puppets.gp5`.
- Supports local upload (`.gp3/.gp4/.gp5/.gpx/.gp/.guitarpro`).

## Recent Changes (Nov 2025)

- TabPlayer: MIDI-only playback, master volume slider, transport under viewport.
- Added VST-style amp preset panel; widened highway; WebMIDI output hook.
- Play mode toggle: playback-only vs Rate My Shred (mic/feedback).
- `/api/tone-settings` added with shared tone types/schemas.
- GP upload wired into TabPlayer; 2D/3D highways; AI feedback integration.
- AlphaTab + TabSong converter wired to sync engine and active beat tracking.
- Dev ports updated (API 3001, Web 3000) and web env defaults adjusted.
- Jam page now renders audio controls and ships default MP3s from `packages/web/public/jam`, while still reading Supabase `jam_tracks` when present.
- Added animated flame background and nav hover flames.
- Homepage + Achievements + Profile redesigned with gradient cards and display font; Learn/Jam/Riffs refreshed with hero CTAs, gradient grids, and media-aware cards; Speed Trainer UI updated with hero, stat tiles, and refreshed controls; Auth screens restyled with gradient cards. Daily Riff, Practice History, and Stats pages now match the new aesthetic and structure. Tab Player and Pricing restyled; legacy `/login` and `/signup` removed in favor of `/auth/*`.

## TODO / Next Steps

- Wire achievements API responses into `RiffEvaluationResult`.
- Add real audio URLs/stems for tabs; preload where available.
- Expose amp sim controls/preset switching directly in Tab Player UI.
- Optimize 3D highway instancing; mobile-friendly fallback.
- Expand Supabase XP update to include streaks/badges from server.
- Dark mode mini mixer; waveform overview; practice loop UI; learn-mode auto-slowdown; count-in customization.
- Tab Player: scores load and display, but playback still does not start (Play stays inert). AlphaTab assets and soundfont live under `packages/web/public/alphatab/` (`/alphatab/soundfont/sonivox.sf2`). Investigate AlphaTab synth init/ready events and ensure transport triggers audio.
- Tab Player extras implemented: backing track preload for demo tabs, count-in control, learn-mode auto-slowdown on loop wrap, track selection, and synced 2D/3D highways (3D instanced, mobile-disabled).
- Streak achievements now auto-awarded server-side in `user-stats` update (7/30/100 day tiers) and streak counters/last_active_at maintained.
- Learn page now bundles two local video lessons (`/IMG_4520.MOV`, `/IMG_4521.MOV`) as always-available featured lessons; Supabase lessons append after these.

## Tab Player Notes (Dec 2025)

### Overview

Full-featured, production-ready interactive tab player at `/tab-player` route. Integrates AlphaTab (score rendering & MIDI playback), VexFlow (synchronized tab highlighting), and Web Audio API (metronome clicks, master volume).

### Architecture

- **AlphaTabWrapper** - Initializes alphaTab library, loads scores (`.gp3/.gp4/.gp5/.gpx` formats).
- **ImprovedTabPlayer** - Central playback UI component with controls:
  - Play/Pause/Stop buttons (with Space keyboard shortcut).
  - Seek slider + time display (Arrow key shortcuts: ← -5s, → +5s).
  - Tempo multiplier (0.5x–2x; shows BPM).
  - Loop controls (enabled/disabled, start/end in seconds).
  - Master volume slider (Web Audio API gain node routed).
  - Bright neon green tab notes (`#39FF14`) for high contrast on dark background.
- **GuitarTabRenderer** - VexFlow-based tab renderer with real-time beat highlighting synced to playback position.
- **TrackPanel** - Track list UI with:
  - View button (isolates track for display; shows "View Only" badge).
  - Solo/Mute buttons.
  - Per-track volume and transpose controls.
- **TransportControls** - Settings for speed, learn mode, metronome, count-in.
- **SettingsPanel** - AlphaTab rendering preferences.

### Key Features

1. **Unified Transport** - Single set of play/pause/stop/seek/tempo handlers delegate to both alphaTab audio engine and ImprovedTabPlayer UI.
2. **Web Audio Metronome** - OscillatorNode-based click generation scheduled at song tempo (adjustable via tempo multiplier).
3. **Synchronized Playback** - Backing audio playback rate matches tempo multiplier; current time flows from alphaTab API to all components.
4. **Loop Isolation** - Define loop start/end; playback automatically rewinds to loop start when reaching loop end.
5. **Track Isolation** - Click "View" on a track to display only that staff; "View Only" badge confirms selection.
6. **Master Volume Control** - Independent of alphaTab's synthesizer volume; affects metronome click loudness only.

### File Locations

| File                                                | Purpose                                                      |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `packages/web/src/app/tab-player/page.tsx`          | Main orchestrator; manages state, API, and component layout. |
| `packages/web/src/components/ImprovedTabPlayer.tsx` | Player UI with controls, metronome, keyboard shortcuts.      |
| `packages/web/src/components/GuitarTabRenderer.tsx` | VexFlow tab rendering with beat sync highlighting.           |
| `packages/web/src/components/TrackPanel.tsx`        | Track list with solo/mute/volume/transpose/view controls.    |
| `packages/web/src/components/AlphaTabWrapper.tsx`   | AlphaTab library wrapper for score rendering.                |

### Demo Files

- `packages/web/public/tabs/metallica-mercyful_fate.gp3`
- `packages/web/public/tabs/metallica-master_of_puppets.gp5`
- Local `.gp3/.gp4/.gp5/.gpx` upload supported.

### Customization Points

- **Note Color:** Edit `GuitarTabRenderer.tsx` line ~160: `fillStyle: '#39FF14'` → any hex color.
- **Metronome Frequency:** Edit `ImprovedTabPlayer.tsx` line ~14: `osc.frequency.value = 1000` → desired Hz.
- **Tempo Range:** Edit ImprovedTabPlayer tempo input (`min={0.5}`, `max={2}`, `step={0.01}`).

### Known Behavior

- Playback state (`playerPlaying`) mirrors alphaTab player readiness; clicking Play triggers alphaTab's audio synthesis.
- Backing track (if loaded) syncs via shared `handlePlayerRequestSeek()` and tempo multiplier.
- Beat highlighting updates every 50ms based on current playback position (`positionMs` from alphaTab).
- Track switching via "View" button sets both `selectedTrackIndex` and `viewOnlyTrackIndex`; calls `api.tracks = [track]` and `api.render?.()`.

### Testing Checklist

- [ ] Load demo tab → score renders correctly.
- [ ] Click Play → metronome clicks and score scrolls.
- [ ] Drag seek bar → current time updates, metronome resets.
- [ ] Adjust tempo → BPM display and metronome frequency update.
- [ ] Enable Loop → playback rewinds at loop end.
- [ ] Toggle Master Volume → metronome volume changes independently.
- [ ] Click Track View → staff updates and "View Only" badge appears.
- [ ] Upload local `.gp5` file → score loads and plays.
- [ ] Use keyboard shortcuts (Space, ← →) → actions trigger correctly.

### See Also

- **Full Guide:** `TAB_PLAYER_GUIDE.md`
- **Old Notes:** AlphaTab assets in `packages/web/public/alphatab/`; soundfont URL `/alphatab/soundfont/sonivox.sf2`.
- **Shared Types:** `@metalmaster/shared-types` exports `TabSong`, `TabBeat`, `TabStaff` etc.
- **Validation:** `@metalmaster/shared-validation` includes `TabSongSchema` for type safety.

## Frontend Updates (Dec 2025)

- Homepage: new **What’s New** strip highlighting tab player/WebMIDI, bundled lessons, and the AlphaTab docs map.
- Tab Player: bright green UI, demo dropdown aligned with Play/Stop/Loop/Sync, and demos include bundled lessons (`/lessons/lesson-*.gp5`).

## AlphaTab Docs

- Official docs hub: https://www.alphatab.net/docs (1.7.1 stable). Sitemap at `https://www.alphatab.net/sitemap.xml` lists every page.
- Project-facing summary and deep links: `docs/ALPHATAB_DOCS_SUMMARY.md`.

## MIDI Output & Reaper Integration (Dec 2025)

### Real-Time MIDI to DAWs

MetalMaster's tab player now supports **WebMIDI output** to route MIDI events to external DAWs (Reaper, Ableton, Logic, etc.).

### How It Works

- **TabPlayer.tsx** listens to alphaTab's `midiEventsPlayed` events
- Converts MIDI Note On/Off to raw bytes: `[0x90|channel, note, velocity]` and `[0x80|channel, note, 0]`
- Sends via WebMIDI API (`MIDIOutput.send()`) to OS MIDI driver
- Virtual MIDI cable (loopMIDI, IAC Driver) routes to DAW

### New Features (TabPlayer Component)

1. **MIDI Output Device Selector** - Dropdown to select from available MIDI outputs (auto-detected)
2. **Real-Time Status Indicator** - Shows connection state:
   - ✓ Green = MIDI output connected
   - ⚠️ Orange = No output selected
   - ✗ Red = WebMIDI unavailable
3. **MIDI Event Monitor** - Optional toggle to display:
   - Live event counter
   - Last event details (note, velocity, channel)
   - Useful for debugging MIDI flow

### System Requirements

- **Browser:** Chrome/Edge (recommended), Firefox (with flag), Safari (limited)
- **Windows:** loopMIDI virtual MIDI port
- **macOS:** IAC Driver virtual MIDI bus
- **Linux:** ALSA/JACK MIDI support

### DAW Integration

1. Create virtual MIDI port (loopMIDI/IAC Driver)
2. Configure DAW to listen on the port (e.g., Reaper → Preferences → MIDI Devices)
3. Create MIDI track with virtual instrument (ReaGuitar, Kontakt, etc.)
4. Select MIDI output in MetalMaster's dropdown
5. Play tab → MIDI events flow to DAW → Hear audio through VST

### Key Files

- `packages/web/src/components/alphatab/TabPlayer.tsx` - MIDI output selector, event handler, status UI
- `REAPER_QUICK_START.md` - 5-minute setup guide
- `REAPER_MIDI_INTEGRATION.md` - Comprehensive reference (30+ pages)
- `MIDI_OUTPUT_REAPER_IMPLEMENTATION.md` - Technical details

### Features

- [x] WebMIDI output to external MIDI ports
- [x] Automatic MIDI device detection
- [x] Real-time status indicators
- [x] Optional MIDI event monitoring
- [x] Support for loopMIDI (Windows), IAC (macOS), ALSA/JACK (Linux)
- [x] Full documentation and guides
- [x] Non-breaking changes; backward compatible

### Usage Example

```
MetalMaster (Browser)
    ↓ (MIDI events via WebMIDI)
loopMIDI / IAC Driver (Virtual Cable)
    ↓ (System MIDI API)
Reaper DAW
    ↓ (MIDI input)
ReaGuitar VST
    ↓ (Audio synthesis + effects)
🎵 Hear guitar sound with effects!
```

### Documentation

- **Quick Start:** `REAPER_QUICK_START.md` (5 mins)
- **Full Reference:** `REAPER_MIDI_INTEGRATION.md` (30+ pages)
- **Technical:** `MIDI_OUTPUT_REAPER_IMPLEMENTATION.md`
- **Diagrams:** `REAPER_ARCHITECTURE_DIAGRAMS.md`
- **Index:** `REAPER_DOCUMENTATION_INDEX.md`
- **Master Index:** `README_REAPER_MIDI.md`
