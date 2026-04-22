<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NEST"
      subtitle="National Employee Services Team — support and resources"
    />

    <NatcaCard title="About NEST">
      <NatcaEmptyState
        icon="mdi-swap-horizontal"
        title="Content coming soon"
        description="NEST program details, eligibility, and resources will be available here."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
