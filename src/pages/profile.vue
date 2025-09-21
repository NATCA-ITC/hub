<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="mdi-account" class="me-2" />
            Member Profile
          </VCardTitle>
          <VCardText>
            <VAlert
              v-if="!isAuthenticated"
              type="warning"
              class="mb-4"
            >
              Please log in to view your profile.
            </VAlert>
            <div v-else-if="isLoading" class="text-center">
              <VProgressCircular indeterminate color="primary" />
              <p class="mt-2">Loading your profile...</p>
            </div>
            <div v-else>
              <VRow>
                <VCol cols="12" md="6">
                  <VCard variant="outlined" class="mb-4">
                    <VCardTitle>Basic Information</VCardTitle>
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <VTextField
                            v-model="profile.name"
                            label="Full Name"
                            :readonly="!editMode"
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="12">
                          <VTextField
                            v-model="profile.email"
                            label="Email"
                            :readonly="!editMode"
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="6">
                          <VTextField
                            v-model="profile.memberNumber"
                            label="Member Number"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="6">
                          <VTextField
                            v-model="profile.region"
                            label="Region"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>

                <VCol cols="12" md="6">
                  <VCard variant="outlined" class="mb-4">
                    <VCardTitle>Facility Information</VCardTitle>
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <VTextField
                            v-model="profile.facility"
                            label="Primary Facility"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="12">
                          <VChipGroup>
                            <VChip
                              v-for="position in profile.positions"
                              :key="position"
                              color="primary"
                              variant="outlined"
                            >
                              {{ position }}
                            </VChip>
                          </VChipGroup>
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <!-- Actions -->
              <VRow>
                <VCol cols="12">
                  <VCard variant="outlined">
                    <VCardTitle>Profile Actions</VCardTitle>
                    <VCardText>
                      <div class="d-flex gap-3">
                        <VBtn
                          v-if="!editMode"
                          color="primary"
                          @click="enableEditMode"
                        >
                          <VIcon icon="mdi-pencil" class="me-2" />
                          Edit Profile
                        </VBtn>
                        <template v-else>
                          <VBtn
                            color="success"
                            @click="saveProfile"
                            :loading="saving"
                          >
                            <VIcon icon="mdi-content-save" class="me-2" />
                            Save Changes
                          </VBtn>
                          <VBtn
                            color="secondary"
                            variant="outlined"
                            @click="cancelEdit"
                          >
                            <VIcon icon="mdi-cancel" class="me-2" />
                            Cancel
                          </VBtn>
                        </template>

                        <VBtn
                          color="error"
                          variant="outlined"
                          @click="logout"
                        >
                          <VIcon icon="mdi-logout" class="me-2" />
                          Logout
                        </VBtn>
                      </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
// Using Auth0 integration
import { useAuth0 } from '@/composables/useAuth0'

const {
  user,
  isAuthenticated,
  isLoading,
  memberNumber,
  positions,
  region,
  facility,
  logout
} = useAuth0()

const editMode = ref(false)
const saving = ref(false)

const profile = reactive({
  name: '',
  email: '',
  memberNumber: '',
  region: '',
  facility: '',
  positions: [] as string[],
})

const originalProfile = reactive({
  name: '',
  email: '',
})

const loadProfile = () => {
  if (user.value) {
    profile.name = user.value.name || ''
    profile.email = user.value.email || ''
    profile.memberNumber = memberNumber.value?.toString() || ''
    profile.region = region.value || ''
    profile.facility = facility.value || ''
    profile.positions = positions.value || []

    // Store original values for cancel functionality
    originalProfile.name = profile.name
    originalProfile.email = profile.email
  }
}

const enableEditMode = () => {
  editMode.value = true
}

const cancelEdit = () => {
  profile.name = originalProfile.name
  profile.email = originalProfile.email
  editMode.value = false
}

const saveProfile = async () => {
  saving.value = true
  try {
    // Here you would typically make an API call to update the profile
    // For now, we'll just simulate a save operation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update original values
    originalProfile.name = profile.name
    originalProfile.email = profile.email

    editMode.value = false
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadProfile()
  }
})

// Watch for authentication changes
watch(user, () => {
  if (user.value) {
    loadProfile()
  }
}, { immediate: true })
</script>