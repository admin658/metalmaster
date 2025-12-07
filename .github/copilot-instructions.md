# Metal Master - AI Coding Agent Instructions

## Project Overview

**Metal Master** is a full-stack music learning platform for metal guitarists. It's a **monorepo with 5 TypeScript packages** using Yarn workspaces: a shared type system, shared validation layer, Express.js API, Next.js web app, and React Native mobile app. All packages share types and validation via the `@metalmaster/shared-types` and `@metalmaster/shared-validation` packages.

## Critical Architecture Patterns

### Monorepo Structure & Dependencies

The project uses **Yarn workspaces with `node-modules` linker** (see `.yarnrc.yml`). All packages depend on shared packages:
- **`@metalmaster/api`** imports from `@metalmaster/shared-types` and `@metalmaster/shared-validation`
- **`@metalmaster/web`** imports from `@metalmaster/shared-types` and `@metalmaster/shared-validation`
- **`@metalmaster/mobile`** imports from `@metalmaster/shared-types` and `@metalmaster/shared-validation`

**Key:** When adding dependencies, use `workspace:*` in package.json to reference internal packages. When modifying shared types or validation, all dependent packages must be rebuilt.

### Type-Driven Development

Types are the **single source of truth**. The pattern:
1. **Define types** in `packages/shared-types/src/*.types.ts` (e.g., `lesson.types.ts`)
2. **Define Zod schemas** in `packages/shared-validation/src/*.schemas.ts` that match types
3. **API routes** import schemas and use `.parse()` for validation
4. **Client apps** import both types and schemas via `@metalmaster/shared-types` and `@metalmaster/shared-validation`

Example: `CreateLessonSchema` in validation imports type definitions and exports both the schema AND the inferred type.

### API Response Format (Standardized Everywhere)

All API responses follow this structure (enforced in `packages/api/src/middleware/error-handler.ts`):
```typescript
{
  ```md
  # Metal Master — AI Coding Agent Instructions (merged)

  This short guide focuses on what an AI coding agent needs to be immediately productive in this monorepo.

  - **Topology (high level):** Yarn workspaces monorepo with packages: `shared-types`, `shared-validation`, `shared-schemas`, `api` (Express + Supabase), `web` (Next.js App Router), `mobile` (Expo).

  - **Single source of truth:** Types live in `packages/shared-types/src/*` and runtime Zod schemas in `packages/shared-validation/src/*`. Always build these (`yarn workspace @metalmaster/shared-types build`) before building or running dependent packages.

  - **API conventions:** See `packages/api/src/index.ts` and `packages/api/src/middleware/error-handler.ts`.
    - Responses use: `{ success, data?, error?, meta: { timestamp, version } }`.
    - Validation: use Zod schemas (import from `@metalmaster/shared-validation`) and call `.parse()` in route handlers.
    - Auth: Supabase JWT via `packages/api/src/middleware/auth.ts` — middleware sets `req.user = { id, email }`.

  - **Database & RLS:** New features are in `packages/api/db/migrations/005_features.sql`. RLS is enabled for user-owned tables; ensure Supabase policies permit `auth.uid()`/`jwt.claims.user_id` access. Seed script: `packages/api/scripts/seedAchievements.ts` (requires `SUPABASE_SERVICE_ROLE_KEY`).

  - **Client patterns:** Web uses the typed `apiClient` in `packages/web/src/lib/apiClient.ts` and SWR-based hooks in `packages/web/src/hooks/useApi.ts`. Mutations return the API `data` payload (typed generics should be used: `mutate<AuthResponse>(...)`). Example fix: `packages/web/src/hooks/useAuth.ts` uses `mutate<AuthResponse>` for login.

  - **Common issues to watch for:**
    - Forgetting to rebuild `shared-types` / `shared-validation` when changing types.
    - Type mismatches from third-party libs (example: VexFlow typings required a tiny type fix in `packages/web/src/components/GuitarTabRenderer.tsx`).

  - **Quick commands (PowerShell, copy-paste):**
  ```powershell
  cd f:\metalmaster
  yarn install
  # Build shared packages first
  yarn workspace @metalmaster/shared-types build
  yarn workspace @metalmaster/shared-validation build
  yarn workspace @metalmaster/shared-schemas build
  # Then build API and web
  yarn workspace @metalmaster/api build
  yarn workspace @metalmaster/web build
  ```

  - **Run dev servers:**
  ```powershell
  cd f:\metalmaster
  yarn dev                # runs all services concurrently
  # or individually:
  yarn workspace @metalmaster/api dev
  yarn workspace @metalmaster/web dev
  yarn workspace @metalmaster/mobile start
  ```

  - **Apply DB migration & seed (example):**
    - Open `packages/api/db/migrations/005_features.sql` and run it in Supabase SQL editor, or use your migration runner if present.
    - To seed achievements (requires service role key):
  ```powershell
  $env:SUPABASE_URL='https://<project>.supabase.co'; $env:SUPABASE_SERVICE_ROLE_KEY='xxxxx'; npx ts-node packages/api/scripts/seedAchievements.ts
  ```

  - **Where to look first when adding a feature:**
    - Add types in `packages/shared-types/src/` and export from `index.ts`.
    - Add Zod schema in `packages/shared-validation/src/`, export from its `index.ts`.
    - Add API route in `packages/api/src/routes/` (validate input with Zod and use `authenticate` when needed).
    - Add DB migration in `packages/api/db/migrations/` and update seed scripts.
    - Wire client hooks in `packages/web/src/hooks/` and `packages/mobile/src/hooks/`.

  - **Files to reference for examples:**
    - API entry: `packages/api/src/index.ts`
    - Response & error handling: `packages/api/src/middleware/error-handler.ts`
    - Migration + feature tables: `packages/api/db/migrations/005_features.sql`
    - Typed api client: `packages/web/src/lib/apiClient.ts`
    - Example typed hook/login fix: `packages/web/src/hooks/useAuth.ts`
    - Tab renderer VexFlow patch: `packages/web/src/components/GuitarTabRenderer.tsx`

