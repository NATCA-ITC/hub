# Updates System — Master Implementation Plan

_Per-system breakdown of the work needed to ship the Updates system end-to-end. This is the practical companion to [ADR 001](../architecture/decisions/001-updates-system.md) and [agent_docs/updates-system.md](../agent_docs/updates-system.md). Read those for the *what* and *why*; read this for the *who builds what, in what order*._

**Status:** Phase 0 complete (this document, ADR, agent_docs, content standards). Phase 1 ready to start on ADR acceptance.

**Last updated:** 2026-05-08

---

## TL;DR

Build a Hub-driven Updates module that publishes a single story (with timestamped updates) once, and fans out to:

1. **Hub** — story page, topic feeds, dashboard card, Tiptap author UI, role-gated admin
2. **Discord — topic forum** — full content as a forum thread under the private `TOPICS` category, replies for each subsequent update
3. **Discord — `#announcements`** — brief summary cross-postable to follower servers
4. **(Deferred) Constant Contact** — draft email campaigns

Bidirectional links from day 1: Hub story ↔ Discord forum thread ↔ `#announcements` summary.

Work spans three repos (Hub, Platform, Discord), one new schema (`updates`), one new storage bucket (`updates-media`), and a clear set of new grants.

---

## Architecture overview

```
                        ┌────────────────────────┐
                        │   Hub (Vue 3 + Vuetify)│
                        │   /updates             │
                        │   /updates/admin       │
                        │   /updates/[slug]      │
                        │   Tiptap editor        │
                        └────────────┬───────────┘
                                     │ HTTP via /api proxy
                                     ▼
                        ┌────────────────────────┐
                        │  Platform (Express)    │
                        │  /api/updates/*        │
                        │  routes/updates.js     │
                        │  Auth0 session         │
                        │  grants middleware     │
                        └─────┬────────────────┬─┘
                              │                │
                              ▼                ▼
            ┌─────────────────────────┐   ┌──────────────────────┐
            │ Supabase                │   │ Discord Bot          │
            │ updates.* schema        │   │ /webhook/update-     │
            │ updates-media bucket    │   │   published          │
            │ pgvector extension      │   │ forum thread create  │
            └─────────────────────────┘   │ #announcements post  │
                                          │ crosspost + edits    │
                                          └──────────────────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │ Discord — National   │
                                          │   #announcements     │ ──► follower servers
                                          │   TOPICS/#topic-x    │
                                          └──────────────────────┘
```

Single source of truth: the `updates` schema on Supabase. Hub reads/writes via Platform API. Platform fans out to Discord via webhook. Discord stores nothing — only message IDs come back to Platform for storage on `stories` and `updates` rows.

---

## Phase plan with dependencies

| Phase | Deliverable | Blocks | Owner |
|---|---|---|---|
| **0** | Mockups + ADR + agent_docs + content standards + this plan | Nothing — already done | done |
| **1** | Schema migration + pgvector + Storage bucket + Platform API + grants bootstrap | Phases 2 & 3 | Platform + Hub (migrations) |
| **2** | Hub Vue UI: feed, story page, admin dashboard, Tiptap editor, dashboard card | Phase 3 (handler needs publish flow working) | Hub |
| **3** | Discord bot: forum thread create, `#announcements` post, embed renderer, OP-edit pattern, link buttons | None within this batch (after 2) | Discord |
| **4** | Embedding generation on publish + nightly stale-check | Phase 5 | Platform |
| **5** | AI search: `/api/updates/ask` RAG endpoint + Hub search UI + related-stories | None | Platform + Hub |
| **6** | Constant Contact integration as Edge Function in `integrations/` | None | Integrations team |

**Critical path**: Phase 1 → Phase 2 → Phase 3 to ship MVP. Phases 4–6 layer on without blocking MVP launch.

---

## What HUB needs

Repo: `~/dev/mynatca/hub`

### Schema (lives in Hub repo, symlinked into Platform)

