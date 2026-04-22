<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="ATX"
      subtitle="Activist training and development"
    />

    <NatcaCard title="About ATX">
      <p class="text-body-2 mb-3">
        ATX provides union activists with training in leadership, organizing, and representation skills.
      </p>
      <NatcaAlert type="info">
        <strong>ATX 2026</strong> dates and details will be announced here when available.
      </NatcaAlert>
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaAlert } from '@natca-itc/ui-shell'
</script>
