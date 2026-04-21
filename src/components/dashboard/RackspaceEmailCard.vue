<template>
  <div class="ds-card">
    <div class="ds-card__header">
      <VIcon
        icon="mdi-email"
        size="18"
      />
      <span>NATCA Email</span>
      <VTooltip location="top">
        <template #activator="{ props }">
          <VIcon
            v-bind="props"
            icon="mdi-information-outline"
            size="16"
            style="margin-left: auto; opacity: 0.5;"
          />
        </template>
        <span>Manage your @natca.net email address</span>
      </VTooltip>
    </div>

    <div class="ds-card__body">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="text-center py-4"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <p class="mt-2 text-caption">
          Loading...
        </p>
      </div>

      <!-- Not Authenticated -->
      <div
        v-else-if="!isAuthenticated"
        class="text-medium-emphasis text-center py-4"
      >
        Login to manage your NATCA email
      </div>

      <!-- Not Eligible (only show if we have member data and they're not eligible) -->
      <div
        v-else-if="memberStore.currentMember && !isEligible"
        class="text-center py-4"
      >
        <VIcon
          icon="mdi-information"
          size="48"
          color="info"
          class="mb-2"
        />
        <p class="text-caption text-medium-emphasis">
          @natca.net email accounts are available for Active and Retired NATCA members only.
        </p>
      </div>

      <!-- Has Existing Email -->
      <div
        v-else-if="existingEmail"
        class="email-active"
      >
        <!-- Email display -->
        <div class="email-display">
          <div class="email-display__label">
            Your Email
          </div>
          <div class="email-display__row">
            <VIcon
              icon="mdi-at"
              size="16"
              class="email-display__icon"
            />
            <span class="email-display__value">{{ existingEmail }}</span>
            <VBtn
              icon="mdi-content-copy"
              size="x-small"
              variant="text"
              density="comfortable"
              @click="copyToClipboard(existingEmail)"
            />
          </div>
        </div>

        <!-- New password alert (only after reset/create) -->
        <VAlert
          v-if="newPassword"
          type="warning"
          density="compact"
          variant="tonal"
          class="mt-3"
        >
          <div class="text-caption mb-1">
            <strong>New Password — save this, it won't show again</strong>
          </div>
          <div class="d-flex align-center justify-space-between">
            <code class="text-body-2">{{ newPassword }}</code>
            <VBtn
              icon="mdi-content-copy"
              size="x-small"
              variant="text"
              @click="copyToClipboard(newPassword)"
            />
          </div>
        </VAlert>

        <!-- Action row -->
        <div class="email-actions">
          <VBtn
            color="primary"
            variant="flat"
            size="small"
            href="https://webmail.natca.net"
            target="_blank"
            prepend-icon="mdi-email-open-outline"
          >
            Webmail
          </VBtn>
          <VBtn
            variant="outlined"
            size="small"
            :loading="resetting"
            prepend-icon="mdi-lock-reset"
            @click="showResetConfirmation = true"
          >
            Reset
          </VBtn>
          <VBtn
            variant="text"
            size="small"
            prepend-icon="mdi-cog-outline"
            @click="showConfigDialog = true"
          >
            Config
          </VBtn>
        </div>
      </div>

      <!-- No Email - Show Options -->
      <div
        v-else
        class="d-flex flex-column ga-3"
      >
        <VAlert
          type="info"
          density="compact"
          variant="tonal"
        >
          Create your @natca.net email address
        </VAlert>

        <!-- Email Format Options -->
        <div
          v-if="availableOptions.length > 0"
          class="d-flex flex-column ga-2"
        >
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
              <div
                class="d-flex align-center justify-space-between"
                style="width: 100%"
              >
                <span style="text-transform: none;">{{ option.email }}</span>
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
        <div
          v-else-if="checkingAvailability"
          class="text-center py-2"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="32"
          />
          <p class="mt-2 text-caption">
            Checking availability...
          </p>
        </div>

        <!-- Check Availability Button -->
        <VBtn
          v-else
          color="primary"
          variant="tonal"
          block
          :loading="checkingAvailability"
          @click="checkEmailAvailability"
        >
          <VIcon
            icon="mdi-email-check"
            class="me-2"
          />
          Check Availability
        </VBtn>

        <!-- Show password if just created -->
        <VAlert
          v-if="newPassword"
          type="warning"
          density="compact"
          variant="tonal"
        >
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
      <VAlert
        v-if="error"
        type="error"
        density="compact"
        variant="tonal"
        class="mt-3"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </VAlert>
    </div>

    <!-- Create Email Confirmation Dialog -->
    <VDialog
      v-model="showCreateConfirmation"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="mdi-email-plus"
            class="me-2"
          />
          Create NATCA Email?
        </VCardTitle>
        <VCardText>
          <p class="mb-3">
            Are you sure you want to create the email address:
          </p>
          <VAlert
            type="info"
            density="compact"
            variant="tonal"
          >
            <strong>{{ selectedEmail }}</strong>
          </VAlert>
          <p class="mt-3 text-caption text-medium-emphasis">
            You will receive a temporary password that you should save immediately.
            Each member can only have one @natca.net email address.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showCreateConfirmation = false">
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="creating"
            @click="confirmCreateEmail"
          >
            Create Email
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Reset Password Confirmation Dialog -->
    <VDialog
      v-model="showResetConfirmation"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="mdi-lock-reset"
            class="me-2"
          />
          Reset Password?
        </VCardTitle>
        <VCardText>
          <p class="mb-3">
            Are you sure you want to reset the password for:
          </p>
          <VAlert
            type="info"
            density="compact"
            variant="tonal"
          >
            <strong>{{ existingEmail }}</strong>
          </VAlert>
          <p class="mt-3 text-caption text-medium-emphasis">
            You will receive a new temporary password that you should save immediately.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showResetConfirmation = false">
            Cancel
          </VBtn>
          <VBtn
            color="warning"
            :loading="resetting"
            @click="confirmResetPassword"
          >
            Reset Password
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Configuration Dialog -->
    <VDialog
      v-model="showConfigDialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="mdi-cog"
            class="me-2"
          />
          Email Configuration
        </VCardTitle>
        <VCardText>
          <div class="d-flex flex-column ga-4">
            <!-- Server Settings -->
            <div>
              <h3 class="text-h6 mb-3">
                Server Settings
              </h3>

              <!-- Inbound IMAP -->
              <VAlert
                type="info"
                density="compact"
                variant="tonal"
                class="mb-3"
              >
                <div class="d-flex flex-column">
                  <span class="text-caption text-medium-emphasis mb-1">Inbound (Secure IMAP)</span>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        secure.emailsrvr.com
                      </div>
                      <div class="text-caption">
                        Port 993
                      </div>
                    </div>
                    <VBtn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      @click="copyToClipboard('secure.emailsrvr.com')"
                    />
                  </div>
                </div>
              </VAlert>

              <!-- Outbound SMTP -->
              <VAlert
                type="info"
                density="compact"
                variant="tonal"
              >
                <div class="d-flex flex-column">
                  <span class="text-caption text-medium-emphasis mb-1">Outbound (Secure SMTP)</span>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        secure.emailsrvr.com
                      </div>
                      <div class="text-caption">
                        Ports 465 or 587
                      </div>
                    </div>
                    <VBtn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      @click="copyToClipboard('secure.emailsrvr.com')"
                    />
                  </div>
                </div>
              </VAlert>
            </div>

            <!-- Help Links -->
            <div>
              <h3 class="text-h6 mb-3">
                Resources
              </h3>

              <VBtn
                color="primary"
                variant="tonal"
                block
                href="https://help.emailsrvr.com/dashboard/"
                target="_blank"
                class="mb-2"
              >
                <VIcon
                  icon="mdi-book-open-variant"
                  class="me-2"
                />
                Configuration Guide
                <VIcon
                  icon="mdi-open-in-new"
                  class="ms-2"
                  size="16"
                />
              </VBtn>

              <VBtn
                color="info"
                variant="tonal"
                block
                href="https://status.emailsrvr.com/"
                target="_blank"
              >
                <VIcon
                  icon="mdi-information"
                  class="me-2"
                />
                Service Status
                <VIcon
                  icon="mdi-open-in-new"
                  class="ms-2"
                  size="16"
                />
              </VBtn>
            </div>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showConfigDialog = false">
            Close
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
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
const showConfigDialog = ref(false)

// Check if member is eligible (membertypeid = 6, Active or Retired)
const isEligible = computed(() => {
  if (!memberStore.currentMember) return false
  const status = memberStore.currentMember.status
  const membertypeid = memberStore.currentMember.membertypeid
  return membertypeid === 6 && (status === 'Active' || status === 'Retired')
})

// Check MySQL for existing natca.net email when authenticated
watch([isAuthenticated, memberNumber], async ([auth, memberNum]) => {
  if (!auth || !memberNum) return

  try {
    const status = await rackspaceEmailService.getEmailStatus(memberNum)
    if (status.hasEmail && status.email) {
      existingEmail.value = status.email
    }
  } catch (err) {
    console.error('Failed to get email status:', err)
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

    // If member already has email, update state
    if (result.hasExisting && result.existingEmail) {
      existingEmail.value = result.existingEmail
      availableOptions.value = []
      return
    }

    // Show available options (including incremented formats from backend)
    availableOptions.value = result.options

    // If no options available at all, show error
    const anyAvailable = result.options.some(opt => opt.available)
    if (!anyAvailable) {
      error.value = 'No email formats available. Please contact support.'
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
    if (memberNumber.value && memberStore.currentMember?.natca_id) {
      await memberStore.fetchMemberData(memberNumber.value, memberStore.currentMember.natca_id)
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
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.ds-card {
  background: var(--color-shell-surface, #1e2130);
  border: 1px solid var(--color-border, rgba(255,255,255,0.08));
  border-radius: var(--radius-default, 6px);
  overflow: hidden;
}

.ds-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.08));
  font-family: var(--font-display, 'Barlow', sans-serif);
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.7);
}

.ds-card__body {
  padding: var(--space-4, 16px);
}

.email-display {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border, rgba(255,255,255,0.08));
  border-radius: var(--radius-default, 6px);
  padding: var(--space-3, 12px);
}

.email-display__label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 4px;
}

.email-display__row {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.email-display__icon {
  color: rgba(255,255,255,0.5);
  flex-shrink: 0;
}

.email-display__value {
  flex: 1;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-actions {
  display: flex;
  gap: var(--space-2, 8px);
  margin-top: var(--space-3, 12px);
  flex-wrap: wrap;
}
</style>
