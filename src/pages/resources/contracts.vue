<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="Contracts & MOUs" subtitle="Collective Bargaining Agreements — current and historical" />

    <NatcaCard title="Current Agreement">
      <NatcaAlert type="info">
        <strong>2025 Indigo Book</strong> — The current NATCA-FAA Collective Bargaining Agreement.
      </NatcaAlert>
      <p class="text-body-2 mt-3">Document will be embedded from DMS when integration is complete.</p>
    </NatcaCard>

    <NatcaCard title="Historical Agreements">
      <VList>
        <VListItem v-for="contract in contracts" :key="contract.name" :title="contract.name" :subtitle="contract.description" prepend-icon="mdi-file-document" />
      </VList>
    </NatcaCard>

    <NatcaCard title="FCT & DoD Contracts">
      <VList>
        <VListItem v-for="contract in fctDod" :key="contract.name" :title="contract.name" :subtitle="contract.year" prepend-icon="mdi-file-sign" />
      </VList>
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaAlert } from '@natca-itc/ui-shell'

const contracts = [
  { name: '2025 Indigo Book', description: 'Current CBA' },
  { name: '2016 Slate Book', description: 'Previous CBA' },
  { name: '2013 Purple Book', description: 'Historical' },
  { name: '2011 Light Blue Book', description: 'Historical' },
]

const fctDod = [
  { name: '2022 Serco CBA', year: 'FCT' },
  { name: '2016 RVA CBA', year: 'FCT' },
  { name: '2016 Midwest CBA', year: 'FCT' },
  { name: '2013 SLI CBA', year: 'DoD' },
  { name: '2005 NKT CBA', year: 'DoD' },
  { name: '2003 JRF CBA', year: 'DoD' },
]
</script>
