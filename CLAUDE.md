# MyNATCA Hub — CLAUDE.md
_Last updated: 2026-04-22_

## WHY — Project Purpose

MyNATCA Hub is the member portal for NATCA, replacing the authenticated members section of natca.org. It provides members with access to updates, staffing data (NCEPT), events, legislative info, safety programs, committee/region pages, training, and document resources. Hub also serves as the admin control plane for ITC staff (member management, infrastructure monitoring, database tools).

Hub is actively migrating content from the WordPress-based natca.org members home. See `docs/page-inventory.md` for the full migration tracker.

## WHAT — Stack & Structure

**Stack:** Vue 3 + Vuetify 3 + TypeScript + Vite
**Auth:** NATCA Platform (Auth0/OAuth2) — see Platform Rule below
**UI:** `@natca-itc/ui-shell` — shared shell, theme preset, design tokens
**Port:** 1302 (dev server)

```
src/
  pages/              <- File-based routing (unplugin-vue-router)
  components/         <- App components (dashboard cards)
  layouts/            <- default.vue (NatcaShell), blank.vue (login)
  services/           <- Business logic (memberService, rackspaceEmailService, mynatcaApiService)
  stores/             <- Pinia state (memberStore)
  composables/        <- Vue composables (useAuth0, useApi, useSupabase)
  plugins/            <- Vue plugins (vuetify, supabase, router, pinia)
  navigation/         <- Tab/nav configuration
  types/              <- TypeScript definitions
  utils/              <- Utilities (exploreDatabase)
  assets/             <- Images, styles
supabase/
  migrations/         <- Hub schema migrations (symlinked into Platform)
docs/
  architecture/
    decisions/        <- ADRs (NNN-title.md)
  agent_docs/         <- Extended AI context (read on demand)
.claude/commands/     <- Slash commands (symlinked from Platform dev-standards)
.claude/rules/        <- Shared rules (symlinked from Platform dev-standards)
```

**Linear:**
- Hub: https://linear.app/natca/project/hub
- Platform: https://linear.app/natca/project/platform-e857a658cb7b

**Notion:** https://www.notion.so/31bd00a63edf815c95a2d5e35bef5f80
- ADRs and architecture docs are mirrored here (stakeholder-facing)
- Specs live ONLY in the repo

### Read On Demand — Agent Docs
Before working in a specific area, read the relevant file from `docs/agent_docs/`:
- `architecture.md` — system design and component relationships
- `platform-integration.md` — how Hub connects through Platform

### Key Technical Details

**UI Shell integration:**
- Vuetify theme: `natcaVuetifyTheme` and `natcaDefaults` from `@natca-itc/ui-shell`
- Layout: `NatcaShell` component wraps all authenticated pages (`layouts/default.vue`)
- CSS: `@natca-itc/ui-shell/tokens` (design tokens) + `@natca-itc/ui-shell/shell-styles`
- Do NOT import `@natca-itc/ui-shell/components` — that's for non-Vuetify pages only

**Auto-imports** (via unplugin-auto-import):
- Vue Composition API (`ref`, `computed`, `watch`, etc.)
- Vue Router, VueUse, Pinia
- Utilities from `src/composables/`, `src/utils/`

**Component auto-registration** (via unplugin-vue-components):
- Components from `src/components/`
- Type declarations auto-generated in `components.d.ts`

**Path aliases:**
- `@` -> `src/`
- `@images` -> `src/assets/images/`, `@styles` -> `src/assets/styles/`

**Data layer:**
- Supabase `public` schema (read-only): `members`, `facilities`, `regions`, `positions`
- Supabase `hub` schema (read-write): `user_preferences` (dashboard customizations)
- MyNATCA API: member profiles proxied through Platform (`/api/mynatca/*`)
- Hub database client: `supabase` (public), `hubDb` (hub schema) from `src/plugins/supabase.ts`

---

## NATCA PLATFORM RULE — MANDATORY
All authentication and NATCA system interactions MUST proxy through the NATCA Platform project.
- **Never implement auth directly** — all auth flows go through Platform/Auth0
- **Never call NATCA backend systems directly** — all calls proxy through Platform
- If an exception is needed, stop and write an ADR first
- See `docs/agent_docs/platform-integration.md`

## FRONTEND SHELL — MANDATORY
All Vue 3 apps MUST use `@natca-itc/ui-shell` for layout, navigation, and design tokens.
- Import `natcaVuetifyTheme` and `natcaDefaults` — never define your own Vuetify theme
- Import tokens CSS and shell-styles — never hardcode NATCA brand values
- Use `NatcaShell` as the layout wrapper — never build custom nav/topbar/sidebar
- Register in the app switcher so users can navigate between apps
- See the `frontend-shell-standard` shared rule

## INTEGRATION BOUNDARY — MANDATORY
New third-party integrations do NOT go in Platform or in app repos.
- Use Supabase Edge Functions or Azure Functions in `NATCA-ITC/integrations`
- Platform provides thin auth proxies only — no business logic
- See the `integration-architecture-standard` shared rule

