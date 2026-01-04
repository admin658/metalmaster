# Metal Master - Agent Rules (Aligned to tools/ai/mm.ps1)

This file defines repo-specific guidance for coding agents.
If there is a conflict between this file and higher-priority system instructions, follow the higher-priority instructions.

## Purpose
Mirror the operational rules in `tools/ai/mm.ps1` so agents follow the same workflow constraints.

## Operating Modes
- Audit: produce a plan only (findings + suggestions).
- Implement: produce a plan and a patch.
- Auto: detect based on goal text.

## Safety and Git Workflow
- Require a clean git working tree before changes.
- Default to creating a branch named `ai/YYYYMMDD-HHMMSS` (unless explicitly disabled).
- Do not touch `.env` files or secrets.

## Repo Map Guidance
- Build a repo map that avoids black holes: `node_modules`, `.git`, `.yarn`, `.pytest_cache`, `.venv`, `venv`,
  `.venv_audio`, `.venv_basic_pitch`, `.next`, `dist`, `build`, `coverage`, `.cache`, `.turbo`, `.zencoder`, `.zenflow`.
- Prefer recent/active files by last write time; cap per path.
- Allow focus scoping to specific top-level folders.

## Top-Level Focus Areas
- `packages`, `netlify`, `tools`, `tests`, `alphatab`, `docs`, `dev-notes`, `ldocs`,
  `metalmaster-video-pipeline`, `metal-master-vst-companion`, `vexflow`, `assets`, `agents`.

## Key Config Snippets (if present)
- `README.md`, `SETUP.md`, `AGENTS.md`
- `package.json`, `tsconfig.json`, `yarn.lock`
- `netlify.toml`, `docker-compose.yml`
- `jest.config.cjs`, `jest.temp.config.cjs`
- `.eslintrc.json`, `.prettierrc.json`, `.yarnrc.yml`
- `CLAUDE.md`, `GEMINI.md`

## Change Constraints
- Keep scope tight; avoid repo-wide formatting.
- Prefer changes under `packages/*` and `tests/*`; use `netlify/` for deploy/functions.
- Avoid touching `node_modules/` or any venv directories.

## Outputs (when using mm.ps1)
- Always write `tools/ai/out/PLAN.md`.
- In Implement mode, also write `tools/ai/out/PATCH.diff`.
- Apply `PATCH.diff` only when explicitly requested.
