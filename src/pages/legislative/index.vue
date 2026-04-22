<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Legislative & Political"
      subtitle="Congressional advocacy, PAC information, and legislative tracking"
    />

    <NatcaStatGrid :cols="3">
      <NatcaStatCard label="House Support" value="—" change="Counts pending automation" />
      <NatcaStatCard label="Senate Support" value="—" change="Counts pending automation" />
      <NatcaStatCard label="PAC Contributors" value="—" change="Data pending" />
    </NatcaStatGrid>

    <VRow>
      <VCol cols="12" md="6">
        <NatcaCard title="NATCA PAC">
          <p class="text-body-2">
            The NATCA Political Action Committee supports candidates who advocate for aviation safety
            and air traffic controller interests.
          </p>
        </NatcaCard>
      </VCol>
      <VCol cols="12" md="6">
        <NatcaCard title="Take Action">
          <p class="text-body-2">
            Resources for contacting your representatives, voter registration, and advocacy guides.
          </p>
        </NatcaCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaStatGrid, NatcaStatCard, NatcaCard } from '@natca-itc/ui-shell'
</script>
