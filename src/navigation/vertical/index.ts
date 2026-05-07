import type { NatcaTab, NatcaNavSection } from '@natca-itc/ui-shell'

// Hub tab navigation — top-level member portal sections
export const hubTabs: NatcaTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { id: 'topics', label: 'Topics', icon: 'mdi-forum', to: '/topics' },
  { id: 'events', label: 'Events', icon: 'mdi-calendar-star', to: '/events' },
  { id: 'movement', label: 'Movement', icon: 'mdi-swap-horizontal-bold', to: '/employee-movement' },
  { id: 'legislative', label: 'Legislative', icon: 'mdi-bank', to: '/legislative' },
  { id: 'safety', label: 'Safety', icon: 'mdi-shield-check', to: '/safety' },
  { id: 'committees', label: 'Committees', icon: 'mdi-account-group', to: '/committees' },
  { id: 'regions', label: 'Regions', icon: 'mdi-map-marker-radius', to: '/regions' },
  { id: 'training', label: 'Training', icon: 'mdi-school', to: '/training' },
  { id: 'resources', label: 'Resources', icon: 'mdi-file-document-multiple', to: '/resources' },
]

// Sidebar sections — contextual sub-navigation per active tab
// The shell uses longest-prefix matching for active state detection

export const topicsSidebar: NatcaNavSection[] = [
  {
    title: 'Topics',
    items: [
      { id: 'topics-all', label: 'All Topics', icon: 'mdi-forum', to: '/topics' },
    ],
  },
  {
    title: 'Councils',
    items: [
      { id: 'topic-training-education', label: 'Training & Education', icon: 'mdi-school-outline', to: '/topics/training-education' },
      { id: 'topic-employee-wellness', label: 'Employee Wellness', icon: 'mdi-heart-pulse', to: '/topics/employee-wellness' },
      { id: 'topic-representation-advocacy', label: 'Representation & Advocacy', icon: 'mdi-account-tie-voice', to: '/topics/representation-advocacy' },
      { id: 'topic-collaboration-professionalism', label: 'Collaboration & Professionalism', icon: 'mdi-handshake-outline', to: '/topics/collaboration-professionalism' },
      { id: 'topic-safety-technology', label: 'Safety & Technology', icon: 'mdi-shield-star-outline', to: '/topics/safety-technology' },
      { id: 'topic-employee-movement', label: 'Employee Movement', icon: 'mdi-swap-horizontal-bold', to: '/topics/employee-movement' },
      { id: 'topic-facility-issues', label: 'Facility Issues', icon: 'mdi-office-building-cog', to: '/topics/facility-issues' },
      { id: 'topic-metrics', label: 'Metrics', icon: 'mdi-chart-box', to: '/topics/metrics' },
      { id: 'topic-membership-services', label: 'Membership Services', icon: 'mdi-card-account-details', to: '/topics/membership-services' },
    ],
  },
  {
    title: 'Standing Committees',
    items: [
      { id: 'topic-finance', label: 'Finance', icon: 'mdi-cash', to: '/topics/finance' },
      { id: 'topic-organizing', label: 'Organizing', icon: 'mdi-account-multiple-plus', to: '/topics/organizing' },
      { id: 'topic-safety-committee', label: 'Safety (Standing)', icon: 'mdi-shield-outline', to: '/topics/safety-committee' },
      { id: 'topic-constitution', label: 'Constitution', icon: 'mdi-gavel', to: '/topics/constitution' },
    ],
  },
  {
    title: 'Cross-Cutting',
    items: [
      { id: 'topic-legislative', label: 'Legislative', icon: 'mdi-bank', to: '/topics/legislative' },
      { id: 'topic-events', label: 'Events', icon: 'mdi-calendar-star', to: '/topics/events' },
      { id: 'topic-labor-relations', label: 'Labor Relations', icon: 'mdi-scale-balance', to: '/topics/labor-relations' },
    ],
  },
]

export const eventsSidebar: NatcaNavSection[] = [
  {
    title: 'Events & Conferences',
    items: [
      { id: 'events-calendar', label: 'Calendar', icon: 'mdi-calendar', to: '/events' },
      { id: 'events-niw', label: 'NATCA in Washington', icon: 'mdi-bank', to: '/events/niw' },
      { id: 'events-cfs', label: 'Communicating for Safety', icon: 'mdi-bullhorn', to: '/events/cfs' },
      { id: 'events-convention', label: 'Convention', icon: 'mdi-account-group', to: '/events/convention' },
      { id: 'events-atx', label: 'ATX', icon: 'mdi-school', to: '/events/atx' },
    ],
  },
]

export const legislativeSidebar: NatcaNavSection[] = [
  {
    title: 'Legislative & Political',
    items: [
      { id: 'leg-overview', label: 'Overview', icon: 'mdi-bank', to: '/legislative' },
      { id: 'leg-pac', label: 'NATCA PAC', icon: 'mdi-hand-heart', to: '/legislative/pac' },
      { id: 'leg-house', label: 'House Counts', icon: 'mdi-account-multiple', to: '/legislative/house' },
      { id: 'leg-senate', label: 'Senate Counts', icon: 'mdi-account-multiple-check', to: '/legislative/senate' },
      { id: 'leg-resources', label: 'Resources', icon: 'mdi-book-open-variant', to: '/legislative/resources' },
    ],
  },
]

