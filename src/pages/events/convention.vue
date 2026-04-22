<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NATCA Convention"
      subtitle="Biennial national convention — elections, resolutions, and union governance"
    />

    <NatcaCard title="19th Biennial Convention — San Francisco 2025">
      <p class="text-body-2 mb-3">
        The NATCA Convention is the union's highest governing body, held every two years. Delegates vote on
        constitutional amendments, resolutions, and elect national officers.
      </p>
      <NatcaAlert type="success">
        <strong>Convention 2025</strong> — June 2025 in San Francisco, CA.
      </NatcaAlert>
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaAlert } from '@natca-itc/ui-shell'
</script>
