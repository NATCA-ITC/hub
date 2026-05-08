# Updates System — Agent Context

_Read this before making changes to the Updates feature._

## Purpose

Topic-based communication system that lets ITC staff and authorized officers publish a single story that fans out to multiple destinations (Hub, Discord forum + `#announcements`, eventually Constant Contact email). Replaces the hardcoded mock data currently in `src/components/dashboard/MemberUpdatesCard.vue` with a real, database-backed feature.

See:
- [ADR 001](../architecture/decisions/001-updates-system.md) — decision rationale
- [content-standards.md](../content-standards.md) — canonical taxonomy reference
- [specs/updates-implementation-plan.md](../specs/updates-implementation-plan.md) — master plan with phases and per-system breakdown

## Data model hierarchy: Topic → Story → Update

**This is the most important architectural decision.** Content is a three-level hierarchy. Never flatten it.

1. **Topic** — category. Stored in `updates.topics`. 16 topics in 3 groups (Councils / Standing Committees / Cross-Cutting). See [content-standards.md](../content-standards.md).
2. **Story** — a headline with a stable editor-maintained summary that accumulates updates over time. Think news liveblog. One URL per story. Stored in `updates.stories`.
3. **Update** — a timestamped entry under a story. Has a kind (Update / Breaking / Correction / Summary) that affects visual styling. Stored in `updates.updates`.

**Why:** a single evolving event (e.g., "FAA Shutdown 2026") accumulates many developments over days or weeks. The fragmented approach creates disconnected posts members can't reconcile. The liveblog model consolidates everything about one story onto one URL with a chronological update timeline.

**Single announcements are just stories with one update.** Display logic can collapse `update_count == 1` cards to a simpler read.

## Four-axis classification

Every story is classified on four axes — author picks 3, system derives 1. Full definitions in [content-standards.md](../content-standards.md).

| Axis | Set by | Stored in |
|---|---|---|
| Content Type | Author | `stories.content_type` (text CHECK: 'update' / 'document' / 'action_needed' / 'event') |
| Topic | Author | `stories.topic_id` FK → `updates.topics(id)` |
| Area | Author (optional) | `stories.area_id` FK → `updates.areas(id)` (nullable) |
| Lifecycle | System derives | `stories.lifecycle` (text CHECK: 'developing' / 'active' / 'action_needed' / 'resolved' / 'reference') |

Lifecycle derivation rules:
- `Document` → `reference` immediately, no transitions
- `Event` → `active` until `event_end_at` passes, then `resolved`
- `Action Needed` → `action_needed` until `deadline_at` passes, then `resolved`
- `Update` → starts `developing` if rolling, `active` if one-shot; author resolves manually

## Three member-facing concepts, kept separate

Beyond the data hierarchy, three concepts must stay separate in code and UI:

1. **Topic** — the category. One per story. Drives display grouping, Discord channel routing, email list mapping.
2. **Subscription** — a member's per-topic **email delivery** preference. Stored in `updates.subscriptions`. Maps 1:1 to future Constant Contact list membership. Does NOT control what a member sees in Hub.
3. **Hub display filter** — what a member's *dashboard card* shows. Stored in `hub.user_preferences.preferences.updates` JSON. Independent of subscriptions. The full `/updates` page always shows everything regardless of filters.

**Urgent flag** is orthogonal. Any story can be marked urgent → pinned on Hub regardless of filter, includes `@here` in the Discord forum thread + `#announcements` summary, (deferred) always emails to full active-member list.

## Database schema

All tables live in the new `updates` schema, owned by Platform. Migration in `hub/supabase/migrations/` (per the symlink convention — Hub owns the migrations because the feature is Hub-driven, even though Platform exposes the API).

### `updates.topics`

| Column | Type | Notes |
|---|---|---|
| id | text PK | slug: 'employee-movement', 'legislative', ... |
| name | text | display name |
| description | text | short blurb shown in browse pages |
| group | text CHECK | 'council' / 'standing_committee' / 'cross_cutting' |
| icon | text | mdi-* icon name |
| color | text | design token name or hex fallback |
| sort_order | integer | display ordering within group |
| default_subscribed | boolean | seeds new members' subscription rows |
| discord_forum_channel_id | text | id of the topic's forum channel under `TOPICS` |
| cc_list_id | text | nullable; Constant Contact list id (deferred) |
| is_active | boolean | soft-delete flag |
| created_at / updated_at | timestamptz | |

Seed: 16 rows, in 3 groups. See [content-standards.md](../content-standards.md) for the canonical list.

