<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NCEPT"
      subtitle="National Centralized ERR Process Team — staffing data and placement metrics"
    />

    <NatcaStatGrid :cols="4">
      <NatcaStatCard label="National CPC Target" value="—" change="Data pending" />
      <NatcaStatCard label="Current On-Board" value="—" change="Data pending" />
      <NatcaStatCard label="% to Target" value="—" change="Data pending" />
      <NatcaStatCard label="In Training" value="—" change="Data pending" />
    </NatcaStatGrid>

    <NatcaCard title="Staffing Overview">
      <NatcaEmptyState
        icon="mdi-chart-timeline-variant"
        title="NCEPT data coming soon"
        description="Staffing metrics, placement lists, and facility-level CPC data will be available here once the Platform API is connected."
      />
    </NatcaCard>

    <NatcaCard title="Priority & Selection Lists">
      <NatcaEmptyState
        icon="mdi-format-list-numbered"
        title="Lists coming soon"
        description="Current and historical NCEPT priority and selection lists. Reference documents will be embedded from DMS."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaStatGrid, NatcaStatCard, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
