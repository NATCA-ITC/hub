<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Events & Conferences"
      subtitle="Upcoming NATCA events, conferences, and registration"
    />

    <NatcaStatGrid :cols="4">
      <NatcaStatCard label="NATCA in Washington" value="2026" change="March · Washington, DC" change-color="info" />
      <NatcaStatCard label="CFS" value="2026" change="October · TBD" change-color="info" />
      <NatcaStatCard label="Convention" value="2025" change="June · San Francisco" change-color="success" />
      <NatcaStatCard label="ATX" value="2026" change="Date TBD" />
    </NatcaStatGrid>

    <NatcaCard title="Event Calendar">
      <NatcaEmptyState
        icon="mdi-calendar-clock"
        title="Calendar coming soon"
        description="Trumba calendar integration is in progress. Events will display here with registration links and schedule details."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaStatGrid, NatcaStatCard, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