### `updates.areas`

| Column | Type | Notes |
|---|---|---|
| id | text PK | slug: 'ncept', 'cism', 'faa-reauthorization', ... |
| topic_id | text FK → topics | required |
| name | text | display name |
| sort_order | integer | display ordering within topic |
| created_at / updated_at | timestamptz | |

Areas are optional per topic. Adding new ones is an `INSERT` — no schema change.

### `updates.stories`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| topic_id | text FK → topics | required, single |
| area_id | text FK → areas | nullable; must match `topic_id` if set |
| content_type | text CHECK | 'update' / 'document' / 'action_needed' / 'event' |
| lifecycle | text CHECK | 'developing' / 'active' / 'action_needed' / 'resolved' / 'reference' (derived; see rules above) |
| title | text | stable story headline |
| slug | text UNIQUE | permalink slug |
| summary_json | jsonb | Tiptap canonical for the stable overview |
| summary_md | text | derived markdown |
| summary_html | text | rendered HTML cache |
| key_points_json | jsonb | optional pinned key-points section |
| key_points_md | text | derived |
| key_points_html | text | derived |
| status | text CHECK | 'draft' / 'published' / 'archived' |
| urgent | boolean | pins on Hub, `@here` on Discord, future: full-list email |
| audience | text CHECK | 'members' / 'public' / 'both' |
| author_member_id | text | original story author |
| pinned_update_id | uuid FK → updates | nullable; defaults to latest update |
| update_count | integer | denormalized counter for feed queries |
| event_start_at | timestamptz | for `content_type='event'` |
| event_end_at | timestamptz | for `content_type='event'`; drives auto-resolve |
| deadline_at | timestamptz | for `content_type='action_needed'`; drives auto-resolve |
| first_published_at | timestamptz | when story became visible |
| last_updated_at | timestamptz | most recent update's published_at (denormalized for sort) |
| resolved_at | timestamptz | |
| expires_at | timestamptz | optional auto-archive |
| discord_forum_thread_id | text | the forum thread/post for this story |
| discord_announcement_message_id | text | the brief summary in `#announcements` |
| discord_posted_at | timestamptz | |
| cc_campaign_id | text | deferred |
| cc_campaign_status | text | deferred |
| cc_synced_at | timestamptz | deferred |
| created_at / updated_at | timestamptz | |

**DMS link:** stories with `content_type='document'` have one or more linked DMS document IDs in a join table `updates.story_documents (story_id, document_id, role)` — `role` allows distinguishing "primary" vs "supporting" documents per story.

Indexes: `(topic_id, last_updated_at DESC)` WHERE `status='published'`, `(urgent, last_updated_at DESC)` WHERE `urgent=true`, `(content_type, lifecycle)`, `(slug)`.

### `updates.updates`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| story_id | uuid FK → stories | CASCADE on delete |
| kind | text CHECK | 'update' / 'breaking' / 'correction' / 'summary' — affects visual styling |
| headline | text | optional short headline for this specific update |
| body_json | jsonb | **Tiptap ProseMirror canonical** |
| body_md | text | markdown serialized from JSON |
| body_html | text | HTML rendered from JSON |
| author_member_id | text | who wrote this update |
| status | text CHECK | 'draft' / 'published' |
| published_at | timestamptz | |
| discord_forum_message_id | text | Discord message id for THIS update (each update = one reply in the thread) |
| discord_posted_at | timestamptz | |
| created_at / updated_at | timestamptz | |

Indexes: `(story_id, published_at DESC)` WHERE `status='published'`, `(published_at DESC)` for global latest.

### `updates.update_embeddings`

Per-update vector embeddings for AI-powered search (RAG). One update can produce multiple embedding rows if its body needs chunking (~500 tokens per chunk).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| update_id | uuid FK → updates | CASCADE on delete |
| chunk_index | integer | 0 for most updates; >0 for long updates split into chunks |
| chunk_text | text | the text that was embedded |
| embedding | vector(1536) | pgvector; OpenAI text-embedding-3-small output |
| content_hash | text | hash of `chunk_text`; avoids re-embedding unchanged content |
| model | text | embedding model identifier, for future migrations |
| created_at | timestamptz | |

Index: `USING hnsw (embedding vector_cosine_ops)`.

Embedding lifecycle:
- Generated on `update.status → published` via a Platform background job (inline for v1, queue later)
- Re-generated when `body_md` changes and `content_hash` no longer matches
- Deleted via CASCADE when the update is deleted
- Stale check runs nightly to catch any missed updates

