INSERT INTO achievements_library (badge_id, name, description, icon_url, type, xp_multiplier, requirements) VALUES
  ('first_practice', 'First Practice', 'Complete your first practice session.', 'https://example.com/icons/first_practice.svg', 'milestone', 1.00, jsonb_build_object('sessions', 1)),
  ('streak_7', '7-Day Streak', 'Practice 7 days in a row.', 'https://example.com/icons/streak_7.svg', 'streak', 1.25, jsonb_build_object('days', 7)),
  ('streak_30', '30-Day Streak', 'Practice 30 days in a row.', 'https://example.com/icons/streak_30.svg', 'streak', 1.50, jsonb_build_object('days', 30)),
  ('speedster_150', 'Speedster 150', 'Reach 150 BPM in Speed Trainer.', 'https://example.com/icons/speedster_150.svg', 'performance', 1.30, jsonb_build_object('bpm', 150)),
  ('shredder_200', 'Shredder 200', 'Hit 200 BPM goal.', 'https://example.com/icons/shredder_200.svg', 'performance', 1.50, jsonb_build_object('bpm', 200)),
  ('loop_master', 'Loop Master', 'Set and complete 20 loop reps.', 'https://example.com/icons/loop_master.svg', 'skill', 1.20, jsonb_build_object('loops', 20)),
  ('tone_sculptor', 'Tone Sculptor', 'Save a custom tone preset.', 'https://example.com/icons/tone_sculptor.svg', 'creation', 1.10, jsonb_build_object('presets', 1)),
  ('tab_lab_pro', 'Tab Lab Pro', 'Finish a full tab in Tab Lab.', 'https://example.com/icons/tab_lab_pro.svg', 'milestone', 1.40, jsonb_build_object('tabs_completed', 1)),
  ('daily_riff_5', 'Daily Riff Hunter', 'Complete 5 Daily Riffs.', 'https://example.com/icons/daily_riff_5.svg', 'milestone', 1.20, jsonb_build_object('daily_riffs', 5))
ON CONFLICT (badge_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  type = EXCLUDED.type,
  xp_multiplier = EXCLUDED.xp_multiplier,
  requirements = EXCLUDED.requirements;
