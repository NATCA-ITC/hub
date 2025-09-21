<template>
  <div class="pa-4">
    <VCard>
      <VCardTitle>
        <VIcon icon="mdi-database" class="me-2" />
        Database Structure Explorer
      </VCardTitle>
      <VCardText>
        <VBtn
          color="primary"
          @click="exploreDatabase"
          :loading="loading"
          class="mb-4"
        >
          <VIcon icon="mdi-refresh" class="me-2" />
          Explore Database Structure
        </VBtn>

        <!-- Tables List -->
        <div v-if="exploration.tables.length > 0" class="mb-6">
          <h3 class="text-h6 mb-2">Available Tables ({{ exploration.tables.length }})</h3>
          <VChip
            v-for="table in exploration.tables"
            :key="table"
            class="ma-1"
            :color="keyTables.includes(table) ? 'primary' : 'default'"
          >
            {{ table }}
          </VChip>
        </div>

        <!-- Key Tables Details -->
        <div v-if="Object.keys(exploration.tableDetails).length > 0">
          <h3 class="text-h6 mb-4">Key Tables Structure</h3>

          <VExpansionPanels class="mb-4">
            <VExpansionPanel
              v-for="[tableName, columns] in Object.entries(exploration.tableDetails)"
              :key="tableName"
              :title="tableName"
            >
              <VExpansionPanelText>
                <!-- Table Structure -->
                <h4 class="text-subtitle-1 mb-2">Columns</h4>
                <VTable>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                      <th>Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="column in columns" :key="column.column_name">
                      <td><code>{{ column.column_name }}</code></td>
                      <td>{{ column.data_type }}</td>
                      <td>{{ column.is_nullable }}</td>
                    </tr>
                  </tbody>
                </VTable>

                <!-- Sample Data -->
                <h4 class="text-subtitle-1 mt-4 mb-2">Sample Data</h4>
                <div v-if="exploration.sampleData[tableName]?.length > 0">
                  <pre class="text-caption">{{ JSON.stringify(exploration.sampleData[tableName], null, 2) }}</pre>
                </div>
                <div v-else class="text-caption text-medium-emphasis">
                  No sample data available
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>

        <!-- Member Details Test -->
        <div v-if="memberSample.length > 0" class="mt-6">
          <h3 class="text-h6 mb-2">Sample Member Data with Details</h3>
          <VTable>
            <thead>
              <tr>
                <th>Member Number</th>
                <th>Name</th>
                <th>Member Type ID</th>
                <th>Facility</th>
                <th>Region</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in memberSample" :key="member.member_number">
                <td>{{ member.member_number }}</td>
                <td>{{ member.first_name }} {{ member.last_name }}</td>
                <td>{{ member.member_type_id }}</td>
                <td>{{ member.facility_code }}</td>
                <td>{{ member.region_code }}</td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <!-- Error Display -->
        <VAlert
          v-if="error"
          type="error"
          class="mt-4"
          :text="error"
        />
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DatabaseExplorer } from '@/utils/exploreDatabase'

// Component state
const loading = ref(false)
const error = ref<string | null>(null)
const exploration = ref({
  tables: [] as string[],
  tableDetails: {} as Record<string, any[]>,
  sampleData: {} as Record<string, any[]>
})
const memberSample = ref<any[]>([])

// Key tables we're interested in
const keyTables = ['members', 'facilities', 'regions', 'positions', 'member_types']

// Explore database function
const exploreDatabase = async () => {
  loading.value = true
  error.value = null

  try {
    // Get full structure
    exploration.value = await DatabaseExplorer.exploreFullStructure()

    // Get sample member data
    memberSample.value = await DatabaseExplorer.getMemberWithDetails()

    console.log('Database exploration completed:', exploration.value)
    console.log('Sample member data:', memberSample.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to explore database'
    console.error('Database exploration error:', err)
  } finally {
    loading.value = false
  }
}
</script>