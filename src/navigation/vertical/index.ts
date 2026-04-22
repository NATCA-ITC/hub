import type { NatcaTab, NatcaNavSection } from '@natca-itc/ui-shell'

// Hub tab navigation — top-level member portal sections
export const hubTabs: NatcaTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { id: 'events', label: 'Events', icon: 'mdi-calendar-star', to: '/events' },
  { id: 'movement', label: 'Movement', icon: 'mdi-swap-horizontal-bold', to: '/employee-movement' },
  { id: 'legislative', label: 'Legislative', icon: 'mdi-bank', to: '/legislative' },
  { id: 'safety', label: 'Safety', icon: 'mdi-shield-check', to: '/safety' },
  { id: 'committees', label: 'Committees', icon: 'mdi-account-group', to: '/committees' },
  { id: 'regions', label: 'Regions', icon: 'mdi-map-marker-radius', to: '/regions' },
  { id: 'resources', label: 'Resources', icon: 'mdi-file-document-multiple', to: '/resources' },
]

// Sidebar sections — contextual sub-navigation per active tab
// The shell uses longest-prefix matching for active state detection

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
