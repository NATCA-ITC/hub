<template>
  <div
    v-if="isAuthenticated"
    class="ds-card"
  >
    <div class="ds-card__header">
      <VIcon
        icon="mdi-briefcase"
        size="18"
      />
      <span>Positions</span>
    </div>
    <div class="ds-card__body">
      <div v-if="positions.length > 0">
        <div class="positions-chips">
          <span
            v-for="position in positions"
            :key="position"
            class="position-chip"
          >
            {{ position }}
          </span>
        </div>
        <div class="positions-details">
          <div class="positions-detail">
            <span class="positions-detail__label">Facility</span>
            <span class="positions-detail__value">
              <template v-if="memberStore.loading">Loading...</template>
              <template v-else>{{ memberStore.facilityName }} ({{ memberStore.facilityCode }})</template>
            </span>
          </div>
          <div class="positions-detail">
            <span class="positions-detail__label">Region</span>
            <span class="positions-detail__value">
              <template v-if="memberStore.loading">Loading...</template>
              <template v-else>{{ memberStore.regionName }}</template>
            </span>
          </div>
        </div>
      </div>
      <p
        v-else
        class="positions-empty"
      >
        No positions assigned
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { isAuthenticated, positions } = useAuth0()
const memberStore = useMemberStore()
</script>

<style scoped>
.ds-card {
  background: var(--color-shell-surface, #1e2130);
  border: 1px solid var(--color-border, rgba(255,255,255,0.08));
  border-radius: var(--radius-default, 6px);
  overflow: hidden;
}

.ds-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.08));
  font-family: var(--font-display, 'Barlow', sans-serif);
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.7);
}

.ds-card__body {
  padding: var(--space-4, 16px);
}

.positions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-4, 16px);
}

.position-chip {
  display: inline-block;
  background: rgba(var(--natca-red-rgb, 206, 14, 45), 0.15);
  color: #ff6b7a;
  border-radius: var(--radius-full, 9999px);
  padding: 3px 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.positions-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.positions-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.positions-detail__label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.45);
}

.positions-detail__value {
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.85);
}

.positions-empty {
  color: rgba(255,255,255,0.4);
  font-size: 0.8125rem;
  margin: 0;
}
</style>
