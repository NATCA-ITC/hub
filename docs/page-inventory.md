# Members Home Page Inventory — Migration Tracker

_Tracks every page from natca.org's authenticated members section and its migration status in Hub._

**Status key:**
- **Done** — Page exists in Hub with content
- **Stub** — Page exists in Hub as placeholder/shell
- **DMS** — Content will be embedded from DMS when ready
- **Updates** — Content moves to Updates system (deferred)
- **Deferred** — Not yet planned for Hub
- **N/A** — Not migrating (legacy, test, or one-off)

## Events & Conferences

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| Events (parent) | `/events/` | `/events` | Stub |
| Calendar | `/calendar/` | `/events` | Stub — awaiting Trumba |
| NATCA in Washington | `/niw/` | `/events/niw` | Stub |
| Convention | `/convention/` | `/events/convention` | Stub |
| CFS | `/cfs/` | `/events/cfs` | Stub |
| ATX | — | `/events/atx` | Stub |
| NIW Video Library (2006–2025) | `/natca-in-washington-*-video-library/` | — | Deferred (10 archive pages) |
| CFS Registration forms | `/natca-members-cfs-*-registration/` | — | N/A (ephemeral forms) |
| Convention Subsidy | `/convention-subsidy/` | — | Deferred |

## Employee Movement

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| NCEPT | `/ncept/` | `/employee-movement/ncept` | **Done** — real content + documents |
| Seniority | `/seniority/` | — | Deferred |
| NCEPT Selection/Priority Lists | various | `/employee-movement/ncept#placement-lists` | **Done** — document links |
| Hardship | (within NCEPT/NEB content) | `/employee-movement/hardship` | **Done** — process + Article 99 |
| SSR | (within NCEPT content) | `/employee-movement/ssr` | **Done** — metrics table |
| NEST | (referenced in NEB minutes) | `/employee-movement/nest` | Stub |

## Legislative & Political

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| NATCA PAC | `/natca-political-action-committee-pac/` | `/legislative/pac` | Stub + Hatch Act gate |
| House Counts | `/house-natca-counts/` | `/legislative/house` | Stub — awaiting MyNATCA automation |
| Senate Counts | `/senate-natca-counts/` | `/legislative/senate` | Stub — awaiting MyNATCA automation |
| Voter Center | `/vote/` | `/legislative/resources` | Stub |
| Congressional District List | `/2020-congressional-district-list/` | `/legislative/resources` | Stub |
| NLC Advocacy Tutorial | `/nlc-how-to-effectively-advocate/` | `/legislative/resources` | Stub |
| Hatch Act Warning | `/hatch-act-warning-pac-form/` | `/legislative/pac` | **Done** — integrated as gate |

## Safety & Technology

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| Safety overview | — | `/safety` | Stub — program cards |
| VSRP | `/vsrp/` | `/safety` | Stub (card) |
| Partnership for Safety | `/partnership-for-safety-pfs/` | `/safety` | Stub (card) |
| Safety Management Systems | `/safety-management-systems-sms/` | `/safety` | Stub (card) |
| Runway Safety | `/runway-safety/` | `/safety` | Stub (card) |
| Human Performance | `/human-performance/` | `/safety` | Stub (card) |
| Aircraft Certification | `/aircraft-certification/` | `/safety` | Stub (card) |
| Safety Advocacy Training | `/safety-advocacy-training/` | `/safety/training` | Stub |
| Safety Advocacy Training sub-pages (8) | `/safety-advocacy-training-*/` | `/safety/training` | Stub |
| Safety Article Archive | `/safety-technology-articles/` | `/safety/articles` | Stub → Updates |
| Stand for Safety | `/stand-for-safety/` | — | Deferred |
| SurfaceWatch | `/surfacewatch/` | — | Deferred |
| Region X Safety | `/region-x-safety/` | — | Deferred |
| SASR (QA/QC) | `/qaqc/` | — | Deferred |

## Topics

_New surface added 2026-05-06 from Nick's council-structure draft. Each topic mirrors a Discord channel under the TOPICS category. Source data: `src/data/topics.ts`._

| Topic | Slug | Hub Route | Status |
|---|---|---|---|
| Topics directory | — | `/topics` | **Stub** — searchable, grouped by type (council / standing / cross-cutting) |
| Per-topic pages (18) | various | `/topics/:slug` | **Stub** — leads + committees rendered, updates/docs/Discord placeholders |
| Training & Education Council | `training-education` | `/topics/training-education` | Stub |
| Employee Wellness Council | `employee-wellness` | `/topics/employee-wellness` | Stub |
| Representation & Advocacy Council | `representation-advocacy` | `/topics/representation-advocacy` | Stub |
| Collaboration & Professionalism Council | `collaboration-professionalism` | `/topics/collaboration-professionalism` | Stub |
| Safety & Technology Council | `safety-technology` | `/topics/safety-technology` | Stub |
| Employee Movement Council | `employee-movement` | `/topics/employee-movement` | Stub |
| Facility Issues Council | `facility-issues` | `/topics/facility-issues` | Stub |
| Metrics Council | `metrics` | `/topics/metrics` | Stub |
| Membership Services Council | `membership-services` | `/topics/membership-services` | Stub |
| Finance (Standing) | `finance` | `/topics/finance` | Stub |
| Organizing (Standing) | `organizing` | `/topics/organizing` | Stub |
| Legislative Committee (Standing) | `legislative-committee` | `/topics/legislative-committee` | Stub |
| Safety Committee (Standing) | `safety-committee` | `/topics/safety-committee` | Stub |
| Constitution (Standing) | `constitution` | `/topics/constitution` | Stub |
| National (Cross-cutting) | `national` | `/topics/national` | Stub |
| Legislative (Cross-cutting) | `legislative` | `/topics/legislative` | Stub |
| Events (Cross-cutting) | `events` | `/topics/events` | Stub |
| Labor Relations (Cross-cutting) | `labor-relations` | `/topics/labor-relations` | Stub |