`hub/supabase/migrations/<timestamp>_updates_init.sql`:
- New `updates` schema
- Tables: `topics`, `areas`, `stories`, `updates`, `subscriptions`, `update_embeddings`, `story_documents`
- Triggers: denormalize `update_count` and `last_updated_at` on story when an update publishes
- pgvector extension + HNSW index on `update_embeddings.embedding`
- Seed: 16 topics in 3 groups (see [content-standards.md](../content-standards.md))
- Seed: areas for the 5 topics that define them (Employee Movement, Employee Wellness, Safety & Technology, Legislative, Membership Services)
- RLS off on this schema — Platform mediates all access

Run via Platform's `npm run db:reset -- updates` once symlinked.

### Routes (file-based)

`src/pages/updates/`:
- `index.vue` — story feed with topic filter chips
- `[slug].vue` — story page (the liveblog)
- `topics/[topicId].vue` — single-topic view with area filter chips
- `preferences.vue` — subscription toggles
- `admin/index.vue` — Author Dashboard (quick-find + inline "post update" form)
- `admin/new.vue` — new story editor
- `admin/stories/[id]/edit.vue` — edit story metadata

Route meta on every page sets `breadcrumbs` for `NatcaShell`.

### Components

`src/components/updates/`:
- `StoryCard.vue` — feed-row card; props: `story`. Renders content-type + lifecycle chips, area chip, latest-update preview, urgent badge, links to story page
- `StoryFeed.vue` — paginated feed; pulls from `updatesStore`
- `StoryHeader.vue` — story page header (title, topic + area badge, content type + lifecycle, urgent state)
- `UpdateTimeline.vue` — chronological list of updates; `kind` drives styling (📰 / ⚡ / ✏️ / 📋)
- `UpdateCard.vue` — single update render
- `TiptapEditor.vue` — wraps `@tiptap/vue-3`; emits JSON + markdown; image upload hook → `/api/updates/upload`
- `AuthorQuickFind.vue` — search + filter UI for `/updates/admin`
- `ContentTypePicker.vue` — segmented control (Update / Document / Action Needed / Event)
- `TopicPicker.vue` — grouped select (Councils / Standing Committees / Cross-Cutting)
- `AreaPicker.vue` — appears only when the picked topic has areas
- `UrgentToggle.vue` — switch with explainer tooltip
- `DiscordSyncToggle.vue` — "Also post to Discord" — default on; can be off for backfill or test
- `LinkedDocuments.vue` — for `Document` content type; pulls from DMS via Platform proxy

`MemberUpdatesCard.vue` (existing, in `src/components/dashboard/`) gets rewritten to consume the real API.

### Services

- `src/services/updatesService.ts` — typed wrapper around `/api/updates/*`. Mirror `rackspaceEmailService.ts` pattern (singleton class, fetch helpers, typed return values).
- `src/services/dmsService.ts` (extend, if it exists; otherwise create) — methods to fetch DMS document metadata for `LinkedDocuments`

### Store

`src/stores/updatesStore.ts` (Pinia):
- State: `stories: Story[]`, `topics: Topic[]`, `areas: Record<TopicId, Area[]>`, `subscriptions: Subscription[]`, `currentStory: StoryWithUpdates | null`, `feedFilter: { topicId?, contentType?, lifecycle?, areaId? }`, `cursor`
- Actions: `fetchTopics`, `fetchFeed`, `fetchStory`, `createStory`, `addUpdate`, `editStory`, `editUpdate`, `resolveStory`, `archiveStory`, `updateSubscriptions`
- Getters: `urgentStories`, `storiesByTopic`, `activeStoriesCount`

### Types

`src/types/updates.ts`:
- `ContentType = 'update' | 'document' | 'action_needed' | 'event'`
- `Lifecycle = 'developing' | 'active' | 'action_needed' | 'resolved' | 'reference'`
- `UpdateKind = 'update' | 'breaking' | 'correction' | 'summary'`
- `StoryStatus = 'draft' | 'published' | 'archived'`
- `Topic`, `Area`, `Story`, `Update`, `Subscription`, `UpdatePreferences`

### Role-gated UI

