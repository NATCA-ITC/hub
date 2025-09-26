<template>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth0 } from '@/composables/useAuth0'

const { isAuthenticated } = useAuth0()

// Define emits for parent communication
const emit = defineEmits(['view-update-details'])

// Mock member updates data (would come from props or store in real implementation)
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

const viewUpdateDetails = (update: any) => {
  emit('view-update-details', update)
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
</script>