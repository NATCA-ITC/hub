/**
 * Document Search Service
 * Handles semantic search requests to the platform API
 */

import type {
  SearchResponse,
  SearchOptions,
  SearchError,
  SearchResultDocument
} from '@/types/documentSearch'

class DocumentSearchService {
  private baseUrl: string
  private apiKey: string | undefined
  private enabled: boolean

  constructor() {
    this.baseUrl = import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:1300'
    this.apiKey = import.meta.env.VITE_PLATFORM_API_KEY
    this.enabled = import.meta.env.VITE_AI_SERVICE_ENABLED !== 'false'
  }

  /**
   * Perform semantic search for documents
   * @param query - Search query in natural language
   * @param options - Optional search parameters
   * @returns Promise with search results or null on error
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResponse | null> {
    // Check if service is enabled
    if (!this.enabled) {
      console.warn('Document search service is disabled')
      return null
    }

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.warn('Invalid search query:', query)
      return null
    }

    try {
      const startTime = Date.now()

      // Build query parameters
      const params = new URLSearchParams({
        query: query.trim(),
        limit: String(options.matchCount || 10)
      })

      if (options.matchThreshold !== undefined) {
        params.append('threshold', String(options.matchThreshold))
      }

      if (options.schema) {
        params.append('schema', options.schema)
      }

      // Prepare request headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      // Make API request
      const response = await fetch(`${this.baseUrl}/api/documents/search?${params}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `API error: ${response.status}`)
      }

      const data: SearchResponse = await response.json()

      // Add local duration to metadata
      const duration = Date.now() - startTime
      console.log(`Document search completed in ${duration}ms`, {
        query,
        resultsCount: data.results?.length || 0,
        totalChunks: data.metadata?.totalChunks || 0
      })

      return data

    } catch (error: any) {
      // Network errors or timeouts
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.warn('Document search timed out:', query)
      } else if (error.message?.includes('fetch')) {
        console.warn('Document search API unavailable (expected in development):', error.message)
      } else {
        console.error('Document search failed:', error)
      }

      // Return null to signal fallback to mock responses
      return null
    }
  }

  /**
   * Filter search results by minimum similarity threshold
   * @param results - Search results to filter
   * @param threshold - Minimum similarity score (0-1)
   * @returns Filtered results
   */
  filterByThreshold(
    results: SearchResultDocument[],
    threshold: number = 0.7
  ): SearchResultDocument[] {
    return results
      .filter(doc => doc.max_similarity >= threshold)
      .map(doc => ({
        ...doc,
        chunks: doc.chunks.filter(chunk => chunk.similarity >= threshold)
      }))
      .filter(doc => doc.chunks.length > 0)
  }

  /**
   * Get the most relevant chunks across all documents
   * @param results - Search results
   * @param maxChunks - Maximum number of chunks to return
   * @returns Top chunks sorted by similarity
   */
  getTopChunks(
    results: SearchResultDocument[],
    maxChunks: number = 3
  ): Array<{ content: string; similarity: number; documentTitle: string }> {
    const allChunks: Array<{
      content: string
      similarity: number
      documentTitle: string
    }> = []

    results.forEach(doc => {
      doc.chunks.forEach(chunk => {
        allChunks.push({
          content: chunk.content,
          similarity: chunk.similarity,
          documentTitle: doc.document_title
        })
      })
    })

    // Sort by similarity and take top N
    return allChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxChunks)
  }

  /**
   * Format search results as a context string for LLM or display
   * @param results - Search results
   * @param maxChunks - Maximum chunks to include
   * @returns Formatted context string
   */
  formatResultsAsContext(
    results: SearchResultDocument[],
    maxChunks: number = 3
  ): string {
    const topChunks = this.getTopChunks(results, maxChunks)

    if (topChunks.length === 0) {
      return ''
    }

    let context = 'Based on relevant NATCA documents:\n\n'

    topChunks.forEach((chunk, index) => {
      context += `${index + 1}. From "${chunk.documentTitle}" (relevance: ${(chunk.similarity * 100).toFixed(0)}%):\n`
      context += `${chunk.content}\n\n`
    })

    return context.trim()
  }

  /**
   * Check if the platform API is available
   * Useful for showing user-friendly error messages
   * @returns Promise<boolean> - True if API is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const documentSearchService = new DocumentSearchService()
