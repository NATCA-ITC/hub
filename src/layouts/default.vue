<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NatcaShell } from '@natca-itc/ui-shell'
import type { NatcaTab, NatcaNavSection, NatcaBreadcrumb, NatcaApp, NatcaUser } from '@natca-itc/ui-shell'
import { useAuth0 } from '@/composables/useAuth0'

const route = useRoute()
const router = useRouter()
const { memberProfile, isAuthenticated, logout } = useAuth0()

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
  const crumbs: NatcaBreadcrumb[] = [{ label: 'Hub', to: '/' }]

  if (route.meta?.breadcrumbs) {
    return route.meta.breadcrumbs as NatcaBreadcrumb[]
  }

  // Auto-generate from route name
  if (route.path !== '/') {
    const pageName = route.path.split('/').pop() || ''
    crumbs.push({
      label: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' '),
    })
  }

  return crumbs
})

// Event handlers
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
    @search="handleSearch"
    @app-select="navigateToApp"
  >
    <template #sidebar-footer>
      <div v-if="isAuthenticated" style="padding: 8px 12px;">
        <button
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 8px;
            border: none;
            background: transparent;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            border-radius: 6px;
            font-size: 13px;
          "
          @click="logout()"
        >
          <VIcon icon="mdi-logout" size="18" />
          Sign Out
        </button>
      </div>
    </template>

    <RouterView />
  </NatcaShell>
</template>
