# Hub Content Standards

_How Hub organizes, classifies, and connects content across platforms. Every NATCA communication — from a breaking legislative alert to a reference SOP — follows this taxonomy so members can find it now and 2 years from now._

This document is the **canonical reference for the four-axis content taxonomy**. The ADR ([001-updates-system](architecture/decisions/001-updates-system.md)) explains *why* this taxonomy exists; this document defines *what* the taxonomy is. Authors, developers, and Discord moderators should treat this as source of truth.

---

## The Four Axes

Every Hub story is classified on four independent axes. They are not interchangeable — each answers a different question. **Authors set three; the system derives the fourth.**

| Axis | Question it answers | Who sets it | Values | Where it's used |
|---|---|---|---|---|
| **Content Type** | What *kind* of thing is this? | Author picks | Update, Document, Action Needed, Event | Discord tags, Hub card styling, feed filters |
| **Topic** | What *domain* does this belong to? | Author picks | 16 topics in 3 groups (see below) | Discord forum routing under `TOPICS`, Hub topic filter, email lists |
| **Area** | What *specific subject* within the topic? | Author picks (optional — only if the topic defines areas) | Per-topic, optional | Hub sub-filter within a topic, Discord embed chip, search facet |
| **Lifecycle** | Where is this in its *life*? | System derives | Developing, Active, Action Needed, Resolved, Reference | Discord tags, Hub status badges, auto-archive rules |

> **Author picks 2–3 things, system handles 1.** Content Type + Topic = required. Area = optional, only when the topic defines a sub-list. Lifecycle = derived from content type + author actions (resolve, archive).

---

## Axis 1 — Content Type

What kind of thing is this? Each story gets exactly one content type. The type drives Hub card styling, Discord tag, and the default lifecycle path.

| Type | When to use | Example | Default lifecycle |
|---|---|---|---|
| 📰 **Update** | The default — news, coverage, announcements, advisories, anything that isn't a document, event, or action item | Pay raise, staffing numbers, ASRS changes, FAA shutdown coverage, election results | Starts **Developing** (if rolling) or **Active** (if one-time). Author resolves when done. |
| 📋 **Document** | Official artifacts that link to DMS — SOPs, MOUs, contract interpretations, policies | Long-Term Hold SOP, Slate Book Article 35 MOU | Immediately **Reference**. Documents are evergreen from publish. |
| ⚡ **Action Needed** | Members must do something by a date | TA vote, benefits enrollment, scholarship application | **Action Needed** until deadline passes, then auto-**Resolved**. |
| 📅 **Event** | Has start/end dates | CFS Conference, NATCA in Washington, regional training | **Active** until event date passes, then auto-**Resolved**. |

### Why only 4 types?

Earlier iterations had 6 (Coverage, Advisory, Announcement were separate). In practice, whether a post gets follow-up updates is a *lifecycle* question (Developing vs Resolved), not a content-type question:

- An "advisory" that gets 3 updates IS coverage → **Update / Developing**
- An "announcement" is just an update that's already resolved → **Update / Resolved**

`Update` covers all of these — the lifecycle does the rest.

---

## Axis 2 — Topic

What domain does this belong to? **16 topics** organized into 3 groups that mirror NATCA's organizational structure. Topics map 1:1 to Discord forum channels (under a single private `TOPICS` category) and to email subscription lists. Each story belongs to exactly one topic.

### Councils (9)

| Topic | Description | Discord channel |
|---|---|---|
| **Training & Education** | Representative training, leadership development, member education. NTC, Reloaded. | `#training-education` |
| **Employee Wellness** | CISM, EAP, DAC, Childcare, Union Synergy, Benefits, Human Performance. | `#employee-wellness` |
| **Representation & Advocacy** | GRT, Core 30, Center / TRACON / Level 4-9 / FCT FacRep groups, Onboarding, NEC, ESC. | `#representation-advocacy` |
| **Collaboration & Professionalism** | COG, Collaboration Facilitators, Right From the Start, Professional Standards. | `#collaboration-professionalism` |
| **Safety & Technology** | NSTLC, NSC, NAPC, ASI, Security Breach. | `#safety-technology` |
| **Employee Movement** | NCEPT, NEST, Hardships, Academy Oversight, Reasonable Accommodations, Deviations. | `#employee-movement` |
| **Facility Issues** | OSHA, OWCP, Article 804/76 facility-level CBA work. | `#facility-issues` |
| **Metrics** | Operational metrics, validation, data-driven oversight. ABACUS, NVT. | `#metrics` |
| **Membership Services** | Veterans, Pay Review Team, Comms, ITC, DRC, RNAV, Seniority, Historical. | `#membership-services` |

### Standing Committees (4)