- Use `useAuth0().hasGrant('updates_admin')` and `hasGrant('updates_author')` and `hasGrant(\`updates_author:\${topicId}\`)` to show / hide:
  - "+ New Story" button on `/updates`
  - `/updates/admin*` route guard
  - Per-row "+ Post Update" buttons on Author Dashboard
  - Edit / Delete on existing stories + updates

### Tiptap setup

- Install: `@tiptap/vue-3`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-markdown`
- Image upload handler hits `POST /api/updates/upload` with FormData; inserts `<image>` node on success
- On editor blur or every 2s of inactivity, save draft (`PATCH /api/updates/stories/:id` with new `body_json`)
- On publish, `getJSON()` + `getHTML()` are sent server-side; markdown is generated server-side from JSON to keep Hub bundle smaller (or kept client-side — TBD on perf)

### Dashboard card behavior

`MemberUpdatesCard.vue`:
- Reads filter from `hub.user_preferences.preferences.updates` (existing JSON column)
- Calls `/api/updates/stories?limit=5` with topic filter from preferences
- Renders cards using `<StoryCard>`
- Settings (gear) icon opens `<UpdatePreferencesDialog>` that updates `hub.user_preferences`
- Card limit defaults to 1 row; can show 2 rows if user enables in preferences

### What's reused vs. new

- Reused: `NatcaShell`, ui-shell tokens / Vuetify theme, `useAuth0`, `useSupabase`, `hub.user_preferences` JSON
- New: `updates` schema migrations, Tiptap, the components and services above

---

## What Discord bot needs

Repo: `~/dev/mynatca/discord` (separate Node.js project)

### Channel + category setup (one-time)

- Create private category `TOPICS`
- Create 16 forum channels under `TOPICS` (slugs match `updates.topics.id`)
- Per-forum: configure 8 forum tags — 4 content type (📰 Update / 📋 Document / ⚡ Action Needed / 📅 Event) + 4 lifecycle (🔄 Developing / 🟢 Active / ✅ Resolved / 📌 Reference). `#announcements` channel skipped here — that one gets summary embeds, not tags.
- Create top-level Announcement-type channel `#announcements` (or convert if it exists)
- Bot config gets two new constants: `ANNOUNCEMENTS_CHANNEL_ID`, `TOPICS_CATEGORY_ID`. Per-topic forum IDs come from the Platform → Discord webhook payload (`topic.discord_forum_channel_id`)
- Permissions: see [agent_docs/updates-system.md § Permissions per channel](../agent_docs/updates-system.md#permissions-per-channel)

### Webhook handler

`discord/lib/webhookHandlers/updatePublished.js`:

```js
async function handleUpdatePublished({ story, topic, area, update }) {
  const isFirstUpdate = !story.discord_forum_thread_id;

  if (isFirstUpdate) {
    // 1. Forum thread under TOPICS/#topic-x
    const forum = await client.channels.fetch(topic.discord_forum_channel_id);
    const tagIds = pickTagIds(forum, story.content_type, story.lifecycle);
    const thread = await forum.threads.create({
      name: story.title.slice(0, 100),
      message: {
        content: story.urgent ? '@here' : null,
        embeds: [buildStoryThreadEmbed(story, topic, area, update)],
        components: [buildLinkButtonRow(story, /* forumThreadId */ null)],
      },
      appliedTags: tagIds,
    });

    // 2. #announcements summary
    const announcements = await client.channels.fetch(ANNOUNCEMENTS_CHANNEL_ID);
    const summaryMsg = await announcements.send({
      content: story.urgent ? '@here' : null,
      embeds: [buildAnnouncementSummaryEmbed(story, topic, update)],
      components: [buildLinkButtonRow(story, thread.id)],
    });
    await summaryMsg.crosspost();

    return {
      discord_forum_thread_id: thread.id,
      discord_forum_message_id: thread.id, // OP message id == thread id in Discord forums
      discord_announcement_message_id: summaryMsg.id,
      discord_posted_at: new Date().toISOString(),
    };
  }

  // Subsequent update on existing story
  const thread = await client.channels.fetch(story.discord_forum_thread_id);
  if (thread.archived) await thread.setArchived(false);

  // 1. Reply in the forum thread
  const replyMsg = await thread.send({
    content: update.kind === 'breaking' && story.urgent ? '@here' : null,
    embeds: [buildUpdateReplyEmbed(story, topic, update)],
  });

  // 2. Edit the #announcements summary embed (description refreshes to latest update preview)
  const announcements = await client.channels.fetch(ANNOUNCEMENTS_CHANNEL_ID);
  const summaryMsg = await announcements.messages.fetch(story.discord_announcement_message_id);
  await summaryMsg.edit({
    embeds: [buildAnnouncementSummaryEmbed(story, topic, update)],
    components: [buildLinkButtonRow(story, story.discord_forum_thread_id)],
  });
  // No re-crosspost — Discord syncs edits to follower servers automatically

  return {
    discord_forum_message_id: replyMsg.id,
    discord_posted_at: new Date().toISOString(),
  };
}
```

### Embed renderers

`discord/lib/embeds/`:
- `storyThreadEmbed.js` — full forum-thread OP embed: title, topic + area pill, content-type chip, lifecycle chip, summary, key points, footer with Hub URL + DMS doc count, color = topic color
- `updateReplyEmbed.js` — thread-reply embed: kind chip (📰 / ⚡ / ✏️ / 📋), optional headline, body excerpt with markdown→Discord conversion, footer "Update N · {timestamp}"
- `announcementSummaryEmbed.js` — brief summary: title, 1-line description (latest update preview), topic color bar, footer "{topic} · N updates · {time}"

All embeds include link buttons via Discord's `ActionRow`:
- Hub story button → `https://hub.natca.org/updates/[slug]`
- Forum thread button → `https://discord.com/channels/{guildId}/{threadId}` (when applicable)
- DMS document button → present on `Document` content type with linked docs

### Channel manager updates

If `discord/lib/channelManager.js` exists and caches channel IDs, extend it to know about:
- `topic.discord_forum_channel_id` (per topic)
- `ANNOUNCEMENTS_CHANNEL_ID` (constant)
- `TOPICS_CATEGORY_ID` (constant)

If admin creates a new topic via Hub, Platform should call `POST /api/discord/topics` (new) → bot creates the forum channel + tags + returns the ID. Platform stores it on `updates.topics.discord_forum_channel_id`.

### Logging

Use the existing `discord/lib/logger.js` — add convenience methods:
- `logger.update('published', { story_id, topic_id, kind, urgent })`
- `logger.update('crosspost_failed', { story_id, error })`

---

## What Platform needs

Repo: `~/dev/mynatca/platform`

### Migration / schema linking

- Add `updates` to `.linked-projects.config.json`
- Run `bash scripts/link-project.sh` to symlink Hub's `updates_init.sql` into Platform's `supabase/migrations/`
- Update `supabase/config.toml` PostgREST schema list to include `updates`
- Verify with `npm run db:reset -- updates`

### Routes

`platform/routes/updates.js` — see [agent_docs/updates-system.md § Platform API surface](../agent_docs/updates-system.md#platform-api-surface) for the full route list. Key implementation notes:

- `POST /api/updates/stories` and `POST /api/updates/stories/:id/updates` — wrap in a transaction; serialize Tiptap JSON → markdown + HTML server-side (`marked` or `markdown-it`)
- `POST /api/updates/stories/:id/publish` — transitions story status, calls Discord webhook, kicks off embedding job, calls `ccSync()` stub
- All write routes use `requireUpdatesAuthor(topicId)` middleware
- `POST /api/updates/upload` — uses `multer` for multipart, writes via Supabase JS client to `updates-media` bucket, returns CDN URL
- `GET /api/updates/stories` — supports cursor pagination by `last_updated_at + id`; pins urgent first via `ORDER BY urgent DESC, last_updated_at DESC`

### Discord webhook caller

`platform/lib/discordSync.js`:
- `publishUpdate(story, topic, area, update)` — calls `http://discord:1303/webhook/update-published` (or whatever the discord bot's HTTP server runs on)
- Returns `{ discord_forum_thread_id, discord_forum_message_id, discord_announcement_message_id }`
- Stores returned IDs on the appropriate rows
- Synchronous in v1; queue if needed later

### Grants bootstrap

`platform/migrations/<timestamp>_seed_updates_grants.sql`:
- Insert seed grants for known authors (initial admins via SQL)
- Document the manual process in `dev-standards/rules/grants.md` (if not already covered)

### Supabase Storage bucket

- Create `updates-media` bucket in Supabase Dashboard (public read, max 10MB per file, mime allow-list `image/*` + `application/pdf`)
- No bucket-level RLS — Platform mediates writes via `/api/updates/upload`
- Document the bucket creation step in `platform/docs/local-dev-setup.md`

### Embedding pipeline

`platform/lib/embeddings.js`:
- `embedUpdate(updateId)` — fetches `body_md`, chunks if needed (~500 tokens), calls OpenAI `text-embedding-3-small`, upserts to `updates.update_embeddings`
- Inline call from `publishUpdate` for v1 (synchronous after the Discord call)
- `npm run embeddings:backfill` script for retroactive embedding
- Nightly cron stale-check via Platform's existing scheduled-jobs mechanism

### Integrations stub

`platform/lib/ccSync.js`:
- `ccSync(update)` — logs "deferred" + early-returns
- Comment links to the future Edge Function path: `NATCA-ITC/integrations/supabase/functions/constant-contact-sync/`

### Topic + area admin endpoints

- `POST /api/updates/topics` (admin only) — creates the topic row, calls `POST /api/discord/topics` to create the forum channel, stores returned channel ID
- `POST /api/updates/topics/:id/areas` (admin only) — creates an area row

### Logging

Use existing `platform/lib/logger.js` — add convenience method:
- `logger.update(action, context)` for structured update-system logging

---

## Bidirectional linking convention

Every published story has IDs stored in **three places**:

| ID | Lives on | Points to |
|---|---|---|
| `stories.discord_forum_thread_id` | Database | Discord forum thread under `TOPICS/<topic>` |
| `stories.discord_announcement_message_id` | Database | `#announcements` summary message |
| (Discord forum thread OP) | Discord embed footer/buttons | Hub story slug URL |
| (Discord `#announcements` summary) | Discord embed buttons | Hub story slug URL + Discord forum thread |
| (Hub story page) | Hub UI | Discord forum thread (when `discord_forum_thread_id` is set) |

**Result:** from any of the three platforms, a member can reach the other two in one click.

When an update is edited or deleted:
- Platform calls Discord bot to update / delete the corresponding `discord_forum_message_id`
- For the `#announcements` summary edit, Discord syncs edits to follower servers automatically — no extra work

---

## Open questions / decisions before Phase 1

1. **Should `#announcements` summary include a `@here` ping when story is urgent, in addition to the `@here` in the forum thread OP?**
   *Default proposal:* yes. `@here` in `#announcements` reaches members who haven't joined the topic forum / aren't in the national server (via follower servers).

2. **Forum thread tag updates when story lifecycle changes (e.g., Active → Resolved).**
   *Default proposal:* bot edits the `appliedTags` on the thread when Platform sends a `lifecycle-changed` webhook. Adds latency/complexity to lifecycle transitions; keep it in scope for v1 because tag staleness is a member-trust issue.

3. **Where does `area_id` live on the model — column on stories, or join table for many-to-many?**
   *Default proposal:* single column on `stories` (`area_id text FK NULL`). One area per story keeps the UI and Discord embed simpler. Multi-area can be added later without breaking changes.

4. **Auto-archive behavior for forum threads.**
   *Default proposal:* set `autoArchiveDuration: 10080` (7 days). Bot unarchives on next reply. Acceptable.

5. **Tiptap markdown serialization — server-side or client-side?**
   *Default proposal:* server-side. Keeps Hub bundle smaller; markdown is needed server-side anyway (for Discord embed, embedding tokenization, and full-text search). Hub sends only `body_json`; Platform derives the other two.

6. **Image upload — Tiptap extension version vs. custom node-view.**
   *Default proposal:* official `@tiptap/extension-image` + custom upload handler that POSTs to `/api/updates/upload`. Avoids the custom node-view unless we need captions in v1.

7. **DMS document linking on stories — how does the author add a document in the editor?**
   *Default proposal:* a sidebar panel on `/updates/admin/stories/[id]/edit` that lets the author search DMS by name + add documents to `story_documents`. Renders on the story page in a "Related Documents" sidebar. NOT a Tiptap inline embed — keeps the relationship structured.

8. **Do areas get their own seed migration, or are they part of the topic seed?**
   *Default proposal:* part of the same migration as topics. They're a small fixed list per topic and rarely change.

9. **Confidentiality — `Document` stories that link to internal-only DMS docs.**
   *Default proposal:* the `audience` column on stories already covers this (`members` / `public` / `both`). Public-audience stories cannot link to internal-only DMS docs (server-side check on document add).

10. **Position-sync to grants.**
    *Default proposal:* not in v1. Initial authors get grants via a manual SQL bootstrap. Position → grant sync is a separate, broader Platform initiative.

Each of these can be answered before kickoff or punted to a Phase 1 PR-time decision; flag here so they don't get rediscovered mid-implementation.

---

## MyNATCA v2 merge note

This work lives in the Hub repo (`~/dev/mynatca/hub`) for parallel development. When Hub and MyNATCA v2 merge into a single entity:

| Where it lives now | Where it likely goes after merge |
|---|---|
| `hub/supabase/migrations/<ts>_updates_init.sql` | Migration moves with the Hub codebase wholesale; symlinks into Platform stay valid |
| `hub/src/pages/updates/*` | Stay where they are — the merged entity inherits Hub's routing |
| `hub/src/components/updates/*` | Stay |
| `hub/src/services/updatesService.ts` | Stay |
| `hub/src/stores/updatesStore.ts` | Stay |
| `hub/docs/architecture/decisions/001-updates-system.md` | Stay (or moves to merged-entity `docs/`) |
| `hub/docs/content-standards.md` | Stay (or moves to merged-entity `docs/`) |
| Platform routes (`platform/routes/updates.js`) | Stay in Platform regardless |
| Discord bot handlers | Stay in Discord regardless |

**Nothing about the data model, API, or Discord layout is Hub-specific.** The merge is a frontend-routing question, not a backend redesign. We're not painting ourselves into a corner.

---

## Out of scope for v1

(Same as in [agent_docs/updates-system.md § Explicitly NOT in v1](../agent_docs/updates-system.md#explicitly-not-in-v1).)

- Constant Contact send / sync (stub only)
- AI search UI (`/api/updates/ask` endpoint and Hub search box) — Phase 5
- Read receipts / view tracking
- Multiple dashboard cards per member
- Comments / reactions
- Scheduled publishing worker (column may exist; no cron in v1)
- Collaborative editing (Tiptap + Y.js — add later if needed)
- Email digest rollups

---

## Next actions

1. **Get the ADR accepted** by ITC. Run `/sync-to-notion docs/architecture/decisions/001-updates-system.md` after acceptance.
2. **Resolve open questions 1–10** (above) — most have defaults; confirm or override.
3. **Write the schema migration** (`hub/supabase/migrations/<ts>_updates_init.sql`) and link it into Platform.
4. **Bootstrap initial grants** via SQL.
5. **Stand up Platform routes** (`platform/routes/updates.js`) — start with reads + writes, add fan-out + embedding hooks last.
6. **Stand up Discord channel structure** (private `TOPICS` category + 16 forums + `#announcements`) and the webhook handler stub.
7. **Build Hub UI** in this repo.
8. **End-to-end test**: publish a draft story → verify forum thread + announcement summary land + Hub renders correctly + edits sync.

Implementation tickets get created in Linear under the Hub project once the ADR is accepted.
