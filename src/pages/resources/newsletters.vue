<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="Newsletters" subtitle="NATCA publications and member communications" />
    <NatcaCard title="Newsletter Archive">
      <NatcaEmptyState
        icon="mdi-email-newsletter"
        title="Archive coming soon"
        description="Newsletter archive will be available here once content migration is complete."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
