# Metal Master: Claude Code Rules (Implementer)

You are working in a TypeScript monorepo (Next.js App Router web, Expo mobile, Supabase, Netlify/Next API routes).

## Always
- Prefer small, reviewable commits. If unsure, make one commit per logical step.
- Keep scope tight: implement only what the PLAN asks.
- Before edits: locate existing patterns and follow them (lint, folder conventions, naming).
- After edits: run checks (at minimum: typecheck + tests if present).
- Summarize changes with: files touched + why + how to test.

## Repo habits
- Do not rewrite unrelated files.
- Do not change formatting repo-wide.
- If a dependency is needed, add it with Yarn and explain why.

## Safety
- Never delete data or secrets.
- Never commit .env files or keys.
