# Metal Master - Agent Guide

This file defines repo-specific guidance for coding agents.
If there is a conflict between this file and higher-priority system instructions, follow the higher-priority instructions.

## Quick Repo Map
- `packages/web`: Next.js (App Router) web app + API routes under `/api`.
- `packages/api`: Express API + Supabase scripts/migrations.
- `packages/mobile`: Expo mobile app.
- `packages/shared-types`, `packages/shared-validation`, `packages/shared-schemas`: shared TypeScript models/schemas.
- `docs/project/KNOWLEDGE_BASE.md`: high-level architecture + recent updates.
- `README.md`: top-level “What’s New” for releases.

## Where To Update "What's New"
- External-facing release note: `README.md` under `## What's New (Dec 2025)`.
- Internal engineering updates: `docs/project/KNOWLEDGE_BASE.md` under `## Recent Updates (Dec 2025)`.
- If a UI “What’s New” surface exists in the app, add items only where it is wired (search for `WhatsNew` components).

## Jam Tracks (Local Bundles)
- Bundled jam tracks live in `packages/web/public/jam`.
- Local fallback entries are defined in `packages/web/src/hooks/useMetalMasterHooks.ts` (`localJamTracks`).
- If you add or rename jam tracks in `public/jam`, update `localJamTracks` accordingly.

## Editing Rules (Repo-Specific)
- Prefer `rg` for search and avoid slow recursive commands in `node_modules`.
- Use `apply_patch` for single-file edits when practical.
- Keep edits ASCII-only unless the file already contains Unicode.
- Avoid modifying generated or vendored artifacts unless explicitly requested.

## Testing & Validation
- For web: `yarn workspace @metalmaster/web dev` or `yarn test`.
- For shared packages changes, rebuild types/schemas:
  - `yarn workspace @metalmaster/shared-types build`
  - `yarn workspace @metalmaster/shared-validation build`
  - `yarn workspace @metalmaster/shared-schemas build`

## Common Paths
- Homepage: `packages/web/src/app/page.tsx`
- Jam page: `packages/web/src/app/jam/page.tsx`
- Jam hooks: `packages/web/src/hooks/useMetalMasterHooks.ts`
- Supabase migrations: `packages/api/db/migrations`

## When Unsure
- Ask which surface should change (README vs Knowledge Base vs in-app).
- Avoid touching `.env` or secrets unless explicitly asked.
