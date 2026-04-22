<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Committees"
      subtitle="NATCA national committees and working groups"
    />

    <VTextField
      v-model="search"
      label="Search committees..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-2"
      style="max-width: 400px;"
    />

    <VRow>
      <VCol v-for="committee in filteredCommittees" :key="committee.slug" cols="12" sm="6" md="4">
        <router-link :to="`/committees/${committee.slug}`" class="text-decoration-none">
          <NatcaCard :title="committee.name" :subtitle="committee.abbr">
            <p class="text-body-2 text-medium-emphasis">{{ committee.description }}</p>
          </NatcaCard>
        </router-link>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NatcaPageHeader, NatcaCard } from '@natca-itc/ui-shell'

const search = ref('')

const committees = [
  { slug: 'asi', abbr: 'ASI', name: 'Air Safety Investigations', description: 'Investigates aviation safety events and contributes to NTSB processes.' },
  { slug: 'napc', abbr: 'NAPC', name: 'Airspace and Procedures', description: 'Reviews and develops airspace design and ATC procedures.' },
  { slug: 'nbc', abbr: 'NBC', name: 'Benefits', description: 'Advocates for member benefits including health insurance, retirement, and leave.' },
  { slug: 'comms', abbr: 'Comms', name: 'Communications', description: 'Manages NATCA communications strategy and member outreach.' },
  { slug: 'cism', abbr: 'CISM', name: 'Critical Incident Stress Management', description: 'Peer support program for members involved in critical incidents.' },
  { slug: 'drc', abbr: 'DRC', name: 'Disaster Response', description: 'Coordinates NATCA response to natural disasters and emergencies.' },
  { slug: 'dac', abbr: 'DAC', name: 'Drug and Alcohol', description: 'Oversees substance abuse testing programs and member support.' },
  { slug: 'eap', abbr: 'EAP', name: 'Employee Assistance Program', description: 'Confidential counseling and support services for members.' },
  { slug: 'nec', abbr: 'NEC', name: 'Election', description: 'Manages NATCA national elections and voting processes.' },
  { slug: 'esc', abbr: 'ESC', name: 'Election Support', description: 'Provides support for local and regional election processes.' },
  { slug: 'nfc', abbr: 'NFC', name: 'Finance', description: 'Oversees NATCA financial operations, budget, and auditing.' },
  { slug: 'nhc', abbr: 'NHC', name: 'Historical', description: 'Preserves and documents NATCA history and milestones.' },
  { slug: 'itc', abbr: 'ITC', name: 'Information Technology', description: 'Manages NATCA technology infrastructure and digital services.' },
  { slug: 'nlc', abbr: 'NLC', name: 'National Legislative', description: 'Leads congressional advocacy and political strategy.' },
  { slug: 'ncc', abbr: 'NCC', name: 'National Constitution', description: 'Interprets and proposes amendments to the NATCA constitution.' },
  { slug: 'noc', abbr: 'NOC', name: 'Organizing', description: 'Organizes new bargaining units and supports local organizing efforts.' },
  { slug: 'nsc', abbr: 'NSC', name: 'Safety', description: 'National safety committee — policy, programs, and FAA collaboration.' },
  { slug: 'nstlc', abbr: 'NSTLC', name: 'Safety & Technology Leadership Council', description: 'Strategic oversight of safety and technology programs.' },
  { slug: 'ntc', abbr: 'NTC', name: 'National Training', description: 'Develops and delivers training programs for NATCA representatives.' },
  { slug: 'onboarding', abbr: '', name: 'Onboarding', description: 'Welcomes and orients new NATCA members.' },
  { slug: 'osha', abbr: 'OSHA', name: 'Occupational Safety and Health', description: 'Workplace safety inspections, hazard reporting, and OSHA compliance.' },
  { slug: 'ps', abbr: 'PS', name: 'Professional Standards', description: 'Peer-to-peer conflict resolution and professional conduct.' },
  { slug: 'reloaded', abbr: '', name: 'Reloaded', description: 'Mid-career engagement and development program.' },
  { slug: 'rnav', abbr: 'RNAV', name: 'RNAV', description: 'Area navigation procedures and performance-based navigation.' },
  { slug: 's804', abbr: 'S804', name: 'Section 804', description: 'Oversight of Section 804 personnel reform implementation.' },
  { slug: 'us', abbr: 'US', name: 'Union Synergy', description: 'Cross-committee collaboration and strategic alignment.' },
]

const filteredCommittees = computed(() => {
  if (!search.value) return committees
  const q = search.value.toLowerCase()
  return committees.filter(c =>
    c.name.toLowerCase().includes(q)
    || c.abbr.toLowerCase().includes(q)
    || c.description.toLowerCase().includes(q),
  )
})
</script>
