<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <VIcon icon="mdi-office-building" class="me-2" />
              Facilities Management
            </div>
            <VBtn
              color="primary"
              variant="outlined"
              @click="refreshFacilities"
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
              Please log in to view facilities information.
            </VAlert>
            <div v-else>
              <!-- Search and Filters -->
              <VRow class="mb-4">
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="searchQuery"
                    label="Search facilities..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    clearable
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="selectedRegion"
                    :items="regionOptions"
                    label="Filter by Region"
                    variant="outlined"
                    clearable
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="selectedType"
                    :items="facilityTypeOptions"
                    label="Filter by Type"
                    variant="outlined"
                    clearable
                  />
                </VCol>
              </VRow>

              <!-- Facilities Table -->
              <VDataTable
                :headers="facilityHeaders"
                :items="filteredFacilities"
                :loading="loading"
                item-key="facility_code"
                :search="searchQuery"
              >
                <template #item.status="{ item }">
                  <VChip
                    :color="getStatusColor(item.status)"
                    size="small"
                  >
                    {{ item.status }}
                  </VChip>
                </template>
                <template #item.actions="{ item }">
                  <VBtn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    @click="viewFacilityDetails(item)"
                  />
                  <VBtn
                    icon="mdi-server"
                    size="small"
                    variant="text"
                    @click="viewInfrastructure(item)"
                  />
                </template>
              </VDataTable>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Facility Details Dialog -->
    <VDialog
      v-model="detailsDialog"
      max-width="600"
    >
      <VCard v-if="selectedFacility">
        <VCardTitle>
          {{ selectedFacility.facility_name }}
          ({{ selectedFacility.facility_code }})
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="6">
              <p><strong>Code:</strong> {{ selectedFacility.facility_code }}</p>
              <p><strong>Region:</strong> {{ selectedFacility.region_code }}</p>
              <p><strong>Type:</strong> {{ selectedFacility.facility_type }}</p>
            </VCol>
            <VCol cols="6">
              <p><strong>Status:</strong>
                <VChip
                  :color="getStatusColor(selectedFacility.status)"
                  size="small"
                >
                  {{ selectedFacility.status }}
                </VChip>
              </p>
            </VCol>
          </VRow>

          <!-- Mock additional facility information -->
          <VDivider class="my-4" />
          <h4 class="mb-2">Contact Information</h4>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          <p><strong>Address:</strong> 123 Aviation Way, {{ selectedFacility.facility_name }}</p>

          <h4 class="mt-4 mb-2">Operating Hours</h4>
          <p><strong>24/7 Operations:</strong> Yes</p>
          <p><strong>Administrative Hours:</strong> Monday-Friday 8:00 AM - 5:00 PM</p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            variant="outlined"
            @click="viewInfrastructure(selectedFacility)"
          >
            View Infrastructure
          </VBtn>
          <VBtn @click="detailsDialog = false">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Using Auth0 integration
import { useAuth0 } from '@/composables/useAuth0'
import { useSupabase } from '@/composables/useSupabase'
import type { Facility } from '@/plugins/supabase'

const router = useRouter()
const { isAuthenticated } = useAuth0()
const { getFacilities } = useSupabase()

const loading = ref(false)
const facilities = ref<Facility[]>([])
const searchQuery = ref('')
const selectedRegion = ref<string | null>(null)
const selectedType = ref<string | null>(null)
const detailsDialog = ref(false)
const selectedFacility = ref<Facility | null>(null)

const facilityHeaders = [
  { title: 'Code', key: 'facility_code' },
  { title: 'Name', key: 'facility_name' },
  { title: 'Region', key: 'region_code' },
  { title: 'Type', key: 'facility_type' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const regionOptions = computed(() => {
  const regions = [...new Set(facilities.value.map(f => f.region_code))]
  return regions.map(region => ({ title: region, value: region }))
})

const facilityTypeOptions = computed(() => {
  const types = [...new Set(facilities.value.map(f => f.facility_type))]
  return types.map(type => ({ title: type, value: type }))
})

const filteredFacilities = computed(() => {
  let filtered = facilities.value

  if (selectedRegion.value) {
    filtered = filtered.filter(f => f.region_code === selectedRegion.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(f => f.facility_type === selectedType.value)
  }

  return filtered
})

const loadFacilities = async () => {
  loading.value = true
  try {
    const data = await getFacilities()
    facilities.value = data
  } catch (error) {
    console.error('Error loading facilities:', error)
  } finally {
    loading.value = false
  }
}

const refreshFacilities = async () => {
  await loadFacilities()
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'error'
    case 'maintenance':
      return 'warning'
    default:
      return 'default'
  }
}

const viewFacilityDetails = (facility: Facility) => {
  selectedFacility.value = facility
  detailsDialog.value = true
}

const viewInfrastructure = (facility: Facility) => {
  router.push({
    name: 'infrastructure',
    query: { facility: facility.facility_code }
  })
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadFacilities()
  }
})
</script>