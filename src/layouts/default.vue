<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NatcaShell } from '@natca-itc/ui-shell'
import type { NatcaBreadcrumb, NatcaApp, NatcaUser } from '@natca-itc/ui-shell'
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'
import {
  hubTabs,
  eventsSidebar,
  movementSidebar,
  nceptSidebar,
  legislativeSidebar,
  safetySidebar,
  resourcesSidebar,
  adminSidebar,
} from '@/navigation/vertical'

const route = useRoute()
const router = useRouter()
const { memberProfile, logout } = useAuth0()
const memberStore = useMemberStore()

// Contextual sidebar based on active route
const sidebarSections = computed(() => {
  const path = route.path

  if (path.startsWith('/events')) return eventsSidebar
  if (path === '/employee-movement/ncept' || path.startsWith('/employee-movement/ncept#')) return nceptSidebar
  if (path.startsWith('/employee-movement')) return movementSidebar
  if (path.startsWith('/legislative')) return legislativeSidebar
  if (path.startsWith('/safety')) return safetySidebar
  if (path.startsWith('/resources')) return resourcesSidebar

  // Admin-level pages show admin sidebar
  if (
    path.startsWith('/profile')
    || path.startsWith('/facilities')
    || path.startsWith('/db-explorer')
    || path.startsWith('/infrastructure')
    || path.startsWith('/analytics')
  ) {
    return adminSidebar
  }

  // Dashboard, NCEPT, Committees, Regions — no sidebar needed
  return []
})

// App switcher
const natcaApps: NatcaApp[] = [
  { id: 'hub', name: 'Hub', url: '/', description: 'Member Portal', icon: 'mdi-view-dashboard' },
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
    region: memberStore.regionCode || profile?.region,
    facility: memberStore.facilityCode || profile?.facility,
  }
})

const userFacility = computed(() => memberStore.facilityCode || memberProfile.value?.facility || '')

// Breadcrumbs from route
const breadcrumbs = computed<NatcaBreadcrumb[]>(() => {
  if (route.meta?.breadcrumbs) {
    return route.meta.breadcrumbs as NatcaBreadcrumb[]
  }

  const crumbs: NatcaBreadcrumb[] = [{ label: 'Hub', to: '/' }]

  // Build breadcrumbs from path segments
  const segments = route.path.split('/').filter(Boolean)
  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      to: path === route.path ? undefined : path,
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
      break
  }
}

// Scroll to hash anchors within the shell content container
// Vue Router's scrollBehavior targets the window, but our scroll container
// is .natca-shell-content (overflow: auto). Watch for hash changes and
// scroll the correct element.
watch(() => route.hash, async (hash) => {
  if (!hash) return
  await nextTick()
  const el = document.querySelector(hash)
  const container = document.querySelector('.natca-shell-content')
  if (el && container) {
    const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    container.scrollTo({ top, behavior: 'smooth' })
  }
}, { immediate: true })

const handleSearch = (query: string) => {
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
    <div class="pa-6">
      <RouterView />
    </div>
  </NatcaShell>
</template>
