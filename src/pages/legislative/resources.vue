<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Legislative Resources"
      subtitle="Voter center, advocacy guides, and congressional contact information"
    />

    <VRow>
      <VCol cols="12" md="6">
        <NatcaCard title="Voter Center">
          <p class="text-body-2">Voter registration resources and tools for NATCA members.</p>
        </NatcaCard>
      </VCol>
      <VCol cols="12" md="6">
        <NatcaCard title="How to Advocate">
          <p class="text-body-2">Guide to building relationships with your congressional representatives.</p>
        </NatcaCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard } from '@natca-itc/ui-shell'
</script>
