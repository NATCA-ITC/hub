<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader title="Docs & Forms" subtitle="Official NATCA documents and forms" />
    <NatcaCard title="Document Repository">
      <NatcaEmptyState
        icon="mdi-folder-open"
        title="DMS integration pending"
        description="Documents will be browsable here once the DMS document browser is embedded."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