| Topic | Description | Discord channel |
|---|---|---|
| **Finance** | NATCA financial operations, budget, audit. | `#finance` |
| **Organizing** | New bargaining units, organizing support. | `#organizing` |
| **Safety (Standing Committee)** | Overall safety policy, FAA collaboration. Distinct from the Safety & Technology Council. | `#safety-committee` |
| **Constitution** | Interpretation and amendments to the NATCA constitution. | `#constitution` |

### Cross-Cutting (3)

| Topic | Description | Discord channel |
|---|---|---|
| **Legislative** | Bills, calls to action, NATCA PAC, NIW. (No separate Legislative Committee topic — that work folds in here.) | `#legislative` |
| **Events** | Convention, CFS, NIW, ATX, regional gatherings. | `#events` |
| **Labor Relations** | Contract enforcement, grievances, MOUs, FAA labor-relations posture. | `#labor-relations` |

### Discord channel layout

All 16 topic forums live under a single private `TOPICS` category — admin-only at launch. Top-level channels:

- `#announcements` — top-level Announcement-type channel for org-wide broadcasts (every published story produces a brief summary here, cross-postable to follower servers)
- `#verify` — the only public channel; member verification onboarding

The legacy `COUNCILS` and per-topic `ANNOUNCEMENTS` categories have been retired.

---

## Axis 3 — Area (optional, per-topic)

What specific subject within the topic? **Optional and per-topic.** A topic that maps to many sub-committees may benefit from areas; a topic with focused scope can skip them entirely.

When present, areas render as:
- Filter chips on the Hub topic page (instant client-side filter)
- A small chip next to the topic badge on story cards
- A metadata field in the Discord embed (not a Discord tag — see below)
- A structured facet for AI search ("show me all NCEPT documents")

### Why areas aren't Discord tags

Discord limits forum channels to 20 tags and posts to 5 tags. Hub already uses 8 tags per forum (4 content types + 4 lifecycle stages). Areas would blow past that limit. Instead, areas live in the embed body as a chip — no Discord tag limit applies.

### Topics with defined areas

| Topic | Areas |
|---|---|
| **Employee Movement** | NCEPT · NEST · Hardships · Academy Oversight · Reasonable Accommodations · Deviations |
| **Employee Wellness** | CISM · EAP · DAC · Childcare · Benefits · Union Synergy |
| **Safety & Technology** | NSC · NAPC · ASI · Security Breach |
| **Legislative** | FAA Reauthorization · Appropriations · NATCA PAC · NIW / Hill Visits |
| **Membership Services** | Veterans · Pay Review · Comms · ITC · DRC · RNAV · Seniority |

### Topics with no defined areas

Finance, Organizing, Constitution, Metrics — stories surface at the topic level only. New areas can be added per-topic without schema changes.

### How areas render on each platform

| Platform | How areas appear | Filterable? |
|---|---|---|
| **Hub — topic page** | Filter chips below the topic header | Yes — client-side, instant |
| **Hub — story card** | Small chip next to the topic badge | — |
| **Hub — AI search** | Indexed as a structured facet | Yes — pgvector + metadata filter |
| **Discord — forum post** | Chip in the embed metadata fields | No — Discord search only |
| **Discord — `#announcements` summary** | Same — embed field chip | No |
| **Email** | Body context, not a routing factor | No |

---

## Axis 4 — Lifecycle (system-derived)

Where is this in its life? Not all content goes through every stage. An SOP goes straight to **Reference**. A shutdown story goes **Developing → Resolved**. The lifecycle determines the Hub status badge and the Discord tag.

```
Developing  →  Active  →  Resolved
              (or)
           Action Needed  →  Resolved
              (or)
            Reference (terminal — for evergreen content)
```

| Stage | Meaning | When set |
|---|---|---|
| 🔄 **Developing** | Situation active, updates expected | Default for `Update` content type when `update_count > 1` is anticipated |
| 🟢 **Active** | Current, members should know | Default for one-time `Update`; `Event` while date is in the future |
| ⚡ **Action Needed** | Has a deadline | `Action Needed` content type until deadline passes |
| ✅ **Resolved** | Done, outcome known | Author resolves manually for Update; auto-set when Event/Action deadline passes |
| 📌 **Reference** | Evergreen — consult as needed | Set immediately for `Document` content type; never transitions out |

> **Reference ≠ Resolved.** An MOU is Reference from the moment it's signed — it was never Developing. A shutdown story goes Developing → Resolved, and its associated SOPs remain Reference indefinitely. These are different paths.

### Typical path by content type

| Content Type | Typical path |
|---|---|
| 📰 Update | 🔄 Developing → ✅ Resolved (rolling) — *or* — 🟢 Active → ✅ Resolved (one-time) |
| 📋 Document | → 📌 Reference (immediate) |
| ⚡ Action Needed | ⚡ Action Needed → ✅ Resolved (at deadline) |
| 📅 Event | 🟢 Active → ✅ Resolved (after event date) |

