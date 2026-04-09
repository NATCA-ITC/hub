<template>
  <div v-if="isAuthenticated" class="ds-card">
    <div class="ds-card__header">
      <VIcon icon="mdi-bell" size="18" />
      <span>Updates</span>
      <span v-if="memberUpdates.length" class="ds-card__count">{{ memberUpdates.length }}</span>
    </div>
    <div class="ds-card__body ds-card__body--flush">
      <div v-if="memberUpdates.length > 0" class="updates-list">
        <div
          v-for="update in memberUpdates.slice(0, 5)"
          :key="update.id"
          class="update-item"
          @click="emit('view-update-details', update)"
        >
          <div class="update-item__dot" :class="`update-item__dot--${update.category.toLowerCase()}`" />
          <div class="update-item__content">
            <span class="update-item__title">{{ update.title }}</span>
            <span class="update-item__date">{{ formatUpdateDate(update.date) }}</span>
          </div>
          <VIcon icon="mdi-chevron-right" size="16" class="update-item__arrow" />
        </div>
      </div>
      <div v-else class="updates-empty">
        <VIcon icon="mdi-bell-check" size="32" />
        <p>All caught up</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth0 } from '@/composables/useAuth0'

const { isAuthenticated } = useAuth0()
const emit = defineEmits(['view-update-details'])

const memberUpdates = ref([
  { id: '1', title: 'New CBA Ratification Results', date: new Date('2024-09-15'), category: 'Bargaining', summary: 'The collective bargaining agreement has been ratified by membership vote.', content: 'Details about the CBA ratification process and key changes...' },
  { id: '2', title: 'Updated Training Requirements', date: new Date('2024-09-12'), category: 'Training', summary: 'New training modules are now required for all facility representatives.', content: 'Information about new training requirements and deadlines...' },
  { id: '3', title: 'Regional Meeting Schedule', date: new Date('2024-09-10'), category: 'Events', summary: 'Upcoming regional meetings and town halls scheduled for October.', content: 'Schedule and details for upcoming regional meetings...' },
  { id: '4', title: 'Safety Alert: Weather Procedures', date: new Date('2024-09-08'), category: 'Safety', summary: 'Updated weather-related operational procedures for fall season.', content: 'Detailed weather procedure updates and safety guidelines...' },
  { id: '5', title: 'Member Benefits Update', date: new Date('2024-09-05'), category: 'Benefits', summary: 'Changes to health insurance options and retirement benefits.', content: 'Comprehensive overview of benefit changes effective October 1st...' },
])

const formatUpdateDate = (date: Date) => {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}
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

.ds-card__count {
  margin-left: auto;
  background: rgba(var(--natca-red-rgb, 206, 14, 45), 0.2);
  color: #ff6b7a;
  border-radius: var(--radius-full, 9999px);
  padding: 1px 8px;
  font-size: 0.6875rem;
  font-weight: 700;
}

.ds-card__body--flush {
  padding: 0;
}

.updates-list {
  display: flex;
  flex-direction: column;
}

.update-item {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  cursor: pointer;
  transition: background 150ms;
}

.update-item:hover {
  background: rgba(255,255,255,0.04);
}

.update-item:not(:last-child) {
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.update-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.update-item__dot--bargaining { background: var(--natca-navy, #003366); }
.update-item__dot--training { background: #29B6F6; }
.update-item__dot--events { background: #4CAF50; }
.update-item__dot--safety { background: var(--natca-red, #CE0E2D); }
.update-item__dot--benefits { background: #FFA726; }

.update-item__content {
  flex: 1;
  min-width: 0;
}

.update-item__title {
  display: block;
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-item__date {
  display: block;
  font-size: 0.6875rem;
  color: rgba(255,255,255,0.4);
  margin-top: 1px;
}

.update-item__arrow {
  color: rgba(255,255,255,0.25);
  flex-shrink: 0;
}

.updates-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-8, 32px);
  color: rgba(255,255,255,0.3);
  font-size: 0.8125rem;
}
</style>