---

## Git Workflow
- **Base branch:** `main`
- **Code promotion:** feature -> PR to main

---

## HOW — Task Workflow

### Starting Work
**Option A — From a Linear issue (preferred):**
Run `/implement-issue NAT-##` — Claude fetches the ticket, reads agent_docs,
moves to In Progress, creates branch, plans, implements, opens PR.

**Option B — Ad hoc (exploration, cleanup, quick bugs):**
Start directly without a ticket. You are never blocked by the absence of one.
Run `/finish-task` at the end — it will prompt to link or create a Linear issue.

### Finishing Work — `/finish-task` before every merge
1. Lint + validation must pass (see Essential Commands)
2. Update specs if behavior changed
3. Write ADR if architectural decision was made -> sync to Notion
4. Update agent_docs if system structure changed -> sync to Notion
5. Update Linear issue status + add completion comment
6. Open PR via `/open-pr`

### PR Rules
- Opened via `/open-pr` — NATCA template, auto-links Linear issue
- Lists all docs updated (specs, ADRs, agent_docs, Notion pages)
- Will not open if lint, typecheck, or tests are failing

---

## Documentation Rules

| Content | Source of Truth | Also synced to |
|---|---|---|
| Feature specs | `specs/` in repo | — (repo only) |
| ADRs | `docs/architecture/decisions/` | **Notion — ALWAYS** |
| Architecture / agent_docs | `docs/agent_docs/` | **Notion — ALWAYS** |
| Domain / business logic | `docs/architecture/domain/` | **Notion — ALWAYS** |
| Requirements changes | Notion | ADR in repo if a decision |
| Task tracking | Linear | — |

**Notion sync required any time:**
- An ADR is written or its status changes
- `docs/agent_docs/` content changes
- Requirements or business rules change

Run `/sync-to-notion [filepath]` to push content and get the Notion URL back.
**Specs never go to Notion.**

---

## Essential Commands
```bash
# Install
npm install

# Dev
npm run dev          # Port 1302, proxies /api to Platform at 1300

# Lint / typecheck — must pass before PR
npm run lint         # ESLint with auto-fix
npm run typecheck    # vue-tsc --noEmit

# Build
npm run build        # Production build

# Pre-merge (run before every PR)
npm run lint && npm run typecheck && npm run build
```

---

## ADR Format
New ADRs: `docs/architecture/decisions/NNN-title.md` (check existing for next number).
After writing, run `/sync-to-notion` and add returned URL to `Notion Page:` field.

```markdown
# ADR NNN: [Title]
**Status**: Accepted | Proposed | Deprecated | Superseded
**Date**: YYYY-MM-DD
**Notion Page**: [URL — fill in after /sync-to-notion]

**Context**: [Problem and background]
**Decision**: [What was decided]
**Consequences**:
- [Positive]
- [Negative / trade-off]
**Alternatives Considered**: [Why others were rejected]
**Related Decisions**: [Links]
---
**Accepted By**: NATCA ITC
**Implementation Status**: [Status]
```

---

## Git & Branch Rules
- Branch naming: Linear's suggested branch name (includes issue ID)
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Never commit to `main` directly — never commit secrets
- Shared infrastructure changes require team communication first
- Lint and tests must pass before any PR — no exceptions
- Base branch for PRs: see Git Workflow section above

## Forbidden Patterns
- Direct auth implementation — use Platform/Auth0
- Direct calls to NATCA backend systems — proxy through Platform
- Defining a custom Vuetify theme — use `natcaVuetifyTheme` and `natcaDefaults` from ui-shell
- Importing `@natca-itc/ui-shell/components` in Vuetify apps — that CSS is for non-Vuetify pages only
- Hardcoded hex colors — use CSS custom properties from ui-shell tokens
- Building custom nav/topbar/sidebar — use `NatcaShell` from ui-shell
- Merging PRs with lint/typecheck/test failures
- Writing ADRs or changing architecture docs without syncing to Notion

## Page Inventory — Migration Tracker
Hub is replacing the members section of natca.org. `docs/page-inventory.md` tracks every WordPress page and its Hub migration status.

**When building or modifying Hub pages, update the inventory:**
- New page created → set status to **Stub** or **Done**
- Page gets real content → update status to **Done**
- Page deferred → mark **Deferred** with reason
- DMS embed added → update from **DMS** to **Done**

The inventory is the source of truth for migration progress. Keep it current.

## Done Checklist
- Lint, typecheck, and build pass
- Spec updated if behavior changed
- ADR written if architectural decision made
- Notion synced if ADR or architecture changed
- agent_docs updated if system structure changed
- **Page inventory updated if a page was added, modified, or migrated**
- Linear issue updated with completion comment and correct status
- PR opened via `/open-pr`, Linear issue linked, docs listed
