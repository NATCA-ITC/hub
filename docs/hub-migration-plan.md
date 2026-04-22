# Hub Migration Plan — Members Home Replacement

_Working document — structure and page inventory for replacing natca.org/members-home_

## The Big Picture

Hub replaces the authenticated member section of natca.org. The current WordPress site has ~120 private pages, but they collapse into **8 sections** in Hub. Most WordPress "pages" are just static content with embedded PDFs/links — those move to DMS and get embedded in Hub.

## Hub Page Structure

```
/ (Dashboard)
├── /updates/                    ← DEFERRED (Updates system — ADR pending)
├── /events/                     ← Events & Conferences
│   ├── /events/calendar         ← Trumba calendar embed (or native table)
│   ├── /events/niw              ← NATCA in Washington
│   ├── /events/cfs              ← Communicating for Safety
│   ├── /events/convention       ← Convention
│   └── /events/atx              ← ATX
├── /ncept/                      ← NCEPT & Staffing
├── /legislative/                ← Legislative & Political
│   ├── /legislative/pac         ← PAC info
│   ├── /legislative/house       ← House counts (auto-updated from MyNATCA)
│   ├── /legislative/senate      ← Senate counts (auto-updated from MyNATCA)
│   └── /legislative/resources   ← Voter center, advocacy how-to
├── /safety/                     ← Safety & Technology
│   ├── /safety/programs         ← VSRP, PFS, SMS, Runway Safety, etc.
│   ├── /safety/training         ← Safety Advocacy Training
│   └── /safety/articles         ← Article archive (→ Updates system eventually)
├── /committees/                 ← Committee Pages
│   └── /committees/:slug        ← Per-committee page (28 committees)
├── /regions/                    ← Regional Pages
│   └── /regions/:code           ← Per-region page (10 regions)
├── /resources/                  ← Documents & Reference (DMS-embedded)
│   ├── /resources/contracts     ← Contracts & MOUs (DMS embed)
│   ├── /resources/docs          ← Docs & Forms (DMS embed)
│   ├── /resources/constitution  ← Constitution (DMS embed)
│   ├── /resources/neb-minutes   ← NEB Minutes (DMS embed)
│   └── /resources/newsletters   ← Newsletters (DMS embed)
├── /training/                   ← Training & Academy
├── /profile/                    ← EXISTS — member profile
├── /facilities/                 ← EXISTS — facility browser
└── /admin/                      ← EXISTS — db-explorer, infrastructure
```

## Section Breakdown

### 1. DASHBOARD (/)
The landing page. Cards/widgets for quick access:
- Welcome card (EXISTS)
- Updates card (DEFERRED — mock data for now)
- Events card (upcoming events from calendar)
- NCEPT summary card (key staffing metrics)
- Email card (EXISTS — Rackspace)
- Profile card (EXISTS)
- Quick links (most visited, recently visited)

### 2. EVENTS & CONFERENCES (/events/)
**What it replaces:** 15+ WordPress pages (NIW, CFS, Convention, calendar, video libraries)
**Data source:** Trumba calendar (pending access) → Hub events table
**Pages needed:**
- Events listing/calendar page (main)
- NIW page (annual legislative conference — registration, schedule, resources)
- CFS page (annual safety conference)
- Convention page (biennial)
- ATX page
- Video libraries could be sub-sections or embedded media

**Status:** Need Trumba calendar access. Build the page shell now, wire data later.

### 3. NCEPT & STAFFING (/ncept/)
**What it replaces:** WordPress NCEPT page + MyNATCA portal facility dashboard NCEPT section
**Data source:** Currently SQL Server via MyNATCA API. Will need Platform API route.
**Pages needed:**
- NCEPT overview (national metrics, charts)
- Seniority information
- Selection/priority lists (historical data — could be DMS documents)

**Status:** Data exists in MyNATCA backend. Need Platform API endpoint.

### 4. LEGISLATIVE & POLITICAL (/legislative/)
**What it replaces:** PAC page, House/Senate counts, voter center, congressional district list, NLC tutorial
**Data source:** House/Senate counts will be automated from MyNATCA once data model updated. PAC info is mostly static content.
**Pages needed:**
- Legislative overview (main page)
- PAC information
- House counts (auto-updated)
- Senate counts (auto-updated)
- Resources (voter center, advocacy guide, congressional districts)

**Status:** Counts are stale on current site. Will automate once MyNATCA stores the data.

### 5. SAFETY & TECHNOLOGY (/safety/)
**What it replaces:** 15+ WordPress pages (VSRP, PFS, SMS, Runway Safety, Safety Advocacy Training, etc.)
**Data source:** Mostly static content pages with embedded docs/videos.
**Pages needed:**
- Safety overview (programs listing)
- Safety Advocacy Training (sub-pages: about, exercises, library, resources)
- Individual program pages (VSRP, PFS, SMS, etc.) — could be cards on overview
- Article archive (→ moves to Updates system eventually)

