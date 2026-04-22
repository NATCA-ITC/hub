<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Safety & Technology"
      subtitle="Safety programs, training resources, and technology initiatives"
    />

    <VRow>
      <VCol v-for="program in programs" :key="program.slug" cols="12" sm="6" md="4">
        <NatcaHeaderCard :icon="program.icon" :title="program.name" :subtitle="program.abbr">
          <p class="text-body-2">{{ program.description }}</p>
        </NatcaHeaderCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaHeaderCard } from '@natca-itc/ui-shell'

const programs = [
  { slug: 'vsrp', name: 'Voluntary Safety Reporting', abbr: 'VSRP', icon: 'mdi-clipboard-alert', description: 'Confidential safety reporting program for air traffic controllers.' },
  { slug: 'pfs', name: 'Partnership for Safety', abbr: 'PFS', icon: 'mdi-handshake', description: 'FAA-NATCA collaborative safety improvement program.' },
  { slug: 'sms', name: 'Safety Management Systems', abbr: 'SMS', icon: 'mdi-cog-outline', description: 'Systematic approach to managing safety risks in the NAS.' },
  { slug: 'runway', name: 'Runway Safety', abbr: '', icon: 'mdi-airplane-landing', description: 'Initiatives to reduce runway incursions and surface incidents.' },
  { slug: 'human-perf', name: 'Human Performance', abbr: '', icon: 'mdi-head-cog', description: 'Research and programs addressing human factors in ATC.' },
  { slug: 'aircraft-cert', name: 'Aircraft Certification', abbr: '', icon: 'mdi-certificate', description: 'NATCA involvement in aircraft certification processes.' },
]
</script>
