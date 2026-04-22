<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      :title="region?.name ?? 'Region'"
      :subtitle="region ? `${region.code} — ${region.description}` : 'Loading...'"
    >
      <template #actions>
        <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="$router.push('/regions')">
          All Regions
        </VBtn>
      </template>
    </NatcaPageHeader>

    <template v-if="region">
      <!-- Regional Leadership -->
      <NatcaCard title="Regional Leadership">
        <NatcaEmptyState
          icon="mdi-account-tie"
          title="Leadership info coming soon"
          description="Regional Vice President, staff, and leadership contacts will be loaded from MyNATCA."
        />
      </NatcaCard>

      <!-- Facilities in Region -->
      <NatcaCard title="Facilities">
        <NatcaEmptyState
          icon="mdi-office-building"
          title="Facility list coming soon"
          description="All facilities in this region with staffing levels and contact information, pulled from Supabase."
        />
      </NatcaCard>

      <!-- Regional News -->
      <NatcaCard title="Regional News">
        <NatcaEmptyState
          icon="mdi-newspaper"
          title="News feed coming soon"
          description="Regional news and updates will appear here once the Updates system is live."
        />
      </NatcaCard>

      <!-- Regional Documents -->
      <NatcaCard title="Documents">
        <NatcaEmptyState
          icon="mdi-file-document-multiple"
          title="Documents coming soon"
          description="Regional documents and resources will be embedded from DMS."
        />
      </NatcaCard>
    </template>

    <NatcaEmptyState
      v-else
      icon="mdi-alert-circle-outline"
      title="Region not found"
      description="The requested region does not exist."
      action-label="Back to Regions"
      @action="$router.push('/regions')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'

const route = useRoute()
const code = computed(() => (route.params.code as string)?.toUpperCase())

const regions: Record<string, { code: string; name: string; description: string }> = {
  'NAL': { code: 'NAL', name: 'Alaska', description: 'Covering all ATC facilities in the state of Alaska.' },
  'NCE': { code: 'NCE', name: 'Central', description: 'Kansas, Missouri, Iowa, Nebraska.' },
  'NEA': { code: 'NEA', name: 'Eastern', description: 'New York, New Jersey, Pennsylvania, Virginia, West Virginia, Maryland, Delaware, DC.' },
  'NGL': { code: 'NGL', name: 'Great Lakes', description: 'Illinois, Indiana, Michigan, Minnesota, North Dakota, Ohio, South Dakota, Wisconsin.' },
  'NNE': { code: 'NNE', name: 'New England', description: 'Connecticut, Massachusetts, Maine, New Hampshire, New York, Rhode Island, Vermont.' },
  'NNM': { code: 'NNM', name: 'Northwest Mountain', description: 'Colorado, Idaho, Montana, Oregon, Utah, Washington, Wyoming.' },
  'NRX': { code: 'NRX', name: 'Region X', description: 'Engineers, architects, and non-ATC bargaining units nationwide.' },
  'NSO': { code: 'NSO', name: 'Southern', description: 'Alabama, Florida, Georgia, Kentucky, Mississippi, North Carolina, Puerto Rico, South Carolina, Tennessee, US Virgin Islands.' },
  'NSW': { code: 'NSW', name: 'Southwest', description: 'Arkansas, Louisiana, New Mexico, Oklahoma, Texas.' },
  'NWP': { code: 'NWP', name: 'Western Pacific', description: 'Arizona, California, Hawaii, Nevada, Guam.' },
}

const region = computed(() => regions[code.value] ?? null)
</script>
