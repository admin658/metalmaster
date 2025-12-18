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

## XP Awards API (`/api/xp`)
```
POST   /award                 # Award XP + badges for a lesson session
POST   /tick                  # Optional periodic XP tick (base XP chunks)
```

### Anti-Cheese Rules (XP)
- If `hadActivityGapOver20s` is true OR `activeSeconds/totalSeconds < 0.35`, base XP is set to 0 for that award call.
- If `loopSeconds < 10` and `loopsCompleted > 8`, base XP is reduced by 80% (micro-loop farming).
- If `seeks >= 6` in a short session, base XP is reduced by 50%.
- Diminishing returns (per day per lesson) applies to base XP only: after 20 min -> 0.5x, after 45 min -> 0.2x.

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

### Level Tiers
- XP levels/tiers are defined by the level curve config (`packages/shared-validation/src/xpLevels.seed.json`).

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

### Award XP for Lesson Session
```bash
curl -X POST http://localhost:3000/api/xp/award \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "L01",
    "sessionKey": "<UUID>",
    "trackIndex": 0,
    "metrics": {
      "activeSeconds": 300,
      "totalSeconds": 360,
      "loopsCompleted": 14,
      "perfectLoops": 10,
      "perfectLoopStreakMax": 5,
      "avgTempoBpm": 92,
      "maxTempoBpm": 95,
      "pauses": 0,
      "seeks": 0,
      "loopSeconds": 15,
      "lessonMinutesToday": 5,
      "hadActivityGapOver20s": false
    }
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
# or apply SQL from db/all-migrations.sql manually
```

## Seed Data (Achievements)
Insert sample achievements into `achievements_library`:
```sql
INSERT INTO achievements_library (badge_id, name, description, icon_url, type, xp_multiplier) VALUES
('downpicking_demon', 'Downpicking Demon', 'Master downpicking technique', 'https://...', 'badge', 1.5),
('sweep_sorcerer', 'Sweep Sorcerer', 'Perfect 50 sweep picking riffs', 'https://...', 'badge', 1.75),
-- ... more achievements
```
Lesson 1–10 badge seeds are included in `packages/api/db/migrations/004_xp_badges.sql`.

### Lesson 1-10 Badges
- B01 Iron Wrist I: complete L03 at clean tempo.
- B02 Mute Surgeon: L02 with perfectLoopStreakMax >= 5 and clean tempo.
- B03 Chord Executioner: complete L04 with pauses == 0 and seeks == 0.
- B04 Gallop Engine: L05 at aggro tempo (one-time).
- B05 Alternate Assassin: L06 with perfectLoopStreakMax >= 8.
- B06 Crossing Clean: L07 with perfectLoopStreakMax >= 5.
- B07 Silence Controller: L08 with perfectLoopStreakMax >= 6.
- B08 Burst Certified: L09 at aggro tempo (one-time).
- B09 First Riff Forged: complete L10 at clean tempo.
- B10 Foundations: Steel: complete lessons L01-L10.

## Development Notes
- All routes are fully typed with Zod validation
- User isolation handled via `req.user.id` from auth middleware
- Timestamps are UTC (TIMESTAMP WITH TIME ZONE)
- XP calculations are server-side only
- XP rules and lesson requirements are configurable via `packages/shared-validation/src/xpRules.seed.json`
- Streak logic counts consecutive calendar days
- Heatmap requires explicit date range (no default range)
