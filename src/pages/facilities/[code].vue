<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      :title="facilityName"
      :subtitle="facilityCode ? `${facilityCode} — Facility Dashboard` : 'Loading...'"
    >
      <template #actions>
        <VAutocomplete
          v-model="selectedFacility"
          :items="facilityOptions"
          label="Switch facility..."
          prepend-inner-icon="mdi-magnify"
          style="max-width: 300px;"
          hide-details
          clearable
          @update:model-value="navigateToFacility"
        />
      </template>
    </NatcaPageHeader>

    <!-- Facility Info -->
    <div id="info">
      <NatcaCard title="Facility Information">
        <NatcaEmptyState
          icon="mdi-office-building"
          title="Facility data loading"
          description="Address, phone, level, type, staffing counts, and regional assignment will be loaded from Supabase and MyNATCA."
        />
      </NatcaCard>
    </div>

    <!-- Representatives -->
    <div id="representatives">
      <NatcaCard title="Representatives">
        <NatcaEmptyState
          icon="mdi-account-tie"
          title="Representative data coming soon"
          description="FacRep, ATM, regional contacts, and congressional representatives for this facility."
        />
      </NatcaCard>
    </div>

    <!-- NCEPT / Staffing -->
    <div id="ncept">
      <NatcaCard title="NCEPT Staffing">
        <NatcaStatGrid :cols="4">
          <NatcaStatCard label="CPC Target" value="—" />
          <NatcaStatCard label="Current On-Board" value="—" />
          <NatcaStatCard label="% to Target" value="—" />
          <NatcaStatCard label="In Training" value="—" />
        </NatcaStatGrid>
        <div class="mt-4">
          <NatcaEmptyState
            icon="mdi-chart-timeline-variant"
            title="NCEPT data coming soon"
            description="Staffing metrics, charts, and historical trend data for this facility. See NAT-293."
          />
        </div>
      </NatcaCard>
    </div>

    <!-- Files -->
    <div id="files">
      <NatcaCard title="Facility Documents">
        <NatcaEmptyState
          icon="mdi-folder-open"
          title="Documents coming soon"
          description="Facility-specific documents (constitution, MOUs, meeting minutes) will be embedded from DMS."
        />
      </NatcaCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NatcaPageHeader, NatcaCard, NatcaStatGrid, NatcaStatCard, NatcaEmptyState } from '@natca-itc/ui-shell'
import { MemberService } from '@/services/memberService'
import type { Facility } from '@/plugins/supabase'

const route = useRoute()
const router = useRouter()
const facilityCode = computed(() => (route.params.code as string)?.toUpperCase())

const facilities = ref<Facility[]>([])
const selectedFacility = ref<string | null>(null)

const facilityName = computed(() => {
  const f = facilities.value.find(f => f.code === facilityCode.value)
  return f ? `${f.name} (${f.code})` : facilityCode.value ?? 'Facility'
})

const facilityOptions = computed(() =>
  facilities.value.map(f => ({
    title: `${f.code} — ${f.name}`,
    value: f.code,
  })),
)

function navigateToFacility(code: string | null) {
  if (code) {
    router.push(`/facilities/${code.toLowerCase()}`)
  }
}

onMounted(async () => {
  try {
    facilities.value = await MemberService.getAllFacilities()
  } catch {
    // Facilities will load when Supabase is connected
  }
})
</script>
