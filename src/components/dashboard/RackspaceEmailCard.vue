<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <VIcon icon="mdi-email" class="me-2" />
        NATCA Email
      </div>
      <VTooltip location="top">
        <template #activator="{ props }">
          <VIcon
            v-bind="props"
            icon="mdi-information-outline"
            size="20"
            class="text-medium-emphasis"
          />
        </template>
        <span>Manage your @natca.net email address</span>
      </VTooltip>
    </VCardTitle>

    <VCardText>
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <VProgressCircular indeterminate color="primary" />
        <p class="mt-2 text-caption">Loading...</p>
      </div>

      <!-- Not Authenticated -->
      <div v-else-if="!isAuthenticated" class="text-medium-emphasis text-center py-4">
        Login to manage your NATCA email
      </div>

      <!-- Not Eligible -->
      <div v-else-if="!isEligible" class="text-center py-4">
        <VIcon icon="mdi-information" size="48" color="info" class="mb-2" />
        <p class="text-caption text-medium-emphasis">
          @natca.net email accounts are available for Active and Retired NATCA members only.
        </p>
      </div>

      <!-- Has Existing Email -->
      <div v-else-if="existingEmail" class="d-flex flex-column ga-3">
        <VAlert type="success" density="compact" variant="tonal">
          <div class="d-flex flex-column">
            <span class="text-caption mb-1"><strong>Your NATCA Email:</strong></span>
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">{{ existingEmail }}</span>
              <VBtn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                @click="copyToClipboard(existingEmail)"
              />
            </div>
          </div>
        </VAlert>

        <!-- Show password if just reset -->
        <VAlert v-if="newPassword" type="warning" density="compact" variant="tonal">
          <div class="d-flex flex-column">
            <span class="text-caption mb-1"><strong>New Password (save this!):</strong></span>
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2 font-weight-medium">{{ newPassword }}</span>
              <VBtn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                @click="copyToClipboard(newPassword)"
              />
            </div>
            <span class="text-caption text-medium-emphasis mt-1">
              This password will not be shown again. Save it securely.
            </span>
          </div>
        </VAlert>

        <VBtn
          color="warning"
          variant="tonal"
          block
          @click="showResetConfirmation = true"
          :loading="resetting"
        >
          <VIcon icon="mdi-lock-reset" class="me-2" />
          Reset Password
        </VBtn>
      </div>

      <!-- No Email - Show Options -->
      <div v-else class="d-flex flex-column ga-3">
        <VAlert type="info" density="compact" variant="tonal">
          Create your @natca.net email address
        </VAlert>

        <!-- Email Format Options -->
        <div v-if="availableOptions.length > 0" class="d-flex flex-column ga-2">
          <span class="text-caption text-medium-emphasis">Select your email format:</span>
          <div
            v-for="option in availableOptions"
            :key="option.email"
            class="d-flex align-center"
          >
            <VBtn
              :color="option.available ? 'primary' : 'default'"
              :variant="option.available ? 'tonal' : 'outlined'"
              block
              :disabled="!option.available"
              @click="selectEmailOption(option.email)"
            >
              <div class="d-flex align-center justify-space-between" style="width: 100%">
                <span>{{ option.email }}</span>
                <VIcon
                  v-if="option.available"
                  icon="mdi-check-circle"
                  color="success"
                  size="20"
                />
                <VIcon
                  v-else
                  icon="mdi-close-circle"
                  color="error"
                  size="20"
                />
              </div>
            </VBtn>
          </div>
        </div>

        <!-- Loading Options -->
        <div v-else-if="checkingAvailability" class="text-center py-2">
          <VProgressCircular indeterminate color="primary" size="32" />
          <p class="mt-2 text-caption">Checking availability...</p>
        </div>

        <!-- Check Availability Button -->
        <VBtn
          v-else
          color="primary"
          variant="tonal"
          block
          @click="checkEmailAvailability"
          :loading="checkingAvailability"
        >
          <VIcon icon="mdi-email-check" class="me-2" />
          Check Availability
        </VBtn>

        <!-- Show password if just created -->
        <VAlert v-if="newPassword" type="warning" density="compact" variant="tonal">
          <div class="d-flex flex-column">
            <span class="text-caption mb-1"><strong>Your Password (save this!):</strong></span>
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2 font-weight-medium">{{ newPassword }}</span>
              <VBtn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                @click="copyToClipboard(newPassword)"
              />
            </div>
            <span class="text-caption text-medium-emphasis mt-1">
              This password will not be shown again. Save it securely.
            </span>
          </div>
        </VAlert>
      </div>

      <!-- Error Alert -->
      <VAlert v-if="error" type="error" density="compact" variant="tonal" class="mt-3" closable @click:close="error = null">
        {{ error }}
      </VAlert>
    </VCardText>

    <!-- Create Email Confirmation Dialog -->
    <VDialog v-model="showCreateConfirmation" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="mdi-email-plus" class="me-2" />
          Create NATCA Email?
        </VCardTitle>
        <VCardText>
          <p class="mb-3">
            Are you sure you want to create the email address:
          </p>
          <VAlert type="info" density="compact" variant="tonal">
            <strong>{{ selectedEmail }}</strong>
          </VAlert>
          <p class="mt-3 text-caption text-medium-emphasis">
            You will receive a temporary password that you should save immediately.
            Each member can only have one @natca.net email address.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showCreateConfirmation = false">Cancel</VBtn>
          <VBtn
            color="primary"
            @click="confirmCreateEmail"
            :loading="creating"
          >
            Create Email
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Reset Password Confirmation Dialog -->
    <VDialog v-model="showResetConfirmation" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="mdi-lock-reset" class="me-2" />
          Reset Password?
        </VCardTitle>
        <VCardText>
          <p class="mb-3">
            Are you sure you want to reset the password for:
          </p>
          <VAlert type="info" density="compact" variant="tonal">
            <strong>{{ existingEmail }}</strong>
          </VAlert>
          <p class="mt-3 text-caption text-medium-emphasis">
            You will receive a new temporary password that you should save immediately.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showResetConfirmation = false">Cancel</VBtn>
          <VBtn
            color="warning"
            @click="confirmResetPassword"
            :loading="resetting"
          >
            Reset Password
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'
import { rackspaceEmailService, type EmailAvailabilityOption } from '@/services/rackspaceEmailService'

