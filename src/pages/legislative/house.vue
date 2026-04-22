<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="House Counts"
      subtitle="U.S. House of Representatives — NATCA support tracker"
    />

    <NatcaCard title="House Support Counts">
      <NatcaEmptyState
        icon="mdi-account-multiple"
        title="Automated counts coming soon"
        description="House support data will be auto-updated from MyNATCA once the data model is in place."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