## Code Generation Standards

**ALWAYS follow these patterns when implementing features:**

- **ALWAYS follow the shared-types and shared-validation package structures.**
  - Types go in `packages/shared-types/src/{feature}.types.ts`
  - Schemas go in `packages/shared-validation/src/{feature}.schemas.ts`
  - Export from both `index.ts` files

- **ALWAYS generate TypeScript strict-safe code.**
  - No `any` types unless absolutely necessary (and document why)
  - Use proper type inference where possible
  - Enable `strict: true` in tsconfig
  - Example: `useSubscription.ts` fixed by replacing `ApiResponse<any>` with `ApiResponse<UserStats>` and using proper error type checking with `instanceof Error`

- **ALWAYS include import paths using `workspace:*` resolution.**
  - Example: `"@metalmaster/shared-types": "workspace:*"`
  - This ensures local workspace packages are properly linked

- **ALWAYS generate React + Tailwind code for web.**
  - Use Next.js App Router (`pages` in `packages/web/src/app/`)
  - Prefer functional components with hooks
  - Use Tailwind CSS for styling (dark theme: blacks, reds, gradients)
  - Component patterns: `packages/web/src/components/` for reusable, `packages/web/src/app/` for pages

- **ALWAYS generate Expo compatible code for mobile.**
  - Use React Native components from `react-native` (not web APIs)
  - Use Expo APIs where needed (`expo-av`, `expo-secure-store`, etc.)
  - Screen components in `packages/mobile/src/screens/`
  - Reusable components in `packages/mobile/src/components/`

- **ALWAYS assume MetalMaster uses a heavy-metal, dark themed UI (black, red).**
  - Web: Tailwind classes like `bg-zinc-950`, `bg-red-600`, `border-red-500/30`, `shadow-[0_0_40px_rgba(220,38,38,0.35)]`
  - Mobile: StyleSheet colors: `backgroundColor: '#050508'`, `borderColor: 'rgba(248,113,113,0.4)'`
  - Use red neon accents (#ff1744, #dc2626) for highlights
  - Glassmorphism: semi-transparent backgrounds with borders

- **ALWAYS integrate with VexFlow or alphaTab when dealing with tabs.**
  - VexFlow is used in `packages/web/src/components/GuitarTabRenderer.tsx` for SVG tab rendering
  - For mobile, use Canvas-based rendering or placeholder (alphaTab has Expo support)
  - Example: `packages/web/src/components/tab/TabPlayer.tsx` for synchronized playback

## Feature Implementation Checklist

**When the user requests a feature, follow this order:**

1. **Create/update shared types** (`packages/shared-types/src/{feature}.types.ts`)
   - Define all data structures (e.g., `UserStats`, `TabSong`)
   - Export from `packages/shared-types/src/index.ts`

2. **Add/update Zod validation** (`packages/shared-validation/src/{feature}.schemas.ts`)
   - Create schemas that match types (e.g., `UserStatsSchema`)
   - Export schemas AND inferred types from `packages/shared-validation/src/index.ts`

3. **Add backend routes** (`packages/api/src/routes/{feature}.routes.ts`)
   - Use Zod `.parse()` for validation
   - Return standardized API responses: `{ success, data?, error?, meta }`
   - Register routes in `packages/api/src/index.ts`
   - Add DB migrations if needed

4. **Add web hooks** (`packages/web/src/hooks/use{Feature}.ts`)
   - Use SWR pattern with typed API client
   - Example: `useUserStats()` → `useSWR('/api/user-stats', apiClient)`
   - Pages go in `packages/web/src/app/`

5. **Add mobile screens** (`packages/mobile/src/screens/{Feature}Screen.tsx`)
   - Mirror web functionality in React Native
   - Same hooks as web (shared via `@metalmaster/shared-types`)
   - Use native components and Expo APIs

6. **Update documentation and commit**
   - Update `PROJECT_SUMMARY.md`, `FEATURES_IMPLEMENTATION.md`, `STRUCTURE.md`
   - Add code comments and JSDoc where appropriate
   - Commit with descriptive message: `feat(feature-name): Add X functionality`

  ---
  If anything above is unclear or you want the instructions expanded (CI, deploy steps, or adding seed data), tell me which section to expand and I will update the file.
  ``` 
### Troubleshooting Builds


