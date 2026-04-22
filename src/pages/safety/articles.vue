<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="Safety Articles" subtitle="Safety & Technology article archive" />

    <NatcaCard title="Article Archive">
      <NatcaEmptyState
        icon="mdi-newspaper"
        title="Articles moving to Updates"
        description="Safety articles will be available through the Updates system once it launches. Historical articles are being migrated."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
