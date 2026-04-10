# Updates System — Agent Context

_Read this before making changes to the Updates feature._

## Purpose

Topic-based communication system that lets ITC staff and authorized officers publish a single post that fans out to multiple destinations (Hub, Discord, and eventually Constant Contact email). Replaces the hardcoded mock data currently in `src/components/dashboard/MemberUpdatesCard.vue` with a real, database-backed feature.

See [ADR 001](../architecture/decisions/001-updates-system.md) for decision rationale.

## Data model hierarchy: Topic → Story → Update

**This is the most important architectural decision.** Content is a three-level hierarchy. Never flatten it.

1. **Topic** — category. Stored in `updates.topics` (national, legislative, safety, etc.).
2. **Story** — a headline with a stable editor-maintained summary that accumulates updates over time. Think news liveblog. One URL per story. Stored in `updates.stories`. Has status (Live / Active / Resolved / Archived).
3. **Update** — a timestamped entry under a story. Has a kind (Update / Breaking / Correction / Summary). This is what actually gets cross-posted to Discord. Stored in `updates.updates`.

**Why:** a single evolving event (e.g., "FAA Shutdown 2026") accumulates many developments over days or weeks. The current fragmented approach creates disconnected posts that members can't reconcile. The liveblog model consolidates everything about one story onto one URL with a chronological update timeline. This mirrors Guardian rolling coverage, NYT live updates, and [MS.now](https://www.ms.now/liveblog/iran-war-news-today-trump-us-april-10-2026).

**Single announcements are just stories with one update.** A one-shot announcement like "Registration open for CFS" creates a story with exactly one update. The data model is uniform; display logic can collapse `update_count == 1` cards to a simpler read.

## Three member-facing concepts, kept separate

Beyond the data hierarchy, three concepts must stay separate in code and UI to prevent conflation:

1. **Topic** — the category. One per story. Drives display grouping, Discord channel routing, email list mapping.
2. **Subscription** — a member's per-topic **email delivery** preference. Stored in `updates.subscriptions`. Maps 1:1 to future Constant Contact list membership. Does NOT control what a member sees in Hub.
3. **Hub display filter** — what a member's *dashboard card* shows. Stored in `hub.user_preferences.preferences.updates` JSON. Independent of subscriptions. The full `/updates` page always shows everything regardless of filters.

**Urgent flag** is orthogonal. Any story can be marked urgent → pinned on Hub regardless of filter, always posts updates to Discord with @role mention, (future) always emails to full active-member list.

## Data model

All tables live in the new `updates` schema, owned by Platform.

### `updates.topics`
| Column | Type | Notes |
|---|---|---|
| id | text PK | slug: 'national', 'legislative', ... |
| name | text | display name |
| description | text | |
| icon | text | mdi-* icon name |
| color | text | design token or hex fallback |
| sort_order | integer | display ordering |
| default_subscribed | boolean | seeds new members' subscription rows |
| is_national | boolean | marks the mandatory-by-default topic |
| discord_channel_id | text | nullable; id of Discord channel to auto-post to |
| cc_list_id | text | nullable; Constant Contact list id (deferred) |
| is_active | boolean | soft-delete flag |
| created_at / updated_at | timestamptz | |

### `updates.stories`
The **parent container**. Holds the stable headline + summary + metadata. Every story has at least one update beneath it.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| topic_id | text FK → topics | required, single |
| title | text | stable story headline, e.g. "FAA Shutdown 2026 — Rolling Coverage" |
| slug | text UNIQUE | permalink slug |
| summary | text | editor-maintained stable overview; can be edited as the story evolves |
| summary_html | text | rendered cache of summary markdown |
| key_points_md | text | optional pinned "key points" section (nullable) |
| key_points_html | text | rendered cache |
| status | text CHECK | 'draft' / 'live' / 'active' / 'resolved' / 'archived' |
| urgent | boolean | pins story to top of Hub, @mentions Discord role |
| audience | text CHECK | 'members' / 'public' / 'both' |
| author_member_id | text | original story author |
| pinned_update_id | uuid FK → updates | optional; which update to surface at top (default: latest) |
| update_count | integer | denormalized counter for feed queries |
| first_published_at | timestamptz | when story became visible |
| last_updated_at | timestamptz | most recent update's published_at (denormalized for sort) |
| resolved_at | timestamptz | |
| expires_at | timestamptz | optional auto-archive |
| discord_thread_id | text | optional; Discord thread that collects this story's updates |
| cc_campaign_id | text | deferred |
| cc_campaign_status | text | |
| cc_synced_at | timestamptz | |
| created_at / updated_at | timestamptz | |

Indexes: `(topic_id, last_updated_at DESC)` WHERE status IN ('live','active'), `(urgent, last_updated_at DESC)` WHERE urgent=true, `(status)`.

