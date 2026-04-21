<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon
              icon="mdi-account"
              class="me-2"
            />
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
            <div
              v-else-if="loading || mynatcaLoading"
              class="text-center"
            >
              <VProgressCircular
                indeterminate
                color="primary"
              />
              <p class="mt-2">
                Loading your profile...
              </p>
            </div>
            <div v-else>
              <VRow>
                <!-- Basic Information -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCard
                    variant="outlined"
                    class="mb-4"
                  >
                    <VCardTitle>Basic Information</VCardTitle>
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <VTextField
                            :model-value="fullName"
                            label="Full Name"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="6">
                          <VTextField
                            :model-value="memberNumber"
                            label="Member Number"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="6">
                          <VTextField
                            :model-value="username"
                            label="Username"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Facility Information -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCard
                    variant="outlined"
                    class="mb-4"
                  >
                    <VCardTitle>Facility Information</VCardTitle>
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <VTextField
                            :model-value="facilityName"
                            label="Primary Facility"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="6">
                          <VTextField
                            :model-value="facilityCode"
                            label="Facility Code"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                        <VCol cols="6">
                          <VTextField
                            :model-value="regionName"
                            label="Region"
                            readonly
                            variant="outlined"
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <!-- Contact Information from MyNATCA API -->
              <VRow v-if="mynatcaProfile">
                <!-- Email Addresses -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCard
                    variant="outlined"
                    class="mb-4"
                  >
                    <VCardTitle class="d-flex align-center">
                      <VIcon
                        icon="mdi-email"
                        class="me-2"
                      />
                      Email Addresses
                    </VCardTitle>
                    <VCardText>
                      <div
                        v-for="email in allEmails"
                        :key="email.id"
                        class="d-flex align-center py-1"
                      >
                        <VIcon
                          :icon="email.isprimary ? 'mdi-star' : 'mdi-star-outline'"
                          :color="email.isprimary ? 'amber' : 'grey'"
                          size="small"
                          class="me-2"
                        />
                        <VIcon
                          icon="mdi-email"
                          size="small"
                          class="me-2 text-primary"
                        />
                        <span class="text-body-2">{{ email.email }}</span>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Phone Numbers -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCard
                    variant="outlined"
                    class="mb-4"
                  >
                    <VCardTitle class="d-flex align-center">
                      <VIcon
                        icon="mdi-phone"
                        class="me-2"
                      />
                      Phone Numbers
                    </VCardTitle>
                    <VCardText>
                      <div
                        v-for="phone in allPhones"
                        :key="phone.id"
                        class="d-flex align-center py-1"
                      >
                        <VIcon
                          :icon="phone.isprimary ? 'mdi-star' : 'mdi-star-outline'"
                          :color="phone.isprimary ? 'amber' : 'grey'"
                          size="small"
                          class="me-2"
                        />
                        <VIcon
                          :icon="getPhoneIcon(phone.phonetype)"
                          size="small"
                          class="me-2 text-primary"
                        />
                        <span class="text-body-2">{{ phone.number }}</span>
                        <VChip
                          size="x-small"
                          variant="outlined"
                          class="ml-2"
                        >
                          {{ phone.phonetype }}
                        </VChip>
                      </div>
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
                          color="primary"
                          :loading="loading || mynatcaLoading"
                          @click="refreshData"
                        >
                          <VIcon
                            icon="mdi-refresh"
                            class="me-2"
                          />
                          Refresh Data
                        </VBtn>
                        <VBtn
                          color="error"
                          variant="outlined"
                          @click="logout"
                        >
                          <VIcon
                            icon="mdi-logout"
                            class="me-2"
                          />
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
import { computed, onMounted, watch } from 'vue'
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { isAuthenticated, logout } = useAuth0()
const memberStore = useMemberStore()

// Destructure reactive values from store
const {
  loading,
  mynatcaLoading,
  currentMember,
  mynatcaProfile,
  fullName,
  username,
  memberNumber,
  facilityCode,
  facilityName,
  regionName,
  allEmails,
  allPhones,
  fetchMemberData,
  fetchMyNATCAProfile
} = memberStore

// Helper function to get appropriate phone icon
const getPhoneIcon = (phoneType: string) => {
  switch (phoneType?.toLowerCase()) {
    case 'cell':
      return 'mdi-cellphone'
    case 'home':
      return 'mdi-home'
    case 'work':
      return 'mdi-briefcase'
    case 'fax':
      return 'mdi-fax'
    default:
      return 'mdi-phone'
  }
}

// Refresh all member data
const refreshData = async () => {
  if (memberNumber && currentMember?.natca_id) {
    await Promise.all([
      fetchMemberData(memberNumber, currentMember.natca_id, true),
      fetchMyNATCAProfile(currentMember.natca_id, true)
    ])
  }
}

onMounted(async () => {
  if (isAuthenticated && memberNumber && currentMember?.natca_id) {
    // Load MyNATCA profile if we don't have it yet
    if (!mynatcaProfile) {
      await fetchMyNATCAProfile(currentMember.natca_id)
    }
  }
})

// Watch for authentication changes
watch(isAuthenticated, (authenticated) => {
  if (authenticated && memberNumber && currentMember?.natca_id) {
    fetchMyNATCAProfile(currentMember.natca_id)
  }
})
</script>