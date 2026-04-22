<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="NATCA Constitution" subtitle="The union's foundational governing document" />
    <NatcaCard title="Constitution">
      <NatcaEmptyState
        icon="mdi-gavel"
        title="Document embed pending"
        description="The NATCA Constitution will be viewable here once DMS integration is complete."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
