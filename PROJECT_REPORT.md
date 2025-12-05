# Project Report: StoryWeave / AndThen

## 1. Core Idea & Overview
**StoryWeave (also referred to as AndThen)** is an AI-powered personalized storytelling platform. The core value proposition is to provide users with interactive stories that are specifically tailored to their personality traits.

The user journey consists of:
1.  **Personality Assessment**: Users take a psychometric test (based on the HEXACO model or similar) to measure traits like Conscientiousness, Openness, etc.
2.  **Profile Generation**: The system generates a detailed personality profile and assigns a "Character Archetype" (e.g., from anime/pop culture).
3.  **Personalized Storytelling**: Users select a genre (Fantasy, Sci-Fi, etc.), and the AI generates a story where the narrative style, plot points, and choices are influenced by their specific personality scores.
4.  **Interactive Gameplay**: The story unfolds in segments, allowing users to make choices that affect the outcome.

## 2. Tech Stack

### Frontend & Framework
-   **Next.js 16**: Using the App Router for modern, server-first routing and layouts.
-   **React 19**: The latest version of React for UI components.
-   **TypeScript**: For type safety and better developer experience.
-   **Tailwind CSS v4**: For utility-first styling.
-   **Framer Motion**: For smooth animations and transitions.

### UI Components
-   **shadcn/ui**: Reusable components built on top of Radix UI.
-   **Radix UI**: Headless UI primitives for accessibility and functionality.
-   **Lucide React**: Icon library.

### AI & Logic
-   **Vercel AI SDK**: For streaming AI responses and managing chat state.
-   **OpenAI GPT-4o-mini**: The underlying LLM used for story generation and personality analysis.

### Data & Persistence
-   **LocalStorage (Current)**: Primary storage for user progress, game state, and personality results in the current MVP.
-   **MongoDB + Mongoose (Auth)**: Used for user authentication (Signup/Login) and storing user credentials.
-   **PostgreSQL (Planned)**: A schema (`lib/db-schema.sql`) exists for a future migration to a relational database (Supabase/Neon) for robust data persistence.

## 3. Detailed File Structure & Purpose

### Root Directory
-   `package.json`: Defines project dependencies (Next.js, React, AI SDK, etc.) and scripts (dev, build, start).
-   `tsconfig.json`: TypeScript configuration file, setting up paths (like `@/*`) and compiler options.
-   `next.config.mjs`: Next.js configuration, currently set to ignore TypeScript errors during build (`ignoreBuildErrors: true`).
-   `postcss.config.mjs`: Configuration for PostCSS, used by Tailwind CSS.
-   `tailwind.config.ts`: (Implicitly handled or merged in v4) Configuration for Tailwind CSS theme and plugins.
-   `README.md`: General project documentation.
-   `WARP.md`: Context file for AI agents (like Warp) to understand the project structure and conventions.
-   `PROJECT_REPORT.md`: This detailed report file.

### `app/` (Next.js App Router)
This directory contains the application's routes and pages.
-   `layout.tsx`: The root layout file. It wraps the entire application, providing the `ThemeProvider` and global font settings.
-   `page.tsx`: The landing page of the application. It features the hero section, feature highlights, and calls to action.
-   `globals.css`: Global CSS styles, including Tailwind directives and custom theme variables (colors, animations).
-   `providers.tsx`: Client-side component that wraps the app with context providers (like `ThemeProvider` for dark mode).
-   `theme-provider.tsx`: A wrapper around `next-themes` to handle light/dark mode switching.

#### `app/auth/`
-   `layout.tsx`: Layout specific to authentication pages (e.g., centering the form).
-   `login/page.tsx`: The Login page. Contains the form for users to sign in.
-   `signup/page.tsx`: The Signup page. Contains the form for new user registration.

#### `app/test/`
-   `page.tsx`: The Personality Test page. It renders the questionnaire defined in `lib/personality-data.ts` and handles user responses.
-   `results/page.tsx`: The Results page. It calculates scores based on the test, displays the personality profile (traits, archetype), and offers to start a story.

#### `app/stories/`
-   `new/page.tsx`: The Genre Selection page. Users choose a genre (Fantasy, Sci-Fi, etc.) to start a new story.
-   `play/page.tsx`: The main Gameplay interface. It handles the interactive story loop: displaying text, showing choices, and calling the AI to generate the next segment.

#### `app/dashboard/`
-   `page.tsx`: The User Dashboard. It displays the user's level, XP, badges, saved stories, and personality summary.

#### `app/api/` (Backend Routes)
-   `auth/`:
    -   `login/route.ts`: Handles POST requests for user login (verifies credentials against MongoDB).
    -   `signup/route.ts`: Handles POST requests for user registration (creates new user in MongoDB).
    -   `me/route.ts`: Returns the current authenticated user's data.
