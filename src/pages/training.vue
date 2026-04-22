<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Training"
      subtitle="NATCA Academy, development programs, and training resources"
    />

    <VRow>
      <VCol cols="12" sm="6" md="4">
        <NatcaHeaderCard icon="mdi-school" title="NATCA Academy" subtitle="Union leadership development">
          <p class="text-body-2">
            The NATCA Academy provides comprehensive training for union representatives
            at all levels — from new FacReps to experienced national committee members.
          </p>
        </NatcaHeaderCard>
      </VCol>
      <VCol cols="12" sm="6" md="4">
        <NatcaHeaderCard icon="mdi-certificate" title="NTI" subtitle="National Training Initiative">
          <p class="text-body-2">
            Training initiatives and curriculum developed by the National Training Committee
            for NATCA representatives and activists.
          </p>
        </NatcaHeaderCard>
      </VCol>
      <VCol cols="12" sm="6" md="4">
        <NatcaHeaderCard icon="mdi-airplane" title="Concur Travel" subtitle="Travel & expense training">
          <p class="text-body-2">
            How to use the Concur travel and expense system for NATCA-related travel,
            voucher submission, and reimbursement.
          </p>
        </NatcaHeaderCard>
      </VCol>
    </VRow>

    <NatcaCard title="Training Resources">
      <NatcaEmptyState
        icon="mdi-book-open-page-variant"
        title="Training materials migrating"
        description="Course catalogs, training schedules, and reference materials are being migrated from natca.org."
      />
    </NatcaCard>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaHeaderCard, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