## Committees

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| Committee directory | — | `/committees` | **Done** — searchable, 26 committees |
| Per-committee pages (26) | `/asi/`, `/nbc/`, etc. | `/committees/:slug` | **Done** — template with placeholders |
| Committee member listings | (via block) | `/committees/:slug` | Stub — awaiting MyNATCA API |

## Regions

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| Regions directory | `/regions/` | `/regions` | **Done** — 10 region cards |
| Per-region pages (10) | `/nal/`, `/nce/`, etc. | `/regions/:code` | Stub — facility type-ahead added |
| Region-specific content (RVP Message, Member Focus, etc.) | (via tags) | — | Updates system |

## Facility Dashboards

| Feature | Source | Hub Route | Status |
|---|---|---|---|
| Facility browser | MyNATCA portal | `/facilities` | Exists (built out) |
| Facility dashboard | MyNATCA portal | `/facilities/:code` | Stub — info, reps, NCEPT, files |
| Facility type-ahead nav | New | Region + facility pages | **Done** |

## Resources (DMS-embedded)

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| Contracts & MOUs | `/contracts-mous/` | `/resources/contracts` | Stub — DMS |
| 2025 Indigo Book | `/2025-indigo-book/` | `/resources/contracts` | Stub — DMS |
| 2016 Slate Book | `/2016-slate-book/` | `/resources/contracts` | Stub — DMS |
| 2013 Purple Book | `/2013-purple-book/` | `/resources/contracts` | Stub — DMS |
| 2011 Light Blue Book | `/2011-light-blue-book/` | `/resources/contracts` | Stub — DMS |
| FCT Contracts (3) | `/fct-contracts/` + children | `/resources/contracts` | Stub — DMS |
| DoD Contracts (3) | `/dod-contracts/` + children | `/resources/contracts` | Stub — DMS |
| Docs & Forms | `/forms/` | `/resources/docs` | Stub — DMS |
| Constitution | `/constitution/` | `/resources/constitution` | Stub — DMS |
| NEB Minutes | `/neb-minutes/` | `/resources/neb-minutes` | Stub — DMS |
| Newsletters | `/newsletters/` | `/resources/newsletters` | Stub — DMS |
| OPM Email Templates (15) | `/opm-email-templates*/` | — | Deferred (single page with selector) |
| Committee Charters | `/charters/` | — | DMS |

## Training

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| NATCA Academy | `/academy/` | `/training` | Stub (card) |
| Training | `/training/` | `/training` | Stub (card) |
| NTI | `/nti/` | `/training` | Stub (card) |
| Concur Travel Training | `/concur-travel-expense-training/` | `/training` | Stub (card) |

## Content Feeds (Updates system — deferred)

| WordPress Category | Hub Mapping | Status |
|---|---|---|
| Program Updates (cat 2115) | Updates system — all topics | Deferred |
| Local & Regional News (cat 12) | Updates filtered by region/area | Deferred |
| Committee News (cat 242) | Updates filtered by committee | Deferred |
| Labor Relations (cat 2117) | Working Conditions topic | Deferred |
| Government Affairs (cat 2180) | Legislative topic | Deferred |
| Safety & Technology (cat 2116) | Safety topic | Deferred |
| National Update Videos | `/national-update-videos/` | Deferred |
| Weekly Member Update | `/weekly-update/` | Deferred |

## Member Services

| WordPress Page | Slug | Hub Route | Status |
|---|---|---|---|
| Account | `/account/` | — | Handled by Platform/Auth0 |
| Profile | `/profile/` | `/profile` | Exists (built out) |
| Email Support | `/email-support/` | — | Deferred |
| Support | `/support/` | — | Deferred |
| FacRep Resources | `/facrep-resources/` | — | Deferred |
| NATCA Map | `/natca-map/` | — | Deferred |
| Directory | `/directory/` | — | Deferred (large feature) |
| Activism | `/activism/` | — | Deferred |
| Members in Need (VLTP) | `/members-in-need-vltp/` | — | Deferred |

## Not Migrating

| WordPress Page | Why |
|---|---|
| Block Test, test pages | Dev artifacts |
| COVID-19 Resources | Outdated |
| Shutdown Resources | Outdated |
| Solicitation Test | Dev artifact |
| Various one-off registration forms | Ephemeral |
| Calendar Photo Submission | One-off form |
| Raffle forms | One-off |
| Surveys | One-off |
| Practice Form Test | Dev artifact |

## Summary

| Status | Count |
|---|---|
| **Done** (real content) | ~10 pages |
| **Stub** (shell/placeholder) | ~35 pages |
| **DMS** (awaiting embed) | ~15 pages |
| **Updates** (deferred to Updates system) | ~8 categories |
| **Deferred** | ~20 pages |
| **N/A** (not migrating) | ~15 pages |
