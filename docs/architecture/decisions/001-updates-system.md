# ADR 001: Updates System — Topic-Based Member Communications
**Status**: Proposed
**Date**: 2026-04-10
**Notion Page**: [Pending — run /sync-to-notion after acceptance]

## Context

NATCA currently emails members regularly but communication is fragmented across three ad-hoc categories (member updates, legislative updates, "public" updates) with no central system. Hub's existing `MemberUpdatesCard.vue` is hardcoded mock data. There is no database-backed updates/news/announcements feature anywhere in the MyNATCA ecosystem.

We need a modern, topic-organized system where ITC staff and authorized officers publish posts once and they fan out to:
- **Hub** — members browse by topic, customizable dashboard cards, urgent posts pinned
- **Discord** — auto-posted to topic-mapped channels via the existing Discord bot
- **Constant Contact** (future) — draft email campaigns generated from posts, with per-topic subscription lists

Secondary requirements surfaced during planning:
- National updates should reach every active member by default, but members must still be able to unsubscribe (CAN-SPAM compliance)
- Any post can be flagged urgent to pin it at the top of Hub regardless of filters
- Members can subscribe/unsubscribe from topics independently for email vs. Hub display
- New topics must be addable without schema changes
- Authoring permissions should be scoped per-topic (e.g., Legislative Committee chair authors only Legislative)

## Decision

### 1. Liveblog-style data model — Topic → Story → Update

Content is organized as a three-level hierarchy:

| Level | Stored in | Purpose |
|---|---|---|
| **Topic** | `updates.topics` | Category (national, legislative, safety, etc.). Organizing axis for display, Discord channel routing, email list mapping. |
| **Story** | `updates.stories` | A headline + stable editor-maintained summary that **accumulates updates over time**. Has status (Live / Active / Resolved). One URL per story. |
| **Update** | `updates.updates` | A timestamped entry under a story. Has a kind (Update / Breaking / Correction / Summary). This is what gets fanned out to Discord and (future) email. |

**Key principle:** one story = one URL. Multiple related developments about the same event (e.g., "FAA Shutdown 2026") live on a single story page with a running timeline, rather than fragmenting across disconnected posts. This matches how modern news orgs handle rolling coverage (Guardian liveblogs, NYT live updates, MS.now). Single announcements (e.g., "Registration open for CFS") are just stories with one update — the data model is uniform.

**Urgent flag** (`stories.urgent boolean`) is orthogonal to the hierarchy: pins the story to top of Hub regardless of filter, always posts updates to Discord with @role mentions, (future) always triggers Constant Contact campaign to full active-member list.

### 2. Three member-facing concepts kept strictly separate

Beyond the data model, three concepts must stay separate in code and UI to prevent the current conflation:

| Concept | Stored in | Purpose |
|---|---|---|
| **Topic** | `updates.stories.topic_id` (above) | Category axis. |
| **Subscription** | `updates.subscriptions` (member × topic) | Member's **email delivery** preference. Drives Constant Contact list membership when that integration lands. |
| **Hub display filter** | `hub.user_preferences.preferences.updates` JSON | What a member's *dashboard card* shows. Independent of email. Seeded from subscriptions but edited separately. The `/updates` page always shows everything. |

### 3. New `updates` schema owned by Platform

Create a new schema (not `public`, not `hub`) because:
- Keeps `public` clean (reserved for canonical member/facility reference data from UnionWare sync)
- `hub` would lock other apps out — Discord bot needs to read, BID/DMS might later
- Follows existing MyNATCA convention of one schema per domain (`bid`, `pay`, `discord`, `dms`, `updates`)
- Platform owns the migrations; Hub consumes via Platform API

Tables: `updates.topics`, `updates.stories`, `updates.updates`, `updates.subscriptions`. Columns for Discord fan-out tracking (`discord_message_id`, `discord_posted_at` on both stories and updates) and Constant Contact tracking (`cc_campaign_id`, `cc_campaign_status`, `cc_synced_at`) exist from day 1 to avoid future migrations.

Full schema in `docs/agent_docs/updates-system.md`.

### 4. Reuse `public.grants` for authorization

