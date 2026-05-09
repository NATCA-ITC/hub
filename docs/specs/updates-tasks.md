# Updates System — Task Tracker

_Lightweight task tracker until Hub merges into MyNATCA v2. Treat this file like a Linear board — check items off as they complete, update status notes inline. Source-of-truth for `what needs doing` on the Updates system._

**Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` blocked / waiting · `[?]` open question

**Last updated:** 2026-05-08

---

## Status snapshot

- **Current phase:** Pre-flight (open questions + ADR acceptance)
- **Branch:** `docs/updates-master-plan` (clean from main)
- **Blockers:** ADR 001 is `Proposed`, awaiting ITC acceptance
- **Next concrete action:** resolve the 10 open questions below; either accept all defaults or override, then move to Phase 1

---

## Pre-flight

ADR sign-off + design questions that need answers before code.

- [-] **U0.1** ADR 001 acceptance by NATCA ITC
  - Sign-off on `docs/architecture/decisions/001-updates-system.md`
  - On acceptance: change Status field to `Accepted`, run `/sync-to-notion docs/architecture/decisions/001-updates-system.md`, paste returned URL into the `Notion Page:` field
  - Blocks: Phase 1

- [?] **U0.2** Open questions — resolve all 10 before starting Phase 1
  - All listed in [`docs/specs/updates-implementation-plan.md` § Open questions](updates-implementation-plan.md#open-questions--decisions-before-phase-1) with default proposals
  - Track per-question status here:
    - [ ] Q1 — `@here` in `#announcements` summary on urgent? (default: yes)
    - [ ] Q2 — Forum tag updates on lifecycle change? (default: yes, in scope for v1)
    - [ ] Q3 — `area_id` as column or join table? (default: column, single area per story)
    - [ ] Q4 — Auto-archive duration for forum threads? (default: 7 days)
    - [ ] Q5 — Tiptap markdown serialization server vs client? (default: server)
    - [ ] Q6 — Tiptap image extension version? (default: official `@tiptap/extension-image`)
    - [ ] Q7 — DMS document linking UX in editor? (default: sidebar panel, not inline embed)
    - [ ] Q8 — Areas seed migration location? (default: same migration as topics)
    - [ ] Q9 — Public-audience stories linking internal-only DMS docs? (default: server-side gate)
    - [ ] Q10 — Position → grant sync? (default: not in v1, manual SQL bootstrap)
  - Each question is a one-line decision; checking the box = accept default OR write the override decision in a sub-bullet

---

## Phase 1 — Schema + Platform API + grants + bucket

Foundation. Blocks Phases 2 and 3.

### Schema (Hub repo, symlinked into Platform)

