const README = `# Project Database Tables — README

This README documents the main database tables and their column structures for your Supabase project. It summarizes schemas: \`auth\`, \`storage\`, \`vault\`, \`realtime\`, and \`public\`. Use this as a quick reference for development, RLS policy design, and Edge Function integration.

---

## Table of contents

- [auth schema](#auth-schema)  
- [storage schema](#storage-schema)  
- [vault schema](#vault-schema)  
- [realtime schema](#realtime-schema)  
- [public schema](#public-schema)  
- [recommendations & next steps](#recommendations--next-steps)

---

## auth schema

Purpose: Supabase Auth system objects (users, sessions, tokens, SSO, MFA, etc.)

- users (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Selected columns: `instance_id` (uuid), `id` (uuid), `aud` (varchar), `role` (varchar), `email` (varchar), `encrypted_password` (varchar), `email_confirmed_at` (timestamptz), `last_sign_in_at` (timestamptz), `raw_app_meta_data` (jsonb), `raw_user_meta_data` (jsonb), `is_super_admin` (boolean), `created_at` (timestamptz), `updated_at` (timestamptz), `phone` (text, unique), `confirmed_at` (generated), `deleted_at` (timestamptz), `is_anonymous` (boolean)  
  - Foreign keys: referenced by `one_time_tokens`, `mfa_factors`, `identities`, `sessions`, `oauth_authorizations`, `oauth_consents`

- refresh_tokens (RLS: enabled)  
  - Primary key: `id` (bigint)  
  - Columns: `token` (varchar, unique), `user_id` (varchar), `revoked` (boolean), `session_id` (uuid), `created_at`, `updated_at`

- instances (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `uuid`, `raw_base_config` (text), `created_at`, `updated_at`

- audit_log_entries (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `payload` (json), `created_at`, `ip_address`

- schema_migrations (RLS: enabled)  
  - Primary key: `version` (varchar)

- identities (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `provider_id`, `user_id` (uuid), `identity_data` (jsonb), `provider` (text), `last_sign_in_at`, `created_at`, `updated_at`, `email` (generated)

- sessions (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id` (uuid), `created_at`, `updated_at`, `factor_id`, `aal` (enum), `not_after`, `refreshed_at`, `user_agent`, `ip`, `oauth_client_id`, `refresh_token_hmac_key`, `refresh_token_counter`

- mfa_factors, mfa_challenges, mfa_amr_claims (RLS: enabled)  
  - MFA metadata tables: `id` (uuid), `user_id` (uuid), factor metadata, timestamps, webauthn fields

- sso_providers, sso_domains, saml_providers, saml_relay_states, flow_state (RLS: enabled)  
  - SSO / SAML provider configurations and relay states

