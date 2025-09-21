<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="mdi-view-dashboard" class="me-2" />
            Welcome to MyNATCA Hub
          </VCardTitle>
          <VCardText>
            <div v-if="isLoading" class="text-center">
              <VProgressCircular indeterminate color="primary" />
              <p class="mt-2">Loading your profile...</p>
            </div>
            <div v-else-if="isAuthenticated">
              <VAlert type="success" class="mb-4">
                Welcome back, {{ user?.name }}!
              </VAlert>
              <VRow>
                <VCol cols="12" md="6">
                  <VCard variant="outlined">
                    <VCardTitle>
                      <VIcon icon="mdi-account" class="me-2" />
                      Member Information
                    </VCardTitle>
                    <VCardText>
                      <div v-if="memberNumber">
                        <p><strong>Member Number:</strong> {{ memberNumber }}</p>
                        <p><strong>Email:</strong> {{ user?.email }}</p>
                        <p><strong>Region:</strong> {{ region || 'Not assigned' }}</p>
                        <p><strong>Facility:</strong> {{ facility || 'Not assigned' }}</p>
                      </div>
                      <VAlert v-else type="warning">
                        No member number found. Please contact support.
                      </VAlert>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="12" md="6">
                  <VCard variant="outlined">
                    <VCardTitle>
                      <VIcon icon="mdi-briefcase" class="me-2" />
                      Positions
                    </VCardTitle>
                    <VCardText>
                      <div v-if="positions.length > 0">
                        <VChip
                          v-for="position in positions"
                          :key="position"
                          class="me-1 mb-1"
                          color="primary"
                          variant="outlined"
                        >
                          {{ position }}
                        </VChip>
                      </div>
                      <p v-else class="text-medium-emphasis">
                        No positions assigned
                      </p>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </div>
            <div v-else>
              <VAlert type="info" class="mb-4">
                Please log in to access your MyNATCA Hub dashboard.
              </VAlert>
              <VBtn
                color="primary"
                size="large"
                @click="login"
              >
                <VIcon icon="mdi-login" class="me-2" />
                Log In with Auth0
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Quick Actions -->
    <VRow v-if="isAuthenticated" class="mt-4">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="mdi-lightning-bolt" class="me-2" />
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
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@/composables/useAuth0'

const {
  user,
  isAuthenticated,
  isLoading,
  memberNumber,
  positions,
  region,
  facility,
  login
} = useAuth0()
</script>