### `updates.updates`
The **child entries**. Each is a timestamped addition to a parent story. This is what actually gets cross-posted to Discord.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| story_id | uuid FK → stories | required; CASCADE on delete |
| kind | text CHECK | 'update' / 'breaking' / 'correction' / 'summary' — affects visual styling |
| headline | text | optional short headline for this specific update (e.g. "2:14 PM — Senate vote scheduled") |
| body_md | text | markdown source of truth |
| body_html | text | rendered cache |
| author_member_id | text | who wrote this specific update |
| status | text CHECK | 'draft' / 'published' |
| published_at | timestamptz | set on publish |
| discord_message_id | text | Discord message id for THIS update (each update gets its own message) |
| discord_posted_at | timestamptz | |
| created_at / updated_at | timestamptz | |

Indexes: `(story_id, published_at DESC)` WHERE status='published', `(published_at DESC)` for global latest.

**Denormalization pattern:** when an update transitions to `published`, a trigger (or the publish route) updates the parent story's `last_updated_at` and increments `update_count`. This keeps feed queries fast.

### `updates.subscriptions`
Composite PK `(member_id, topic_id)`. Columns: `subscribed boolean`, `source` ('default' / 'manual' / 'import'), `updated_at`.

Rows only created when a member explicitly changes a subscription. Defaults come from `topics.default_subscribed` until overridden.

### Seed topics
| id | name | default_subscribed | is_national | icon |
|---|---|---|---|---|
| national | National Updates | true | true | mdi-flag |
| legislative | Legislative & Political Action | false | false | mdi-gavel |
| safety | Safety Bulletins | true | false | mdi-shield-alert |
| bargaining | Contract & Bargaining | true | false | mdi-handshake |
| training | Training & Professional Development | false | false | mdi-school |
| benefits | Benefits & Member Services | false | false | mdi-gift |
| events | Events & Conferences | false | false | mdi-calendar |

## Authorization via `public.grants`

Reuses the existing grants pattern (already used for DMS `logo_approver`). No new permissions table.

| Grant name | Permission |
|---|---|
| `updates_admin` | Full CRUD on posts + topics; can grant to others |
| `updates_author` | Create/edit/publish posts in any topic |
| `updates_author:<topic_id>` | Create/edit/publish posts only in that topic |

Session middleware already loads grants at login (`platform/routes/auth.js`). Frontend uses `useAuth0().hasGrant('updates_admin')` to show/hide author UI.

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
- `GET /api/updates/topics` — list active topics
- `GET /api/updates/stories?topic=&status=&limit=&cursor=` — paginated feed of stories, sorted by `last_updated_at DESC`. Includes urgent stories pinned first. Each row includes the latest update as an embedded object.
- `GET /api/updates/stories/:slug` — single story with ALL its published updates (paginated if large)
- `GET /api/updates/stories/:slug/updates?limit=&cursor=` — just the updates timeline, for load-more
- `GET /api/updates/subscriptions` — current member's state
- `PUT /api/updates/subscriptions` — bulk update

**Author reads (require grant):**
- `GET /api/updates/author/stories?status=&topic=&q=` — quick-find for Author Dashboard. Returns stories across all statuses including drafts, with search support.

**Writes (require grant):**
- `POST /api/updates/stories` — create new story. Body includes topic, title, summary, and the first update (kind='update', body). Creates both rows in one transaction.
- `PATCH /api/updates/stories/:id` — edit story metadata (title, summary, key_points, status, urgent flag)
- `POST /api/updates/stories/:id/publish` — transition story from draft → live. Publishes the first update, triggers Discord fan-out.
- `POST /api/updates/stories/:id/resolve` — transition to resolved (no more updates expected)
- `POST /api/updates/stories/:id/archive`
- `POST /api/updates/stories/:id/updates` — **add a new update to an existing story**. This is the most common author operation. Body includes kind, optional headline, body_md. On publish, fans out to Discord.
- `PATCH /api/updates/stories/:storyId/updates/:updateId` — edit an update
- `DELETE /api/updates/stories/:storyId/updates/:updateId` — delete (tombstone) an update; emits a "removed" notice
- `POST /api/updates/topics` — admin only

## Fan-out on publish

Each update fans out independently (not the story). Synchronous for v1 (no queue):

1. Set `update.status='published'`, `update.published_at=now()`, render markdown → `body_html`
2. Update parent story: bump `last_updated_at`, increment `update_count`. If this is the story's first published update, also set `stories.first_published_at` and transition status from `draft` → `live` (or `active` per author choice).
3. If `topic.discord_channel_id` is set OR parent story is urgent: POST to `http://discord:1303/webhook/update-published` with `{story, topic, update}`. Store returned `discord_message_id` + `discord_posted_at` on the **update** row (each update gets its own Discord message).
4. Call `ccSync(update)` stub — logs "deferred" and returns for v1.

**Discord thread option:** if `story.discord_thread_id` is set, the bot posts subsequent updates into that thread rather than as separate top-level messages. This keeps Discord visually tidy for long-running stories. The bot creates the thread on the first update and stores the id.

## Discord integration

Extends the existing Discord bot HTTP server (`discord/lib/httpServer.js`). New handler in `discord/lib/webhookHandler.js`:

