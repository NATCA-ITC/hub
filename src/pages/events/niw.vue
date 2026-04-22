<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NATCA in Washington"
      subtitle="Annual legislative conference — advocacy, lobbying, and congressional meetings"
    />

    <NatcaCard title="About NIW">
      <p class="text-body-2 mb-3">
        NATCA in Washington is the union's premier legislative advocacy event. Members meet with their congressional
        representatives to advocate for aviation safety, workforce issues, and air traffic control modernization.
      </p>
      <NatcaAlert type="info">
        <strong>NIW 2026</strong> dates and registration details will be announced here when available.
      </NatcaAlert>
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaAlert } from '@natca-itc/ui-shell'
</script>
