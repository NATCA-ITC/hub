<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard__loading">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- Landing Page for non-authenticated users -->
    <div v-else-if="!isAuthenticated" class="dashboard__landing">
      <div class="landing-card">
        <VImg
          src="/src/assets/images/natca/myNATCA-dark-logo.png"
          max-width="160"
          class="mx-auto mb-6"
        />
        <h1 class="landing-card__title">MyNATCA Hub</h1>
        <p class="landing-card__subtitle">
          Your central dashboard for member services and resources
        </p>
        <VBtn color="primary" size="large" @click="login()">
          <VIcon icon="mdi-login" start />
          Sign In
        </VBtn>
      </div>
    </div>

    <!-- Dashboard for authenticated users -->
    <div v-else class="dashboard__grid">
      <!-- Welcome banner spans full width -->
      <div class="dashboard__welcome">
        <WelcomeCard />
      </div>

      <!-- Main content area -->
      <div class="dashboard__main">
        <RackspaceEmailCard />
        <PositionsCard />
      </div>

      <!-- Sidebar area -->
      <div class="dashboard__aside">
        <ProfileCard />
        <MemberUpdatesCard @view-update-details="viewUpdateDetails" />
      </div>
    </div>

    <!-- Member Update Details Modal -->
    <VDialog v-model="updateDetailsDialog" max-width="560">
      <div v-if="selectedUpdate" class="update-dialog">
        <div class="update-dialog__header">
          <h3>{{ selectedUpdate.title }}</h3>
          <button class="update-dialog__close" @click="updateDetailsDialog = false">
            <VIcon icon="mdi-close" size="18" />
          </button>
        </div>
        <div class="update-dialog__body">
          <div class="update-dialog__meta">
            <span class="update-dialog__category" :data-category="selectedUpdate.category.toLowerCase()">
              {{ selectedUpdate.category }}
            </span>
            <span class="update-dialog__date">{{ formatUpdateDate(selectedUpdate.date) }}</span>
          </div>
          <p class="update-dialog__summary">{{ selectedUpdate.summary }}</p>
          <p class="update-dialog__content">{{ selectedUpdate.content }}</p>
        </div>
      </div>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'
import WelcomeCard from '@/components/dashboard/WelcomeCard.vue'
import PositionsCard from '@/components/dashboard/PositionsCard.vue'
import MemberUpdatesCard from '@/components/dashboard/MemberUpdatesCard.vue'
import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import RackspaceEmailCard from '@/components/dashboard/RackspaceEmailCard.vue'

const { isLoading, isAuthenticated, accessToken, login, memberNumber, memberProfile } = useAuth0()
const memberStore = useMemberStore()

memberStore.setupAuthTokenProvider(() => accessToken.value)

watch([isAuthenticated, memberNumber], async () => {
  if (isAuthenticated.value && memberNumber.value) {
    const natcaId = memberProfile.value?.natcaId
    if (natcaId) {
      await memberStore.fetchMemberData(memberNumber.value, natcaId)
    }
  }
}, { immediate: true })

// Modal state
const updateDetailsDialog = ref(false)
const selectedUpdate = ref<any>(null)

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
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}
</script>

<style scoped>
.dashboard {
  padding: var(--space-6, 24px);
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.dashboard__landing {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.landing-card {
  text-align: center;
  background: var(--color-shell-surface, #1e2130);
  border: 1px solid var(--color-border, rgba(255,255,255,0.08));
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-8, 32px) var(--space-6, 24px);
  max-width: 420px;
}

.landing-card__title {
  font-family: var(--font-display, 'Barlow', sans-serif);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--space-2, 8px);
  color: white;
}

.landing-card__subtitle {
  color: rgba(255,255,255,0.6);
  margin: 0 0 var(--space-6, 24px);
  font-size: 0.9375rem;
}

.dashboard__grid {
  display: grid;
  gap: var(--space-5, 20px);
}

.dashboard__welcome {
  grid-column: 1 / -1;
}

@media (min-width: 768px) {
  .dashboard__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .dashboard__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.dashboard__main,
.dashboard__aside {
  display: flex;
  flex-direction: column;
  gap: var(--space-5, 20px);
}

/* Update dialog */
.update-dialog {
  background: var(--color-shell-surface, #1e2130);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
}

.update-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5, 20px) var(--space-5, 20px) var(--space-3, 12px);
}

.update-dialog__header h3 {
  font-family: var(--font-display, 'Barlow', sans-serif);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.update-dialog__close {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.update-dialog__close:hover {
  color: white;
  background: rgba(255,255,255,0.08);
}

.update-dialog__body {
  padding: 0 var(--space-5, 20px) var(--space-5, 20px);
}

.update-dialog__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-4, 16px);
}

.update-dialog__category {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: var(--radius-full, 9999px);
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
}

.update-dialog__category[data-category="safety"] {
  background: rgba(206, 14, 45, 0.15);
  color: #ff6b7a;
}

.update-dialog__category[data-category="bargaining"] {
  background: rgba(0, 51, 102, 0.3);
  color: #5BA3D9;
}

.update-dialog__date {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}

.update-dialog__summary {
  font-size: 0.9375rem;
  color: rgba(255,255,255,0.85);
  margin: 0 0 var(--space-3, 12px);
  line-height: 1.5;
}

.update-dialog__content {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
  line-height: 1.5;
}
</style>