```js
async function handleUpdatePublished({ story, topic, update }) {
  const channel = await channelManager.getChannelById(topic.discord_channel_id);

  // Optionally post into a story-specific thread if one exists
  let target = channel;
  if (story.discord_thread_id) {
    target = await channel.threads.fetch(story.discord_thread_id);
  } else if (story.update_count > 3) {
    // Auto-create a thread when a story gets chatty
    const thread = await channel.threads.create({
      name: story.title.slice(0, 90),
      autoArchiveDuration: 4320,
    });
    story.discord_thread_id = thread.id;
    target = thread;
  }

  const embed = {
    title: update.headline || story.title,
    description: update.body_html_preview, // plain text, ~280 chars
    url: `https://hub.natca.org/updates/${story.slug}#u-${update.id}`,
    color: hexToInt(topic.color),
    author: { name: `${story.title} · ${topic.name}` },
    fields: [
      { name: 'Kind', value: kindEmoji(update.kind), inline: true },
      { name: 'Story', value: `${story.update_count} updates`, inline: true },
    ],
    timestamp: update.published_at,
    footer: { text: `MyNATCA Hub · Read full story →` }
  };
  const message = await target.send({
    content: story.urgent && update.kind === 'breaking' ? `@here` : null,
    embeds: [embed]
  });
  return {
    discord_message_id: message.id,
    discord_thread_id: story.discord_thread_id,
    discord_posted_at: new Date().toISOString()
  };
}
```

Channel mapping is a single column (`updates.topics.discord_channel_id`) — no new config table. Thread creation is automatic for stories with > 3 updates.

## Hub UI

### Routes
- `/updates` — topic-filtered stories feed with urgent story pinned on top. Cards show story title, latest update preview, update count, Live indicator.
- `/updates/[slug]` — story view (the liveblog). Shows story headline + summary + key points + chronological update timeline. This is the canonical URL for a story.
- `/updates/preferences` — subscription toggles (email delivery)
- `/updates/admin` — **Author Dashboard**. Quick-find interface: search, filter by status/topic/author, "+ Post Update" inline form on each story row to append an update without leaving the page. Gated by grants.
- `/updates/admin/new` — new story editor (markdown, topic, urgent, first update)
- `/updates/admin/stories/[id]/edit` — edit story metadata (title, summary, key points, status)

### Author quick-find flow (critical UX)
From any page, an author can:
1. Open `/updates/admin`
2. Type in the search box (cmd-K anywhere in Hub opens it)
3. Find the existing story
4. Click "+ Post Update" → inline form expands under that row
5. Pick kind (Update / Breaking / Correction / Summary), optional headline, body
6. Toggle "Also post to Discord", publish

This prevents the fragmentation problem — authors naturally add to existing stories instead of creating duplicates. The design target is **< 10 seconds from "I have an update" → "it's published"** for frequent-author flows.

### Dashboard card
`MemberUpdatesCard.vue` (existing, currently mocked) is rewritten to:
- Fetch real stories from `GET /api/updates/stories?limit=5`
- Pin urgent stories first
- Show story cards with latest-update preview + update count
- Read filter from `hub.user_preferences.preferences.updates`:
  ```json
  { "updates": { "topics": ["national","legislative"], "card_count": 1 } }
  ```
- Settings button → filter dialog
- Click through → `/updates/[slug]` (the story page)

### Services / store
- `src/services/updatesService.ts` — mirror `rackspaceEmailService.ts` pattern (singleton, fetch, typed)
- `src/stores/updatesStore.ts` — Pinia store: stories, updates, topics, subscriptions, filter state
- `src/types/updates.ts` — `Topic`, `Story`, `Update`, `UpdateKind`, `StoryStatus`, `Subscription`, `UpdatePreferences`

## Constant Contact — designed, deferred

Schema has all necessary columns from day 1 (`topics.cc_list_id`, `posts.cc_campaign_id`, etc.). Platform has stub `ccSync(post)`. When the integration lands:
1. Edge Function in `NATCA-ITC/integrations/supabase/functions/constant-contact-sync/`
2. Reads `updates.subscriptions WHERE topic_id = X AND subscribed = true` → list membership
3. Upserts to `topic.cc_list_id`
4. Creates draft campaign (human review gate — no auto-send)
5. Returns `cc_campaign_id` for Platform to store

No CC code in v1.

## Phase plan

- **Phase 0** (this branch): Mockups + ADR + agent_docs only. No functional code.
- **Phase 1**: Schema migration + Platform API + grants bootstrap
- **Phase 2**: Hub Vue UI (replaces mockups with real components)
- **Phase 3**: Discord webhook integration
- **Phase 4**: Constant Contact integration (still deferred — separate project)

## Explicitly NOT in v1
- Constant Contact send/sync (stub only)
- Read receipts / view tracking
- Multiple dashboard cards per member
- Post search
- Comments / reactions
- Scheduled publishing worker (column exists, no cron)
- Rich media embeds beyond markdown images
- Email digest rollups

## Mockups

Static HTML mockups in `docs/mockups/updates/` show the intended visual design before Vue implementation. Open `docs/mockups/updates/index.html` in a browser.
