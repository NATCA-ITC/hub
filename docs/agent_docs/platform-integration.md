# Hub — Platform Integration

## How Hub Connects Through Platform

Hub depends on Platform for authentication and API proxying. It never talks to external NATCA systems directly.

## Authentication

Hub uses Platform's session-based auth (Auth0 under the hood):

| Endpoint | Purpose |
|----------|---------|
| `GET /api/auth/session` | Check current session, returns user profile |
| `GET /api/auth/login` | Initiates Auth0 login flow |
| `GET /api/auth/logout` | Destroys session, redirects to Auth0 logout |

The `useAuth0` composable (`src/composables/useAuth0.ts`) wraps these endpoints and manages reactive auth state.

## API Proxy

All `/api/*` requests from Hub are proxied to Platform via Vite dev server config:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:1300',
      changeOrigin: true
    }
  }
}
```

### Proxied Endpoints Used by Hub

| Route | Platform Handler | Hub Consumer |
|-------|-----------------|--------------|
| `/api/auth/*` | Auth routes | `useAuth0.ts` |
| `/api/mynatca/*` | MyNATCA API proxy | `mynatcaApiService.ts` |

## Supabase (Direct Read)

Hub reads shared tables directly from Supabase using the service role key:
- Schema: `dev` (development) / `public` (production)
- Tables: `members`, `facilities`, `regions`, `positions`, `member_types`
- Client: `src/plugins/supabase.ts`

Hub does NOT own any database tables. All shared tables are owned and managed by Platform.

## Environment Variables

| Variable | Purpose | Source |
|----------|---------|--------|
| `VITE_PLATFORM_API_URL` | Platform backend URL | Default: `http://localhost:1300` |
| `VITE_SUPABASE_URL` | Supabase project URL | Platform's Supabase instance |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase access | Platform's service role key |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant | Must match Platform's Auth0 app |
| `VITE_AUTH0_CLIENT_ID` | Auth0 client | Must match Platform's Auth0 app |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience | Must match Platform |
