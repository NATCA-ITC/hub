<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Senate Counts"
      subtitle="U.S. Senate — NATCA support tracker"
    />

    <NatcaCard title="Senate Support Counts">
      <NatcaEmptyState
        icon="mdi-account-multiple-check"
        title="Automated counts coming soon"
        description="Senate support data will be auto-updated from MyNATCA once the data model is in place."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
