---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary

**Metal Master** is a full-stack music learning platform for metal guitarists built as a monorepo with five interconnected packages. It provides lessons, riffs, tablature, and jam tracks with cross-platform support through web and mobile applications. The architecture uses TypeScript throughout, Supabase for authentication, and Express.js for the API backend.

## Repository Structure

### Main Repository Components

- **shared-types**: Central TypeScript type definitions for all services (User, Lesson, Riff, Tab, JamTrack, API response types)
- **shared-validation**: Reusable Zod validation schemas for auth, users, lessons, riffs, tabs, and jam tracks
- **api**: Express.js REST API server with Supabase authentication and database integration
- **web**: Next.js web application with server-side rendering for browser-based access
- **mobile**: React Native Expo application for iOS/Android native experiences

### Root Configuration

- **Workspace Manager**: Yarn 4.11.0 with npm workspaces
- **Build System**: TypeScript with tsc compilation
- **Code Quality**: ESLint with TypeScript support, Jest for testing
- **Runtime**: Node.js 18+ (defined in Docker and package configurations)

---

## Projects

### Shared-Types

**Configuration File**: `packages/shared-types/package.json`

#### Language & Runtime

**Language**: TypeScript  
**Version**: 5.0.0+  
**Build System**: TypeScript Compiler (tsc)  
**Package Manager**: Yarn Workspaces  

#### Build & Installation

```bash
yarn workspace @metalmaster/shared-types build
yarn workspace @metalmaster/shared-types dev
```

---

### Shared-Validation

**Configuration File**: `packages/shared-validation/package.json`

#### Language & Runtime

**Language**: TypeScript  
**Version**: 5.0.0+  
**Build System**: TypeScript Compiler (tsc)  
**Package Manager**: Yarn Workspaces  

#### Dependencies

**Main Dependencies**:
- zod: ^3.22.0 (validation schema library)

#### Build & Installation

```bash
yarn workspace @metalmaster/shared-validation build
yarn workspace @metalmaster/shared-validation dev
```

#### Testing

**Framework**: Jest  
**Configuration**: jest.config.cjs  
**Test Location**: Shared-validation source files  
**Run Command**:

```bash
yarn test
```

---

### API (Express.js Backend)

**Configuration File**: `packages/api/package.json`  
**Main Entry Point**: `src/index.ts`  
**Output**: `dist/index.js`

#### Language & Runtime

**Language**: TypeScript  
**Version**: 5.0.0+  
**Runtime**: Node.js 20 (Alpine)  
**Build System**: TypeScript Compiler (tsc)  
**Port**: 3000

#### Dependencies

**Main Dependencies**:
- express: ^5.1.0 (web framework)
- @supabase/supabase-js: ^2.84.0 (auth and database)
- cors: ^2.8.5 (cross-origin requests)
- dotenv: ^17.2.3 (environment variables)
- zod: ^4.1.12 (validation)
- @metalmaster/shared-types: workspace:* (internal types)
- @metalmaster/shared-validation: workspace:* (internal validation)

**Development Dependencies**:
- @types/express: ^5.0.5
- @types/cors: ^2.8.19
- @types/node: ^24.10.1
- tsx: ^4.5.0 (TypeScript execution)
- typescript: ^5.0.0

#### Build & Installation

```bash
yarn workspace @metalmaster/api build
yarn workspace @metalmaster/api dev
yarn workspace @metalmaster/api start
```

#### Docker

**Dockerfile**: `packages/api/Dockerfile`  
**Base Image**: node:20-alpine  
**Exposed Port**: 3000  

---

### Web (Next.js Frontend)

**Configuration File**: `packages/web/package.json`  
**Main Entry Point**: Next.js pages in `src/pages/`  
**Output**: `.next/` (Next.js build output)

#### Language & Runtime

**Language**: TypeScript + JSX  
**Version**: 5.0.0+  
**Framework**: Next.js 16.0.3  
**React Version**: 18.3.1  
**Build System**: Next.js build tool  
**Port**: 3001 (development), 3000 (production)

#### Dependencies

