<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NATCA PAC"
      subtitle="Political Action Committee — supporting pro-aviation candidates"
    />

    <!-- Hatch Act overlay — blurs content until acknowledged -->
    <div v-if="!acknowledged" class="pac-gate">
      <div class="pac-gate__blur">
        <NatcaCard title="PAC Information">
          <p class="text-body-2">PAC contribution data, sign-up information, and resources.</p>
          <p class="text-body-2">Disbursement reports and election cycle information.</p>
          <p class="text-body-2">How to contribute and manage your PAC deduction.</p>
        </NatcaCard>
      </div>
      <div class="pac-gate__overlay">
        <VCard max-width="560" class="pa-2">
          <VCardTitle class="d-flex align-center ga-2">
            <VIcon icon="mdi-alert" color="warning" />
            Hatch Act Notice
          </VCardTitle>
          <VCardText>
            <p class="text-body-2 mb-3">
              The information on this page relates to NATCA's Political Action Committee (PAC).
              Federal law restricts political activity by government employees.
            </p>
            <p class="text-body-2 mb-3">
              <strong>You may not view, share, or discuss PAC-related content while on government time,
              in a government building, or using government equipment.</strong>
              This includes government-issued phones, computers, and email.
            </p>
            <p class="text-body-2 mb-3">
              All PAC contributions are strictly voluntary. You have the right to refuse to contribute
              without reprisal. NATCA will not favor or disadvantage anyone based on their decision
              to contribute or not contribute.
            </p>
            <p class="text-caption text-medium-emphasis">
              By proceeding, you acknowledge that you are viewing this content on your own time
              and not using government resources.
            </p>
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn variant="text" @click="$router.push('/legislative')">Go Back</VBtn>
            <VBtn color="primary" @click="acknowledged = true">I Understand — Continue</VBtn>
          </VCardActions>
        </VCard>
      </div>
    </div>

    <!-- Actual PAC content (shown after acknowledgment) -->
    <template v-if="acknowledged">
      <NatcaCard title="About NATCA PAC">
        <p class="text-body-2">
          Content migrating from natca.org. PAC contribution data, sign-up information, and resources
          will be displayed here.
        </p>
      </NatcaCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NatcaPageHeader, NatcaCard } from '@natca-itc/ui-shell'

const acknowledged = ref(false)
</script>

<style scoped>
.pac-gate {
  position: relative;
}

.pac-gate__blur {
  filter: blur(8px);
  pointer-events: none;
  user-select: none;
}

.pac-gate__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: var(--space-8, 32px);
  z-index: 1;
}
</style>
