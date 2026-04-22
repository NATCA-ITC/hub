<template>
  <div class="doc-link">
    <div class="doc-link__icon">
      <VIcon :icon="fileIcon" size="20" />
    </div>
    <div class="doc-link__info">
      <span class="doc-link__title">{{ title }}</span>
      <span v-if="subtitle" class="doc-link__subtitle">{{ subtitle }}</span>
    </div>
    <div class="doc-link__actions">
      <VTooltip location="top">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="$emit('view', url)"
          />
        </template>
        <span>View</span>
      </VTooltip>
      <VTooltip location="top">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="mdi-download"
            size="small"
            variant="text"
            :href="url"
            target="_blank"
            download
          />
        </template>
        <span>Download</span>
      </VTooltip>
      <VTooltip location="top">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="mdi-link-variant"
            size="small"
            variant="text"
            @click="copyLink"
          />
        </template>
        <span>{{ copied ? 'Copied!' : 'Copy link' }}</span>
      </VTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  url: string
  type?: 'pdf' | 'xlsx' | 'doc' | 'other'
}>()

defineEmits<{
  view: [url: string]
}>()

const copied = ref(false)

const fileIcon = computed(() => {
  switch (props.type ?? guessType(props.url)) {
    case 'pdf': return 'mdi-file-pdf-box'
    case 'xlsx': return 'mdi-file-excel'
    case 'doc': return 'mdi-file-word'
    default: return 'mdi-file-document'
  }
})

function guessType(url: string): string {
  if (url.endsWith('.pdf')) return 'pdf'
  if (url.endsWith('.xlsx') || url.endsWith('.xls')) return 'xlsx'
  if (url.endsWith('.doc') || url.endsWith('.docx')) return 'doc'
  return 'other'
}

async function copyLink() {
  await navigator.clipboard.writeText(props.url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.doc-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-border, rgba(var(--v-border-color), var(--v-border-opacity)));
  border-radius: var(--radius-md, 6px);
  transition: background 0.15s;
}

.doc-link:hover {
  background: var(--overlay-hover, rgba(var(--v-theme-on-surface), 0.04));
}

.doc-link__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-subtle, rgba(var(--v-theme-on-surface), 0.04));
  border-radius: 8px;
  flex-shrink: 0;
  color: var(--color-text-muted, rgba(var(--v-theme-on-surface), 0.6));
}

.doc-link__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.doc-link__title {
  font-family: var(--font-display, 'Barlow', sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.doc-link__subtitle {
  font-size: 11px;
  color: var(--color-text-faint, rgba(var(--v-theme-on-surface), 0.5));
  margin-top: 1px;
}

.doc-link__actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
</style>
