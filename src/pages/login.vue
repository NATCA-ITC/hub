<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useAuth0 } from '@/composables/useAuth0'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

// Set page title
useHead({
  title: 'Sign In - MyNATCA Hub'
})

const router = useRouter()
const route = useRoute()

const {
  isLoading,
  isAuthenticated,
  user,
  error,
  login
} = useAuth0()

// Handle login button click
const handleLogin = async () => {
  // Get redirect from query params, or default to home page
  // Use full URL for home page so Platform knows where to redirect
  const redirectPath = route.query.redirect as string || '/'
  const redirectUrl = redirectPath === '/' ? window.location.origin + '/' : redirectPath
  await login(redirectUrl)
}

// Redirect to dashboard if already authenticated
const redirectToDashboard = () => {
  const redirectTo = route.query.redirect as string || '/'
  router.push(redirectTo)
}

// Watch for authentication changes
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    // Small delay to show success message
    setTimeout(() => {
      redirectToDashboard()
    }, 1500)
  }
})

// Initialize auth on mount
onMounted(() => {
  // If already authenticated, redirect immediately
  if (isAuthenticated.value) {
    redirectToDashboard()
  }
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-8"
      max-width="500"
      width="100%"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="d-flex justify-center mb-4">
          <VImg
            src="/src/assets/images/natca/myNATCA-dark-logo.png"
            max-width="150"
            class="mb-4"
          />
        </div>
        <h1 class="text-h4 font-weight-bold mb-2">
          Welcome to MyNATCA Hub
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Your central dashboard for member services, updates, and resources
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center pa-8">
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
          class="mb-4"
        />
        <p class="text-body-2">Initializing authentication...</p>
      </div>

      <!-- Error State -->
      <VAlert
        v-if="error"
        type="error"
        class="mb-6"
        :text="error"
      />

      <!-- Login Content -->
      <div v-if="!isLoading && !isAuthenticated" class="text-center">
        <!-- Benefits Section -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">Access Your Member Dashboard</h3>
          <VRow class="mb-4">
            <VCol cols="12" sm="6">
              <div class="d-flex align-center pa-3">
                <VIcon icon="mdi-bell" color="primary" size="24" class="me-3" />
                <div class="text-start">
                  <p class="text-subtitle-2 mb-0">Member Updates</p>
                  <p class="text-caption text-medium-emphasis">Stay informed with latest news</p>
                </div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="d-flex align-center pa-3">
                <VIcon icon="mdi-email" color="success" size="24" class="me-3" />
                <div class="text-start">
                  <p class="text-subtitle-2 mb-0">Email Services</p>
                  <p class="text-caption text-medium-emphasis">Manage your NATCA email</p>
                </div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="d-flex align-center pa-3">
                <VIcon icon="mdi-robot" color="info" size="24" class="me-3" />
                <div class="text-start">
                  <p class="text-subtitle-2 mb-0">AI Assistant</p>
                  <p class="text-caption text-medium-emphasis">Get instant help and answers</p>
                </div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="d-flex align-center pa-3">
                <VIcon icon="mdi-chart-line" color="warning" size="24" class="me-3" />
                <div class="text-start">
                  <p class="text-subtitle-2 mb-0">Analytics & Reports</p>
                  <p class="text-caption text-medium-emphasis">Member statistics and data</p>
                </div>
              </div>
            </VCol>
          </VRow>
        </div>

        <!-- Login Button -->
        <VBtn
          color="primary"
          size="large"
          variant="flat"
          block
          @click="handleLogin"
          :loading="isLoading"
        >
          <VIcon icon="mdi-login" start />
          Sign In with MyNATCA Account
        </VBtn>

        <!-- Additional Info -->
        <div class="mt-6 pt-4 border-t">
          <p class="text-caption text-medium-emphasis text-center">
            Use your existing MyNATCA credentials to access the hub.<br>
            New to MyNATCA? Contact your local representative for account setup.
          </p>
        </div>
      </div>

      <!-- Already Authenticated -->
      <div v-if="!isLoading && isAuthenticated" class="text-center">
        <VIcon icon="mdi-check-circle" color="success" size="64" class="mb-4" />
        <h3 class="text-h6 mb-2">Welcome back, {{ user?.name }}!</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          You're already signed in. Redirecting to your dashboard...
        </p>
        <VBtn
          color="primary"
          variant="outlined"
          @click="redirectToDashboard"
        >
          Go to Dashboard
        </VBtn>
      </div>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
