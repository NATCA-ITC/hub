<template>
  <div
    v-if="isAuthenticated"
    class="ds-card"
  >
    <div class="ds-card__header">
      <VIcon
        icon="mdi-account"
        size="18"
      />
      <span>Profile</span>
    </div>
    <div class="ds-card__body">
      <div class="profile-field">
        <span class="profile-field__label">Username</span>
        <span class="profile-field__value">
          <template v-if="memberStore.loading">Loading...</template>
          <template v-else>{{ memberStore.username || user?.email?.split('@')[0] || 'N/A' }}</template>
        </span>
      </div>

      <div class="profile-field">
        <span class="profile-field__label">Email</span>
        <div
          v-if="memberStore.mynatcaLoading"
          class="profile-field__value"
        >
          Loading...
        </div>
        <div
          v-else-if="memberStore.allEmails?.length > 0"
          class="profile-field__list"
        >
          <div
            v-for="email in memberStore.allEmails"
            :key="email.id"
            class="profile-field__list-item"
          >
            <span>{{ email.email }}</span>
            <VIcon
              v-if="email.isprimary"
              icon="mdi-star"
              color="amber"
              size="12"
            />
          </div>
        </div>
        <span
          v-else
          class="profile-field__value"
        >{{ user?.email || 'N/A' }}</span>
      </div>

      <div class="profile-field">
        <span class="profile-field__label">Phone</span>
        <div
          v-if="memberStore.mynatcaLoading"
          class="profile-field__value"
        >
          Loading...
        </div>
        <div
          v-else-if="memberStore.allPhones?.length > 0"
          class="profile-field__list"
        >
          <div
            v-for="phone in memberStore.allPhones"
            :key="phone.id"
            class="profile-field__list-item"
          >
            <VIcon
              :icon="getPhoneIcon(phone.phonetype)"
              size="12"
            />
            <span>{{ phone.number }}</span>
            <VIcon
              v-if="phone.isprimary"
              icon="mdi-star"
              color="amber"
              size="12"
            />
          </div>
        </div>
        <span
          v-else
          class="profile-field__value"
        >N/A</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@/composables/useAuth0'
import { useMemberStore } from '@/stores/memberStore'

const { user, isAuthenticated } = useAuth0()
const memberStore = useMemberStore()

const getPhoneIcon = (phoneType: string) => {
  switch (phoneType?.toLowerCase()) {
    case 'cell': return 'mdi-cellphone'
    case 'home': return 'mdi-home'
    case 'work': return 'mdi-briefcase'
    case 'fax': return 'mdi-fax'
    default: return 'mdi-phone'
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
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-field__label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.45);
}

.profile-field__value {
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.85);
}

.profile-field__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-field__list-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.85);
}
</style>
