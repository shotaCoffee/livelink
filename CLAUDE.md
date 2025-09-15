# CLAUDE.md

ユーザーの返信には日本語を用いること

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

liveLink is a setlist sharing app for bands (バンド向けセットリスト共有アプリ). The main purpose is to effectively share "these are the songs we'll be playing!" with potential audience members, with secondary functionality for song management and history sharing between band members.

## Tech Stack

- **Architecture**: Monorepo using pnpm workspaces
- **Frontend**: SolidJS + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Development**: Docker Compose
- **Production**: Vercel (Frontend) + Supabase (Backend)

## Repository Structure

This is a pnpm monorepo with the following structure:

```
liveLink/
├── packages/
│   ├── shared/           # Shared type definitions and utilities
│   ├── supabase-client/  # Supabase-related logic and queries
│   └── ui/               # Shared UI components library
├── apps/
│   └── web/              # Main SolidJS web application (@livelink/web)
├── supabase/             # Supabase project files (migrations, functions, config)
│   ├── migrations/       # Database schema migrations
│   ├── functions/        # Edge Functions
│   └── config.toml       # Supabase configuration
└── .claude/
    └── docs/             # Development documentation and guides
```

**Current Implementation Status**: Full monorepo with working web application, Supabase backend, and comprehensive UI component library.

## Development Commands

### Initial Setup
After cloning the repository, run these commands to set up the development environment:

```bash
# Install all dependencies (including dev tools)
pnpm install

# Format all files to match code style
pnpm format

# Check code quality (lint + format)
pnpm lint
pnpm format:check
```

### Primary Commands

- `pnpm dev` - Start all development servers in parallel
- `pnpm build` - Build all packages recursively
- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Auto-fix ESLint issues where possible
- `pnpm type-check` - Run TypeScript type checking across all packages
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check if files are properly formatted
- `pnpm clean` - Clean build artifacts from all packages

### Development Environment Setup

```bash
# Start Supabase local development
supabase start

# Start web application in development mode
pnpm --filter @livelink/web dev

# Or start all development servers
pnpm dev
```

### Code Quality Tools

The project includes automated code quality tools:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky + lint-staged**: Pre-commit hooks that automatically format and lint staged files
- **TypeScript**: Type checking across all packages

### Package-specific Commands

- `pnpm --filter @livelink/web dev` - Run web application in development mode
- `pnpm --filter @livelink/web build` - Build web application
- `pnpm --filter @livelink/web type-check` - Type check web application
- `pnpm --filter @band-setlist/ui build` - Build UI component library
- `pnpm --filter @band-setlist/shared build` - Build shared types package
- `pnpm --filter @band-setlist/supabase-client build` - Build Supabase client
- `pnpm --filter <package-name> add <dependency>` - Add dependency to specific package
- `pnpm add -D -w <package>` - Add dev dependency to workspace root

### Supabase Development Setup

```bash
# Install Supabase CLI globally
npm install -g supabase

# Start local Supabase (PostgreSQL, Auth, API, Dashboard)
supabase start

# Apply database migrations
supabase db reset

# Check Supabase status
supabase status

# Deploy functions to local environment
supabase functions serve
```

### Docker Development (Optional)

```bash
# Start all services including Supabase
docker-compose up
```

## Package Architecture

### Shared Package (`@band-setlist/shared`)

- Contains TypeScript type definitions for database entities (Song, Live, Band, SetlistItem, etc.)
- Form types and UI state types
- Common utilities

### Supabase Client Package (`@band-setlist/supabase-client`)

- Supabase client configuration
- Authentication functions
- Database query functions organized by entity (songs, lives, setlists)
- Will depend on `@band-setlist/shared` for types

### UI Package (`@band-setlist/ui`)

- **Complete UI component library** built with SolidJS and TailwindCSS
- **Base components**: Button, Input, Card, Modal, Badge, LoadingSpinner, ErrorBanner
- **Form components**: FormGroup, SongForm, LiveForm with validation
- **Layout components**: Header, Sidebar, Layout, AppLayout, PageHeader, Container
- **Fully typed** with TypeScript and proper component props
- **Ready for production** with consistent styling and accessibility

## Core Data Models

Based on the documentation, the app handles:

- **Songs**: Individual tracks with metadata (title, artist, YouTube/Spotify URLs)
- **Lives**: Concert events with venue, date, and sharing capabilities
- **Bands**: User-owned band entities
- **Setlists**: Ordered song lists for specific live events
- **Sharing**: Public sharing functionality via slugs

## Development Workflow

1. **Database Schema**: Update migrations in `supabase/migrations/`
2. **Shared Types**: Update type definitions in `packages/shared`
3. **Database Queries**: Implement queries in `packages/supabase-client`
4. **UI Components**: Create/update reusable components in `packages/ui`
5. **Application Features**: Implement features in `apps/web` using shared packages
6. **Testing**: Run type checks and linting before committing

### Typical Feature Development Flow

1. Create/update database schema in Supabase migrations
2. Update TypeScript types in `@band-setlist/shared`
3. Add/update database queries in `@band-setlist/supabase-client`
4. Create UI components in `@band-setlist/ui` if needed
5. Implement feature in `@livelink/web` using the above packages
6. Test locally with `pnpm dev` and Supabase local development

## Key Files

- `package.json` - Root workspace configuration with parallel script execution
- `pnpm-workspace.yaml` - Defines workspace packages in `apps/*` and `packages/*`
- `supabase/config.toml` - Supabase project configuration
- `supabase/migrations/` - Database schema migrations with initial data
- `apps/web/src/` - Main web application source code
- `.env` / `.env.example` - Environment variables for Supabase connection
- `.claude/docs/` - Development guides and documentation
  - `FRONTEND_DEBUG_GUIDE.md` - SolidJS debugging patterns and solutions
  - `SUPABASE_SETUP.md` - Production deployment guide
- `LiveLink.md` - Original comprehensive project documentation in Japanese

## Current Implementation Status

- ✅ **Full monorepo setup** with working web application
- ✅ **Complete UI component library** (`@band-setlist/ui`) with 15+ components
- ✅ **Database backend** with Supabase local development
- ✅ **Authentication system** with user management
- ✅ **Core features implemented**:
  - Band management and user association
  - Song library with YouTube/Spotify links
  - Live event management with public sharing
  - Setlist creation and public sharing via slugs
  - Public viewing pages for shared setlists
- ✅ **Production-ready** with comprehensive documentation

## Important Development Notes

- **Package naming**: Main packages use `@band-setlist/*`, web app uses `@livelink/web`
- **SolidJS patterns**: Use `createEffect` for reactive Resource monitoring (not `onMount`)
- **Database**: All schema changes must be done via Supabase migrations
- **Environment**: Local development uses Supabase local instance
- **Debugging**: Comprehensive guides available in `.claude/docs/`
- **Japanese market focus**: UI and documentation primarily in Japanese

## Architecture Highlights

- **SolidJS** for reactive frontend with excellent performance
- **Supabase** for PostgreSQL database, authentication, and Edge Functions
- **TailwindCSS** for consistent, utility-first styling
- **TypeScript** throughout for type safety
- **pnpm workspaces** for efficient monorepo management
- **Row Level Security (RLS)** for data access control