- [ ] **U1.1** Write `hub/supabase/migrations/<ts>_updates_init.sql`
  - Schema `updates` + tables: `topics`, `areas`, `stories`, `updates`, `subscriptions`, `update_embeddings`, `story_documents`
  - Trigger: denormalize `update_count` + `last_updated_at` on story when an update publishes
  - pgvector extension + HNSW index on `update_embeddings.embedding`
  - Schema reference: [`docs/agent_docs/updates-system.md` § Database schema](../agent_docs/updates-system.md#database-schema)

- [ ] **U1.2** Seed: 16 topics in 3 groups
  - Source of truth: [`docs/content-standards.md` § Axis 2](../content-standards.md#axis-2--topic)
  - INSERT rows for `updates.topics` with `group`, `discord_forum_channel_id NULL` (filled in by U3.1), `default_subscribed`, `sort_order`

- [ ] **U1.3** Seed: areas for the 5 topics that define them
  - Source of truth: [`docs/content-standards.md` § Axis 3](../content-standards.md#axis-3--area-optional-per-topic)
  - INSERT rows for `updates.areas`: Employee Movement (6), Employee Wellness (6), Safety & Technology (4), Legislative (4), Membership Services (7)

- [ ] **U1.4** Add `updates` to Platform's `.linked-projects.config.json`
  - In `~/dev/mynatca/platform/`
  - Update PostgREST exposed schemas in `supabase/config.toml`
  - Run `bash scripts/link-project.sh` from Platform
  - Verify with `npm run db:reset -- updates`

### Platform API

- [ ] **U1.5** `platform/routes/updates.js` — read endpoints
  - `GET /api/updates/topics` (grouped by `group`)
  - `GET /api/updates/topics/:id/areas`
  - `GET /api/updates/stories` with `topic`, `content_type`, `lifecycle`, `area`, `urgent` filters; cursor pagination by `(urgent DESC, last_updated_at DESC, id)`
  - `GET /api/updates/stories/:slug` — story + all published updates
  - `GET /api/updates/stories/:slug/updates` — paginated update timeline
  - `GET /api/updates/subscriptions` — current member's state
  - All require `requireAuth` session middleware

- [ ] **U1.6** `platform/routes/updates.js` — write endpoints (gated by `requireUpdatesAuthor`)
  - `POST /api/updates/stories` — wraps in transaction, server-side markdown + HTML render
  - `PATCH /api/updates/stories/:id`
  - `POST /api/updates/stories/:id/publish` — calls Discord webhook, kicks off embedding job, calls `ccSync()` stub
  - `POST /api/updates/stories/:id/resolve`
  - `POST /api/updates/stories/:id/archive`
  - `POST /api/updates/stories/:id/updates` — most common author op
  - `PATCH /api/updates/stories/:storyId/updates/:updateId`
  - `DELETE /api/updates/stories/:storyId/updates/:updateId`
  - `GET /api/updates/author/stories` — quick-find for Author Dashboard
  - `PUT /api/updates/subscriptions`

- [ ] **U1.7** `platform/routes/updates.js` — admin endpoints
  - `POST /api/updates/topics` — admin only, calls Discord bot to create forum channel, stores returned ID
  - `POST /api/updates/topics/:id/areas` — admin only

- [ ] **U1.8** Tiptap markdown + HTML serializer (server-side)
  - `platform/lib/tiptap.js` — exports `renderToMarkdown(json)` and `renderToHtml(json)`
  - Use `@tiptap/core` + `@tiptap/extension-markdown` + `prosemirror-model` server-side, OR call out to a small Node helper
  - Decision Q5 default: server-side; revisit if perf becomes an issue

- [ ] **U1.9** `POST /api/updates/upload` — Supabase Storage write
  - `multer` for multipart, mime allow-list (`image/*`, `application/pdf`), 10MB cap
  - Streams to `updates-media/{year}/{month}/{uuid}.{ext}`
  - Returns `{ url, width, height, mime_type, size }`
  - Gated by `requireUpdatesAuthor`

- [ ] **U1.10** Discord webhook caller — `platform/lib/discordSync.js`
  - `publishUpdate(story, topic, area, update)` → POSTs to `http://discord:1303/webhook/update-published`
  - Returns IDs to store on story / update rows
  - Synchronous in v1; structured for future queue insertion

- [ ] **U1.11** Constant Contact stub — `platform/lib/ccSync.js`
  - `ccSync(update)` — logs "deferred" and returns
  - Comment links to future Edge Function path: `NATCA-ITC/integrations/supabase/functions/constant-contact-sync/`

- [ ] **U1.12** Embedding stub — `platform/lib/embeddings.js`
  - `embedUpdate(updateId)` — fetches `body_md`, OpenAI call, upsert to `updates.update_embeddings`
  - Wired into publish flow but allowed to fail silently in v1 (logs error, doesn't block publish)
  - Backfill script: `npm run embeddings:backfill`
  - Full implementation in Phase 4 (this phase = stub + interface)

### Storage bucket + auth

- [ ] **U1.13** Create `updates-media` Supabase Storage bucket
  - Public read for published content
  - Write gated via Platform `/api/updates/upload` (no bucket-level RLS)
  - 10MB max file size, mime allow-list at app layer
  - Document creation step in `platform/docs/local-dev-setup.md`

- [ ] **U1.14** Grants bootstrap — `platform/migrations/<ts>_seed_updates_grants.sql`
  - Insert `updates_admin` for known initial admins (Doss + Linda + ITC ops)
  - Document the manual process in `platform/dev-standards/rules/grants.md` if not already covered

### Phase 1 acceptance test

- [ ] **U1.15** End-to-end via curl/Postman
  - As an admin: list topics → topics show 16 across 3 groups
  - Create a story → returns ID + slug
  - Publish the story → returns success + Discord stub log line
  - List stories → new story appears
  - Add an update → returns ID
  - Verify denormalization: `update_count` and `last_updated_at` on the story bumped

---

## Phase 2 — Hub Vue UI

Replaces mockups with real components.

### Types + services + store

- [ ] **U2.1** `src/types/updates.ts`
  - `ContentType`, `Lifecycle`, `UpdateKind`, `StoryStatus`
  - `Topic`, `Area`, `Story`, `Update`, `Subscription`, `UpdatePreferences`

- [ ] **U2.2** `src/services/updatesService.ts`
  - Singleton class, mirrors `rackspaceEmailService.ts` pattern
  - Typed wrappers around all `/api/updates/*` endpoints

- [ ] **U2.3** `src/stores/updatesStore.ts` (Pinia)
  - State, actions, getters per [`docs/specs/updates-implementation-plan.md` § What HUB needs › Store](updates-implementation-plan.md#store)

### Routes + pages

- [ ] **U2.4** `src/pages/updates/index.vue` — story feed
- [ ] **U2.5** `src/pages/updates/[slug].vue` — story page (the liveblog)
- [ ] **U2.6** `src/pages/updates/topics/[topicId].vue` — single-topic view with area filter chips
- [ ] **U2.7** `src/pages/updates/preferences.vue` — subscription toggles
- [ ] **U2.8** `src/pages/updates/admin/index.vue` — Author Dashboard (quick-find + inline post-update)
- [ ] **U2.9** `src/pages/updates/admin/new.vue` — new story editor
- [ ] **U2.10** `src/pages/updates/admin/stories/[id]/edit.vue` — edit story metadata

### Components

- [ ] **U2.11** `src/components/updates/StoryCard.vue` — feed-row card
- [ ] **U2.12** `src/components/updates/StoryFeed.vue` — paginated feed
- [ ] **U2.13** `src/components/updates/StoryHeader.vue` — story page header
- [ ] **U2.14** `src/components/updates/UpdateTimeline.vue` — chronological update list
- [ ] **U2.15** `src/components/updates/UpdateCard.vue` — single-update render
- [ ] **U2.16** `src/components/updates/TiptapEditor.vue` — Tiptap wrapper, image-upload hook to U1.9
- [ ] **U2.17** `src/components/updates/AuthorQuickFind.vue` — search + filter
- [ ] **U2.18** `src/components/updates/ContentTypePicker.vue` — segmented control
- [ ] **U2.19** `src/components/updates/TopicPicker.vue` — grouped select
- [ ] **U2.20** `src/components/updates/AreaPicker.vue` — only when topic has areas
- [ ] **U2.21** `src/components/updates/UrgentToggle.vue`
- [ ] **U2.22** `src/components/updates/DiscordSyncToggle.vue`
- [ ] **U2.23** `src/components/updates/LinkedDocuments.vue` — DMS doc linker (sidebar)

### Dashboard card

- [ ] **U2.24** Rewrite `src/components/dashboard/MemberUpdatesCard.vue`
  - Pulls from real `/api/updates/stories?limit=5`
  - Uses `<StoryCard>` for rendering
  - Settings button → `<UpdatePreferencesDialog>` modifying `hub.user_preferences.preferences.updates`

### Tiptap setup

- [ ] **U2.25** Install Tiptap deps
  - `@tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-markdown`

- [ ] **U2.26** Auto-save draft logic
  - On editor blur or 2s of inactivity → `PATCH /api/updates/stories/:id` with new `body_json`

### Role gating

- [ ] **U2.27** Use `useAuth0().hasGrant()` to gate UI
  - "+ New Story" on `/updates`
  - `/updates/admin*` route guard
  - Per-row "+ Post Update" + edit/delete buttons on Author Dashboard

### Phase 2 acceptance test

- [ ] **U2.28** End-to-end author flow
  - Log in as `updates_author` → navigate to `/updates/admin`
  - Create new story (Tiptap editor) → publish → see it on `/updates`
  - Click into story → see liveblog timeline
  - Click "+ Post Update" on existing story → add update → see new entry in timeline

---

## Phase 3 — Discord forum + announcements

### Channel structure

- [ ] **U3.1** Create private `TOPICS` category + 16 forum channels
  - Bot creates channels via Discord API (or admin UI for first run)
  - Slugs match `updates.topics.id`
  - Per-forum: configure 8 forum tags (4 content type + 4 lifecycle)
  - Stores returned channel IDs back into `updates.topics.discord_forum_channel_id`

- [ ] **U3.2** Top-level `#announcements` (Announcement-type) + `#verify` (only public channel)
  - Permissions per [`docs/agent_docs/updates-system.md` § Permissions per channel](../agent_docs/updates-system.md#permissions-per-channel)
  - Bot config gets `ANNOUNCEMENTS_CHANNEL_ID`, `TOPICS_CATEGORY_ID` constants

### Webhook handler

- [ ] **U3.3** `discord/lib/webhookHandlers/updatePublished.js`
  - First-update path: forum thread create + apply tags + post `#announcements` summary + crosspost
  - Subsequent-update path: thread reply + edit `#announcements` summary embed
  - Returns IDs back to Platform

- [ ] **U3.4** Embed renderers — `discord/lib/embeds/`
  - `storyThreadEmbed.js` — full forum-thread OP
  - `updateReplyEmbed.js` — thread reply
  - `announcementSummaryEmbed.js` — brief summary
  - All embeds include link buttons (Hub story, forum thread, DMS docs as applicable)

- [ ] **U3.5** Channel manager updates — `discord/lib/channelManager.js`
  - Knows about per-topic forum IDs (loaded from Platform on boot)
  - `ANNOUNCEMENTS_CHANNEL_ID` + `TOPICS_CATEGORY_ID` constants

- [ ] **U3.6** Logging convenience methods
  - `logger.update('published', { story_id, topic_id, kind, urgent })`
  - `logger.update('crosspost_failed', { story_id, error })`

### Phase 3 acceptance test

- [ ] **U3.7** End-to-end Discord fan-out
  - Publish a story from Hub → forum thread created in correct topic forum + summary in `#announcements`
  - Add update → thread reply lands + announcements summary edited
  - Mark urgent → `@here` in both
  - Verify cross-server: follow `#announcements` from a test server → published stories appear

---

## Phase 4 — Embedding generation

- [ ] **U4.1** Implement `embedUpdate(updateId)` in `platform/lib/embeddings.js` (started in U1.12)
  - Chunk if `body_md` > ~500 tokens
  - OpenAI `text-embedding-3-small` call
  - Upsert with `content_hash` to skip unchanged content

- [ ] **U4.2** Wire into publish flow — runs after Discord fan-out
  - Failure logs but doesn't block publish

- [ ] **U4.3** `npm run embeddings:backfill` script
  - Iterates all published updates without an embedding row
  - Useful for retroactive seeding

- [ ] **U4.4** Nightly stale-check
  - Re-embed updates where `body_md` hash doesn't match stored `content_hash`
  - Hooked into Platform's existing scheduled-jobs mechanism

---

## Deferred (post-MVP)

- [ ] **U5** Phase 5 — AI search UI (`/api/updates/ask` + Hub search box + related-stories on story page)
- [ ] **U6** Phase 6 — Constant Contact integration (Edge Function in `NATCA-ITC/integrations`)

---

## How to use this file

- Update an item: change `[ ]` → `[~]` (in progress) → `[x]` (done). Add a one-line note in a sub-bullet if useful.
- Reference an item in commits / PRs: use the ID, e.g. `feat(U1.1): updates schema migration`.
- New tasks: add under the relevant phase with the next free ID. Don't reorder existing IDs.
- Open questions: convert `[?]` to `[x]` when the decision is made; record the decision in a sub-bullet.
- When a phase finishes, leave checked items in place — they're the definitive log of what shipped.
- When Hub merges into MyNATCA v2, this file moves with the rest of the Updates docs (see [`updates-implementation-plan.md` § MyNATCA v2 merge note](updates-implementation-plan.md#mynatca-v2-merge-note)).
