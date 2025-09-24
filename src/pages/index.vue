<template>
  <div>
    <!-- Top Row - 3 Columns -->
    <VRow dense>
      <!-- Left Column -->
      <VCol cols="12" md="4">
        <VCard>
          <VCardTitle>
            <VIcon icon="mdi-view-dashboard" class="me-2" />
            Welcome to MyNATCA Hub
          </VCardTitle>
          <VCardText>
            <div v-if="isLoading" class="text-center">
              <VProgressCircular indeterminate color="primary" />
              <p class="mt-2">Loading your profile...</p>
            </div>
            <div v-else-if="isAuthenticated">
              <VAlert type="success" class="mb-3" density="compact">
                Welcome back, {{ user?.name }}!
              </VAlert>
              <div v-if="memberNumber">
                <p class="mb-1"><strong>Member Number:</strong> {{ memberNumber }}</p>
                <p class="mb-1"><strong>Status:</strong> {{ memberStore.memberTypeName || 'Loading...' }}</p>
                <p class="mb-1"><strong>Region:</strong> {{ memberStore.regionName }}</p>
                <p class="mb-0"><strong>Facility:</strong> {{ memberStore.facilityName }}</p>
              </div>
            </div>
            <div v-else>
              <div class="text-center">
                <VIcon icon="mdi-view-dashboard" size="96" color="primary" class="mb-4" />
                <h1 class="text-h3 mb-4">Welcome to MyNATCA Hub</h1>
                <p class="text-h6 text-medium-emphasis mb-6">
                  Your centralized portal for member services, facility management, and platform administration.
                </p>
                <VAlert type="info" class="mb-6" variant="tonal">
                  Please log in to access your MyNATCA Hub dashboard.
                </VAlert>
                <VBtn
                  color="primary"
                  size="large"
                  @click="login"
                  class="px-8"
                >
                  <VIcon icon="mdi-login" class="me-2" />
                  Log In with Auth0
                </VBtn>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Center Column -->
      <VCol cols="12" md="4">
        <div class="d-flex flex-column ga-3">
          <!-- Current Positions Card -->
          <VCard>
            <VCardTitle>
              <VIcon icon="mdi-briefcase" class="me-2" />
              Current Positions
            </VCardTitle>
            <VCardText>
              <div v-if="isAuthenticated && positions.length > 0">
                <VChip
                  v-for="position in positions"
                  :key="position"
                  class="me-1 mb-1"
                  color="primary"
                  size="small"
                  variant="flat"
                >
                  {{ position }}
                </VChip>
                <div class="mt-3">
                  <p class="mb-1 text-caption">
                    <strong>Primary Facility:</strong>
                    <span v-if="memberStore.loading">Loading...</span>
                    <span v-else>{{ memberStore.facilityName }} ({{ memberStore.facilityCode }})</span>
                  </p>
                  <p class="mb-0 text-caption">
                    <strong>Region:</strong>
                    <span v-if="memberStore.loading">Loading...</span>
                    <span v-else>{{ memberStore.regionName }}</span>
                  </p>
                </div>
              </div>
              <p v-else-if="isAuthenticated" class="text-medium-emphasis">
                No positions assigned
              </p>
              <div v-else class="text-medium-emphasis">
                Login to view positions
              </div>
            </VCardText>
          </VCard>

          <!-- Member Updates Card -->
          <VCard v-if="isAuthenticated">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="mdi-bell" class="me-2" />
              Member Updates
            </VCardTitle>
            <VCardText>
              <div v-if="memberUpdates.length > 0" class="d-flex flex-column">
                <div
                  v-for="(update, index) in memberUpdates.slice(0, 5)"
                  :key="update.id"
                  class="d-flex align-center justify-space-between py-1"
                >
                  <div class="flex-grow-1">
                    <span class="text-body-2">{{ update.title }}</span>
                    <span class="text-caption text-medium-emphasis ms-2">({{ formatUpdateDate(update.date) }})</span>
                  </div>
                  <VBtn
                    icon
                    variant="text"
                    size="x-small"
                    @click="viewUpdateDetails(update)"
                  >
                    <VIcon icon="mdi-eye" size="16" />
                  </VBtn>
                </div>
              </div>
              <div v-else class="text-center py-3">
                <VIcon icon="mdi-bell-off" size="48" class="text-medium-emphasis mb-2" />
                <p class="text-body-2 text-medium-emphasis">No recent updates</p>
              </div>
            </VCardText>
          </VCard>
        </div>
      </VCol>

      <!-- Right Column - User Profile -->
      <VCol cols="12" md="4">
        <div class="d-flex flex-column ga-3">
          <!-- User Profile Card -->
          <VCard>
            <VCardTitle class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <span class="text-subtitle-1 me-2">{{ user?.name || 'User Profile' }}</span>
                <span
                  v-if="isAuthenticated"
                  class="text-body-2 font-weight-bold text-uppercase"
                >
                  <span v-if="memberStore.loading">Loading...</span>
                  <span v-else>{{ memberStore.regionCode }} | {{ memberStore.facilityCode }}</span>
                </span>
              </div>
              <VMenu v-if="isAuthenticated">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    icon
                    variant="text"
                    size="small"
                  >
                    <VIcon icon="mdi-dots-vertical" />
                  </VBtn>
                </template>
                <VList density="compact">
                  <VListItem @click="openMyNATCA">
                    <template #prepend>
                      <VAvatar size="20" class="me-1">
                        <VImg src="/src/assets/images/natca/myNATCA-dark-logo.png" />
                      </VAvatar>
                    </template>
                    <VListItemTitle>MyNATCA Portal</VListItemTitle>
                  </VListItem>
                  <VListItem @click="resetPassword">
                    <template #prepend>
                      <VIcon icon="mdi-lock" />
                    </template>
                    <VListItemTitle>Reset Password</VListItemTitle>
                  </VListItem>
                  <VListItem @click="logout">
                    <template #prepend>
                      <VIcon icon="mdi-logout" />
                    </template>
                    <VListItemTitle>Logout</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VCardTitle>
            <VCardText>
              <div v-if="isAuthenticated">
                <div class="mb-0">
                  <p class="mb-1 text-caption">
                    <strong>Username: </strong>
                    <span v-if="memberStore.loading">Loading...</span>
                    <span v-else>{{ memberStore.username || user?.email?.split('@')[0] || 'N/A' }}</span>
                  </p>
                  <!-- Email Addresses -->
                  <div class="mb-2">
                    <p class="text-caption mb-1"><strong>Email Addresses:</strong></p>
                    <div v-if="mynatcaLoading" class="text-caption text-medium-emphasis">
                      Loading...
                    </div>
                    <div v-else-if="mynatcaData?.emails?.length > 0" class="d-flex flex-column ga-1">
                      <div
                        v-for="email in mynatcaData.emails"
                        :key="email.id"
                        class="d-flex align-center text-caption"
                      >
                        <VIcon
                          v-if="email.isprimary"
                          icon="mdi-star"
                          size="12"
                          color="warning"
                          class="me-1"
                        />
                        <VIcon
                          v-else
                          icon="mdi-star-outline"
                          size="12"
                          color="grey"
                          class="me-1"
                        />
                        <span>{{ email.emailaddress }}</span>
                      </div>
                    </div>
                    <div v-else class="text-caption text-medium-emphasis">
                      {{ user?.email || 'N/A' }}
                    </div>
                  </div>

                  <!-- Phone Numbers -->
                  <div class="mb-2">
                    <p class="text-caption mb-1"><strong>Phone Numbers:</strong></p>
                    <div v-if="mynatcaLoading" class="text-caption text-medium-emphasis">
                      Loading...
                    </div>
                    <div v-else-if="mynatcaData?.phonenumbers?.length > 0" class="d-flex flex-column ga-1">
                      <div
                        v-for="phone in mynatcaData.phonenumbers"
                        :key="phone.id"
                        class="d-flex align-center text-caption"
                      >
                        <VIcon
                          v-if="phone.isprimary"
                          icon="mdi-star"
                          size="12"
                          color="warning"
                          class="me-1"
                        />
                        <VIcon
                          v-else
                          icon="mdi-star-outline"
                          size="12"
                          color="grey"
                          class="me-1"
                        />
                        <span>{{ phone.phonenumber }}</span>
                        <span v-if="phone.type" class="text-medium-emphasis ms-1">({{ phone.type }})</span>
                      </div>
                    </div>
                    <div v-else class="text-caption text-medium-emphasis">
                      N/A
                    </div>
                  </div>
                  <p class="mb-1 text-caption">
                    <strong>MyNATCA Status:</strong>
                    <span v-if="mynatcaLoading">Loading...</span>
                    <span v-else-if="mynatcaError" class="text-error">{{ mynatcaError }}</span>
                    <span v-else-if="mynatcaData" class="text-success">Connected</span>
                    <span v-else class="text-warning">Not connected</span>
                  </p>
                  <div class="mb-0 text-caption d-flex align-center">
                    <strong class="me-2">Calendar Service:</strong>
                    <div class="d-flex align-center">
                      <VChip
                        size="x-small"
                        color="info"
                        variant="outlined"
                        class="text-caption"
                      >
                        <VIcon icon="mdi-api" size="12" class="me-1" />
                        External API Integration
                      </VChip>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-medium-emphasis">
                Login to view profile
              </div>
            </VCardText>
          </VCard>

          <!-- Bearer Token Display Test -->
          <VCard v-if="isAuthenticated" variant="outlined">
            <VCardTitle class="text-h6">Bearer Token</VCardTitle>
            <VCardText>
              <p><strong>Token Available:</strong> {{ !!accessToken }}</p>
              <p><strong>Token Length:</strong> {{ accessToken?.length || 0 }} characters</p>
              <div v-if="accessToken">
                <p><strong>Token Preview:</strong></p>
                <pre class="text-caption">{{ accessToken.substring(0, 100) }}...</pre>
              </div>
            </VCardText>
          </VCard>
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
                  @click="$router.push('/profile')"
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
                  @click="$router.push('/facilities')"
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
                  @click="$router.push('/analytics')"
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
                  @click="$router.push('/infrastructure')"
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
// Using Auth0 integration
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const {
  user,
  isAuthenticated,
  isLoading,
  memberNumber,
  positions,
  accessToken,
  idToken,
  login,
  logout
} = useAuth0()

