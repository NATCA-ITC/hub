<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Communicating for Safety"
      subtitle="Annual safety conference — collaboration between NATCA and the FAA"
    />

    <NatcaCard title="About CFS">
      <p class="text-body-2 mb-3">
        Communicating for Safety is NATCA's annual safety and collaboration conference, bringing together
        controllers, engineers, and FAA management to address safety improvements in the National Airspace System.
      </p>
      <NatcaAlert type="info">
        <strong>CFS 2026</strong> dates and registration details will be announced here when available.
      </NatcaAlert>
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaAlert } from '@natca-itc/ui-shell'
</script>