export const movementSidebar: NatcaNavSection[] = [
  {
    title: 'Employee Movement',
    items: [
      { id: 'mov-overview', label: 'Overview', icon: 'mdi-swap-horizontal-bold', to: '/employee-movement' },
      { id: 'mov-ncept', label: 'NCEPT', icon: 'mdi-chart-timeline-variant', to: '/employee-movement/ncept' },
      { id: 'mov-hardship', label: 'Hardship', icon: 'mdi-heart-pulse', to: '/employee-movement/hardship' },
      { id: 'mov-ssr', label: 'SSR', icon: 'mdi-clipboard-text-search', to: '/employee-movement/ssr' },
      { id: 'mov-nest', label: 'NEST', icon: 'mdi-swap-horizontal', to: '/employee-movement/nest' },
    ],
  },
]

// NCEPT-specific sidebar with section anchors for in-page navigation
export const nceptSidebar: NatcaNavSection[] = [
  {
    title: 'Employee Movement',
    items: [
      { id: 'mov-overview', label: 'Overview', icon: 'mdi-swap-horizontal-bold', to: '/employee-movement' },
      { id: 'mov-ncept', label: 'NCEPT', icon: 'mdi-chart-timeline-variant', to: '/employee-movement/ncept' },
      { id: 'mov-hardship', label: 'Hardship', icon: 'mdi-heart-pulse', to: '/employee-movement/hardship' },
      { id: 'mov-ssr', label: 'SSR', icon: 'mdi-clipboard-text-search', to: '/employee-movement/ssr' },
      { id: 'mov-nest', label: 'NEST', icon: 'mdi-swap-horizontal', to: '/employee-movement/nest' },
    ],
  },
  {
    title: 'On This Page',
    items: [
      { id: 'ncept-snapshot', label: 'Staffing Snapshot', icon: 'mdi-counter', to: '/employee-movement/ncept#staffing-snapshot' },
      { id: 'ncept-overview', label: 'Staffing Overview', icon: 'mdi-chart-timeline-variant', to: '/employee-movement/ncept#staffing-overview' },
      { id: 'ncept-facility', label: 'Facility Data', icon: 'mdi-office-building', to: '/employee-movement/ncept#facility-data' },
      { id: 'ncept-lists', label: 'Placement Lists', icon: 'mdi-format-list-numbered', to: '/employee-movement/ncept#placement-lists' },
      { id: 'ncept-charts', label: 'Charts & Trends', icon: 'mdi-chart-line', to: '/employee-movement/ncept#charts' },
      { id: 'ncept-err', label: 'ERR Process', icon: 'mdi-file-document-check', to: '/employee-movement/ncept#err-process' },
      { id: 'ncept-resources', label: 'Resources', icon: 'mdi-file-document-multiple', to: '/employee-movement/ncept#resources' },
    ],
  },
]

export const safetySidebar: NatcaNavSection[] = [
  {
    title: 'Safety & Technology',
    items: [
      { id: 'safety-overview', label: 'Overview', icon: 'mdi-shield-check', to: '/safety' },
      { id: 'safety-programs', label: 'Programs', icon: 'mdi-clipboard-check', to: '/safety/programs' },
      { id: 'safety-training', label: 'Training', icon: 'mdi-school', to: '/safety/training' },
      { id: 'safety-articles', label: 'Articles', icon: 'mdi-newspaper', to: '/safety/articles' },
    ],
  },
]

export const resourcesSidebar: NatcaNavSection[] = [
  {
    title: 'Documents & Reference',
    items: [
      { id: 'res-overview', label: 'Overview', icon: 'mdi-file-document-multiple', to: '/resources' },
      { id: 'res-contracts', label: 'Contracts & MOUs', icon: 'mdi-file-sign', to: '/resources/contracts' },
      { id: 'res-docs', label: 'Docs & Forms', icon: 'mdi-folder-open', to: '/resources/docs' },
      { id: 'res-constitution', label: 'Constitution', icon: 'mdi-gavel', to: '/resources/constitution' },
      { id: 'res-neb', label: 'NEB Minutes', icon: 'mdi-clipboard-text', to: '/resources/neb-minutes' },
      { id: 'res-newsletters', label: 'Newsletters', icon: 'mdi-email-newsletter', to: '/resources/newsletters' },
    ],
  },
]

export const facilityDashboardSidebar: NatcaNavSection[] = [
  {
    title: 'Facility Dashboard',
    items: [
      { id: 'fac-info', label: 'Information', icon: 'mdi-office-building', to: '#info' },
      { id: 'fac-reps', label: 'Representatives', icon: 'mdi-account-tie', to: '#representatives' },
      { id: 'fac-ncept', label: 'NCEPT Staffing', icon: 'mdi-chart-timeline-variant', to: '#ncept' },
      { id: 'fac-files', label: 'Documents', icon: 'mdi-folder-open', to: '#files' },
    ],
  },
]

export const adminSidebar: NatcaNavSection[] = [
  {
    title: 'Admin Tools',
    items: [
      { id: 'admin-profile', label: 'Profile', icon: 'mdi-account', to: '/profile' },
      { id: 'admin-facilities', label: 'Facilities', icon: 'mdi-office-building', to: '/facilities' },
      { id: 'admin-db', label: 'DB Explorer', icon: 'mdi-database-search', to: '/db-explorer' },
      { id: 'admin-infra', label: 'Infrastructure', icon: 'mdi-server', to: '/infrastructure' },
    ],
  },
]

export default hubTabs
