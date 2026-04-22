<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Hardship Transfers"
      subtitle="Article 99, Section II — CBA hardship reassignment process"
    />

    <!-- Overview -->
    <div id="overview">
      <NatcaCard title="About Hardship Transfers">
        <p class="text-body-2 mb-3">
          The Hardship Transfer process allows bargaining unit employees to request reassignment to
          another facility based on qualifying personal hardship circumstances. Hardship transfers are
          governed by Article 99, Section II of the Collective Bargaining Agreement.
        </p>
        <p class="text-body-2 mb-3">
          Hardship requests are coordinated through your Regional Hardship Representative and evaluated
          by the NCEPT team alongside standard ERR requests. Approved hardships appear on the NCEPT
          Placement List as "Hardship" inbound/outbound entries.
        </p>
        <NatcaAnnotation>
          <strong>Regional coordination required:</strong> Hardship representatives in each region
          handle requests to ensure the process is consistent across all facilities. Contact your
          Regional VP office for your hardship representative.
        </NatcaAnnotation>
      </NatcaCard>
    </div>

    <!-- Process -->
    <div id="process">
      <NatcaCard title="Process">
        <div class="d-flex flex-column ga-4">
          <div v-for="(step, i) in processSteps" :key="i" class="d-flex ga-3 align-start">
            <VAvatar color="primary" size="28">
              <span class="text-caption font-weight-bold">{{ i + 1 }}</span>
            </VAvatar>
            <div>
              <p class="text-body-2 font-weight-medium mb-1">{{ step.title }}</p>
              <p class="text-body-2 text-medium-emphasis">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </NatcaCard>
    </div>

    <!-- Documents -->
    <div id="documents">
      <NatcaCard title="Documents & Resources">
        <div class="d-flex flex-column ga-3">
          <DocumentLink
            title="Article 99 — Reassignment (CBA)"
            subtitle="Collective Bargaining Agreement provisions for hardship transfers"
            url="#"
            type="pdf"
            @view="openViewer"
          />
          <DocumentLink
            title="Hardship Transfer Request Form"
            subtitle="Submit to your Regional Hardship Representative"
            url="#"
            type="pdf"
            @view="openViewer"
          />
        </div>
        <NatcaAnnotation type="tip" class="mt-4">
          <strong>Tip:</strong> Documents will be linked from DMS once integration is complete.
          Contact your FacRep or Regional VP office for current forms.
        </NatcaAnnotation>
      </NatcaCard>
    </div>

    <!-- Regional Contacts -->
    <div id="contacts">
      <NatcaCard title="Regional Hardship Representatives">
        <NatcaEmptyState
          icon="mdi-account-group"
          title="Contact list coming soon"
          description="Regional hardship representative contacts will be loaded from MyNATCA once the API is connected."
        />
      </NatcaCard>
    </div>

    <DocumentViewer v-model="viewerOpen" :title="viewerTitle" :url="viewerUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NatcaPageHeader, NatcaCard, NatcaAnnotation, NatcaEmptyState } from '@natca-itc/ui-shell'
import DocumentLink from '@/components/DocumentLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

const viewerOpen = ref(false)
const viewerTitle = ref('')
const viewerUrl = ref('')

function openViewer(url: string) {
  viewerUrl.value = url
  viewerTitle.value = decodeURIComponent(url.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/-/g, ' ') ?? 'Document')
  viewerOpen.value = true
}

const processSteps = [
  {
    title: 'Contact your FacRep',
    description: 'Discuss your situation with your facility representative. They can help determine if your circumstances qualify under Article 99, Section II.',
  },
  {
    title: 'Submit request to Regional Hardship Representative',
    description: 'Your FacRep or Regional VP office will connect you with the Regional Hardship Representative who coordinates all hardship requests in your region.',
  },
  {
    title: 'Regional review and coordination',
    description: 'The hardship representative reviews your request, coordinates with the gaining facility\'s region if applicable, and submits to the NCEPT team.',
  },
  {
    title: 'NCEPT panel evaluation',
    description: 'Hardship requests are evaluated alongside ERR requests at the NCEPT panel. Approved transfers appear on the Placement List as hardship entries.',
  },
  {
    title: 'Placement and release',
    description: 'If approved, your transfer is processed through standard placement procedures. Release timing depends on your facility\'s staffing situation.',
  },
]
</script>
