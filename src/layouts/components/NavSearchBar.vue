<script setup lang="ts">
// TODO: Re-enable AI chat search once ai_conversations table is created
// import AIChatSearch from '@/components/AIChatSearch.vue'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <!-- AI-Powered Master Search - Temporarily disabled -->
  <div
    class="flex-grow-1 mx-4"
    v-bind="$attrs"
  >
    <!-- <AIChatSearch /> -->
    <VTextField
      placeholder="Search MyNATCA Hub..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      disabled
      class="search-field"
    />
  </div>
</template>

<style lang="scss">
@use "@styles/variables/vuetify.scss";

.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  font-size: 0.8125rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}

.app-bar-search-dialog {
  .custom-letter-spacing {
    letter-spacing: 0.8px;
  }

  .card-list {
    --v-card-list-gap: 8px;
  }
}
</style>
