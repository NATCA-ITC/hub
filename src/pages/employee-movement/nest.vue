<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NEST"
      subtitle="National Employee Services Team — member support and services"
    />

    <NatcaCard title="About NEST">
      <p class="text-body-2 mb-3">
        The National Employee Services Team (NEST) works alongside NCEPT and the Hardship Committee
        to support members navigating the transfer and reassignment process. NEST provides direct
        member services and coordination between facilities, regions, and national leadership.
      </p>
      <NatcaEmptyState
        icon="mdi-swap-horizontal"
        title="Content being developed"
        description="NEST program details, services, and contact information will be added as content is finalized."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
