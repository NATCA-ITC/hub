<template>
  <div class="welcome-card">
    <div v-if="isLoading" class="welcome-card__loading">
      <VProgressCircular indeterminate size="32" color="primary" />
    </div>
    <div v-else-if="isAuthenticated" class="welcome-card__content">
      <div class="welcome-card__greeting">
        <h2 class="welcome-card__name">{{ greeting }}, {{ firstName }}</h2>
        <p class="welcome-card__subtitle">{{ memberStore.facilityName || 'NATCA Member' }}</p>
      </div>
      <div class="welcome-card__meta">
        <div v-if="memberNumber" class="welcome-card__badge">
          <VIcon icon="mdi-card-account-details" size="14" />
          <span>#{{ memberNumber }}</span>
        </div>
        <div v-if="memberStore.memberTypeName" class="welcome-card__badge">
          <VIcon icon="mdi-shield-check" size="14" />
          <span>{{ memberStore.memberTypeName }}</span>
        </div>
        <div v-if="memberStore.regionCode" class="welcome-card__badge">
          <VIcon icon="mdi-map-marker" size="14" />
          <span>{{ memberStore.regionCode }}</span>
        </div>
        <div v-if="memberStore.facilityCode" class="welcome-card__badge">
          <VIcon icon="mdi-map-marker-outline" size="14" />
          <span>{{ memberStore.facilityCode }}</span>
        </div>
      </div>
    </div>
    <div v-else class="welcome-card__unauthenticated">
      <h2 class="welcome-card__name">Welcome to Hub</h2>
      <p class="welcome-card__subtitle">Sign in to access your dashboard</p>
      <VBtn color="primary" size="small" class="mt-3" @click="login()">
        <VIcon icon="mdi-login" size="16" start />
        Sign In
      </VBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { user, isAuthenticated, isLoading, memberNumber, login } = useAuth0()
const memberStore = useMemberStore()

const firstName = computed(() => {
  const name = user.value?.name || 'User'
  return name.split(' ')[0]
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, var(--natca-navy, #003366) 0%, #001a33 100%);
  border-radius: var(--radius-default, 6px);
  padding: var(--space-6, 24px);
  color: white;
}

.welcome-card__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-4, 16px);
}

.welcome-card__greeting {
  margin-bottom: var(--space-4, 16px);
}

.welcome-card__name {
  font-family: var(--font-display, 'Barlow', sans-serif);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 4px;
  line-height: 1.2;
}

.welcome-card__subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0;
}

.welcome-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8px);
}

.welcome-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-full, 9999px);
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.welcome-card__unauthenticated {
  text-align: center;
}
</style>
