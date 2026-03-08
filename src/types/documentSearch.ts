/**
 * TypeScript interfaces for document search functionality
 */

/**
 * A single chunk from a document with its similarity score
 */
export interface DocumentChunk {
  chunk_id: string
  chunk_index: number
  content: string
  similarity: number
}

/**
 * A document with relevant chunks from search results
 */
export interface SearchResultDocument {
  document_id: string
  document_title: string
  chunks: DocumentChunk[]
  max_similarity: number
  avg_similarity: number
}

/**
 * Metadata about the search operation
 */
export interface SearchMetadata {
  matchThreshold?: number
  matchCount?: number
  totalChunks: number
  totalDocuments: number
  duration: number
}

/**
 * Complete search response from the API
 */
export interface SearchResponse {
  success: boolean
  query: string
  results: SearchResultDocument[]
  metadata: SearchMetadata
}

/**
 * Search options for customizing the query
 */
export interface SearchOptions {
  matchThreshold?: number
  matchCount?: number
  schema?: 'public' | 'dev'
}

/**
 * Error response from the API
 */
export interface SearchError {
  success: false
  error: string
  message: string
}

/**
 * File reference for chat messages
 */
export interface FileReference {
  id: string
  name: string
  url: string
  similarity?: number
}
