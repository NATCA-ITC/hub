<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Staffing Standards & Reviews"
      subtitle="Facility staffing standards, CPC targets, and the review process"
    />

    <!-- Overview -->
    <div id="overview">
      <NatcaCard title="About Staffing Standards">
        <p class="text-body-2 mb-3">
          Staffing standards define the CPC (Certified Professional Controller) target for each
          facility based on traffic volume, complexity, and operational requirements. These targets
          are the foundation of the NCEPT process — they determine whether a facility is gaining
          or releasing controllers.
        </p>
        <p class="text-body-2 mb-3">
          The Staffing Workbook (SWB) is the authoritative document for each facility's staffing
          numbers. FacReps and ATMs should regularly review their SWB for accuracy, as it directly
          impacts NCEPT panel decisions.
        </p>
        <NatcaAnnotation type="warning">
          <strong>SWB accuracy is critical.</strong> Inaccurate staffing workbooks can result in
          facilities being incorrectly categorized as gaining or releasing at the NCEPT panel.
          Schedule regular reviews with your ATM.
        </NatcaAnnotation>
      </NatcaCard>
    </div>

    <!-- Key Metrics -->
    <div id="metrics">
      <NatcaCard title="Key Metrics">
        <VTable>
          <thead>
            <tr>
              <th>Metric</th>
              <th>What It Measures</th>
              <th>Used For</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in metrics" :key="metric.name">
              <td class="font-weight-medium">{{ metric.name }}</td>
              <td>{{ metric.description }}</td>
              <td>{{ metric.usage }}</td>
            </tr>
          </tbody>
        </VTable>
      </NatcaCard>
    </div>

    <!-- Thresholds -->
    <div id="thresholds">
      <NatcaCard title="Current Thresholds">
        <NatcaStatGrid :cols="3">
          <NatcaStatCard label="Releasing Threshold" value="≥ 81%" change="Current CPC to Target" change-color="info" />
          <NatcaStatCard label="12-Month ETT" value="≥ 85%" change="Expected To Target" change-color="info" />
          <NatcaStatCard label="En Route Gaining" value="TBD" change="Set per panel via PPT" />
        </NatcaStatGrid>
        <p class="text-body-2 mt-4 text-medium-emphasis">
          Thresholds are reviewed and may be adjusted at each NCEPT panel based on national staffing
          conditions. The releasing threshold was updated in January 2026 following CRWG updates.
        </p>
      </NatcaCard>
    </div>

    <!-- Documents -->
    <div id="documents">
      <NatcaCard title="Documents & Resources">
        <div class="d-flex flex-column ga-3">
          <DocumentLink
            title="NCEPT Standard Operating Procedures"
            subtitle="Includes staffing standard methodology and review process"
            url="https://www.natca.org/wp-content/uploads/2020/06/2019-NCEPT-SOP-May-2019.pdf"
            @view="openViewer"
          />
        </div>
        <NatcaAnnotation type="tip" class="mt-4">
          <strong>Facility-level data:</strong> Per-facility staffing metrics (CPC target, on-board,
          training pipeline) are available in the monthly PPT and ETT reports on the
          <router-link to="/employee-movement/ncept#charts">NCEPT page</router-link>.
        </NatcaAnnotation>
      </NatcaCard>
    </div>

    <DocumentViewer v-model="viewerOpen" :title="viewerTitle" :url="viewerUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NatcaPageHeader, NatcaCard, NatcaAnnotation, NatcaStatGrid, NatcaStatCard } from '@natca-itc/ui-shell'
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

const metrics = [
  { name: 'CPC Target', description: 'Number of certified controllers the facility needs', usage: 'Releasing/gaining determination' },
  { name: 'Current CPC On-Board', description: 'Actual certified controllers at the facility (from SWB)', usage: 'Percent-to-target calculation' },
  { name: '% CPC to Target', description: 'Current on-board divided by target', usage: 'Releasing threshold (≥81%)' },
  { name: 'Expected To Target (ETT)', description: 'Projected staffing including training pipeline, inbounds, outbounds, retirements', usage: '12-month ETT threshold (≥85%)' },
  { name: 'Training Success Rate', description: 'Historical certification rate for trainees at the facility', usage: 'Projected certification calculations' },
  { name: 'ERR Category', description: 'Facility classification (None, Category 1, Category 2) based on staffing position', usage: 'Panel priority and draft order' },
  { name: 'Staffing Workbook (SWB)', description: 'Authoritative facility staffing document maintained by management', usage: 'Source data for all CPC counts' },
]
</script>