### `updates.subscriptions`

Composite PK `(member_id, topic_id)`. Columns: `subscribed boolean`, `source` ('default' / 'manual' / 'import'), `updated_at`.

Rows only created when a member explicitly changes a subscription. Defaults come from `topics.default_subscribed` until overridden.

### Denormalization triggers

When an update transitions to `published`, the publish route (or a trigger):
- Bumps the parent story's `last_updated_at`
- Increments `update_count`
- If first update of the story, sets `first_published_at` and (if not already) transitions story `status` from `draft` → `published`

## Authorization via `public.grants`

Reuses the existing grants pattern (already used for DMS `logo_approver`). No new permissions table.

| Grant name | Permission |
|---|---|
| `updates_admin` | Full CRUD on stories + topics; can grant to others |
| `updates_author` | Create / edit / publish stories in any topic |
| `updates_author:<topic_id>` | Create / edit / publish stories only in that topic |

Session middleware already loads grants at login. Frontend uses `useAuth0().hasGrant('updates_admin')` to show / hide author UI.

Middleware pattern (mirrors DMS):
```js
function requireUpdatesAuthor(topicId) {
  return (req, res, next) => {
    const grants = req.session.user?.grants || [];
    if (grants.includes('updates_admin')) return next();
    if (grants.includes('updates_author')) return next();
    if (topicId && grants.includes(`updates_author:${topicId}`)) return next();
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
}
```

## Platform API surface

All routes live in `platform/routes/updates.js`. Hub reaches them via its existing `/api` → Platform proxy.

**Reads (require auth):**
- `GET /api/updates/topics` — list active topics, grouped by `group` (council / standing_committee / cross_cutting)
- `GET /api/updates/topics/:id/areas` — list areas defined for a topic
- `GET /api/updates/stories?topic=&content_type=&lifecycle=&area=&urgent=&limit=&cursor=` — paginated feed of stories, sorted by `last_updated_at DESC`. Urgent stories pinned first. Each row includes the latest update as an embedded object.
- `GET /api/updates/stories/:slug` — single story with ALL its published updates (paginated if large)
- `GET /api/updates/stories/:slug/updates?limit=&cursor=` — just the updates timeline, for load-more
- `GET /api/updates/subscriptions` — current member's state
- `PUT /api/updates/subscriptions` — bulk update

**Author reads (require grant):**
- `GET /api/updates/author/stories?status=&topic=&q=` — quick-find for Author Dashboard. Returns stories across all statuses including drafts, with search support.

**Writes (require grant):**
- `POST /api/updates/stories` — create new story. Body includes content_type, topic, area (optional), title, summary (Tiptap JSON), and the first update (body_json). Creates both rows in one transaction. Server serializes to markdown + HTML.
- `PATCH /api/updates/stories/:id` — edit story metadata (title, summary, key_points, urgent, area, deadline_at, event_*_at)
- `POST /api/updates/stories/:id/publish` — transition story from draft → published. Publishes the first update, triggers Discord fan-out, triggers embedding generation.
- `POST /api/updates/stories/:id/resolve` — author marks an Update story Resolved
- `POST /api/updates/stories/:id/archive`
- `POST /api/updates/stories/:id/updates` — **add a new update to an existing story**. The most common author operation. Body includes kind, optional headline, body_json. On publish, fans out to Discord and generates embedding.
- `PATCH /api/updates/stories/:storyId/updates/:updateId` — edit an update; re-syncs the Discord reply
- `DELETE /api/updates/stories/:storyId/updates/:updateId` — soft-delete; emits a "removed" notice; cascades embedding rows
- `POST /api/updates/topics` — admin only; new topic + Discord forum channel creation handshake

**Media upload (require grant):**
- `POST /api/updates/upload` — multipart file upload from Tiptap's image extension. Validates mime type (`image/*`, `application/pdf`), size limit 10MB, streams to Supabase Storage bucket `updates-media/{year}/{month}/{uuid}.{ext}`. Returns `{ url, width, height, mime_type, size }`.

**AI search (Phase 5 — not in v1):**
- `POST /api/updates/ask` — `{ query: string }` → embed query → pgvector nearest neighbors → fetch top N updates → Claude API with citations prompt → `{ answer, citations: [{ story_slug, update_id, snippet }] }`
- `GET /api/updates/stories/:id/related` — semantically related stories using story-level embedding averages

## Fan-out on publish

Each update fans out independently. Synchronous for v1 (no queue):

