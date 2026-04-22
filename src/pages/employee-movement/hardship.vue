<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Hardship Transfers"
      subtitle="Eligibility, application process, and resources"
    />

    <NatcaCard title="About Hardship Transfers">
      <p class="text-body-2 mb-3">
        The Hardship Transfer Program allows eligible members to request a transfer to another facility
        based on qualifying personal hardship circumstances. Transfers are subject to staffing availability
        and management approval.
      </p>
      <NatcaEmptyState
        icon="mdi-heart-pulse"
        title="Content migrating"
        description="Eligibility criteria, application forms, timelines, and FAQs are being migrated from natca.org."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