- one_time_tokens (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id` (uuid), `token_type` (enum), `token_hash` (text), `relates_to`, `created_at`, `updated_at`

- oauth_clients, oauth_authorizations, oauth_consents (some RLS disabled)  
  - OAuth client management and authorization records

Notes:
- Many auth tables have RLS enabled. Use auth helpers like `auth.uid()` or `auth.jwt()` in policies where appropriate.
- Several columns are generated or constrained (enums, checks).

---

## storage schema

Purpose: Supabase Storage (buckets, objects, multipart uploads, vector indexes)

- buckets (RLS: enabled)  
  - Primary key: `id` (text)  
  - Columns: `id`, `name`, `owner` (uuid, deprecated), `owner_id` (text), `created_at` (timestamptz, default now()), `updated_at`, `public` (bool), `avif_autodetection` (bool), `file_size_limit` (bigint), `allowed_mime_types` (text[]), `type` (enum: STANDARD|ANALYTICS|VECTOR)

- objects (RLS: enabled)  
  - Primary key: `id` (uuid, default gen_random_uuid())  
  - Columns: `bucket_id` (text), `name` (text), `owner` (uuid, deprecated), `owner_id` (text), `created_at`, `updated_at`, `last_accessed_at`, `metadata` (jsonb), `path_tokens` (generated text[]), `version` (text), `user_metadata` (jsonb), `level` (int)

- migrations (RLS: enabled)  
  - Primary key: `id` (int)  
  - Columns: `name` (varchar, unique), `hash`, `executed_at` (timestamp default CURRENT_TIMESTAMP)

- s3_multipart_uploads, s3_multipart_uploads_parts (RLS: enabled)  
  - Manage multipart uploads for S3-compatible backends. FK relations to `buckets`.

- prefixes (RLS: enabled)  
  - Composite PK: (`bucket_id`, `name`, `level`)  
  - Columns: `level` (generated), `created_at`, `updated_at`

- buckets_analytics, buckets_vectors, vector_indexes (RLS: enabled)  
  - Analytics/vector-specific metadata and index configurations

Notes:
- Storage helper functions (e.g., `storage.foldername(name)`) are used in policies. Ensure policies match your app's folder conventions.

---

## vault schema

Purpose: Encrypted secrets storage

- secrets (RLS: disabled)  
  - Primary key: `id` (uuid, default gen_random_uuid())  
  - Columns: `name` (text), `description` (text, default ''), `secret` (text — encrypted), `key_id` (uuid), `nonce` (bytea, default `vault._crypto_aead_det_noncegen()`), `created_at` (timestamptz default CURRENT_TIMESTAMP), `updated_at` (timestamptz default CURRENT_TIMESTAMP)  
  - Comment: Table stores encrypted `secret` column for sensitive information on disk.

Notes:
- RLS is disabled. Consider restricting access or enabling RLS for production secrets.

---

## realtime schema

Purpose: Realtime engine metadata, subscriptions, and messages

- schema_migrations (RLS: disabled)  
  - Primary key: `version` (bigint)

- subscription (RLS: disabled)  
  - Primary key: `id` (bigint identity)  
  - Columns: `subscription_id` (uuid), `entity` (regclass), `filters` (realtime.user_defined_filter[]), `claims` (jsonb), `claims_role` (regrole generated), `created_at`

- messages (RLS: enabled)  
  - Primary key: composite (`inserted_at`, `id`)  
  - Columns: `topic` (text), `extension` (text), `payload` (jsonb), `event` (text), `private` (boolean, default false), `updated_at` (timestamp default now()), `inserted_at` (timestamp default now()), `id` (uuid default gen_random_uuid())

Notes:
- `realtime.messages` is RLS-enabled. When allowing client access ensure policies check topic membership (e.g., `topic LIKE 'room:%'` and membership table checks).

---

## public schema

Purpose: Application domain tables (users, lessons, riffs, tabs, jam tracks/sessions, progress, achievements, AI feedback, etc.)

- users (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `id`, `email` (text, unique), `username` (text), `avatar_url` (text), `bio` (text), `created_at` (timestamptz default now())  
  - Comment: RLS enabled; owner-based policies plus admin override via `auth.jwt()->>'role' = 'admin'` (adjust to your claim names)

- lessons (RLS: enabled)  
  - Primary key: `id` (uuid, default gen_random_uuid())  
  - Columns: `title`, `description`, `category`, `difficulty_level`, `duration_minutes` (int), `instructor_id` (uuid), `created_at`, `updated_at`

- riffs (RLS: enabled)  
  - Primary key: `id` (uuid, default gen_random_uuid())  
  - Columns: `title`, `description`, `bpm` (int), `key`, `time_signature`, `genre`, `difficulty_level`, `created_by` (uuid), `created_at`, `updated_at`

- tabs (RLS: enabled)  
  - Primary key: `id` (uuid, default gen_random_uuid())  
  - Columns: `riff_id` (uuid), `title`, `content` (text), `format`, `created_by` (uuid), `created_at`, `updated_at`

- jam_tracks (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `title`, `description`, `bpm`, `key`, `time_signature`, `difficulty_level`, `duration_seconds`, `audio_url`, `created_by`, `created_at`, `updated_at`

- jam_sessions (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `jam_track_id` (uuid), `user_id` (uuid), `notes`, `duration_seconds`, `created_at`

- lesson_progress, riff_progress (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id` (uuid), `lesson_id` / `riff_id` (uuid), `progress` (int default 0), `completed` (boolean default false), `updated_at`

- xp_events (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id`, `event_type`, `xp_amount`, `created_at`

- achievements (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id`, `name`, `description`, `achieved_at` (default now()), `icon`, `tier`, `category`, `xp_reward`

- tone_presets (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id`, `name`, `settings` (jsonb), `created_at`

- ai_feedback_results (RLS: enabled)  
  - Primary key: `id` (uuid)  
  - Columns: `user_id`, `riff_id`, `accuracy` (numeric), `timing_deviation` (numeric), `noise_score`, `pick_attack_score`, `raw_data` (jsonb), `created_at`

- daily_riffs, user_daily_riff (RLS: enabled)  
  - `daily_riffs`: `id` (uuid), `riff_id` (uuid), `date` (date, unique), `xp_reward` (int default 50), `created_at`  
  - `user_daily_riff`: `id` (uuid), `user_id`, `daily_riff_id`, `completed` (bool default false), `completed_at`, `xp_earned`

- user_stats (RLS: enabled)  
  - Primary key: `user_id` (uuid)  
  - Columns: `total_xp` (int default 0), `last_active_at` (timestamptz default now()), `created_at`, `updated_at`, `subscription_status` (enum: free|pro|trial|lifetime default 'free')
  - Note: Web and mobile hooks use `ApiResponse<UserStats>` for type-safe subscription_status access

Notes:
- Public tables commonly reference `public.users` for ownership checks. Ensure RLS policies align with `auth.users` identity mapping if your app uses separate auth and app user records.

---

## Recommendations & next steps

- RLS policies
  - Keep owner-based policies for app tables (e.g., `WHERE user_id = (SELECT auth.uid())`), and use `auth.jwt()` claims for admin/multi-tenant behavior.
  - For `realtime.messages`, ensure SELECT/INSERT policies check topic membership to avoid unauthorized broadcasts.

- Indexes
  - Add indexes on columns used by RLS checks and joins (e.g., `user_id`, `created_by`, `tenant_id`) to keep queries fast under RLS.

- Vault
  - Consider enabling RLS or restricting access to `vault.secrets` to service role functions only.

- Storage
  - Confirm storage policies restrict object access to appropriate owners using `storage.foldername(name)` where relevant.

- Backups & Migrations
  - Export DDL and keep migrations in version control. Preserve default/generate expressions (timestamps, UUIDs).

- Testing
  - Test policies with multiple user roles and JWT claim variations (anon, authenticated, admin) to validate expected behavior.

---

If you want, I can:
- Save this README as a markdown file formatted for your repository,
- Generate SQL migration files (CREATE TABLE) for any selected tables,
- Propose concrete RLS policies for specific tables (e.g., `public.users`, `public.riffs`, `storage.objects`).

Which should I do next?
`;

console.info('deploying download-readme function');
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname.endsWith('/readme.md')) {
    return new Response(README, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="README.md"',
        'Connection': 'keep-alive'
      }
    });
  }
  return new Response(JSON.stringify({ message: 'Navigate to /readme.md to download the README' }), {
    headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' }
  });
});