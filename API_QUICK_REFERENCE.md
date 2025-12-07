# Quick Reference - Metal Master Feature Routes

## Speed Trainer API (`/api/speed-trainer`)
```
GET    /                      # List user's sessions (page, limit, exercise_type)
GET    /:id                   # Get single session
POST   /                      # Create session (exercise_type, starting_bpm, target_bpm, riff_id?)
PATCH  /:id                   # Update session (current_bpm, accuracy_percentage, duration_seconds)
DELETE /:id                   # Delete session
GET    /progress/stats        # Get personal bests and improvement trends (exercise_type?)
```

## Daily Riff API (`/api/daily-riff`)
```
GET    /today                 # Get today's featured riff (public)
GET    /:id                   # Get specific riff
GET    /                      # List all riffs (page, limit)
POST   /:id/complete          # Mark complete & award XP (24-hour bonus)
GET    /stats/user            # Get streak, completion count
```

## Achievements API (`/api/achievements`)
```
GET    /library               # List all available achievements (public)
GET    /                      # Get user's earned achievements
GET    /progress              # Get progress on all achievements
GET    /:id                   # Get single achievement
POST   /:achievementId/award  # Award achievement to user
GET    /stats/summary         # Get cumulative XP multiplier
```

## User Stats API (`/api/user-stats`)
```
GET    /                      # Get user stats (auto-creates)
GET    /heatmap               # Practice calendar (start_date, end_date required)
GET    /skills                # Get 4 skill scores (accuracy, speed, rhythm, tone)
GET    /summary               # High-level stats (today/week/all-time)
PATCH  /update                # Update stats (xp_earned, practice_minutes, lesson_completed)
```

## Tone Settings API (`/api/tone-settings`)
```
POST   /                      # Generate tone settings (artist, gear) via GPT; validates with ToneSettingsSchema
```

## Practice Sessions API (`/api/practice-sessions`)
```
GET    /                      # List sessions (page, limit, session_type?)
GET    /:id                   # Get session details
POST   /                      # Create session (session_type, duration_seconds, xp_earned)
DELETE /:id                   # Delete session
GET    /stats/summary         # Statistics (total, average duration, XP this week/today)
```

## Key Types

### Exercise Types (Speed Trainer)
- `metronome` | `chugging` | `tremolo` | `downpicking` | `sweep_picking` | `tapping`

### Difficulty Levels
- `beginner` | `intermediate` | `advanced` | `expert`

### Session Types (Practice)
- `lesson` | `riff_practice` | `jam_session` | `speed_trainer` | `free_play`

### Skill Categories
- `accuracy` | `speed` | `rhythm_consistency` | `tone_knowledge`

### Level Tiers (8 total)
1. Novice (0-1000 XP)
2. Acolyte (1000-2000 XP)
3. Hammerhand (2000-3000 XP)
4. Thrash Apprentice (3000-4000 XP)
5. Riff Adept (4000-5000 XP)
6. Blackened Knight (5000-6000 XP)
7. Djent Architect (6000-7000 XP)
8. Shred Overlord (7000+ XP)

### Daily Riff Frequency
- `free_weekly` | `subscriber_daily`

### Badges (Achievements)
- `downpicking_demon`
- `sweep_sorcerer`
- `djent_machine`
- `black_metal_blizzard`
- `power_metal_paladin`
- `speed_merchant`
- `rhythm_warrior`
- `tone_master`

## Response Format (All Endpoints)
```typescript
{
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any },
  meta: { timestamp: string; version: string }
}
```

## Pagination Format
```typescript
{
  items: T[],
  total: number,
  page: number,
  limit: number,
  total_pages: number
}
```

## Authentication
All endpoints except public ones (`/today`, `/library`, `/:id` GETs) require:
```
Authorization: Bearer <JWT_TOKEN>
```

## Example Requests

### Create Speed Trainer Session
```bash
curl -X POST http://localhost:3000/api/speed-trainer \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_type": "downpicking",
    "starting_bpm": 120,
    "target_bpm": 200,
    "auto_increment_enabled": true
  }'
```

### Complete Daily Riff
```bash
curl -X POST http://localhost:3000/api/daily-riff/<DAILY_RIFF_ID>/complete \
  -H "Authorization: Bearer <TOKEN>"
```

### Get User Stats
```bash
curl http://localhost:3000/api/user-stats \
  -H "Authorization: Bearer <TOKEN>"
```

### Get Practice Heatmap
```bash
curl "http://localhost:3000/api/user-stats/heatmap?start_date=2025-01-01&end_date=2025-01-31" \
  -H "Authorization: Bearer <TOKEN>"
```

### Create Practice Session
```bash
curl -X POST http://localhost:3000/api/practice-sessions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_type": "riff_practice",
    "related_riff_id": "<RIFF_ID>",
    "duration_seconds": 1800,
    "xp_earned": 50,
    "accuracy_percentage": 87.5
  }'
```

### Generate Tone Settings
```bash
curl -X POST http://localhost:3000/api/tone-settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "artist": "Metallica",
    "gear": "ESP LTD -> Mesa Dual Rectifier"
  }'
```

## Database Setup
Run migration after deploying:
```bash
cd packages/api
npx tsx run-migrations.ts
# or apply SQL from db/migrations/005_features.sql manually
```

## Seed Data (Achievements)
Insert sample achievements into `achievements_library`:
```sql
INSERT INTO achievements_library (badge_id, name, description, icon_url, type, xp_multiplier) VALUES
('downpicking_demon', 'Downpicking Demon', 'Master downpicking technique', 'https://...', 'badge', 1.5),
('sweep_sorcerer', 'Sweep Sorcerer', 'Perfect 50 sweep picking riffs', 'https://...', 'badge', 1.75),
-- ... more achievements
```

## Development Notes
- All routes are fully typed with Zod validation
- User isolation handled via `req.user.id` from auth middleware
- Timestamps are UTC (TIMESTAMP WITH TIME ZONE)
- XP calculations are server-side only
- Streak logic counts consecutive calendar days
- Heatmap requires explicit date range (no default range)
