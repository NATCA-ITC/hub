<template>
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
</template>

<script setup lang="ts">
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { isAuthenticated, positions } = useAuth0()
const memberStore = useMemberStore()
</script>