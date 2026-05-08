# ADR 001: Updates System — Topic-Based Member Communications
**Status**: Proposed
**Date**: 2026-05-08
**Notion Page**: [Pending — run /sync-to-notion after acceptance]

## Context

NATCA currently emails members regularly but communication is fragmented. Updates scatter across three ad-hoc categories (member updates, legislative updates, "public" updates) with no central system. Hub's existing `MemberUpdatesCard.vue` is hardcoded mock data. There is no database-backed updates / news / announcements feature anywhere in the MyNATCA ecosystem.

We need a modern system where ITC staff and authorized officers publish a story once and it fans out to:
- **Hub** — members browse by topic, customizable dashboard cards, urgent stories pinned, deep links by stable URL
- **Discord** — full content auto-posted to topic-mapped forum channels under a `TOPICS` category, brief summary cross-posted to a top-level `#announcements` channel for org-wide broadcast
- **Constant Contact (deferred)** — draft email campaigns generated from stories, with per-topic subscription lists

Secondary requirements surfaced during planning (Phase 0 — completed 2026-04-16):
- Members must be able to unsubscribe from individual topics (CAN-SPAM compliance)
- Any story can be flagged urgent — pins it to top of Hub regardless of filters
- Members can subscribe/unsubscribe from topics independently for email vs. Hub display
- New topics must be addable without schema changes
- Authoring permissions should be scoped per-topic (e.g., Legislative chair authors only Legislative)
- The taxonomy must reflect NATCA's organizational structure (councils, standing committees, cross-cutting domains) so members and officers find content in the place they expect

## Decision

### 1. Liveblog-style data model — Topic → Story → Update

Content is organized as a three-level hierarchy:

| Level | Stored in | Purpose |
|---|---|---|
| **Topic** | `updates.topics` | Category. Organizing axis for display, Discord channel routing, email list mapping. 16 topics (see Decision 3). |
| **Story** | `updates.stories` | A headline + stable editor-maintained summary that **accumulates updates over time**. Has lifecycle (Developing / Active / Action Needed / Resolved / Reference). One URL per story. |
| **Update** | `updates.updates` | A timestamped entry under a story. Has a kind (Update / Breaking / Correction / Summary) that affects visual styling. Each update is what gets fanned out to Discord as a thread reply. |

**Key principle:** one story = one URL. Multiple related developments about the same event (e.g., "FAA Shutdown 2026") live on a single story page with a running timeline, rather than fragmenting across disconnected posts. This matches how modern news orgs handle rolling coverage (Guardian liveblogs, NYT live updates). Single announcements (e.g., "Registration open for CFS") are just stories with one update — the data model is uniform.

**Urgent flag** (`stories.urgent boolean`) is orthogonal to the hierarchy: pins the story to top of Hub regardless of filter, includes `@here` in the Discord forum post + `#announcements` summary, (deferred) always triggers Constant Contact campaign to full active-member list.

### 2. Three member-facing concepts kept strictly separate

To prevent the current conflation of "category," "subscription," and "what I see," three concepts stay separate in code and UI:

| Concept | Stored in | Purpose |
|---|---|---|
| **Topic** | `updates.stories.topic_id` | Category axis. |
| **Subscription** | `updates.subscriptions` (member × topic) | Member's **email delivery** preference. Drives Constant Contact list membership when that integration lands. |
| **Hub display filter** | `hub.user_preferences.preferences.updates` JSON | What a member's *dashboard card* shows. Independent of email. Seeded from subscriptions but edited separately. The `/updates` page always shows everything. |

### 3. Four-axis content taxonomy

Every story is classified on four independent axes. Authors set three; the system derives one. See [content-standards.md](../../content-standards.md) for the canonical definitions.

| Axis | Set by | Values |
|---|---|---|
| **Content Type** | Author | Update, Document, Action Needed, Event |
| **Topic** | Author | 16 topics in 3 groups: Councils (9), Standing Committees (4), Cross-Cutting (3) |
| **Area** | Author (optional) | Per-topic, optional. Some topics define areas (e.g., Employee Movement → NCEPT/NEST/Hardships); many don't. |
| **Lifecycle** | System derives | Developing, Active, Action Needed, Resolved, Reference |

The 16 topics map to NATCA's actual organizational structure (councils + standing committees + cross-cutting domains). This was a deliberate choice over a flat 6-category list: members already know "Employee Movement" and "Safety & Technology" from how the union is organized; mapping topics to those structures means content lands where they expect to find it.

**Areas are per-topic, optional, and not Discord tags.** Discord limits forum tags to 20 per channel and 5 per post; we use 8 per forum already (4 content types + 4 lifecycle stages). Areas render as embed metadata chips on Discord and as filter chips on the Hub topic page — no Discord tag limit applies.

