# Hub Architecture

## System Overview

Hub is a Vue 3 SPA that serves as the admin/operations dashboard for the MyNATCA ecosystem. It consumes data from two sources — Supabase (direct read) and the MyNATCA API (proxied through Platform).

## Component Architecture

### Pages (File-based routing via unplugin-vue-router)
- `src/pages/index.vue` — Dashboard (member profile, Rackspace email card, positions)
- `src/pages/login.vue` — Auth0 login redirect
- `src/pages/profile.vue` — Member profile detail
- `src/pages/facilities.vue` — Facility browser
- `src/pages/db-explorer.vue` — Supabase table explorer
- `src/pages/infrastructure.vue` — Infrastructure monitoring
- `src/pages/analytics.vue` — Analytics views

### Services
- `memberService.ts` — Supabase queries for member data
- `mynatcaApiService.ts` — Member profiles via Platform proxy (`/api/mynatca/*`)
- `rackspaceEmailService.ts` — Rackspace email account management

### State Management
- `memberStore.ts` — Central member state (Pinia). Merges Supabase + API data. 5-minute cache TTL.

### Auth Flow
1. User visits Hub -> `useAuth0` composable checks Platform session (`/api/auth/session`)
2. If no session -> redirect to Platform login (`/api/auth/login`)
3. Platform handles Auth0 OAuth flow -> sets session cookie
4. Hub reads session via `/api/auth/session` endpoint
5. All subsequent API calls include session cookie automatically (same-origin proxy)

### UI Framework (Current)
- `src/@core/` — Purchased admin template components (form elements, cards, utilities)
- `src/@layouts/` — Layout framework (vertical nav, horizontal nav, responsive)
- Vuetify 3 theme defined in `src/plugins/vuetify/theme.ts`
- **Migration planned:** Replace with `@natca-itc/ui-shell` Vue components (Phase 2)

### Build Pipeline
- Vite dev server on port 1302
- `/api/*` proxied to Platform at port 1300 (configured in `vite.config.ts`)
- Auto-imports: Vue Composition API, VueUse, Pinia, vue-i18n
- Component auto-registration from `@core/components/` and `src/components/`
