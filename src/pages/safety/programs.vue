<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="Safety Programs" subtitle="Active safety and technology programs" />

    <NatcaCard title="Programs Directory">
      <NatcaEmptyState
        icon="mdi-clipboard-check"
        title="Program details migrating"
        description="Individual program pages with documentation, contacts, and resources are being migrated from natca.org."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
