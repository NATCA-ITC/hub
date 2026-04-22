<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      :title="committee?.name ?? 'Committee'"
      :subtitle="committee?.abbr ? `${committee.abbr} — ${committee.description}` : 'Loading...'"
    >
      <template #actions>
        <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="$router.push('/committees')">
          All Committees
        </VBtn>
      </template>
    </NatcaPageHeader>

    <template v-if="committee">
      <!-- Committee description card -->
      <NatcaCard title="About">
        <p class="text-body-2">{{ committee.description }}</p>
      </NatcaCard>

      <!-- Committee members — grouped by position -->
      <NatcaCard title="Members">
        <NatcaEmptyState
          icon="mdi-account-group"
          title="Member list coming soon"
          description="Committee members will be loaded from the MyNATCA API, grouped by position (Chair, Vice Chair, Members)."
        />
      </NatcaCard>

      <!-- Committee news — placeholder for Updates system -->
      <NatcaCard title="Committee News">
        <NatcaEmptyState
          icon="mdi-newspaper"
          title="News feed coming soon"
          description="Committee news and updates will appear here once the Updates system is live."
        />
      </NatcaCard>

      <!-- Committee documents — placeholder for DMS embed -->
      <NatcaCard title="Documents">
        <NatcaEmptyState
          icon="mdi-file-document-multiple"
          title="Documents coming soon"
          description="Committee charters, meeting minutes, and other documents will be embedded from DMS."
        />
      </NatcaCard>
    </template>

    <NatcaEmptyState
      v-else
      icon="mdi-alert-circle-outline"
      title="Committee not found"
      description="The requested committee does not exist."
      action-label="Back to Committees"
      @action="$router.push('/committees')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Static committee data until we have an API
const committees: Record<string, { name: string; abbr: string; description: string }> = {
  'asi': { name: 'Air Safety Investigations', abbr: 'ASI', description: 'Investigates aviation safety events and contributes to NTSB processes. ASI members serve as party coordinators and provide technical expertise during accident and incident investigations.' },
  'napc': { name: 'Airspace and Procedures', abbr: 'NAPC', description: 'Reviews and develops airspace design and air traffic control procedures to improve safety and efficiency in the National Airspace System.' },
  'nbc': { name: 'Benefits', abbr: 'NBC', description: 'Advocates for member benefits including health insurance, retirement plans, leave policies, and other workplace benefits.' },
  'comms': { name: 'Communications', abbr: 'Comms', description: 'Manages NATCA communications strategy, member outreach, and public messaging across all channels.' },
  'cism': { name: 'Critical Incident Stress Management', abbr: 'CISM', description: 'Provides peer support for members involved in critical incidents. Trained CISM team members offer debriefings and follow-up support.' },
  'drc': { name: 'Disaster Response', abbr: 'DRC', description: 'Coordinates NATCA response to natural disasters and emergencies affecting members and their communities.' },
  'dac': { name: 'Drug and Alcohol', abbr: 'DAC', description: 'Oversees substance abuse testing programs, advocates for member rights in testing processes, and provides support resources.' },
  'eap': { name: 'Employee Assistance Program', abbr: 'EAP', description: 'Provides confidential counseling, referral services, and support for members dealing with personal or professional challenges.' },
  'nec': { name: 'Election', abbr: 'NEC', description: 'Manages NATCA national elections, ensures fair voting processes, and certifies election results.' },
  'esc': { name: 'Election Support', abbr: 'ESC', description: 'Provides logistical and procedural support for local and regional election processes.' },
  'nfc': { name: 'Finance', abbr: 'NFC', description: 'Oversees NATCA financial operations, budget development, auditing, and fiduciary responsibility.' },
  'nhc': { name: 'Historical', abbr: 'NHC', description: 'Preserves and documents NATCA history, milestones, and the legacy of the air traffic control profession.' },
  'itc': { name: 'Information Technology', abbr: 'ITC', description: 'Manages NATCA technology infrastructure, digital services, and member-facing applications.' },
  'nlc': { name: 'National Legislative', abbr: 'NLC', description: 'Leads congressional advocacy, political strategy, and grassroots legislative campaigns.' },
  'ncc': { name: 'National Constitution', abbr: 'NCC', description: 'Interprets the NATCA constitution and proposes amendments for consideration at conventions.' },
  'noc': { name: 'Organizing', abbr: 'NOC', description: 'Organizes new bargaining units and supports local organizing efforts to grow NATCA membership.' },
  'nsc': { name: 'Safety', abbr: 'NSC', description: 'National safety committee overseeing policy development, safety programs, and FAA collaboration on safety initiatives.' },
  'nstlc': { name: 'Safety & Technology Leadership Council', abbr: 'NSTLC', description: 'Provides strategic oversight and coordination of safety and technology programs across all NATCA committees.' },
  'ntc': { name: 'National Training', abbr: 'NTC', description: 'Develops and delivers training programs for NATCA representatives at all levels of the organization.' },
  'onboarding': { name: 'Onboarding', abbr: '', description: 'Welcomes and orients new NATCA members, providing resources and mentorship for new hires entering the workforce.' },
  'osha': { name: 'Occupational Safety and Health', abbr: 'OSHA', description: 'Handles workplace safety inspections, hazard reporting, OSHA compliance, and facility health standards.' },
  'ps': { name: 'Professional Standards', abbr: 'PS', description: 'Facilitates peer-to-peer conflict resolution and promotes professional conduct among controllers.' },
  'reloaded': { name: 'Reloaded', abbr: '', description: 'Mid-career engagement and development program helping experienced members reinvigorate their union involvement.' },
  'rnav': { name: 'RNAV', abbr: 'RNAV', description: 'Focuses on area navigation procedures, performance-based navigation, and NextGen route development.' },
  's804': { name: 'Section 804', abbr: 'S804', description: 'Oversees implementation of Section 804 personnel reform provisions affecting NATCA members.' },
  'us': { name: 'Union Synergy', abbr: 'US', description: 'Promotes cross-committee collaboration and strategic alignment across NATCA programs and initiatives.' },
}

const committee = computed(() => committees[slug.value] ?? null)
</script>