1. Set `update.status='published'`, `update.published_at=now()`, render Tiptap JSON → markdown + HTML, kick off embedding job
2. Bump parent story `last_updated_at`, increment `update_count`. If first published update of the story, set `stories.first_published_at` and transition status `draft` → `published`.
3. POST to `http://discord:1303/webhook/update-published` with `{ story, topic, area?, update }`
4. Discord bot routes:
   - **First update** of a new story → creates a forum thread under the topic's forum + posts a brief summary to `#announcements` + cross-posts the announcement
   - **Subsequent update** → posts a reply in the existing thread + edits the `#announcements` summary embed
5. Store returned IDs:
   - First update: `stories.discord_forum_thread_id`, `stories.discord_announcement_message_id`, `updates.discord_forum_message_id` (the OP)
   - Subsequent: `updates.discord_forum_message_id` (just the new reply)
6. Call `ccSync(update)` stub — logs "deferred" and returns for v1

**Key principle:** all updates to one story live in one Discord forum thread — never scattered as separate top-level posts.

See [specs/updates-implementation-plan.md](../specs/updates-implementation-plan.md) for the full Discord-side handler pseudo-code.

## Discord integration

**Layout:**

```
NATCA National Discord
├── (top-level)
│   ├── #verify              ← public, member onboarding
│   └── #announcements        ← Announcement-type, top-level, cross-postable
│
├── 🔒 TOPICS (private category, admin-only initially)
│   ├── #training-education
│   ├── #employee-wellness
│   ├── #representation-advocacy
│   ├── #collaboration-professionalism
│   ├── #safety-technology
│   ├── #employee-movement
│   ├── #facility-issues
│   ├── #metrics
│   ├── #membership-services
│   ├── #finance
│   ├── #organizing
│   ├── #safety-committee
│   ├── #constitution
│   ├── #legislative
│   ├── #events
│   └── #labor-relations
```

