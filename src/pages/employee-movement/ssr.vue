<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Staffing Service Review"
      subtitle="SSR process and facility staffing impact"
    />

    <NatcaCard title="About SSR">
      <p class="text-body-2 mb-3">
        The Staffing Service Review is a process used to evaluate and adjust facility staffing levels
        based on traffic, complexity, and operational requirements.
      </p>
      <NatcaEmptyState
        icon="mdi-clipboard-text-search"
        title="Content migrating"
        description="SSR process details, schedules, and facility-specific information are being migrated."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
