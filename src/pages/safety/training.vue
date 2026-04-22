<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="Safety Training" subtitle="Safety Advocacy Training and development resources" />

    <NatcaCard title="Safety Advocacy Training">
      <p class="text-body-2 mb-3">
        Comprehensive training program for NATCA safety representatives covering CEDAR analysis,
        system service reviews, corrective action plans, and advocacy techniques.
      </p>
      <NatcaEmptyState
        icon="mdi-school"
        title="Training modules coming soon"
        description="Course materials, exercises, and resource library are being migrated."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