**Per-topic forum:**
- Each story = one forum thread (Discord "post")
- Updates = thread replies (chronological)
- Forum tags per channel: 4 content type + 4 lifecycle = 8 tags total (well under Discord's 20 limit)
- Member discussion happens in the thread (post-launch — admin-only initially)

**`#announcements`:**
- One brief summary per published story (initial post = first update; edits when subsequent updates arrive)
- Brief embed: title + 1-line summary + topic color + buttons → Hub story + forum thread
- Cross-postable to follower servers (regional + facility) for broad reach
- Read-only for members
- Edit sync to follower servers means follower-server members always see the latest summary

**Cross-server setup:** regional server admins click "Follow" on `#announcements`; published stories appear in their chosen channel automatically.

### Channel configuration

- `topics.discord_forum_channel_id` → the topic's forum channel ID
- `stories.discord_forum_thread_id` → the thread/post for this story
- `stories.discord_announcement_message_id` → the summary in `#announcements`
- `updates.discord_forum_message_id` → each update's message ID (the OP for the first update, replies for subsequent)
- `#announcements` channel ID → constant in Discord bot config

### Permissions per channel

```
TOPICS forum channels:
  @everyone:           View ❌  (private at launch; flip to ✅ when ready)
  @NATCA Members:      View ✅, Send Messages in Threads ✅, Create Public Threads ❌
  @NATCA Hub (bot):    Send Messages ✅, Manage Messages ✅, Manage Threads ✅

#announcements (top-level):
  @everyone:           View ✅, Send Messages ❌
  @NATCA Hub (bot):    Send Messages ✅, Manage Messages ✅, Crosspost ✅
```

## Editor (Tiptap)

Authors use a [Tiptap](https://tiptap.dev/) rich-text editor (`@tiptap/vue-3`). Triple storage: `body_json` (canonical) + `body_md` (derived) + `body_html` (derived cache).

Tiptap extensions used:
- `StarterKit` (bold, italic, headings, lists, blockquote, code, etc.)
- `Link` with auto-link
- `Image` (custom node-view for captions)
- `Placeholder` (for empty editor state)
- `@tiptap/extension-markdown` (for `getMarkdown()` serializer)

Image upload pipeline:
1. Author drags/pastes/clicks → Tiptap's `Image` extension fires `handleDrop` / `handlePaste` / toolbar click
2. Custom upload handler streams the file to `POST /api/updates/upload`
3. Platform validates grant, writes to `updates-media/` bucket, returns URL
4. Tiptap inserts an image node; auto-save within 2s captures the JSON change
5. On publish, first image becomes the Discord embed thumbnail

Bucket: `updates-media` in the same Supabase project. Public read for published content (CDN-cached). Write gated via Platform (not RLS on the bucket directly — keeps auth centralized).

## Hub UI

### Routes

- `/updates` — topic-filtered story feed with urgent stories pinned. Cards show title, latest-update preview, content type + lifecycle chips, area chip, update count.
- `/updates/topics/:topicId` — single-topic view. Shows area filter chips (if topic defines areas). Pre-filters the feed.
- `/updates/[slug]` — story view (the liveblog). Headline + summary + key points + chronological update timeline + linked DMS docs (for Document type) + link to Discord thread.
- `/updates/preferences` — subscription toggles (email delivery)
- `/updates/admin` — **Author Dashboard**. Quick-find: search, filter by status / topic / content_type, "+ Post Update" inline form on each row. Gated by grants.
- `/updates/admin/new` — new story editor (Tiptap, content type picker, topic/area pickers, urgent toggle, first update body)
- `/updates/admin/stories/:id/edit` — edit story metadata

### Author quick-find flow (critical UX)

From any page, an author can:
1. Open `/updates/admin`
2. Type in the search box (cmd-K shortcut)
3. Find the existing story
4. Click "+ Post Update" → inline form expands
5. Pick kind (Update / Breaking / Correction / Summary), optional headline, body
6. Toggle "Also post to Discord" (default on), publish

This prevents the fragmentation problem — authors naturally add to existing stories instead of creating duplicates. Design target: **< 10 seconds from "I have an update" → "it's published"** for frequent-author flows.

### Dashboard card

`MemberUpdatesCard.vue` (existing, currently mocked) is rewritten to:
- Fetch real stories from `GET /api/updates/stories?limit=5`
- Pin urgent stories first
- Show story cards with content type + lifecycle chips, latest-update preview, update count
- Read filter from `hub.user_preferences.preferences.updates`:
  ```json
  { "updates": { "topics": ["legislative", "employee-movement"], "card_count": 1 } }
  ```
- Settings button → filter dialog
- Click through → `/updates/[slug]`

### Services / store

- `src/services/updatesService.ts` — singleton, fetch, typed (mirrors `rackspaceEmailService.ts` pattern)
- `src/stores/updatesStore.ts` — Pinia store: stories, updates, topics, areas, subscriptions, filter state
- `src/types/updates.ts` — `Topic`, `Area`, `Story`, `Update`, `ContentType`, `Lifecycle`, `Subscription`, `UpdatePreferences`

## Constant Contact — designed, deferred

Schema has all necessary columns from day 1 (`topics.cc_list_id`, `stories.cc_campaign_id`, etc.). Platform has stub `ccSync()`. When the integration lands:
1. Edge Function in `NATCA-ITC/integrations/supabase/functions/constant-contact-sync/`
2. Reads `updates.subscriptions WHERE topic_id = X AND subscribed = true` → list membership
3. Upserts to `topic.cc_list_id`
4. Creates draft campaign (human review gate — no auto-send)
5. Returns `cc_campaign_id` for Platform to store

No CC code in v1.

## Phase plan

- **Phase 0** (complete): mockups + ADR + agent_docs + content standards + implementation plan
- **Phase 1**: Schema migration (topics + areas + stories + updates + subscriptions + embeddings, pgvector extension, Supabase Storage bucket) + Platform API including upload endpoint + grants bootstrap
- **Phase 2**: Hub Vue UI with Tiptap editor (replaces mockups with real components)
- **Phase 3**: Discord forum + `#announcements` integration (forum thread creation, embed renderer, summary post, OP edit pattern, link buttons)
- **Phase 4**: Embedding generation pipeline (backfill any existing + trigger on publish)
- **Phase 5**: AI search — `/api/updates/ask` RAG endpoint, Hub search UI, related-stories on story page
- **Phase 6**: Constant Contact integration (Edge Function in `integrations/`)

See [specs/updates-implementation-plan.md](../specs/updates-implementation-plan.md) for the per-system breakdown and dependencies.

## Explicitly NOT in v1

- Constant Contact send / sync (stub only)
- AI search UI / `/api/updates/ask` endpoint (schema + pgvector exist from Phase 1; embedding generation runs from Phase 4; UI in Phase 5)
- Read receipts / view tracking
- Multiple dashboard cards per member
- Comments / reactions
- Scheduled publishing worker (column may exist; no cron in v1)
- Collaborative editing (Tiptap + Y.js supports this; add later if needed)
- Email digest rollups
