

## Project overview

This repository implements **StoryWeave / AndThen**, an AI-powered personalized storytelling platform built on **Next.js App Router**. Users take a personality test, get a personality profile, and then play through interactive, AI-generated stories whose content and choices are tailored to their traits.

Core ideas:
- All user-facing flows are built as App Router routes under `app/` (landing page, auth, personality test, dashboard, story creation/play).
- Personality modeling and story/genre configuration live in `lib/` and are consumed by pages and API routes.
- Persistence is currently **localStorage-first** with a **future database layer** sketched out via SQL schema and TypeScript interfaces.
- Authentication is wired around **JWT + MongoDB (Mongoose)** for users, with planned relational storage for story/test data.

## Common commands

Use **npm** in this project (a `package-lock.json` is present).

- Install dependencies
  ```bash
  npm install
  ```

- Start dev server (Next.js)
  ```bash
  npm run dev
  ```

- Build production bundle
  ```bash
  npm run build
  ```

- Start production server (after building)
  ```bash
  npm run start
  ```

- Lint the codebase
  ```bash
  npm run lint
  ```

- Type checking

  TypeScript is configured in `tsconfig.json`, but there is **no dedicated typecheck script**. `next build` runs type checking, and `next.config.mjs` is currently set to `ignoreBuildErrors: true`.

  If you need a strict standalone typecheck, you can run:
  ```bash
  npx tsc --noEmit
  ```

- Tests

  There is **no test runner or `test` script** configured yet. Before assuming tests exist, check for a configured framework (e.g. Vitest, Jest, Playwright) and add appropriate scripts to `package.json` such as:
  ```jsonc
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run"
  }
  ```

## High-level architecture

### 1. Next.js App Router (`app/`)

The UI and HTTP surface are organized with Next.js 16 **App Router**:

- **Root layout**: `app/layout.tsx`
  - Registers global fonts, dark theme, and wraps all pages.
  - Integrates `@vercel/analytics`.

- **Landing & marketing**: `app/page.tsx`
  - Public landing page branded as **AND-THEN?** with animated hero and feature explanation.
  - Primary calls-to-action link into auth/signup and the personality story flow.

- **Auth pages**: `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`
  - User registration/login, backed by JWT and MongoDB (via `db/` + `models/` + `lib/auth.ts`).

- **Personality test & results**: `app/test/page.tsx`, `app/test/results/page.tsx`
  - Implement the 16-question personality assessment and show the resulting trait profile.
  - Rely heavily on structures and scoring in `lib/personality-data.ts`.

- **Story flows**: `app/stories/new/page.tsx`, `app/stories/play/page.tsx`
  - Genre selection, story generation, and interactive "choose-your-own" gameplay.
  - Use genre configuration and prompt generation utilities from `lib/story-data.ts` and `lib/story-templates.ts` (for demo stories).

- **User dashboard**: `app/dashboard/page.tsx`
  - Central place for users to see saved stories, personality summary, and progression.
  - Ties together personality data, story history, and gamification stats.

- **API routes**: `app/api/**`
  - `app/api/auth/*`: user signup/login and token management.
  - `app/api/personality/*`: persisting personality test outcomes.
  - `app/api/stories/*`: AI story generation, save/load/update story progress.

When making cross-cutting changes (e.g., new traits, new story metadata), update the relevant `lib/` modules first, then the pages/API routes that consume them.

### 2. Domain logic & configuration (`lib/`)

This folder holds most of the domain model, separate from React components:

- **Personality engine** – `lib/personality-data.ts`
  - Defines `PERSONALITY_TRAITS`, the full question set (`PERSONALITY_QUESTIONS`), and scoring model.
  - `calculatePersonalityScores()` converts raw answers into normalized 0–100 trait scores and a top-trait list.
  - `generatePersonalitySummary()` creates human-readable summaries from normalized traits.
  - Any changes to traits, questions, or scoring **start here**, and will flow through test/results UI and story prompts.

- **Story genres & prompts** – `lib/story-data.ts`
  - Defines `STORY_GENRES` and the core `StoryGenre`/`Story` interfaces used across the app.
  - `generateStoryPrompt(genre, personalityTraits, previousContent?)` is the key function for building prompts that are sent to the AI model.
  - Personality scores are injected into prompts so that narratives differ based on the user profile.

- **Story templates (non-AI demo)** – `lib/story-templates.ts`
  - Contains hand-authored `STORY_TEMPLATES` for each genre.
  - `generateDemoStory(...)` can produce deterministic content and follow-up choices without hitting the AI API.
  - Useful for offline/demo behavior; if you refactor story flow, keep this API aligned with the AI-based path.

- **Gamification & progression** – `lib/gamification.ts`
  - Models user stats (`UserStats`) and badges (`BADGES`).
  - Uses `localStorage` to persist XP, levels, storiesCompleted, choicesMade, and unlocked badges.
  - Key helpers:
    - `calculateLevel`, `getXPForNextLevel`
    - `getUserStats`, `updateUserStats`
    - `awardXP`, `unlockBadge`
  - When you add new gamified events, award XP/badges via these helpers rather than ad-hoc `localStorage` usage.

