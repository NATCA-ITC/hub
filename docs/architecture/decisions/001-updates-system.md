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

Publishing an **update** (not a story) is a synchronous Platform operation that:
1. Sets `update.status='published'`, renders markdown → `body_html`
2. Updates parent story's `last_updated_at` and increments `update_count`
3. If topic has `discord_channel_id` (or parent story is urgent), POSTs to Discord bot's `/webhook/update-published` endpoint with `{story, topic, update}`
4. Discord bot formats a rich embed showing the story title, the specific update content, and a "Read full story" link back to Hub
5. Platform stores returned `discord_message_id` on the `updates` row
6. Calls stub `ccSync(update)` that logs "deferred" for v1

Each update is its own Discord message — members see rolling updates in the channel, and each links back to the same consolidated Hub story page. This is intentional: Discord shows the firehose, Hub shows the coherent thread.

### 6. Constant Contact designed-but-deferred

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
- **Dashboard customization** lives in existing `hub.user_preferences` JSON — no new Hub tables.

### Negative / Trade-offs
- **New schema to own and maintain** — Platform grows a third schema (after `public`, `hub`). Small ongoing cost.
- **Markdown rendering in Platform** — needs a new dependency (`marked` or `markdown-it`) and cached `body_html` column.
- **No queue for fan-out in v1** — publish is synchronous. If Discord bot is down, publish fails or logs and continues. Acceptable for low-volume (a few posts per week).
- **Manual grant bootstrap** — initial authors get grants via SQL. Position → grant sync can be added later.
- **Urgent-flag email behavior deferred** — whether urgent posts should override email unsubscribes is a policy question deferred until Constant Contact integration.

## Alternatives Considered

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
