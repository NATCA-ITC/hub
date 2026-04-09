<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NatcaShell } from '@natca-itc/ui-shell'
import type { NatcaTab, NatcaNavSection, NatcaBreadcrumb, NatcaApp, NatcaUser } from '@natca-itc/ui-shell'
import { useAuth0 } from '@/composables/useAuth0'

const route = useRoute()
const router = useRouter()
const { memberProfile, logout } = useAuth0()

// Hub tabs — top-level navigation
const hubTabs: NatcaTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { id: 'members', label: 'Members', icon: 'mdi-account-group', to: '/profile' },
  { id: 'facilities', label: 'Facilities', icon: 'mdi-office-building', to: '/facilities' },
  { id: 'analytics', label: 'Analytics', icon: 'mdi-chart-line', to: '/analytics' },
  { id: 'infrastructure', label: 'Infrastructure', icon: 'mdi-server', to: '/infrastructure' },
]

// Sidebar sections — tools and utilities
const sidebarSections: NatcaNavSection[] = [
  {
    title: 'Tools',
    items: [
      { id: 'db-explorer', label: 'DB Explorer', icon: 'mdi-database-search', to: '/db-explorer' },
    ],
  },
]

// App switcher
const natcaApps: NatcaApp[] = [
  { id: 'hub', name: 'Hub', url: '/', description: 'Admin Dashboard', icon: 'mdi-view-dashboard' },
  { id: 'bid', name: 'BID', url: 'https://bid.mynatca.org', description: 'Bid Management', icon: 'mdi-file-document' },
  { id: 'dms', name: 'DMS', url: 'https://dms.mynatca.org', description: 'Documents & Logos', icon: 'mdi-folder' },
  { id: 'pay', name: 'PayChecker', url: 'https://pay.mynatca.org', description: 'Pay Verification', icon: 'mdi-currency-usd' },
  { id: 'gats', name: 'GATS', url: 'https://gats.mynatca.org', description: 'Grievance Archive', icon: 'mdi-shield' },
]

// User context from auth
const currentUser = computed<NatcaUser>(() => {
  const profile = memberProfile.value
  const name = profile?.name || 'User'
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    name,
    initials,
    email: profile?.email,
    memberNumber: profile?.memberNumber,
    region: profile?.region,
    facility: profile?.facility,
  }
})

const userFacility = computed(() => memberProfile.value?.facility || '')

// Breadcrumbs from route
const breadcrumbs = computed<NatcaBreadcrumb[]>(() => {
  if (route.meta?.breadcrumbs) {
    return route.meta.breadcrumbs as NatcaBreadcrumb[]
  }

  const crumbs: NatcaBreadcrumb[] = [{ label: 'Hub', to: '/' }]

  if (route.path !== '/') {
    const pageName = route.path.split('/').pop() || ''
    crumbs.push({
      label: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' '),
    })
  }

  return crumbs
})

// Event handlers
const handleProfileAction = (action: string) => {
  switch (action) {
    case 'signout':
      logout()
      break
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      // TODO: settings page
      break
  }
}

const handleSearch = (query: string) => {
  // TODO: implement search
  console.log('Search:', query)
}

const navigateToApp = (app: NatcaApp) => {
  if (app.id === 'hub') {
    router.push('/')
  } else {
    window.location.href = app.url
  }
}
</script>

<template>
  <NatcaShell
    app-id="hub"
    app-name="Hub"
    :tabs="hubTabs"
    :user="currentUser"
    :facility="userFacility"
    :sidebar-sections="sidebarSections"
    :breadcrumbs="breadcrumbs"
    :apps="natcaApps"
    show-search
    show-notifications
    :notification-count="0"
    @profile-action="handleProfileAction"
    @search="handleSearch"
    @app-select="navigateToApp"
  >
    <RouterView />
  </NatcaShell>
</template>