**Status:** Mostly static content migration. Low-effort page creation.

### 6. COMMITTEES (/committees/)
**What it replaces:** 28 committee pages under parent category 10150
**Data source:** WordPress content → migrate to DMS or Hub CMS
**Pages needed:**
- Committee directory (listing all 28)
- Per-committee page template showing:
  - Committee description/mission
  - Committee members (from MyNATCA data)
  - Committee news (→ Updates system eventually)
  - Committee documents (DMS embed)

**Status:** Each committee page is mostly static content. Template once, populate 28 times.

### 7. REGIONS (/regions/)
**What it replaces:** 10 region pages (NAL, NCE, NEA, NGL, NNE, NNM, NRX, NSO, NSW, NWP)
**Data source:** Supabase `public.regions` + regional news (Updates system)
**Pages needed:**
- Region directory (map or grid of 10 regions)
- Per-region page template showing:
  - RVP Message
  - Regional leadership
  - Facilities in region (from Supabase)
  - Regional news (→ Updates system eventually)

**Status:** Region pages described as "BAD" on current site. Opportunity to rebuild well.

### 8. RESOURCES (/resources/)
**What it replaces:** Contracts & MOUs, Docs & Forms, Constitution, NEB Minutes, Newsletters, OPM templates
**Data source:** DMS (Document Management System) — embedded in Hub
**Pages needed:**
- Resources overview (category listing)
- Per-category page that embeds DMS document browser
- Contracts: Indigo Book, Slate Book, Purple Book, FCT/DoD contracts
- Docs & Forms: general document repository
- Constitution
- NEB Minutes
- Newsletters
- OPM Email Templates (15 sub-pages — could be a single page with selector)

**Status:** DMS project handles storage. Hub just needs embed/link pages.

## What's NOT Migrating to Hub

| Content | Why | Where It Goes |
|---------|-----|---------------|
| One-off event registrations (CFS 2024 form, etc.) | Ephemeral, form-based | Gravity Forms or new events system |
| Test/demo pages (block-test, solicitation-test, etc.) | Dev artifacts | Delete |
| Video libraries (NIW 2006–2025) | Archive content, 10 pages | Link from Events or embed in DMS |
| COVID-19 / Shutdown resources | Legacy, outdated | Archive or delete |
| Calendar photo submission, raffle forms, surveys | One-off forms | Gravity Forms or dedicated tool |
| Historical convention pages (NHC) | Archive | DMS or static archive |
| OPM Email Templates (15 pages) | Reference documents | Single page with template selector, or DMS |

## Navigation / Menu Structure

**Primary Nav (top tabs in NatcaShell):**
1. Dashboard (home)
2. Events
3. NCEPT
4. Legislative
5. Safety
6. Committees
7. Regions
8. Resources

**Sidebar (admin variant):**
- Profile
- Facilities
- DB Explorer (admin)
- Infrastructure (admin)

**Dashboard Cards:**
- Welcome + profile summary
- Upcoming Events
- NCEPT summary
- Latest Updates (deferred)
- Email management
- Quick links

## Implementation Order

### Phase 1: Page shells + navigation (NOW)
Create the page structure with placeholder content. Get the routing, tabs, and navigation working. Members can browse the skeleton.

- [ ] Add routes for all 8 sections
- [ ] Update NatcaShell tabs to match new nav
- [ ] Create page components with placeholder cards
- [ ] Dashboard cards for Events, NCEPT, Legislative

### Phase 2: Static content pages
Port the low-effort static content — safety programs, committee descriptions, resources links.

- [ ] Safety overview + program sub-pages
- [ ] Committee directory + per-committee template
- [ ] Region directory + per-region template
- [ ] Resources landing + DMS embed pattern

### Phase 3: Data-driven pages
Wire up the pages that need API data.

- [ ] NCEPT (needs Platform API)
- [ ] Legislative counts (needs MyNATCA data model update)
- [ ] Events calendar (needs Trumba access or native table)
- [ ] Region facilities list (Supabase query)

### Phase 4: Updates system (DEFERRED)
- [ ] Accept ADR 001
- [ ] Platform schema + API
- [ ] Hub updates feed, story pages, author tools
- [ ] Replace mock dashboard card with real data
- [ ] Committee/regional news feeds

### Phase 5: DMS integration
- [ ] Embed DMS browser in Resources pages
- [ ] Contracts, Docs & Forms, Constitution, NEB Minutes
- [ ] Committee documents per-committee
