import type { NatcaTab } from '@natca-itc/ui-shell'

// Hub tab navigation — used by the NATCA shell
export const hubTabs: NatcaTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { id: 'members', label: 'Members', icon: 'mdi-account-group', to: '/profile' },
  { id: 'facilities', label: 'Facilities', icon: 'mdi-office-building', to: '/facilities' },
  { id: 'analytics', label: 'Analytics', icon: 'mdi-chart-line', to: '/analytics' },
  { id: 'infrastructure', label: 'Infrastructure', icon: 'mdi-server', to: '/infrastructure' },
]

export default hubTabs
