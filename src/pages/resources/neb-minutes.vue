<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="NEB Minutes" subtitle="National Executive Board meeting records" />
    <NatcaCard title="Meeting Minutes">
      <NatcaEmptyState
        icon="mdi-clipboard-text"
        title="Document embed pending"
        description="NEB minutes will be browsable here once DMS integration is complete."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
