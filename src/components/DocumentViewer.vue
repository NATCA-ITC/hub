<template>
  <VDialog v-model="visible" max-width="900" scrollable>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-2">
          <VIcon :icon="fileIcon" size="20" />
          <span>{{ title }}</span>
        </div>
        <div class="d-flex ga-1">
          <VBtn
            icon="mdi-download"
            size="small"
            variant="text"
            :href="url"
            target="_blank"
            download
          />
          <VBtn
            icon="mdi-open-in-new"
            size="small"
            variant="text"
            :href="url"
            target="_blank"
          />
          <VBtn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="visible = false"
          />
        </div>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-0" style="height: 75vh;">
        <iframe
          v-if="isPdf"
          :src="url"
          style="width: 100%; height: 100%; border: none;"
        />
        <div
          v-else
          class="d-flex flex-column align-center justify-center"
          style="height: 100%;"
        >
          <VIcon icon="mdi-file-download-outline" size="64" color="primary" class="mb-4" />
          <p class="text-body-1 font-weight-medium mb-2">{{ title }}</p>
          <p class="text-body-2 text-medium-emphasis mb-4">
            This file type cannot be previewed in the browser.
          </p>
          <VBtn color="primary" :href="url" target="_blank" download prepend-icon="mdi-download">
            Download File
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const visible = defineModel<boolean>({ default: false })

const props = defineProps<{
  title: string
  url: string
}>()

const isPdf = computed(() => props.url.endsWith('.pdf'))

const fileIcon = computed(() => {
  if (props.url.endsWith('.pdf')) return 'mdi-file-pdf-box'
  if (props.url.endsWith('.xlsx') || props.url.endsWith('.xls')) return 'mdi-file-excel'
  if (props.url.endsWith('.doc') || props.url.endsWith('.docx')) return 'mdi-file-word'
  return 'mdi-file-document'
})
</script>