// Use member store for Supabase data
const memberStore = useMemberStore()

// Configure MyNATCA API service with Auth0 token provider
memberStore.setupAuthTokenProvider(() => accessToken.value)

// MyNATCA API data
const mynatcaData = ref(null)
const mynatcaLoading = ref(false)
const mynatcaError = ref(null)

// Function to fetch MyNATCA member data
const fetchMyNATCAData = async (natcaId, idToken) => {
  console.log('🔍 fetchMyNATCAData called with:', { natcaId, hasIdToken: !!idToken })

  if (!natcaId || !idToken) {
    console.warn('⚠️ Missing natcaId or idToken for MyNATCA API call')
    return
  }

  mynatcaLoading.value = true
  mynatcaError.value = null

  try {
    console.log('🚀 Fetching MyNATCA data for NATCA ID:', natcaId)
    console.log('🔑 Using ID token:', idToken.substring(0, 50) + '...')

    const response = await fetch(`/api/Member/${natcaId}`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 MyNATCA API response status:', response.status)

    if (!response.ok) {
      throw new Error(`MyNATCA API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    mynatcaData.value = data
    console.log('✅ MyNATCA data fetched:', data)
  } catch (error) {
    console.error('❌ Failed to fetch MyNATCA data:', error)
    mynatcaError.value = error.message
  } finally {
    mynatcaLoading.value = false
  }
}

// Watch for authentication and member number changes to fetch member data
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

      // Only fetch from MyNATCA API using the ID token you specified
      if (natcaId) {
      // Fetch from both Supabase and MyNATCA API
      await memberStore.fetchMemberData(memberNumber.value, natcaId)

        await fetchMyNATCAData(natcaId, idToken.value)
      }
    } catch (error) {
      console.error('❌ Failed to fetch member data:', error)
    }
  } else {
    console.log('🧹 Clearing member data')
    mynatcaData.value = null
    mynatcaError.value = null
  }
}, { immediate: true })

// Modal state
const updateDetailsDialog = ref(false)
const selectedUpdate = ref(null)

// Mock member updates data
const memberUpdates = ref([
  {
    id: '1',
    title: 'New CBA Ratification Results',
    date: new Date('2024-09-15'),
    category: 'Bargaining',
    summary: 'The collective bargaining agreement has been ratified by membership vote.',
    content: 'Details about the CBA ratification process and key changes...'
  },
  {
    id: '2',
    title: 'Updated Training Requirements',
    date: new Date('2024-09-12'),
    category: 'Training',
    summary: 'New training modules are now required for all facility representatives.',
    content: 'Information about new training requirements and deadlines...'
  },
  {
    id: '3',
    title: 'Regional Meeting Schedule',
    date: new Date('2024-09-10'),
    category: 'Events',
    summary: 'Upcoming regional meetings and town halls scheduled for October.',
    content: 'Schedule and details for upcoming regional meetings...'
  },
  {
    id: '4',
    title: 'Safety Alert: Weather Procedures',
    date: new Date('2024-09-08'),
    category: 'Safety',
    summary: 'Updated weather-related operational procedures for fall season.',
    content: 'Detailed weather procedure updates and safety guidelines...'
  },
  {
    id: '5',
    title: 'Member Benefits Update',
    date: new Date('2024-09-05'),
    category: 'Benefits',
    summary: 'Changes to health insurance options and retirement benefits.',
    content: 'Comprehensive overview of benefit changes effective October 1st...'
  }
])

const openMyNATCA = () => {
  window.open('https://my.natca.org', '_blank')
}

const resetPassword = () => {
  console.log('Reset password clicked')
  // TODO: Implement password reset functionality
}

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