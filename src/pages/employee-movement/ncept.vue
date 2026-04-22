<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="NCEPT"
      subtitle="National Centralized ERR Process Team — staffing data and placement metrics"
    />

    <div id="staffing-snapshot">
      <NatcaStatGrid :cols="4">
        <NatcaStatCard label="National CPC Target" value="—" change="Data pending" />
        <NatcaStatCard label="Current On-Board" value="—" change="Data pending" />
        <NatcaStatCard label="% to Target" value="—" change="Data pending" />
        <NatcaStatCard label="In Training" value="—" change="Data pending" />
      </NatcaStatGrid>
    </div>

    <div id="staffing-overview">
      <NatcaCard title="Staffing Overview">
        <NatcaEmptyState
          icon="mdi-chart-timeline-variant"
          title="NCEPT data coming soon"
          description="National staffing metrics and facility-level CPC data will be available here once the Platform API is connected."
        />
      </NatcaCard>
    </div>

    <div id="facility-data">
      <NatcaCard title="Facility Staffing Data">
        <NatcaEmptyState
          icon="mdi-office-building"
          title="Facility data coming soon"
          description="Per-facility CPC targets, on-board counts, training pipeline, and percent-to-target metrics."
        />
      </NatcaCard>
    </div>

    <div id="placement-lists">
      <NatcaCard title="Priority & Selection Lists">
        <NatcaEmptyState
          icon="mdi-format-list-numbered"
          title="Lists coming soon"
          description="Current and historical NCEPT priority and selection lists. Reference documents will be embedded from DMS."
        />
      </NatcaCard>
    </div>

    <div id="charts">
      <NatcaCard title="Charts & Trends">
        <NatcaEmptyState
          icon="mdi-chart-line"
          title="Charts coming soon"
          description="Staffing trends, training success rates, retirement projections, and historical placement data."
        />
      </NatcaCard>
    </div>

    <div id="err-process">
      <NatcaCard title="ERR Process">
        <NatcaEmptyState
          icon="mdi-file-document-check"
          title="Process documentation coming soon"
          description="ERR submission timelines, eligibility requirements, and step-by-step process guides."
        />
      </NatcaCard>
    </div>

    <div id="resources">
      <NatcaCard title="Resources & Documents">
        <NatcaEmptyState
          icon="mdi-file-document-multiple"
          title="Documents migrating"
          description="NCEPT reference materials, FAQs, and archived documents will be embedded from DMS."
        />
      </NatcaCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NatcaPageHeader, NatcaStatGrid, NatcaStatCard, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
</script>
