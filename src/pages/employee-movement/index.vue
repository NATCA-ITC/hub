<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Employee Movement"
      subtitle="Transfer programs, staffing data, and placement resources"
    />

    <VRow>
      <VCol cols="12" sm="6" md="3">
        <router-link to="/employee-movement/ncept" class="text-decoration-none">
          <NatcaHeaderCard icon="mdi-chart-timeline-variant" title="NCEPT" subtitle="National Centralized ERR Process Team">
            <p class="text-body-2">
              Staffing metrics, CPC targets, placement lists, and facility-level data
              used in the national ERR process.
            </p>
          </NatcaHeaderCard>
        </router-link>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <router-link to="/employee-movement/hardship" class="text-decoration-none">
          <NatcaHeaderCard icon="mdi-heart-pulse" title="Hardship" subtitle="Hardship Transfer Program">
            <p class="text-body-2">
              Eligibility criteria, application process, and resources for members
              seeking a hardship transfer to another facility.
            </p>
          </NatcaHeaderCard>
        </router-link>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <router-link to="/employee-movement/ssr" class="text-decoration-none">
          <NatcaHeaderCard icon="mdi-clipboard-text-search" title="SSR" subtitle="Staffing Service Review">
            <p class="text-body-2">
              Information about the Staffing Service Review process and how it
              impacts facility staffing decisions.
            </p>
          </NatcaHeaderCard>
        </router-link>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <router-link to="/employee-movement/nest" class="text-decoration-none">
          <NatcaHeaderCard icon="mdi-swap-horizontal" title="NEST" subtitle="National Employee Services Team">
            <p class="text-body-2">
              NEST program information, eligibility, and resources for members.
            </p>
          </NatcaHeaderCard>
        </router-link>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaHeaderCard } from '@natca-itc/ui-shell'
</script>
