<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex align-center justify-center" style="min-height: 80vh;">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- Landing Page for non-authenticated users -->
    <div v-else-if="!isAuthenticated" class="d-flex align-center justify-center" style="min-height: 80vh;">
      <VCard max-width="500" class="pa-8 text-center">
        <VImg
          src="/src/assets/images/natca/myNATCA-dark-logo.png"
          max-width="180"
          class="mx-auto mb-6"
        />
        <h1 class="text-h4 mb-3">MyNATCA Hub</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Your central dashboard for member services and resources
        </p>
        <VBtn
          color="primary"
          size="large"
          @click="login()"
        >
          <VIcon icon="mdi-login" start />
          Sign In
        </VBtn>
      </VCard>
    </div>

    <!-- Dashboard for authenticated users -->
    <!-- Top Row - 3 Columns -->
    <VRow v-else dense>
      <!-- Left Column -->
      <VCol cols="12" md="4">
        <div class="d-flex flex-column ga-3">
          <WelcomeCard />
          <RackspaceEmailCard />
        </div>
      </VCol>

      <!-- Center Column -->
      <VCol cols="12" md="4">
        <div class="d-flex flex-column ga-3">
          <PositionsCard />
          <MemberUpdatesCard @view-update-details="viewUpdateDetails" />
        </div>
      </VCol>

      <!-- Right Column - User Profile -->
      <VCol cols="12" md="4">
        <div class="d-flex flex-column ga-3">
          <ProfileCard />
        </div>
      </VCol>
    </VRow>

    <!-- Quick Actions -->
    <VRow v-if="isAuthenticated" class="mt-4">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="mdi-flash" class="me-2" />
            Quick Actions
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12" sm="6" md="3">
                <VCard
                  variant="outlined"
                  class="text-center pa-4"
                  hover
                  @click="router.push('/profile')"
                >
                  <VIcon icon="mdi-account-edit" size="48" color="primary" />
                  <h4 class="mt-2">Edit Profile</h4>
                  <p class="text-medium-emphasis">Update your information</p>
                </VCard>
              </VCol>
              <VCol cols="12" sm="6" md="3">
                <VCard
                  variant="outlined"
                  class="text-center pa-4"
                  hover
                  @click="router.push('/facilities')"
                >
                  <VIcon icon="mdi-office-building" size="48" color="success" />
                  <h4 class="mt-2">Facilities</h4>
                  <p class="text-medium-emphasis">View facility information</p>
                </VCard>
              </VCol>
              <VCol cols="12" sm="6" md="3">
                <VCard
                  variant="outlined"
                  class="text-center pa-4"
                  hover
                  @click="router.push('/analytics')"
                >
                  <VIcon icon="mdi-chart-line" size="48" color="info" />
                  <h4 class="mt-2">Analytics</h4>
                  <p class="text-medium-emphasis">Member statistics</p>
                </VCard>
              </VCol>
              <VCol cols="12" sm="6" md="3">
                <VCard
                  variant="outlined"
                  class="text-center pa-4"
                  hover
                  @click="router.push('/infrastructure')"
                >
                  <VIcon icon="mdi-server" size="48" color="warning" />
                  <h4 class="mt-2">Infrastructure</h4>
                  <p class="text-medium-emphasis">Server monitoring</p>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Member Update Details Modal -->
    <VDialog
      v-model="updateDetailsDialog"
      max-width="600"
    >
      <VCard v-if="selectedUpdate">
        <VCardTitle class="d-flex align-center">
          <VIcon icon="mdi-bell" class="me-2" />
          {{ selectedUpdate.title }}
        </VCardTitle>
        <VCardText>
          <div class="mb-3">
            <VChip
              :color="getCategoryColor(selectedUpdate.category)"
              size="small"
              variant="flat"
              class="mb-2"
            >
              {{ selectedUpdate.category }}
            </VChip>
            <p class="text-caption text-medium-emphasis">
              {{ formatUpdateDate(selectedUpdate.date) }}
            </p>
          </div>
          <div class="mb-3">
            <p class="text-body-2"><strong>Summary:</strong></p>
            <p class="text-body-1">{{ selectedUpdate.summary }}</p>
          </div>
          <div>
            <p class="text-body-2"><strong>Details:</strong></p>
            <p class="text-body-1">{{ selectedUpdate.content }}</p>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="updateDetailsDialog = false">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
// Using Auth0 integration
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const router = useRouter()
// Dashboard components
import WelcomeCard from '@/components/dashboard/WelcomeCard.vue'
import PositionsCard from '@/components/dashboard/PositionsCard.vue'
import MemberUpdatesCard from '@/components/dashboard/MemberUpdatesCard.vue'
import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import RackspaceEmailCard from '@/components/dashboard/RackspaceEmailCard.vue'

const {
  isLoading,
  isAuthenticated,
  accessToken,
  login
} = useAuth0()

// Use member store for Supabase data
const memberStore = useMemberStore()

// Configure MyNATCA API service with Auth0 token provider
memberStore.setupAuthTokenProvider(() => accessToken.value)

// Watch for authentication changes to fetch member data
const { memberNumber } = useAuth0()
watch([isAuthenticated, memberNumber], async () => {
  console.log('🔍 Auth/Member watch triggered:', {
    isAuthenticated: isAuthenticated.value,
    memberNumber: memberNumber.value
  })

  if (isAuthenticated.value && memberNumber.value) {
    try {
      console.log('🚀 Fetching member data for:', memberNumber.value)

      // Get natcaId and ID token from Auth0 composable
      const { memberProfile } = useAuth0()
      const natcaId = memberProfile.value?.natcaId

      console.log('🆔 NATCA ID from token:', natcaId)

      // Fetch from both Supabase and MyNATCA API
      if (natcaId) {
        await memberStore.fetchMemberData(memberNumber.value, natcaId)
      }
    } catch (error) {
      console.error('❌ Failed to fetch member data:', error)
    }
  }
}, { immediate: true })

// Modal state
const updateDetailsDialog = ref(false)
const selectedUpdate = ref(null)


const viewUpdateDetails = (update: any) => {
  selectedUpdate.value = update
  updateDetailsDialog.value = true
}

const formatUpdateDate = (date: Date) => {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Bargaining':
      return 'primary'
    case 'Training':
      return 'info'
    case 'Events':
      return 'success'
    case 'Safety':
      return 'error'
    case 'Benefits':
      return 'warning'
    case 'Operations':
      return 'secondary'
    default:
      return 'default'
  }
}
</script>