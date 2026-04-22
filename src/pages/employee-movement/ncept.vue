<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NCEPT"
      subtitle="National Centralized ERR Process Team — staffing data and placement metrics"
    />

    <!-- Panel Notice -->
    <div id="staffing-snapshot">
      <NatcaAlert type="info">
        <strong>Next Panel:</strong> NCEPT panels for 2026 are scheduled for March, May, August, and November.
        Check the timeline document below for submission deadlines and key dates.
      </NatcaAlert>

      <NatcaStatGrid :cols="4" class="mt-4">
        <NatcaStatCard label="Releasing Threshold" value="≥ 81%" change="Current CPC to Target" change-color="info" />
        <NatcaStatCard label="ETT Threshold" value="≥ 85%" change="12-month Expected to Target" change-color="info" />
        <NatcaStatCard label="Next Panel" value="—" change="Date TBD" />
        <NatcaStatCard label="ERR Submissions" value="—" change="Data pending" />
      </NatcaStatGrid>
    </div>

    <!-- About NCEPT -->
    <div id="staffing-overview">
      <NatcaCard title="About NCEPT">
        <p class="text-body-2 mb-3">
          NCEPT is the sole process for the evaluation and approval/disapproval of Employee Requested
          Reassignment (ERR) from bargaining unit employees desiring consideration for placement to
          positions covered by the CBA. The goal of this process is to facilitate more timely releases
          of employees requesting transfer, while seeking to improve the distribution of the workforce.
          This process was developed in collaboration with NATCA and the FAA.
        </p>
        <p class="text-body-2 mb-3">
          All ERR requests will be processed by the National Centralized ERR Process Team (NCEPT)
          in accordance with the NCEPT SOP.
        </p>
        <NatcaAnnotation type="warning">
          <strong>Every FacRep and ATM should schedule meetings to review the accuracy of their
          Staffing Workbook (SWB).</strong> — The NCEPT Team
        </NatcaAnnotation>
      </NatcaCard>
    </div>

    <!-- Key Documents -->
    <div id="facility-data">
      <NatcaCard title="Key Documents">
        <div class="d-flex flex-column ga-3">
          <DocumentLink
            title="NCEPT Standard Operating Procedures (SOP)"
            subtitle="Governs the ERR process — required reading"
            url="https://www.natca.org/wp-content/uploads/2020/06/2019-NCEPT-SOP-May-2019.pdf"
            @view="openViewer"
          />
          <DocumentLink
            title="FAA Regional HR Points of Contact"
            subtitle="Updated February 12, 2026"
            url="https://www.natca.org/wp-content/uploads/2026/02/FAA-Regional-HR-Points-of-Contact-updated-2.12.26.pdf"
            @view="openViewer"
          />
          <DocumentLink
            title="NCEPT Timeline"
            subtitle="Panel dates, submission deadlines, and key milestones"
            url="https://www.natca.org/wp-content/uploads/2026/02/NCEPT-Timeline-Mar-2026.pdf"
            @view="openViewer"
          />
        </div>
      </NatcaCard>
    </div>

    <!-- Selection Lists -->
    <div id="placement-lists">
      <NatcaCard title="Selection Lists">
        <p class="text-body-2 mb-4">
          Published after each NCEPT panel with approved transfers and modifications.
        </p>
        <div class="d-flex flex-column ga-3">
          <DocumentLink
            title="March 17, 2026 NCEPT Selections"
            subtitle="Most recent selection list"
            url="https://www.natca.org/wp-content/uploads/2026/03/NCEPT-March-2026-Selections.pdf"
            @view="openViewer"
          />
        </div>

        <p class="text-body-2 mt-4 mb-2 font-weight-medium">Notable modifications after publishing:</p>
        <VList density="compact" class="bg-transparent">
          <VListItem prepend-icon="mdi-circle-small">TMB — CPC change from 20 to 19</VListItem>
          <VListItem prepend-icon="mdi-circle-small">ZTL — Placement list outbounds increased; projected to target changed to 90.40%</VListItem>
          <VListItem prepend-icon="mdi-circle-small">SNA — Placement list outbounds increased; 12-month ETT 84.91%</VListItem>
          <VListItem prepend-icon="mdi-circle-small">IAH — Placement list inbounds increased; projected over 100%</VListItem>
          <VListItem prepend-icon="mdi-circle-small">SEA — Placement list inbounds increased; one (1) possible gain</VListItem>
        </VList>
      </NatcaCard>
    </div>

    <!-- Monthly Reports -->
    <div id="charts">
      <NatcaCard title="Monthly Reports">
        <p class="text-body-2 mb-4">
          Staffing reports updated monthly. PPT and ETT data drives panel decisions.
        </p>
        <div class="d-flex flex-column ga-3">
          <DocumentLink
            title="Priority Placement Tool (PPT) — April 2026"
            subtitle="Monthly report — facility staffing vs. CPC targets"
            url="https://www.natca.org/wp-content/uploads/2026/03/NCEPT-Priority-Placement-Tool-April-2026-Monthly-Report.xlsx"
            @view="openViewer"
          />
          <DocumentLink
            title="Expected To Target (ETT) — April 2026"
            subtitle="Monthly report — projected staffing with training pipeline"
            url="https://www.natca.org/wp-content/uploads/2026/03/NCEPT-ETT-Expected-To-Target-April-2026-Monthly-Report.xlsx"
            @view="openViewer"
          />
          <DocumentLink
            title="NCEPT Draft Order — March 2026"
            subtitle="Facility selection order for the panel"
            url="https://www.natca.org/wp-content/uploads/2026/02/March-2026-NCEPT-Draft-Order.xlsx"
            @view="openViewer"
          />
          <DocumentLink
            title="ERR Demand"
            subtitle="ERR demand by facility — updated monthly with each PPT"
            url="https://www.natca.org/wp-content/uploads/2026/02/NCEPT-ERR-Demand-Feb-25-2026.xlsx"
            @view="openViewer"
          />
        </div>
      </NatcaCard>
    </div>

    <!-- ERR Process -->
    <div id="err-process">
      <NatcaCard title="ERR Submission">
        <p class="text-body-2 mb-3">
          ERR requests are submitted to your FAA Regional HR office. Please ensure you receive a fax
          or email confirmation from HR when submitting. Contact the NCEPT team if you do not receive
          confirmation and they will ensure valid ERRs are included for the panel.
        </p>
        <NatcaAnnotation>
          <strong>Northwest Mountain HR District:</strong> Due to a phone line disruption, please use
          <a href="mailto:9-ANM-AHR-empsvc@faa.gov">9-ANM-AHR-empsvc@faa.gov</a> until further notice.
        </NatcaAnnotation>
      </NatcaCard>
    </div>

    <!-- Resources -->
    <div id="resources">
      <NatcaCard title="Resources">
        <NatcaEmptyState
          icon="mdi-file-document-multiple"
          title="Historical documents migrating"
          description="Archived selection lists, panel data, and reference documents will be available through DMS."
        />
      </NatcaCard>
    </div>

    <!-- Document Viewer Lightbox -->
    <DocumentViewer
      v-model="viewerOpen"
      :title="viewerTitle"
      :url="viewerUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NatcaPageHeader, NatcaStatGrid, NatcaStatCard, NatcaCard, NatcaAlert, NatcaAnnotation, NatcaEmptyState } from '@natca-itc/ui-shell'
import DocumentLink from '@/components/DocumentLink.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'

const viewerOpen = ref(false)
const viewerTitle = ref('')
const viewerUrl = ref('')

function openViewer(url: string) {
  // Find the DocumentLink that triggered this to get the title
  const allLinks = document.querySelectorAll('.doc-link__title')
  for (const el of allLinks) {
    const linkEl = el.closest('.doc-link')
    if (linkEl) {
      const viewBtn = linkEl.querySelector('[class*="actions"] button')
      // Match by checking if the parent has the same URL
    }
  }
  viewerUrl.value = url
  // Extract filename as title fallback
  viewerTitle.value = decodeURIComponent(url.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/-/g, ' ') ?? 'Document')
  viewerOpen.value = true
}
</script>
