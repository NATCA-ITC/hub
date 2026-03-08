# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MyNATCA Hub is a Vue 3 admin dashboard for NATCA (National Air Traffic Controllers Association) members. It's part of a larger MyNATCA platform ecosystem and communicates with a backend Platform service for authentication and API proxying.

## Commands

```bash
npm run dev          # Start dev server on port 1302
npm run build        # Production build
npm run typecheck    # TypeScript type checking (vue-tsc --noEmit)
npm run lint         # ESLint with auto-fix
npm run build:icons  # Build custom iconify icons
```

## Architecture

### Platform Integration
- Hub runs on port 1302, Platform backend runs on port 1300
- All `/api` requests proxy through Vite to Platform backend (configured in `vite.config.ts`)
- Session-based authentication via Platform's OAuth 2.0 flow (Auth0)
- The `useAuth0` composable (`src/composables/useAuth0.ts`) manages auth state via Platform session endpoints

### Data Layer
- **Supabase**: Member, facility, region, position data (`src/plugins/supabase.ts`)
  - Uses `dev` schema in development, `public` schema in production
  - Service role key required for schema access
  - Shared tables: `members`, `facilities`, `regions`, `positions`, `proxy_routes`, `sync_metadata`
- **MyNATCA API**: Detailed member profile data via Platform proxy (`src/services/mynatcaApiService.ts`)
  - Proxied through `/api/mynatca/*` endpoints
  - Provides emails, phones, addresses

### State Management
- Pinia stores in `src/stores/`
- `memberStore`: Central member data from both Supabase and MyNATCA API
- Member data is cached for 5 minutes before refetch

### Auto-imports (via unplugin-auto-import)
- Vue Composition API (`ref`, `computed`, `watch`, etc.)
- Vue Router, VueUse, vue-i18n, Pinia
- Utilities from `src/@core/utils/`, `src/utils/`, `src/composables/`

### Component Structure
- Components auto-imported from `src/@core/components/`, `src/views/demos/`, `src/components/`
- File-based routing via `unplugin-vue-router` - pages in `src/pages/`
- Layouts in `src/layouts/`, selected via `vite-plugin-vue-meta-layouts`

### Path Aliases
```
@         → src/
@core     → src/@core/
@layouts  → src/@layouts/
@images   → src/assets/images/
@styles   → src/assets/styles/
```

## Key Services

| Service | Purpose |
|---------|---------|
| `mynatcaApiService` | Member profiles via Platform proxy |
| `memberService` | Supabase member queries |
| `rackspaceEmailService` | Email account management |
| `aiChatService` | AI conversation features |

## Environment Variables

Required in `.env`:
- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE` - Auth0 config (must match Platform)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_SERVICE_ROLE_KEY` - Supabase connection
- `VITE_PLATFORM_API_URL` - Platform backend URL (default: http://localhost:1300)
