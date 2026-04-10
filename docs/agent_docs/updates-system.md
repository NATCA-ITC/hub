# Updates System — Agent Context

_Read this before making changes to the Updates feature._

## Purpose

Topic-based communication system that lets ITC staff and authorized officers publish a single post that fans out to multiple destinations (Hub, Discord, and eventually Constant Contact email). Replaces the hardcoded mock data currently in `src/components/dashboard/MemberUpdatesCard.vue` with a real, database-backed feature.

See [ADR 001](../architecture/decisions/001-updates-system.md) for decision rationale.

## Critical mental model — three concepts, kept separate

These have been tangled in past discussions. Never conflate them in code, UI copy, or variable names.

1. **Topic** — what a post is *about*. Stored on `updates.posts.topic_id`. One per post. Drives display grouping, Discord channel routing, and email list mapping.
2. **Subscription** — a member's per-topic **email delivery** preference. Stored in `updates.subscriptions`. Maps 1:1 to future Constant Contact list membership. Does NOT control what a member sees in Hub.
3. **Hub display filter** — what a member's *dashboard card* shows. Stored in `hub.user_preferences.preferences.updates` JSON. Independent of subscriptions. The full `/updates` page always shows everything regardless of filters.

**Urgent flag** is orthogonal. Any post can be marked urgent → pinned on Hub regardless of filter, always posted to Discord, (future) always emailed to full active-member list.

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

### `updates.posts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| topic_id | text FK → topics | required, single |
| title | text | |
| slug | text UNIQUE | permalink slug |
| summary | text | 1-2 sentence preview for cards/email |
| body_md | text | markdown source of truth |
| body_html | text | rendered cache |
| urgent | boolean | pins on Hub, always routes to Discord |
| audience | text CHECK | 'members' / 'public' / 'both' |
| author_member_id | text | public.members.membernumber |
| status | text CHECK | 'draft' / 'scheduled' / 'published' / 'archived' |
| published_at | timestamptz | set on publish |
| scheduled_for | timestamptz | for future scheduler (v1.5) |
| expires_at | timestamptz | optional auto-archive |
| discord_message_id | text | set after Discord fan-out |
| discord_posted_at | timestamptz | |
| cc_campaign_id | text | deferred — set when CC integration lands |
| cc_campaign_status | text | 'draft' / 'sent' / 'failed' |
| cc_synced_at | timestamptz | |
| created_at / updated_at | timestamptz | |

Indexes: `(topic_id, published_at DESC)` WHERE status='published', `(urgent, published_at DESC)` WHERE urgent=true, `(scheduled_for)` WHERE status='scheduled'.

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
- `GET /api/updates/posts?topic=&limit=&cursor=` — paginated feed
- `GET /api/updates/posts/:slug` — single post
- `GET /api/updates/subscriptions` — current member's state
- `PUT /api/updates/subscriptions` — bulk update

**Writes (require grant):**
- `POST /api/updates/posts` — create draft
- `PATCH /api/updates/posts/:id` — edit
- `POST /api/updates/posts/:id/publish` — publish + fan out
- `POST /api/updates/posts/:id/archive`
- `POST /api/updates/topics` — admin only

## Fan-out on publish

Synchronous for v1 (no queue):
1. Set `status='published'`, `published_at=now()`, render markdown → `body_html`
2. If `topic.discord_channel_id` is set OR post is urgent: POST to `http://discord:1303/webhook/update-published` with `{post, topic}`. Store returned `discord_message_id` + `discord_posted_at`.
3. Call `ccSync(post)` stub — logs "deferred" and returns for v1.

## Discord integration

Extends the existing Discord bot HTTP server (`discord/lib/httpServer.js`). New handler in `discord/lib/webhookHandler.js`:

```js
async function handleUpdatePublished({ post, topic }) {
  const channel = await channelManager.getChannelById(topic.discord_channel_id);
  const embed = {
    title: post.title,
    description: post.summary,
    url: `https://hub.natca.org/updates/${post.slug}`,
    color: hexToInt(topic.color),
    author: { name: post.author_name },
    fields: post.urgent ? [{ name: '🚨 URGENT', value: 'Please read and share', inline: false }] : [],
    timestamp: post.published_at,
    footer: { text: `Topic: ${topic.name}` }
  };
  const message = await channel.send({
    content: post.urgent ? `@here` : null,
    embeds: [embed]
  });
  return { discord_message_id: message.id, discord_posted_at: new Date().toISOString() };
}
```

Channel mapping is a single column (`updates.topics.discord_channel_id`) — no new config table.

## Hub UI

### Routes
- `/updates` — topic-filtered feed with urgent banner
- `/updates/[slug]` — single post view
- `/updates/preferences` — subscription toggles
- `/updates/author` — author's draft/published list
- `/updates/author/[id]` — markdown editor

### Dashboard card
`MemberUpdatesCard.vue` (existing, currently mocked) is rewritten to:
- Fetch real posts from `GET /api/updates/posts?limit=5`
- Pin urgent posts first
- Read filter from `hub.user_preferences.preferences.updates`:
  ```json
  { "updates": { "topics": ["national","legislative"], "card_count": 1 } }
  ```
- Settings button → filter dialog
- Click through → `/updates?topic=X`

### Services / store
- `src/services/updatesService.ts` — mirror `rackspaceEmailService.ts` pattern (singleton, fetch, typed)
- `src/stores/updatesStore.ts` — Pinia store: posts, topics, subscriptions, filter state
- `src/types/updates.ts` — `Topic`, `Post`, `Subscription`, `UpdatePreferences`

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
