<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Resources"
      subtitle="Documents, contracts, and reference materials"
    />

    <VRow>
      <VCol v-for="section in sections" :key="section.to" cols="12" sm="6" md="4">
        <router-link :to="section.to" class="text-decoration-none">
          <NatcaHeaderCard :icon="section.icon" :title="section.title" :subtitle="section.subtitle">
            <p class="text-body-2 text-medium-emphasis">{{ section.description }}</p>
          </NatcaHeaderCard>
        </router-link>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaHeaderCard } from '@natca-itc/ui-shell'

const sections = [
  { to: '/resources/contracts', icon: 'mdi-file-sign', title: 'Contracts & MOUs', subtitle: 'Collective Bargaining Agreements', description: 'Current and historical CBAs including the 2025 Indigo Book, Slate Book, FCT and DoD contracts.' },
  { to: '/resources/docs', icon: 'mdi-folder-open', title: 'Docs & Forms', subtitle: 'Official documents', description: 'Forms, templates, and official NATCA documents available for download.' },
  { to: '/resources/constitution', icon: 'mdi-gavel', title: 'Constitution', subtitle: 'Governing document', description: 'The NATCA Constitution — the union\'s foundational governing document.' },
  { to: '/resources/neb-minutes', icon: 'mdi-clipboard-text', title: 'NEB Minutes', subtitle: 'Board meeting records', description: 'Minutes from National Executive Board meetings.' },
  { to: '/resources/newsletters', icon: 'mdi-email-newsletter', title: 'Newsletters', subtitle: 'NATCA publications', description: 'Regular NATCA newsletters and member communications.' },
]
</script>