- **Auth helpers** – `lib/auth.ts`
  - Thin layer around `bcryptjs` and `jsonwebtoken` for password hashing and JWT handling.
  - Exposes:
    - `hashPassword`, `comparePassword`
    - `createToken`, `verifyToken`
    - `getTokenFromRequest` for extracting `Bearer` tokens from HTTP requests.
  - JWT secret is configured via `JWT_SECRET` environment variable (fallback string exists for dev, but prefer setting the env var).

- **Database schema & utilities (future DB)**
  - `lib/db-schema.sql`: SQL schema for a planned PostgreSQL (Supabase/Neon compatible) backend.
  - `lib/db-utils.ts`: TypeScript interfaces (`User`, `PersonalityRecord`, `StoryRecord`) and stubbed CRUD functions (`createUser`, `saveStory`, etc.) that currently `throw`.
  - `models/db.models.ts`: richer domain interfaces (`User`, `PersonalityProfile`, `Story`, `UserProgress`) and collection name constants.
  - The intention is for API routes to migrate from `localStorage` and ad-hoc storage to these utilities once a real DB is wired up.

### 3. Persistence and data access

There are **two main persistence strategies** in the current code:

1. **LocalStorage-backed UX**
   - Used for user stats and some story state via `lib/gamification.ts` and likely parts of the front-end story flow.
   - This is the current default, as documented in `README.md`.

2. **MongoDB for auth (in-progress)**
   - `db/dbconfig.ts` connects to MongoDB via `mongoose` using `process.env.MONGODB_URI`.
   - `models/user.model.ts` defines the Mongoose `User` schema (username, email, password).
   - `helpers/getDataFromToken.ts` reads a JWT from the `token` cookie (using `JWT_SECRET`) and returns the user id, bridging Next.js API routes with JWT validation.

Relational storage for personality results and stories is planned but not fully implemented; most of that design lives in `lib/db-schema.sql`, `lib/db-utils.ts`, and `models/db.models.ts`.

When adding new persistence features:
- Decide if they belong in the **temporary localStorage layer** (quick UX-only features) or the **future DB layer**.
- Prefer implementing new data access through `lib/db-utils.ts` (or a new centralized data access module) rather than calling drivers directly from components/routes.

### 4. UI components, hooks, and types

- **UI components** – `components/`
  - `components/ui/*`: shadcn/radix-based primitives and AndThen-specific wrappers (e.g., `NeonButton`, `NeonCard`, `AnimatedGrid`).
  - `components/theme-provider.tsx`: central place for theme context and providers.
  - When creating new visual elements, prefer composing from existing `components/ui` primitives to maintain visual consistency.

- **Custom hooks** – `hooks/`
  - `use-toast`, `use-mobile`, `use-window-size`, etc., encapsulate common UI behavior.
  - Use these instead of re-implementing responsive/layout logic in pages.

- **Shared types** – `types/`
  - `types/decodedToken.ts`: shape for decoded JWT payloads used across auth utilities.
  - Keep shared cross-layer types here (and referenced via `@/types/...`), leveraging the `@/*` path alias from `tsconfig.json`.

### 5. Routing, paths, and configuration

- **Path aliases** – `tsconfig.json`
  - `@/*` is mapped to the repo root (`./*`). Use imports like `@/lib/personality-data` or `@/components/ui/neon-button` instead of long relative paths.

- **Next.js config** – `next.config.mjs`
  - `typescript.ignoreBuildErrors: true` allows production builds even if TypeScript has errors (be careful when relying on CI).
  - `images.unoptimized: true` disables automatic image optimization.

- **Environment variables**
  - README recommends configuring API URLs in `.env.local` (e.g., `NEXT_PUBLIC_API_URL=http://localhost:3000`).
  - MongoDB and JWT secrets are read from `MONGODB_URI` and `JWT_SECRET` respectively.

## How future Warp agents should use this context

- For **feature work that touches personality logic** (new traits, questions, or result summaries), start from `lib/personality-data.ts` and then adapt `app/test/*` and any story prompt logic that depends on traits.
- For **changes to story generation behavior**, adjust:
  - `STORY_GENRES` and `generateStoryPrompt` in `lib/story-data.ts` for AI-backed flows.
  - `STORY_TEMPLATES` and `generateDemoStory` in `lib/story-templates.ts` for deterministic/demo flows.
- For anything involving **user progress, levels, or achievements**, route changes through `lib/gamification.ts` and keep the `UserStats` model as the single source of truth.
- For **auth and user identity**, operate on:
  - `lib/auth.ts` for hashing/JWTs and `getTokenFromRequest()`.
  - `db/dbconfig.ts`, `models/user.model.ts`, and `helpers/getDataFromToken.ts` for MongoDB-backed user storage and cookie-based JWT parsing.
- Before adding new infrastructure layers (e.g., full DB integration), review `lib/db-schema.sql`, `lib/db-utils.ts`, and `models/db.models.ts` to align with the intended schema and interfaces.