const { isAuthenticated, memberNumber } = useAuth0()
const memberStore = useMemberStore()

// Component state
const loading = ref(false)
const checkingAvailability = ref(false)
const creating = ref(false)
const resetting = ref(false)
const error = ref<string | null>(null)

// Email state
const existingEmail = ref<string | null>(null)
const availableOptions = ref<EmailAvailabilityOption[]>([])
const selectedEmail = ref<string | null>(null)
const newPassword = ref<string | null>(null)

// Dialog state
const showCreateConfirmation = ref(false)
const showResetConfirmation = ref(false)

// Check if member is eligible (membertypeid = 6, Active or Retired)
const isEligible = computed(() => {
  if (!memberStore.currentMember) return false
  const status = memberStore.currentMember.status
  const membertypeid = memberStore.currentMember.membertypeid
  return membertypeid === 6 && (status === 'Active' || status === 'Retired')
})

// Check for existing natca.net email in member's email list
watch(() => memberStore.allEmails, (emails) => {
  if (!emails) return
  const natcaEmail = emails.find(e => e.email?.endsWith('@natca.net'))
  if (natcaEmail) {
    existingEmail.value = natcaEmail.email
  }
}, { immediate: true })

// Check email availability
const checkEmailAvailability = async () => {
  if (!memberNumber.value) {
    error.value = 'Member number not found'
    return
  }

  try {
    error.value = null
    checkingAvailability.value = true

    const result = await rackspaceEmailService.checkAvailability(memberNumber.value)
    availableOptions.value = result.options

    // If neither base option is available, generate incremented options
    const anyAvailable = result.options.some(opt => opt.available)
    if (!anyAvailable) {
      // Take the first base format and start incrementing
      const baseFormat = result.options[0].email.split('@')[0]
      // We'll need to check these incrementally through the API
      // For now, show a message
      error.value = 'Both base formats are taken. Please contact support for custom email format.'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to check email availability'
    console.error('Email availability check error:', err)
  } finally {
    checkingAvailability.value = false
  }
}

// Select email option
const selectEmailOption = (email: string) => {
  selectedEmail.value = email
  showCreateConfirmation.value = true
}

// Confirm create email
const confirmCreateEmail = async () => {
  if (!memberNumber.value || !selectedEmail.value) return

  try {
    error.value = null
    creating.value = true

    // Extract email format (part before @)
    const emailFormat = selectedEmail.value.split('@')[0]

    const result = await rackspaceEmailService.createEmail(memberNumber.value, emailFormat)

    // Store new email and password
    existingEmail.value = result.email
    newPassword.value = result.password

    // Clear options
    availableOptions.value = []
    showCreateConfirmation.value = false

    // Refresh member data to update email list
    if (memberNumber.value && memberStore.currentMember?.natcaId) {
      await memberStore.fetchMemberData(memberNumber.value, memberStore.currentMember.natcaId)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create email account'
    console.error('Email creation error:', err)
  } finally {
    creating.value = false
  }
}

// Confirm reset password
const confirmResetPassword = async () => {
  if (!memberNumber.value) return

  try {
    error.value = null
    resetting.value = true

    const result = await rackspaceEmailService.resetPassword(memberNumber.value)

    // Store new password
    newPassword.value = result.password
    showResetConfirmation.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password'
    console.error('Password reset error:', err)
  } finally {
    resetting.value = false
  }
}

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could show a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>
