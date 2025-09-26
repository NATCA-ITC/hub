<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <span class="text-subtitle-1 me-2">{{ user?.name || 'User Profile' }}</span>
        <span
          v-if="isAuthenticated"
          class="text-body-2 font-weight-bold text-uppercase"
        >
          <span v-if="memberStore.loading">Loading...</span>
          <span v-else>{{ memberStore.regionCode }} | {{ memberStore.facilityCode }}</span>
        </span>
      </div>
      <VMenu v-if="isAuthenticated">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon
            variant="text"
            size="small"
          >
            <VIcon icon="mdi-dots-vertical" />
          </VBtn>
        </template>
        <VList density="compact">
          <VListItem @click="openMyNATCA">
            <template #prepend>
              <VAvatar size="20" class="me-1">
                <VImg src="/src/assets/images/natca/myNATCA-dark-logo.png" />
              </VAvatar>
            </template>
            <VListItemTitle>MyNATCA Portal</VListItemTitle>
          </VListItem>
          <VListItem @click="resetPassword">
            <template #prepend>
              <VIcon icon="mdi-lock" />
            </template>
            <VListItemTitle>Reset Password</VListItemTitle>
          </VListItem>
          <VListItem @click="logout">
            <template #prepend>
              <VIcon icon="mdi-logout" />
            </template>
            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VCardTitle>
    <VCardText>
      <div v-if="isAuthenticated">
        <div class="mb-0">
          <p class="mb-1 text-caption">
            <strong>Username</strong>
            <span v-if="memberStore.loading">Loading...</span>
            <span v-else>{{ memberStore.username || user?.email?.split('@')[0] || 'N/A' }}</span>
          </p>

          <!-- Email Addresses -->
          <div class="mb-2">
            <p class="text-caption mb-1"><strong>Email Addresses</strong></p>
            <div v-if="memberStore.mynatcaLoading" class="text-caption text-medium-emphasis">
              Loading...
            </div>
            <div v-else-if="memberStore.allEmails?.length > 0" class="d-flex flex-column ga-1">
              <div
                v-for="email in memberStore.allEmails"
                :key="email.id"
                class="d-flex align-center text-caption"
              >
                <VIcon icon="mdi-email" size="12" class="me-1 text-primary" />
                <span>{{ email.email }}</span>
                <VIcon
                  v-if="email.isprimary"
                  icon="mdi-star"
                  color="amber"
                  size="12"
                  class="ml-1"
                />
              </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis">
              {{ user?.email || 'N/A' }}
            </div>
          </div>

          <!-- Phone Numbers -->
          <div class="mb-2">
            <p class="text-caption mb-1"><strong>Phone Numbers</strong></p>
            <div v-if="memberStore.mynatcaLoading" class="text-caption text-medium-emphasis">
              Loading...
            </div>
            <div v-else-if="memberStore.allPhones?.length > 0" class="d-flex flex-column ga-1">
              <div
                v-for="phone in memberStore.allPhones"
                :key="phone.id"
                class="d-flex align-center text-caption"
              >
                <VIcon
                  :icon="getPhoneIcon(phone.phonetype)"
                  size="12"
                  class="me-1 text-primary"
                />
                <span>{{ phone.number }}</span>
                <VIcon
                  v-if="phone.isprimary"
                  icon="mdi-star"
                  color="amber"
                  size="12"
                  class="ml-1"
                />
              </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis">
              N/A
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-medium-emphasis">
        Login to view profile
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { user, isAuthenticated, logout } = useAuth0()
const memberStore = useMemberStore()

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

const openMyNATCA = () => {
  window.open('https://my.natca.org', '_blank')
}

const resetPassword = () => {
  console.log('Reset password clicked')
  // TODO: Implement password reset functionality
}
</script>