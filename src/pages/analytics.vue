<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="mdi-chart-line" class="me-2" />
            Member Analytics
          </VCardTitle>
          <VCardText>
            <VAlert
              v-if="!isAuthenticated"
              type="warning"
              class="mb-4"
            >
              Please log in to view analytics.
            </VAlert>
            <div v-else>
              <!-- Summary Cards -->
              <VRow class="mb-6">
                <VCol cols="12" sm="6" md="3">
                  <VCard color="primary" variant="flat">
                    <VCardText class="text-white">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h2 class="text-h4 font-weight-bold">{{ mockStats.totalMembers }}</h2>
                          <p class="text-subtitle-1">Total Members</p>
                        </div>
                        <VIcon icon="mdi-account-group" size="48" />
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="12" sm="6" md="3">
                  <VCard color="success" variant="flat">
                    <VCardText class="text-white">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h2 class="text-h4 font-weight-bold">{{ mockStats.activeFacilities }}</h2>
                          <p class="text-subtitle-1">Active Facilities</p>
                        </div>
                        <VIcon icon="mdi-office-building" size="48" />
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="12" sm="6" md="3">
                  <VCard color="info" variant="flat">
                    <VCardText class="text-white">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h2 class="text-h4 font-weight-bold">{{ mockStats.regionsCount }}</h2>
                          <p class="text-subtitle-1">Regions</p>
                        </div>
                        <VIcon icon="mdi-map" size="48" />
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="12" sm="6" md="3">
                  <VCard color="warning" variant="flat">
                    <VCardText class="text-white">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h2 class="text-h4 font-weight-bold">{{ mockStats.activePositions }}</h2>
                          <p class="text-subtitle-1">Active Positions</p>
                        </div>
                        <VIcon icon="mdi-briefcase" size="48" />
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <!-- Charts -->
              <VRow>
                <VCol cols="12" md="6">
                  <VCard>
                    <VCardTitle>Members by Region</VCardTitle>
                    <VCardText>
                      <apexchart
                        type="pie"
                        :options="pieChartOptions"
                        :series="membersByRegionSeries"
                        height="300"
                      />
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="12" md="6">
                  <VCard>
                    <VCardTitle>Membership Growth</VCardTitle>
                    <VCardText>
                      <apexchart
                        type="line"
                        :options="lineChartOptions"
                        :series="membershipGrowthSeries"
                        height="300"
                      />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <VRow class="mt-4">
                <VCol cols="12">
                  <VCard>
                    <VCardTitle>Position Distribution</VCardTitle>
                    <VCardText>
                      <apexchart
                        type="bar"
                        :options="barChartOptions"
                        :series="positionDistributionSeries"
                        height="400"
                      />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// Using Auth0 integration
import { useAuth0 } from '@/composables/useAuth0'

const { isAuthenticated } = useAuth0()

// Mock statistics data
const mockStats = ref({
  totalMembers: 12500,
  activeFacilities: 185,
  regionsCount: 15,
  activePositions: 3420,
})

// Pie chart for members by region
const membersByRegionSeries = ref([2500, 1800, 1600, 1400, 1200, 1000, 800, 700, 600, 500, 400, 300, 200, 150, 100])
const pieChartOptions = computed(() => ({
  chart: {
    type: 'pie',
  },
  labels: ['Eastern', 'Great Lakes', 'New England', 'Northwest Mountain', 'Southern', 'Southwest', 'Western Pacific', 'Central', 'Alaska', 'Hawaii', 'Terminal', 'TRACON', 'Center', 'Approach', 'Tower'],
  colors: ['#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#00796B', '#C2185B', '#303F9F', '#5D4037', '#616161', '#E64A19', '#FBC02D', '#00BCD4', '#795548', '#009688'],
  legend: {
    position: 'bottom',
  },
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
      },
    },
  }],
}))

// Line chart for membership growth
const membershipGrowthSeries = ref([{
  name: 'Total Members',
  data: [10800, 11200, 11600, 11900, 12100, 12300, 12500],
}])
const lineChartOptions = computed(() => ({
  chart: {
    type: 'line',
    zoom: {
      enabled: false,
    },
  },
  colors: ['#1976D2'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  },
  yaxis: {
    title: {
      text: 'Members',
    },
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5,
    },
  },
  markers: {
    size: 6,
  },
}))

// Bar chart for position distribution
const positionDistributionSeries = ref([{
  name: 'Active Positions',
  data: [850, 720, 680, 540, 380, 250, 180, 120, 90, 60],
}])
const barChartOptions = computed(() => ({
  chart: {
    type: 'bar',
  },
  colors: ['#388E3C'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: ['Controllers', 'Supervisors', 'TMU', 'QA/QC', 'Trainers', 'Management', 'Safety', 'Tech Ops', 'Admin', 'Other'],
  },
  yaxis: {
    title: {
      text: 'Number of Positions',
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} positions`,
    },
  },
}))
</script>