No new permissions table. Reuse the existing grants pattern (already powering DMS's `logo_approver` grant):
- `updates_admin` — full CRUD on all posts and topics
- `updates_author` — create/edit/publish posts in any topic
- `updates_author:<topic_id>` — create/edit/publish posts only in a specific topic

Platform API middleware checks `req.session.user.grants` (already loaded at login). Hub uses `useAuth0().hasGrant()` to show/hide author UI. Authors need a quick-find interface (implemented as `/updates/admin`) to locate existing stories and append updates rather than creating duplicate stories — this is a critical UX requirement.

### 5. Fan-out on publish (Platform → Discord bot)

**One Announcement channel per topic.** Each topic gets its own Discord Announcement channel (e.g. `#pay-benefits`, `#legislative`, `#safety`). Announcement channels enable native cross-server following — regional and facility servers subscribe to topic channels and automatically receive published messages and edits.

Publishing an **update** (not a story) is a synchronous Platform operation that:
1. Sets `update.status='published'`, renders markdown → `body_html`
2. Updates parent story's `last_updated_at` and increments `update_count`
3. POSTs to Discord bot's `/webhook/update-published` endpoint with `{story, topic, update}`
4. Discord bot routes to the topic's announcement channel:
   - **First update:** Post the story OP embed → `crosspost()` to publish to followers → create a thread on the OP for updates + discussion → post the first update in the thread. Store `discord_message_id` (the OP) and `discord_thread_id` (the thread) on the story.
   - **Subsequent updates:** Post the update as a reply in the existing thread. Then **edit the OP embed** to refresh the story summary — the edit automatically syncs to all following servers.
5. Urgent updates include `@here` in the OP and in breaking thread replies.
6. Platform stores returned IDs on the story and update rows.
7. Calls stub `ccSync(update)` that logs "deferred" for v1.

**Why announcement channels, not forum channels:** Forum channels have a nicer browse grid, but they cannot be followed cross-server (Discord limitation). Cross-server broadcast was a requirement from NATCA leadership. Announcement channels give us:
- **Native cross-server following** with edit sync (regional servers see the latest story summary automatically)
- **Read-only broadcast discipline** via permissions (members discuss in threads, not the channel)
- **Per-topic muting** (members mute entire channels natively)
- The OP-edit + thread-reply pattern gives followers the current state while national server members get the full update timeline

**Consolidation principle holds:** all updates to one story live in one thread. The OP embed is the "always-current summary" visible to followers; the thread is the detailed history visible on the national server and on Hub.

### 6. Editor: Tiptap (Vue 3) with markdown export + Supabase Storage for images

Authors are NATCA officers and communications staff — not developers. They need a Word/Google-Docs-style WYSIWYG editor, not a raw markdown textarea.

**Editor: [Tiptap](https://tiptap.dev/)** with the official `@tiptap/vue-3` bindings. ProseMirror-based, MIT licensed, proven at scale by Linear, GitLab, Substack, Axios HQ. First-class Vue 3 support. The core editor is free forever; we don't need Pro features.

**Storage: all three formats, generated from Tiptap's canonical JSON:**

| Column | Purpose | How it's generated |
|---|---|---|
| `body_json jsonb` | Canonical source-of-truth | Tiptap's native `getJSON()` on save |
| `body_md text` | Portable fallback, Discord embed text, future integrations | Tiptap's markdown extension serializes from JSON |
| `body_html text` | Pre-rendered cache for Hub display and email | Tiptap's `getHTML()` on publish |

Storing all three is cheap (text compression in Postgres is excellent) and avoids re-rendering on every read. Markdown is always available for portability and for systems that can't consume Tiptap JSON — addressing the requirement that markdown remains first-class even if authors never see it.

**Images and attachments: Supabase Storage.** New bucket `updates-media/` with:
- Public read for published posts (CDN-cached)
- Write gated by `updates_author` grant via Platform-proxied upload endpoint
- Organized by `{year}/{month}/{uuid}.{ext}` to prevent hot-spots

Upload flow:
1. Author drags an image into Tiptap (or pastes from clipboard, or clicks 📷)
2. Tiptap's upload hook POSTs to `POST /api/updates/upload` (new route on Platform)
3. Platform validates the grant, streams the file to `updates-media/` in Supabase Storage
4. Returns `{ url, width, height, mime_type }`
5. Tiptap inserts an image node pointing at the URL
6. When the post is published, the first image becomes the Discord embed's thumbnail and the email's featured image

**Why this matters for the liveblog model:** rapid-authoring workflows (live coverage, screenshots of FAA memos, event flyers) become native. Authors paste a screenshot and keep typing. This is what makes a news-org liveblog feel alive rather than stale.

### 7. AI search via pgvector embeddings

Every update is embedded into a vector space on publish so members can ask natural-language questions like *"What's the latest on H.R. 4412?"* or *"When is the next CFS conference?"* and get synthesized answers with citations back to the source stories.

**Vector store: pgvector in the same Supabase database.** Supabase has first-class pgvector support — no dedicated vector DB, no separate backup strategy, no sync pipeline. Embeddings live alongside the content they embed.

**Embedding model: OpenAI `text-embedding-3-small`** (1536 dimensions, $0.02/1M tokens). At 500 updates/year × ~500 tokens each, that's $0.005/year in embedding costs — effectively free. Upgrading to `text-embedding-3-large` later is a trivial migration.

**New table: `updates.update_embeddings`**
```sql
CREATE TABLE updates.update_embeddings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id       uuid NOT NULL REFERENCES updates.updates(id) ON DELETE CASCADE,
  chunk_index     integer NOT NULL DEFAULT 0,
  chunk_text      text NOT NULL,
  embedding       vector(1536) NOT NULL,
  content_hash    text NOT NULL,
  model           text NOT NULL DEFAULT 'text-embedding-3-small',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON updates.update_embeddings USING hnsw (embedding vector_cosine_ops);
```

**Retrieval-Augmented Generation (RAG) flow:**
1. Member asks a question in a Hub search box (e.g. *"What did NATCA say about the shutdown?"*)
2. Hub POSTs to `POST /api/updates/ask` on Platform
3. Platform embeds the query → runs nearest-neighbor search against `updates.update_embeddings` → fetches the top N matching updates + their parent stories
4. Sends context + question to Claude API (or Anthropic SDK) as a RAG prompt
5. Claude synthesizes an answer with inline citations like `[1]`, `[2]`
6. Platform maps citation numbers back to story URLs and returns `{ answer, citations: [{ story_slug, update_id, ... }] }`
7. Hub renders the answer with clickable citations → deep-linking into `/updates/[slug]#u-[id]`

**Secondary uses of the embedding index:**
- **Related stories** on the story page (semantic nearest neighbors at story-level)
- **Duplicate detection** on story creation (warn authors when a new story is semantically close to an existing live story)
- **Topic suggestions** (type a headline, get the most likely topic based on historical updates in each topic)
- **Weekly roll-up generation** (summarize all updates in a topic over the past 7 days for a newsletter)

**Not in v1, but designed for:** the embeddings table and pgvector extension can be added in Phase 1 so the data starts accumulating from day 1. The actual `/api/updates/ask` endpoint and Hub search UI can land in a later phase (Phase 5).

### 8. Constant Contact designed-but-deferred

Schema includes all fields needed for Constant Contact integration (`topics.cc_list_id`, `posts.cc_campaign_id`, etc.). Platform has a stub `ccSync()` function marking the integration point. Actual integration lands in `NATCA-ITC/integrations` as an Edge Function that:
- Maps `updates.subscriptions` → Constant Contact list membership
- Creates **draft** campaigns (human review gate, not auto-send)

Not built in v1, but the data model doesn't need migration when it lands.

## Consequences

### Positive
- **Clear mental model** prevents the current conflation of "category," "subscription," and "what I see." Each concept has one owner table.
- **Liveblog model solves the fragmentation problem** — today, multiple related posts about the same event (e.g., shutdown negotiation) scatter across disconnected communications. Stories consolidate coverage into a single URL with a chronological update timeline. Members always land on the canonical, up-to-date view.
- **Single source of truth** for stories and updates — Hub, Discord, and (future) Constant Contact all read from the same tables. No duplication.
- **Reuses existing infrastructure** — `public.grants`, Discord bot HTTP server, Hub's `useAuth0` composable, Platform session middleware. Minimal new surface area.
- **Extensible** — new topics = `INSERT` row. Per-topic author grants via existing grants table. Discord channel mapping is a column, not a separate config system.
- **Constant Contact-ready** — columns exist, but we don't pay the cost of building the integration until it's needed.
- **AI-search-ready from day 1** — pgvector extension and `update_embeddings` table land in Phase 1, so embeddings accumulate from the first published update. The search UI can land months later without a backfill.
- **Rich editor for non-technical authors** — Tiptap removes markdown as a barrier without losing markdown as a storage format. PA staff get a familiar Word-like experience; integrations still consume clean markdown.
- **Dashboard customization** lives in existing `hub.user_preferences` JSON — no new Hub tables.

### Negative / Trade-offs
- **New schema to own and maintain** — Platform grows a third schema (after `public`, `hub`). Small ongoing cost.
- **Markdown rendering in Platform** — needs a new dependency (`marked` or `markdown-it`) and cached `body_html` column.
- **No queue for fan-out in v1** — publish is synchronous. If Discord bot is down, publish fails or logs and continues. Acceptable for low-volume (a few posts per week).
- **Manual grant bootstrap** — initial authors get grants via SQL. Position → grant sync can be added later.
- **Urgent-flag email behavior deferred** — whether urgent posts should override email unsubscribes is a policy question deferred until Constant Contact integration.

## Alternatives Considered

**Raw markdown textarea as the editor.** Rejected: NATCA officers and PA staff aren't developers. Asking them to memorize markdown syntax and write image URLs by hand is friction that will result in fewer posts and worse content. Tiptap gives them a familiar WYSIWYG while still storing markdown as a derived format for portability.

**Dedicated vector database (Pinecone / Qdrant / Weaviate).** Rejected: pgvector in the same Supabase Postgres is simpler, cheaper, has unified backups, and handles our scale (10K–100K embeddings over years) with room to spare. Dedicated vector DBs are worth it at 10M+ embeddings or when query patterns require specialized ANN tuning. We have neither.

**Self-hosted embedding model (sentence-transformers on a DO droplet).** Rejected for v1: adds a server to maintain for pennies of saved cost. OpenAI text-embedding-3-small at $0.02/1M tokens costs us less than $1/year for expected volume. Revisit if we ever need self-hosted for privacy reasons.

**Lexical (Meta's editor) instead of Tiptap.** Rejected: the Vue 3 bindings are community-maintained (`lexical-vue`) and lag the React version significantly. Tiptap's Vue 3 support is first-class and maintained by the Tiptap team directly.

**Flat posts table (no story/update hierarchy).** Rejected: this is what we have today in spirit — each announcement is a standalone post, and related posts fragment across multiple URLs. Members can't find the latest state of an evolving story, authors inadvertently create duplicates, and Discord channels get cluttered with disconnected messages about the same event. The liveblog model directly addresses this.

**Threaded comments on posts.** Rejected: comments would come from members, but we want editor-controlled chronological updates, not a discussion thread. This is more like a news liveblog than a forum thread.

**Store posts in `public` schema.** Rejected: `public` is reserved for canonical UnionWare-sourced reference data. Mixing mutable content with reference data muddies the boundary.

**Store posts in `hub` schema.** Rejected: Discord bot and future apps (BID, DMS) need to read posts. Hub-owned schema would force every consumer to go through Hub, which isn't an API server.

**Use a separate CMS (Sanity, Contentful, etc.).** Rejected: adds a vendor, a webhook, and auth complexity. All authors are already authenticated through Platform. Posts are simple enough that Postgres + markdown is sufficient.

**Many-to-many topics per post.** Rejected for v1: adds complexity to display (which topic color? which Discord channel?) without clear need. Single-topic is enough; we can add cross-posting later by creating multiple post rows.

**Separate post types for member/legislative/public.** Rejected: that's the current tangled mental model. Audience is a field on a single post type; topic is orthogonal.

**Author permissions as a new `updates.author_permissions` table.** Rejected: `public.grants` already solves this exact problem for DMS. Reusing it eliminates a table, a sync script, and a middleware pattern.

## Related Decisions
- Pattern follows existing grants usage in DMS (`logo_approver`)
- Discord webhook pattern follows existing `/webhook/role-assignment` handler in `discord/lib/webhookHandler.js`
- Integration deferral follows [Platform ADR 002 — Integration Worker Architecture]

---
**Accepted By**: NATCA ITC (pending)
**Implementation Status**: Proposed — Phase 0 (mockups + spec) in progress