-   `stories/`:
    -   `generate/route.ts`: The core AI endpoint. Receives the prompt (genre + personality) and streams the generated story text back to the client using Vercel AI SDK.
    -   `save/route.ts`: (Planned/Stub) Endpoint to save story progress to the database.
-   `personality/`:
    -   `save/route.ts`: (Planned/Stub) Endpoint to save personality test results to the database.

### `lib/` (Domain Logic & Utilities)
-   `personality-data.ts`: **Critical File**. Contains:
    -   `PERSONALITY_TRAITS`: Definitions of traits (Conscientiousness, etc.).
    -   `PERSONALITY_QUESTIONS`: The full list of questions for the test.
    -   `calculatePersonalityScores()`: Logic to convert answers into trait scores.
-   `story-data.ts`: **Critical File**. Contains:
    -   `STORY_GENRES`: Definitions of available genres (Fantasy, Sci-Fi, etc.) and their base prompts.
    -   `generateStoryPrompt()`: The function that constructs the prompt sent to the AI, injecting personality traits.
-   `story-templates.ts`: Contains static story templates for demo/offline purposes or fallback scenarios.
-   `gamification.ts`: Handles the gamification logic (XP, levels, badges). Currently uses `localStorage` to persist this data on the client side.
-   `auth.ts`: Utilities for authentication:
    -   Password hashing (using `bcryptjs`).
    -   JWT token generation and verification.
-   `db-utils.ts`: TypeScript interfaces and stub functions for future database operations (CRUD for users, stories).
-   `db-schema.sql`: SQL schema defining the structure for `users`, `personality_profiles`, `stories`, and `story_segments` tables (for PostgreSQL).
-   `utils.ts`: General utility functions (e.g., `cn` for class name merging).

### `components/` (UI Components)
-   `ui/`: A large collection of reusable UI components, mostly from **shadcn/ui**.
    -   Examples: `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `toast.tsx`, `progress.tsx`.
    -   `neon-button.tsx`, `neon-card.tsx`: Custom components with specific "neon" styling for the app's aesthetic.
    -   `animated-grid.tsx`, `floating-particles.tsx`: Visual effect components for the background.
    -   `hud-panel.tsx`: A specialized container for the game interface.
-   `theme-provider.tsx`: (Duplicate mention, likely the same as in `app/` or moved here) Handles theme context.

### `models/` (Database Models)
-   `user.model.ts`: Mongoose schema for the `User` collection (username, email, password, isAdmin).
-   `db.model.ts`: (Likely) Aggregated export or base configuration for models.
-   `personalityProfile.model.ts`: Mongoose schema for storing personality results.
-   `story.model.ts`: Mongoose schema for storing stories.
-   `userProgress.model.ts`: Mongoose schema for gamification progress.

### `db/` (Database Config)
-   `dbconfig.ts`: Handles the connection to the MongoDB database using Mongoose.

### `helpers/`
-   `getDataFromToken.ts`: Utility to extract and verify the user ID from the JWT token stored in cookies.

### `hooks/` (Custom React Hooks)
-   `use-toast.ts`: Hook for managing toast notifications.
-   `use-mobile.ts`: Hook for detecting mobile viewports.
-   `use-window-size.ts`: Hook for tracking window dimensions.

### `types/`
-   `decodedToken.ts`: TypeScript interface defining the structure of the decoded JWT payload.

## 4. Key Approaches & Architecture

### Personality Engine
The personality test is deterministic in its scoring but dynamic in its application.
-   **Scoring**: Answers map to specific trait modifications (e.g., +Conscientiousness, -Neuroticism).
-   **Normalization**: Raw scores are normalized to a 0-100 scale.
-   **Integration**: These scores are not just for display; they are directly injected into the system prompt for the AI. For example, a high-openness user might get a story with more "weird" or abstract plot twists, while a high-conscientiousness user might face challenges requiring planning.

### AI Story Generation
The system uses a "Prompt Engineering" approach:
1.  **Context Construction**: A base prompt is created using the selected Genre and the user's top Personality Traits.
2.  **Generation**: The AI generates a story segment and 3 distinct choices.
3.  **Continuity**: Previous story content is appended to the prompt to ensure the AI maintains context as the story progresses.

### Hybrid Persistence
The app currently operates in a hybrid mode:
-   **Auth**: Server-side (MongoDB).
-   **Gameplay**: Client-side (LocalStorage).
This allows for a snappy, offline-capable feel for the game loop, while keeping user accounts secure. The roadmap clearly points to moving gameplay data to the server (PostgreSQL) for cross-device sync.
