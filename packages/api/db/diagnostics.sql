-- Diagnostics: inspect key tables/constraints/indexes for Tab Lab autosave & core schema.

-- Does practice_sessions exist? What columns?
SELECT
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'practice_sessions'
ORDER BY ordinal_position;

-- Constraints on practice_sessions
SELECT conname, contype, pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND t.relname = 'practice_sessions';

-- Indexes on practice_sessions
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'practice_sessions';

-- RLS enabled + policies on practice_sessions
SELECT relrowsecurity, relforcerowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'practice_sessions';

SELECT *
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'practice_sessions';

-- Quick existence check for users table
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'users'
) AS users_table_exists;