---

## Hub ↔ DMS bridge

Hub **explains and discusses**. DMS **stores and governs**. They link bidirectionally — neither contains the other.

| Hub Story | DMS Document |
|---|---|
| What changed and why it matters | The actual SOP, MOU, or policy PDF |
| Timeline of updates | Versioned, has owner + review date |
| Member discussion | Citeable in grievances |
| Distribution (Discord, email) | Searchable in DMS |

A `Document` content type story always links to one or more DMS documents. Conversely, every DMS document surfaces its related Hub stories. The link is by document ID — not duplicated content.

### Finding things 18 months later

| Search path | Result |
|---|---|
| Search DMS for "long-term hold SOP" | Finds the PDF directly. "Related Stories" links to the Hub story. |
| Search Hub for "long-term hold" | Finds the story. "Related Documents" links to the DMS PDF. |
| Browse Hub → Employee Movement → filter by 📋 Document | Shows all documents in that topic. Click through to the story + PDF. |
| Search Discord `#employee-movement` | Finds the forum post under `TOPICS`. Buttons link to Hub story and DMS. |
| AI search: "what's the rule about LTH at level 12 facilities?" | Surfaces both the Hub story and the DMS document via pgvector. |

---

## Cross-platform flow

Hub is the canonical source. Discord and email are distribution channels. DMS is the document archive.

| Platform | Role | What lives here | Links to |
|---|---|---|---|
| **Hub** | Canonical source | Stories + updates, Tiptap-authored, permanent URL | DMS (related docs), Discord (forum post + announcement summary), Email (campaign) |
| **Discord** | Discussion + notification | Forum channels (one per topic, under `TOPICS`) for full content + thread; `#announcements` (top-level) for org-wide brief summaries | Hub (via buttons on every post) |
| **DMS** | Document archive | Official PDFs — SOPs, MOUs, contract interpretations | Hub (related stories, computed) |
| **Email** | Push delivery (deferred) | Campaigns per topic subscription, digests, alerts | Hub (every email links to the Hub story) |

---

## Examples

### Document — Reference

> 📋 Document · 📌 Reference · **Employee Movement / NCEPT**
>
> **Long-Term Hold (LTH) SOP**
> Updated NCEPT placement procedures. Off-the-boards reduced from 12 to 6 months. New LTH categories in SWB.
>
> 📎 LTH SOP (PDF) — DMS · 📎 CRWG Recommendations — DMS

### Update — Developing (rolling)

> 📰 Update · 🔄 Developing · **Labor Relations**
>
> **FAA Shutdown 2026 — Rolling Coverage**
> Congress negotiating FY2026 CR. NATCA coordinating contingency ops. 12 updates from 4 contributors.
>
> *Started Apr 8 · 7m ago · 12 updates*

### Action Needed

> 📅 Event · ⚡ Action Needed · **Legislative**
>
> **NIW 2026 — Register by April 25**
> Registration closes in 9 days. Contact your RVP office for scholarship information.
>
> [Register Now →]

### Update — Resolved (one-time)

> 📰 Update · ✅ Resolved · **Employee Wellness / Benefits**
>
> **2026 FEHB Open Season — Plan Comparison Posted**
> Benefits committee published the side-by-side comparison for the 2026 plan year. Open Season runs Nov 11 – Dec 9.

### Event — Active

> 📅 Event · 🟢 Active · **Events**
>
> **2026 Communicating For Safety Conference**
> Las Vegas, August 18-20. Early-bird pricing through May 31. Scholarships available.

---

## Authoring quick reference

When publishing a new story, an author makes these decisions in order:

1. **Pick the Content Type** — Update / Document / Action Needed / Event
2. **Pick the Topic** — one of 16
3. **Pick the Area** — only if the topic defines areas, otherwise skip
4. **Write the headline + first update** in Tiptap
5. **(Optional) Toggle Urgent** — pins on Hub, `@here` on Discord, future: full-list email
6. **Publish** — the system derives Lifecycle automatically and fans out to Discord (forum + `#announcements` summary)

The system enforces required vs. optional fields based on the topic's area definition and content type's lifecycle rules.

---

## Source of truth

- **This document** is the human-readable canonical reference for the taxonomy
- **Database** — `updates.topics` table seeds the 16 topics; areas live in a topic config column or a separate small table (decision deferred to migration design)
- **Code** — when types/constants for content types and lifecycle stages exist in TypeScript, they reference this document by section header

When the taxonomy changes, update this document first, then sync the database and code to match.

---

_Last updated: 2026-05-08 · See [ADR 001](architecture/decisions/001-updates-system.md) for decision rationale_
