<script setup lang="ts">
definePage({
  alias: '/pages/misc/not-found/:error(.*)',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div
    class="d-flex flex-column align-center justify-center"
    style="min-height: 100vh;"
  >
    <h1
      class="text-h1 font-weight-bold mb-2"
      style="color: var(--natca-navy, #003366);"
    >
      404
    </h1>
    <h4 class="text-h4 mb-2">
      Page Not Found
    </h4>
    <p class="text-body-1 text-medium-emphasis mb-6">
      We couldn't find the page you are looking for.
    </p>
    <VBtn
      to="/"
      color="primary"
    >
      Back to Home
    </VBtn>
  </div>
</template>
