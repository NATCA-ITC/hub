<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Regions"
      subtitle="NATCA's 10 regional vice presidential areas"
    />

    <VRow>
      <VCol v-for="region in regions" :key="region.code" cols="12" sm="6" md="4">
        <router-link :to="`/regions/${region.code.toLowerCase()}`" class="text-decoration-none">
          <NatcaHeaderCard :icon="'mdi-map-marker'" :title="region.name" :subtitle="region.code">
            <p class="text-body-2 text-medium-emphasis">{{ region.description }}</p>
          </NatcaHeaderCard>
        </router-link>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaHeaderCard } from '@natca-itc/ui-shell'

const regions = [
  { code: 'NAL', name: 'Alaska', description: 'Alaska Region — covering all ATC facilities in the state of Alaska.' },
  { code: 'NCE', name: 'Central', description: 'Central Region — Kansas, Missouri, Iowa, Nebraska.' },
  { code: 'NEA', name: 'Eastern', description: 'Eastern Region — NY, NJ, PA, VA, WV, MD, DE, DC.' },
  { code: 'NGL', name: 'Great Lakes', description: 'Great Lakes Region — IL, IN, MI, MN, ND, OH, SD, WI.' },
  { code: 'NNE', name: 'New England', description: 'New England Region — CT, MA, ME, NH, NY, RI, VT.' },
  { code: 'NNM', name: 'Northwest Mountain', description: 'Northwest Mountain Region — CO, ID, MT, OR, UT, WA, WY.' },
  { code: 'NRX', name: 'Region X', description: 'Region X — engineers, architects, and non-ATC bargaining units.' },
  { code: 'NSO', name: 'Southern', description: 'Southern Region — AL, FL, GA, KY, MS, NC, PR, SC, TN, VI.' },
  { code: 'NSW', name: 'Southwest', description: 'Southwest Region — AR, LA, NM, OK, TX.' },
  { code: 'NWP', name: 'Western Pacific', description: 'Western Pacific Region — AZ, CA, HI, NV, Guam.' },
]
</script>
