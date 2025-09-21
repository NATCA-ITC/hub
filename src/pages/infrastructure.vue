<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <VIcon icon="mdi-server" class="me-2" />
              Infrastructure Monitoring
            </div>
            <VBtn
              color="primary"
              variant="outlined"
              @click="refreshData"
              :loading="loading"
            >
              <VIcon icon="mdi-refresh" class="me-2" />
              Refresh
            </VBtn>
          </VCardTitle>
          <VCardText>
            <VAlert
              v-if="!isAuthenticated"
              type="warning"
              class="mb-4"
            >
              Please log in to view infrastructure information.
            </VAlert>
            <div v-else>
              <VRow>
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="selectedFacility"
                    :items="facilityOptions"
                    label="Select Facility"
                    @update:model-value="loadFacilityInfrastructure"
                  />
                </VCol>
              </VRow>

              <div v-if="facilityInfrastructure" class="mt-4">
                <!-- Health Status Overview -->
                <VRow class="mb-4">
                  <VCol cols="12">
                    <VCard variant="outlined">
                      <VCardTitle>Health Status</VCardTitle>
                      <VCardText>
                        <VChip
                          :color="getHealthColor(facilityInfrastructure.healthStatus)"
                          size="large"
                        >
                          {{ facilityInfrastructure.healthStatus.toUpperCase() }}
                        </VChip>
                        <p class="mt-2 text-caption">
                          Last updated: {{ formatDate(facilityInfrastructure.lastUpdated) }}
                        </p>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>

                <!-- Servers -->
                <VRow class="mb-4">
                  <VCol cols="12">
                    <VCard>
                      <VCardTitle>
                        <VIcon icon="mdi-server" class="me-2" />
                        Servers ({{ facilityInfrastructure.servers.length }})
                      </VCardTitle>
                      <VCardText>
                        <VDataTable
                          :headers="serverHeaders"
                          :items="facilityInfrastructure.servers"
                          item-key="id"
                        >
                          <template #item.status="{ item }">
                            <VChip
                              :color="getStatusColor(item.status)"
                              size="small"
                            >
                              {{ item.status }}
                            </VChip>
                          </template>
                          <template #item.created="{ item }">
                            {{ formatDate(item.created) }}
                          </template>
                          <template #item.updated="{ item }">
                            {{ formatDate(item.updated) }}
                          </template>
                        </VDataTable>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>

                <!-- Load Balancers -->
                <VRow>
                  <VCol cols="12">
                    <VCard>
                      <VCardTitle>
                        <VIcon icon="mdi-scale-balance" class="me-2" />
                        Load Balancers ({{ facilityInfrastructure.loadBalancers.length }})
                      </VCardTitle>
                      <VCardText>
                        <VDataTable
                          :headers="loadBalancerHeaders"
                          :items="facilityInfrastructure.loadBalancers"
                          item-key="id"
                        >
                          <template #item.status="{ item }">
                            <VChip
                              :color="getStatusColor(item.status)"
                              size="small"
                            >
                              {{ item.status }}
                            </VChip>
                          </template>
                          <template #item.created="{ item }">
                            {{ formatDate(item.created.time) }}
                          </template>
                          <template #item.virtualIps="{ item }">
                            <div v-for="vip in item.virtualIps" :key="vip.id">
                              {{ vip.address }} ({{ vip.type }})
                            </div>
                          </template>
                        </VDataTable>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>
              </div>

              <VAlert v-else-if="!loading" type="info" class="mt-4">
                Select a facility to view infrastructure information.
              </VAlert>

              <div v-if="loading" class="text-center mt-4">
                <VProgressCircular indeterminate color="primary" />
                <p class="mt-2">Loading infrastructure data...</p>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// Using Auth0 integration
import { useAuth0 } from '@/composables/useAuth0'
import { useSupabase } from '@/composables/useSupabase'
import { rackspaceService, type FacilityInfrastructure } from '@/services/rackspace'

const { isAuthenticated } = useAuth0()
const { getFacilities } = useSupabase()

const loading = ref(false)
const facilities = ref<any[]>([])
const selectedFacility = ref<string | null>(null)
const facilityInfrastructure = ref<FacilityInfrastructure | null>(null)

const facilityOptions = computed(() => {
  return facilities.value.map(facility => ({
    title: `${facility.facility_code} - ${facility.facility_name}`,
    value: facility.facility_code,
  }))
})

const serverHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Status', key: 'status' },
  { title: 'Flavor', key: 'flavor.name' },
  { title: 'Created', key: 'created' },
  { title: 'Updated', key: 'updated' },
]

const loadBalancerHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Status', key: 'status' },
  { title: 'Protocol', key: 'protocol' },
  { title: 'Port', key: 'port' },
  { title: 'Algorithm', key: 'algorithm' },
  { title: 'Nodes', key: 'nodeCount' },
  { title: 'Virtual IPs', key: 'virtualIps' },
  { title: 'Created', key: 'created' },
]

const loadFacilities = async () => {
  loading.value = true
  try {
    facilities.value = await getFacilities()
  } catch (error) {
    console.error('Error loading facilities:', error)
  } finally {
    loading.value = false
  }
}

const loadFacilityInfrastructure = async () => {
  if (!selectedFacility.value) return

  loading.value = true
  try {
    facilityInfrastructure.value = await rackspaceService.getFacilityInfrastructure(selectedFacility.value)
  } catch (error) {
    console.error('Error loading facility infrastructure:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  if (selectedFacility.value) {
    await loadFacilityInfrastructure()
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'ERROR':
      return 'error'
    case 'BUILD':
    case 'PENDING_UPDATE':
      return 'warning'
    default:
      return 'default'
  }
}

const getHealthColor = (health: string) => {
  switch (health) {
    case 'healthy':
      return 'success'
    case 'warning':
      return 'warning'
    case 'critical':
      return 'error'
    default:
      return 'default'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadFacilities()
  }
})
</script>