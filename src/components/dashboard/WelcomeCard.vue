<template>
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
            @click="() => login()"
            class="px-8"
          >
            <VIcon icon="mdi-login" class="me-2" />
            Log In with Auth0
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { user, isAuthenticated, isLoading, memberNumber, login } = useAuth0()
const memberStore = useMemberStore()
</script>