### 4. New `updates` schema owned by Platform

Create a new schema (not `public`, not `hub`):
- Keeps `public` clean (reserved for canonical UnionWare-sourced reference data)
- `hub` would lock other apps out — Discord bot needs to read, BID/DMS may later
- Follows existing convention of one schema per domain (`bid`, `pay`, `discord`, `dms`, `updates`)
- Platform owns the migrations; Hub consumes via Platform API

Tables: `updates.topics`, `updates.stories`, `updates.updates`, `updates.subscriptions`, `updates.update_embeddings`. Columns for Discord fan-out tracking (`discord_forum_thread_id`, `discord_announcement_message_id`, `discord_posted_at`) and Constant Contact tracking (`cc_campaign_id`, `cc_campaign_status`, `cc_synced_at`) exist from day 1 to avoid future migrations.

Full schema in [agent_docs/updates-system.md](../../agent_docs/updates-system.md).

### 5. Reuse `public.grants` for authorization

No new permissions table. Reuse the existing grants pattern (already powering DMS's `logo_approver` grant):
- `updates_admin` — full CRUD on all stories and topics
- `updates_author` — create / edit / publish stories in any topic
- `updates_author:<topic_id>` — create / edit / publish stories only in a specific topic

Platform API middleware checks `req.session.user.grants` (already loaded at login). Hub uses `useAuth0().hasGrant()` to show / hide author UI. Authors need a quick-find interface (`/updates/admin`) to locate existing stories and append updates rather than creating duplicate stories — this is a critical UX requirement that addresses the fragmentation problem.

### 6. Discord layout — `TOPICS` forum category + top-level `#announcements`

**One forum channel per topic, all 16 forums under a single private `TOPICS` category.** One top-level Announcement-type channel `#announcements` for org-wide broadcasts. The legacy `COUNCILS` and per-topic `ANNOUNCEMENTS` categories are retired.

| Component | Role |
|---|---|
| `TOPICS` category | Private parent for all 16 topic forums. Member access opens up at launch (admin-only initially). |
| Per-topic forum (e.g., `#employee-movement`) | Full content. Each story = one forum thread (post). Updates are replies in the thread. Member discussion happens in the thread. |
| `#announcements` (top-level) | Brief summary post for every published story — cross-postable to follower servers. Read-only for members. |

This layout was chosen after evaluating two earlier alternatives:

- **Forum-only (no announcement channel)** — rejected because forum channels can't be cross-server-followed (Discord limitation). Cross-server reach to regional/facility servers was a leadership requirement.
- **Announcement-only (one announcement channel per topic)** — rejected because announcement channels lose the rich browse / search / member-discussion affordances of forum channels. Members couldn't discuss updates in-place; threads-on-announcements lacked the metadata of forum tags.

The hybrid layout gives us:
- **Rich browsing** — forum channels show content type + lifecycle as native tags, browse grid, thread metadata
- **Cross-server reach** — `#announcements` (Announcement-type) cross-posts brief summaries to regional follower servers with edit sync
- **Member discussion in context** — discussion happens in the topic-forum thread, not in the announcement channel
- **Simpler routing** — one forum per topic = one channel ID per topic in `updates.topics`

### 7. Fan-out on publish — forum thread + announcements summary

Publishing an **update** (not a story) is a synchronous Platform operation:

1. Server sets `update.status='published'`, renders Tiptap JSON → markdown + HTML, generates the embedding asynchronously
2. Updates parent story's `last_updated_at` and increments `update_count`
3. POSTs to Discord bot's `/webhook/update-published` endpoint with `{ story, topic, update }`
4. Discord bot's handler:
   - **First update of a new story:**
     - Create a forum thread in the topic's forum (`channels[topic.id].threads.create(...)`) — thread title = story title, OP = full markdown body + embed footer with metadata (content type, lifecycle, area chips), buttons → Hub story + DMS related docs
     - Apply forum tags: content type + lifecycle (e.g., `📰 Update`, `🟢 Active`)
     - Post a **brief summary** to top-level `#announcements`: small embed (title, 1-line summary, topic color, link button → Hub story + link button → forum thread)
     - `crosspost()` the announcement summary so follower servers receive it
     - Return `{ discord_forum_thread_id, discord_forum_message_id, discord_announcement_message_id }` for storage on the story
   - **Subsequent updates on an existing story:**
     - Post the update as a reply in the existing forum thread (`thread.send(...)`) — full update body, with `@here` if `update.kind='breaking' && story.urgent`
     - Edit the existing `#announcements` summary embed — title stays, but the description refreshes to the latest update preview, footer updates `(N updates · X minutes ago)`. Discord syncs the edit to follower servers automatically.
     - If the forum thread was auto-archived, unarchive it first
     - Return `{ discord_forum_message_id }` for the new reply; story's existing `discord_forum_thread_id` and `discord_announcement_message_id` stay
5. Platform stores returned IDs on the appropriate rows
6. Calls stub `ccSync(update)` — logs "deferred" and returns for v1

Hub story page links to the Discord forum thread; Discord forum OP and `#announcements` summary link back to the Hub story. Bidirectional links from day 1.

### 8. Editor — Tiptap (Vue 3) with markdown export + Supabase Storage for images

Authors are NATCA officers and communications staff — not developers. They need a Word/Google-Docs-style WYSIWYG editor, not a raw markdown textarea.

**Editor: [Tiptap](https://tiptap.dev/)** with `@tiptap/vue-3`. ProseMirror-based, MIT licensed, proven at scale by Linear, GitLab, Substack, Axios HQ. The core editor is free; we don't need Pro features.

**Storage: triple — JSON canonical, markdown derived, HTML cached:**

| Column | Purpose | How it's generated |
|---|---|---|
| `body_json jsonb` | Canonical source of truth | Tiptap's native `getJSON()` on save |
| `body_md text` | Discord embed body, portability, full-text search, embedding tokenization | Tiptap markdown extension serializes from JSON |
| `body_html text` | Pre-rendered cache for Hub display + email | Tiptap's `getHTML()` on publish |

Storing all three is cheap (Postgres text compression is excellent) and avoids re-rendering on every read. Markdown is always available for portability, even if authors never see it directly.

**Images: Supabase Storage.** Bucket `updates-media/`, public read for published stories (CDN-cached), write gated by `updates_author` grant via Platform-proxied upload endpoint. Organized by `{year}/{month}/{uuid}.{ext}` to prevent hot-spots. Tiptap's image upload hook POSTs to `/api/updates/upload` on Platform, which streams to the bucket and returns the URL.

### 9. AI search via pgvector — schema lands early, UI deferred

Every update is embedded into a vector space on publish so members can ask natural-language questions like *"What's the latest on H.R. 4412?"* and get synthesized answers with citations.

**Vector store: pgvector in the same Supabase database.** No dedicated vector DB, no separate backup strategy.

**Embedding model: OpenAI `text-embedding-3-small`** (1536 dimensions, $0.02/1M tokens). At ~500 updates/year × ~500 tokens each, that's <$0.01/year — effectively free.

**`updates.update_embeddings` table** with HNSW index on the vector column. Embeddings generate on `update.status → published` (inline for v1; queue later if volume warrants). `content_hash` prevents re-embedding unchanged content.

**Schema lands in Phase 1; embedding generation runs from Phase 4; AI search UI lands in Phase 5** — embeddings accumulate from day 1 so the UI launches with a fully-populated index.

### 10. Constant Contact designed-but-deferred

Schema includes all fields needed for Constant Contact integration (`topics.cc_list_id`, `stories.cc_campaign_id`, etc.). Platform has a stub `ccSync()` function marking the integration point. Actual integration lands in `NATCA-ITC/integrations` as an Edge Function:
- Maps `updates.subscriptions` → Constant Contact list membership
- Creates **draft** campaigns (human review gate, not auto-send)

Not built in v1, but the data model doesn't migrate when it lands.

## Consequences

### Positive
- **Clear mental model** prevents the current conflation of "category," "subscription," and "what I see." Each concept has one owner.
- **Liveblog model solves the fragmentation problem.** Today, multiple related posts about the same event scatter across disconnected communications. Stories consolidate coverage into a single URL with a chronological timeline.
- **Single source of truth** for stories and updates. Hub, Discord forum, `#announcements`, and (future) Constant Contact all read from the same tables.
- **Topic taxonomy mirrors NATCA org structure** — members find content where they expect (Employee Movement, Safety & Technology, Membership Services). The 3-group organization (Councils / Standing Committees / Cross-Cutting) is recognizable from union governance.
- **Reuses existing infrastructure** — `public.grants`, Discord bot HTTP server, Hub's `useAuth0`, Platform session middleware. Minimal new surface area.
- **Extensible** — new topics = `INSERT` row + Discord channel creation. Per-topic author grants via existing grants table. Areas extend per-topic without schema changes.
- **Discord layout balances reach and depth** — forum channels for browseable discussion + `#announcements` for cross-server broadcast. Edit sync on summaries keeps follower servers fresh.
- **Constant Contact-ready** — columns exist; we don't pay the cost until needed.
- **AI-search-ready from day 1** — schema + pgvector extension + embedding generation land in Phases 1 + 4. Search UI launches with a fully-populated index in Phase 5.
- **Rich editor for non-technical authors** — Tiptap removes markdown as a barrier without losing markdown as a derived format.
- **Dashboard customization** lives in existing `hub.user_preferences` JSON — no new Hub tables.

### Negative / Trade-offs
- **New schema to own and maintain** — Platform grows a third schema. Small ongoing cost.
- **Markdown rendering on the server** — needs a new dependency (`marked` or `markdown-it`) and cached `body_html` column. Acceptable.
- **Discord fan-out is two messages, not one** — every publish results in a forum thread post + an `#announcements` summary. Two writes, two stored IDs per first-update. Marginal cost; the bot manages both atomically per webhook call.
- **No queue for fan-out in v1** — publish is synchronous. If Discord bot is down, publish fails or logs and continues. Acceptable for low-volume (a few stories per week).
- **Manual grant bootstrap** — initial authors get grants via SQL. Position → grant sync can be added later.
- **Urgent-flag email behavior deferred** — whether urgent stories should override email unsubscribes is a policy question deferred until Constant Contact integration.

## Alternatives Considered

**Forum-only Discord layout (no announcements channel).** Rejected: forum channels can't be cross-server-followed. Regional servers wouldn't see published stories.

**Announcement-only Discord layout (one announcement channel per topic).** Rejected: 16 announcement channels = 16 channels in the sidebar. Lost forum-channel affordances (browse grid, native tags, thread metadata). Member discussion was awkward (threads on announcements vs. threads on forum posts).

**Flat 6-topic taxonomy** (the original proposal: Pay / Benefits / Working Conditions / Legislative / Safety / Union). Rejected after alignment with the council and standing-committee structure. The flat list didn't reflect how members actually think about NATCA work; the 16-topic / 3-group taxonomy mirrors the org chart and makes content land where members expect.

**Areas as Discord forum tags.** Rejected: Discord caps tags at 20/channel and 5/post; we use 8 already (4 content types + 4 lifecycle stages). Areas as embed metadata chips give us unlimited area values per topic.

**Raw markdown textarea as the editor.** Rejected: NATCA officers and PA staff aren't developers. Asking them to memorize markdown syntax and write image URLs by hand creates friction that results in fewer stories and worse content. Tiptap gives WYSIWYG while still storing markdown as a derived format.

**Dedicated vector database (Pinecone / Qdrant / Weaviate).** Rejected: pgvector in the same Supabase Postgres is simpler, cheaper, has unified backups, and handles our scale (10K–100K embeddings over years) with room to spare. Dedicated vector DBs are worth it at 10M+ embeddings or when query patterns require specialized ANN tuning. We have neither.

**Self-hosted embedding model.** Rejected for v1: adds a server to maintain for pennies of saved cost. OpenAI `text-embedding-3-small` costs less than $1/year for expected volume.

**Lexical (Meta's editor) instead of Tiptap.** Rejected: Vue 3 bindings (`lexical-vue`) are community-maintained and lag the React version. Tiptap's Vue 3 support is first-class.

**Flat posts table (no story/update hierarchy).** Rejected: that's effectively what we have today, where related announcements fragment across multiple URLs. Members can't find the latest state of an evolving story; authors create duplicates; Discord channels clutter with disconnected messages.

**Threaded comments on stories.** Rejected: comments would come from members. We want editor-controlled chronological updates, not a discussion thread. This is a news liveblog, not a forum thread.

**Store stories in `public` schema.** Rejected: `public` is reserved for canonical UnionWare-sourced reference data.

**Store stories in `hub` schema.** Rejected: Discord bot and future apps need to read; Hub-owned schema would force every consumer to go through Hub, which isn't an API server.

**Use a separate CMS (Sanity, Contentful, etc.).** Rejected: adds a vendor, a webhook, and auth complexity. Authors are already authenticated through Platform.

**Many-to-many topics per story.** Rejected for v1: which topic color? which forum thread? Single-topic is enough; cross-posting can come later by creating multiple story rows.

**Separate story types for member/legislative/public.** Rejected: that's the current tangled mental model. Audience is a field on a single story type; topic and content type are orthogonal.

**Author permissions as a new `updates.author_permissions` table.** Rejected: `public.grants` already solves this for DMS. Reusing it eliminates a table and a sync script.

## Related Decisions
- Pattern follows existing grants usage in DMS (`logo_approver`)
- Discord webhook pattern follows existing `/webhook/role-assignment` handler in `discord/lib/webhookHandler.js`
- Integration deferral follows Platform ADR 002 — Integration Worker Architecture

---
**Accepted By**: NATCA ITC (pending)
**Implementation Status**: Proposed — Phase 0 (mockups + ADR + agent_docs + content standards + implementation plan) complete; Phase 1 (schema + Platform API) ready to start on acceptance
