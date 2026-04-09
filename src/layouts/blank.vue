<script setup lang="ts">
</script>

<template>
  <div class="layout-wrapper layout-blank">
    <RouterView />
  </div>
</template>

<style>
.layout-wrapper.layout-blank {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
