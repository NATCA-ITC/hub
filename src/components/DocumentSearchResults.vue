<template>
  <div class="document-search-results">
    <!-- Header -->
    <div v-if="results.length > 0" class="mb-4">
      <h4 class="text-h6 mb-2">
        Found {{ results.length }} relevant {{ results.length === 1 ? 'document' : 'documents' }}
      </h4>
      <p class="text-body-2 text-medium-emphasis">
        Search results for: <strong>{{ query }}</strong>
      </p>
    </div>

    <!-- Results List -->
    <div v-if="results.length > 0" class="results-list">
      <VCard
        v-for="(doc, index) in results"
        :key="doc.document_id"
        class="mb-4"
        variant="outlined"
      >
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center flex-grow-1">
            <VIcon icon="mdi-file-document" color="primary" class="me-2" />
            <span class="text-subtitle-1">{{ doc.document_title }}</span>
          </div>
          <VChip
            :color="getSimilarityColor(doc.max_similarity)"
            size="small"
            variant="flat"
          >
            {{ Math.round(doc.max_similarity * 100) }}% match
          </VChip>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <!-- Document Metadata -->
          <div class="d-flex align-center gap-2 mb-3 text-caption text-medium-emphasis">
            <VIcon icon="mdi-chart-box" size="16" />
            <span>{{ doc.chunks.length }} relevant {{ doc.chunks.length === 1 ? 'section' : 'sections' }}</span>
            <VIcon icon="mdi-chart-line" size="16" class="ms-2" />
            <span>Avg. relevance: {{ Math.round(doc.avg_similarity * 100) }}%</span>
          </div>

          <!-- Document Chunks -->
          <div class="chunks-container">
            <div
              v-for="(chunk, chunkIndex) in getVisibleChunks(doc)"
              :key="chunk.chunk_id"
              class="chunk-item mb-3"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption text-medium-emphasis">
                  Section {{ chunk.chunk_index + 1 }}
                </span>
                <VProgressLinear
                  :model-value="chunk.similarity * 100"
                  :color="getSimilarityColor(chunk.similarity)"
                  height="4"
                  class="ms-2"
                  style="max-width: 100px"
                />
              </div>
              <div class="chunk-content text-body-2">
                {{ highlightQuery(chunk.content) }}
              </div>
            </div>

            <!-- Show More/Less Button -->
            <VBtn
              v-if="doc.chunks.length > defaultChunksToShow"
              variant="text"
              size="small"
              color="primary"
              @click="toggleExpanded(doc.document_id)"
            >
              <VIcon
                :icon="isExpanded(doc.document_id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                start
              />
              {{ isExpanded(doc.document_id)
                ? 'Show less'
                : `Show ${doc.chunks.length - defaultChunksToShow} more ${doc.chunks.length - defaultChunksToShow === 1 ? 'section' : 'sections'}`
              }}
            </VBtn>
          </div>
        </VCardText>

        <VDivider />

        <VCardActions>
          <VBtn
            color="primary"
            variant="flat"
            @click="viewDocument(doc)"
          >
            <VIcon icon="mdi-open-in-new" start />
            View Full Document
          </VBtn>
          <VSpacer />
          <VBtn
            variant="text"
            size="small"
            @click="copyToClipboard(doc)"
          >
            <VIcon icon="mdi-content-copy" start />
            Copy
          </VBtn>
        </VCardActions>
      </VCard>
    </div>

    <!-- No Results -->
    <VCard v-else variant="outlined" class="pa-6 text-center">
      <VIcon icon="mdi-file-search" size="64" color="medium-emphasis" class="mb-4" />
      <h4 class="text-h6 mb-2">No documents found</h4>
      <p class="text-body-2 text-medium-emphasis">
        Try rephrasing your search or using different keywords
      </p>
    </VCard>

    <!-- Copy Snackbar -->
    <VSnackbar
      v-model="showCopySnackbar"
      :timeout="2000"
      color="success"
    >
      <VIcon icon="mdi-check-circle" start />
      Copied to clipboard
    </VSnackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SearchResultDocument } from '@/types/documentSearch'

interface Props {
  results: SearchResultDocument[]
  query: string
}

const props = defineProps<Props>()

// Reactive state
const expandedDocs = ref<Set<string>>(new Set())
const showCopySnackbar = ref(false)
const defaultChunksToShow = 2

// Methods
const isExpanded = (docId: string): boolean => {
  return expandedDocs.value.has(docId)
}

const toggleExpanded = (docId: string) => {
  if (expandedDocs.value.has(docId)) {
    expandedDocs.value.delete(docId)
  } else {
    expandedDocs.value.add(docId)
  }
}

const getVisibleChunks = (doc: SearchResultDocument) => {
  if (isExpanded(doc.document_id)) {
    return doc.chunks
  }
  return doc.chunks.slice(0, defaultChunksToShow)
}

const getSimilarityColor = (similarity: number): string => {
  if (similarity >= 0.9) return 'success'
  if (similarity >= 0.7) return 'primary'
  if (similarity >= 0.5) return 'warning'
  return 'error'
}

const highlightQuery = (content: string): string => {
  // Simple highlighting - in production, could use a proper text highlighting library
  return content
}

const viewDocument = (doc: SearchResultDocument) => {
  // TODO: Implement document viewer or navigation
  console.log('Viewing document:', doc.document_title)
  // For now, open in a new tab (you might want to implement a modal viewer)
  window.open(`/documents/${doc.document_id}`, '_blank')
}

const copyToClipboard = async (doc: SearchResultDocument) => {
  try {
    let textToCopy = `Document: ${doc.document_title}\n\n`
    textToCopy += `Relevance: ${Math.round(doc.max_similarity * 100)}%\n\n`
    textToCopy += 'Relevant Sections:\n\n'

    doc.chunks.forEach((chunk, index) => {
      textToCopy += `Section ${chunk.chunk_index + 1}:\n${chunk.content}\n\n`
    })

    await navigator.clipboard.writeText(textToCopy)
    showCopySnackbar.value = true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}
</script>

<style lang="scss" scoped>
.document-search-results {
  .results-list {
    .chunk-item {
      padding: 12px;
      background: rgba(var(--v-theme-surface-variant), 0.3);
      border-radius: 8px;
      border-left: 3px solid rgb(var(--v-theme-primary));

      .chunk-content {
        line-height: 1.6;
        color: rgb(var(--v-theme-on-surface));
      }
    }
  }
}
</style>