**Main Dependencies**:
- next: ^16.0.3 (React framework)
- react: 18.3.1 (UI library)
- react-dom: 18.3.1 (DOM rendering)
- @supabase/auth-helpers-nextjs: ^0.10.0 (Supabase auth)
- @supabase/supabase-js: ^2.38.0 (Supabase client)
- swr: ^2.2.4 (data fetching)
- stripe: ^20.0.0 (payment processing)
- zod: ^3.22.0 (validation)
- @metalmaster/shared-types: workspace:*
- @metalmaster/shared-validation: workspace:*

**Development Dependencies**:
- tailwindcss: ^4.1.17 (utility-first CSS)
- @tailwindcss/postcss: ^4.1.17
- postcss: ^8.5.6 (CSS transformation)
- autoprefixer: ^10.4.22
- @types/react: 18.2.41
- @types/react-dom: ^18.2.0
- @types/node: ^24.10.1
- typescript: ^5.0.0

#### Build & Installation

```bash
yarn workspace @metalmaster/web dev
yarn workspace @metalmaster/web build
yarn workspace @metalmaster/web start
```

#### Docker

**Dockerfile**: `packages/web/Dockerfile`  
**Base Image**: node:20-alpine  
**Exposed Port**: 3000  

---

### Mobile (React Native Expo)

**Configuration File**: `packages/mobile/package.json`  
**Entry Point**: `index.js` (Expo entry point)  
**Configuration**: `app.json` (Expo app config)

#### Language & Runtime

**Language**: TypeScript + JSX (React Native)  
**Version**: 5.0.0+  
**Runtime**: Expo SDK 50.0.0  
**React Native**: 0.82.1  
**Platforms**: iOS, Android, Web

#### Dependencies

**Main Dependencies**:
- expo: ^50.0.0 (Expo framework)
- react: ^19.2.0 (UI library)
- react-native: ^0.82.1 (native framework)
- @react-navigation/native: ^6.1.0 (navigation)
- @react-navigation/bottom-tabs: ^6.5.0
- @react-navigation/stack: ^6.3.0
- @supabase/supabase-js: ^2.38.0 (auth and database)
- expo-secure-store: ^12.0.0 (secure token storage)
- expo-av: ^16.0.7 (audio/video playback)
- expo-file-system: ^19.0.19
- expo-font: ^14.0.9
- expo-permissions: ^14.4.0
- react-native-reanimated: ^3.5.0 (animations)
- react-native-gesture-handler: ^2.13.0
- react-native-safe-area-context: ^4.7.0
- react-native-purchases: ^9.6.7 (in-app purchases)
- nativewind: ^4.0.0 (Tailwind for React Native)
- tailwindcss: ^3.3.0
- zod: ^3.22.0

**Development Dependencies**:
- @babel/core: ^7.28.5
- @types/react: ^19.2.6
- @types/react-native: ^0.73.0
- @types/node: ^20.0.0
- typescript: ^5.0.0

#### Build & Installation

```bash
yarn workspace @metalmaster/mobile start
yarn workspace @metalmaster/mobile android
yarn workspace @metalmaster/mobile ios
yarn workspace @metalmaster/mobile web
```

---

## Global Build & Development

#### Build All Packages

```bash
yarn build
```

#### Start All Services

```bash
yarn dev
```

#### Run Linting

```bash
yarn lint
```

#### Type Checking

```bash
yarn type-check
```

#### Running Tests

```bash
yarn test
```

---

## Docker Compose

**File**: `docker-compose.yml`

Services configured:
- **postgres:15** - PostgreSQL database on port 5432
- **adminer** - Database management UI on port 8080
- **api** - Express API (built from packages/api) on port 3000
- **web** - Next.js app (built from packages/web) on port 3001

Database: postgres://mm_user:mm_pass@db:5432/metalmaster

---

## Environment Configuration

**Root Level**: `.env.example`
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `NEXT_PUBLIC_API_URL` - API endpoint for web
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL for web
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key for web

Each package has its own `.env.example` with specific requirements.

---

## Code Quality & Standards

**ESLint Config**: `.eslintrc.json`
- Parser: @typescript-eslint/parser
- ECMAScript 2020 support with JSX
- Recommended rules with TypeScript extensions
- No console warnings, unused vars, or explicit any

**TypeScript**: Version 5.0.0+, strict mode
**Linting**: Available via `yarn lint`
**Type Checking**: Available via `yarn type-check`
