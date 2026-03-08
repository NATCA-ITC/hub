// AI Chat Service with Supabase integration and semantic search
import { supabase } from '@/plugins/supabase'
import { documentSearchService } from './documentSearchService'
import type { SearchResultDocument } from '@/types/documentSearch'

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  files?: Array<{ id: string; name: string; url: string; similarity?: number }>
  followUpQuestions?: string[]
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: Date
  updated_at: Date
  messages: ChatMessage[]
}

export interface ConversationRow {
  id: string
  user_id: string
  title: string
  messages: any
  created_at: string
  updated_at: string
}

class AIChatService {
  // Save or update conversation in Supabase
  async saveConversation(conversation: Conversation): Promise<Conversation> {
    try {
      const conversationData = {
        id: conversation.id,
        user_id: conversation.user_id,
        title: conversation.title,
        messages: JSON.stringify(conversation.messages),
        created_at: conversation.created_at.toISOString(),
        updated_at: conversation.updated_at.toISOString()
      }

      const { data, error } = await supabase
        .from('ai_conversations')
        .upsert(conversationData)
        .select()
        .single()

      if (error) throw error

      return this.mapRowToConversation(data)
    } catch (error) {
      // In development, Supabase might not be running - this is expected
      if (import.meta.env.DEV) {
        console.warn('Supabase connection failed (expected in development):', error)
        // Return the conversation as-is for development
        return conversation
      } else {
        console.error('Error saving conversation:', error)
        throw error
      }
    }
  }

  // Get user's recent conversations
  async getUserConversations(userId: string, limit: number = 10): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map(this.mapRowToConversation)
    } catch (error) {
      // In development, Supabase might not be running - this is expected
      if (import.meta.env.DEV) {
        console.warn('Supabase connection failed (expected in development):', error)
      } else {
        console.error('Error fetching conversations:', error)
      }
      return []
    }
  }

  // Get specific conversation by ID
  async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return this.mapRowToConversation(data)
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  // Delete conversations older than 14 days
  async cleanupOldConversations(): Promise<void> {
    try {
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .lt('updated_at', fourteenDaysAgo.toISOString())

      if (error) throw error
    } catch (error) {
      console.error('Error cleaning up old conversations:', error)
    }
  }

  // Generate AI response with semantic search integration
  async generateAIResponse(message: string, conversationHistory: ChatMessage[]): Promise<ChatMessage> {
    try {
      // Step 1: Perform semantic search for relevant documents
      const searchResults = await documentSearchService.search(message, {
        matchCount: 5,
        matchThreshold: 0.5
      })

      // Step 2: Check if we got good results
      if (searchResults && searchResults.results.length > 0) {
        // Filter for high-quality results (similarity > 0.7)
        const highQualityResults = documentSearchService.filterByThreshold(
          searchResults.results,
          0.7
        )

        if (highQualityResults.length > 0) {
          // We have good semantic search results
          return this.generateEnhancedResponse(message, highQualityResults)
        } else if (searchResults.results.length > 0) {
          // We have moderate results (0.5-0.7 similarity)
          return this.generateModerateResponse(message, searchResults.results)
        }
      }

      // Step 3: Fallback to mock responses if no good results or API unavailable
      return this.generateMockResponse(message)

    } catch (error) {
      console.error('Error generating AI response:', error)
      // Fallback to mock response on any error
      return this.generateMockResponse(message)
    }
  }

  // Generate enhanced response with high-quality document results
  private generateEnhancedResponse(query: string, results: SearchResultDocument[]): ChatMessage {
    const topChunks = documentSearchService.getTopChunks(results, 3)

    // Build response content with document citations
    let content = 'Based on relevant NATCA documents, here\'s what I found:\n\n'

    topChunks.forEach((chunk, index) => {
      const similarityPercent = Math.round(chunk.similarity * 100)
      content += `${index + 1}. From "${chunk.documentTitle}" (${similarityPercent}% relevant):\n\n`
      content += `${chunk.content}\n\n`
    })

    content += 'You can review the full documents linked below for more details.'

    // Build file references
    const files = results.slice(0, 3).map(doc => ({
      id: doc.document_id,
      name: doc.document_title,
      url: `/documents/${doc.document_id}`,
      similarity: doc.max_similarity
    }))

    // Generate contextual follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(query, results)

    return {
      role: 'ai',
      content,
      timestamp: new Date(),
      files,
      followUpQuestions
    }
  }

  // Generate response with moderate quality results
  private generateModerateResponse(query: string, results: SearchResultDocument[]): ChatMessage {
    const topChunks = documentSearchService.getTopChunks(results, 2)

    let content = 'I found some potentially relevant information in our documents:\n\n'

    topChunks.forEach((chunk, index) => {
      content += `${index + 1}. From "${chunk.documentTitle}":\n\n`
      content += `${chunk.content.substring(0, 300)}...\n\n`
    })

    content += 'The relevance might not be perfect, but these documents may contain helpful information. You can also try rephrasing your question for better results.'

    const files = results.slice(0, 2).map(doc => ({
      id: doc.document_id,
      name: doc.document_title,
      url: `/documents/${doc.document_id}`,
      similarity: doc.max_similarity
    }))

    const followUpQuestions = [
      'Can you rephrase the question differently?',
      'What specific aspect are you most interested in?',
      'Would you like me to search for related topics?'
    ]

    return {
      role: 'ai',
      content,
      timestamp: new Date(),
      files,
      followUpQuestions
    }
  }

  // Generate follow-up questions based on search results
  private generateFollowUpQuestions(query: string, results: SearchResultDocument[]): string[] {
    const keywords = query.toLowerCase()
    const questions: string[] = []

    // Generic follow-ups based on document types
    if (results.some(r => r.document_title.toLowerCase().includes('cba') ||
                          r.document_title.toLowerCase().includes('agreement'))) {
      questions.push('What are the specific procedures outlined in the CBA?')
      questions.push('How does this affect my rights as a member?')
    }

    if (results.some(r => r.document_title.toLowerCase().includes('policy') ||
                          r.document_title.toLowerCase().includes('procedure'))) {
      questions.push('Who should I contact about this policy?')
      questions.push('When was this policy last updated?')
    }

    if (results.some(r => r.document_title.toLowerCase().includes('training') ||
                          r.document_title.toLowerCase().includes('education'))) {
      questions.push('What are the training requirements?')
      questions.push('How do I register for training?')
    }

    // Ensure we have at least 3 questions
    while (questions.length < 3) {
      const defaultQuestions = [
        'Can you provide more details about this topic?',
        'Are there related documents I should review?',
        'Where can I find additional resources?'
      ]
      questions.push(defaultQuestions[questions.length])
    }

    return questions.slice(0, 3)
  }

  // Fallback to mock responses when semantic search is unavailable
  private generateMockResponse(message: string): ChatMessage {
    const responses = this.getMockAIResponses()
    const keywords = message.toLowerCase()

    let selectedResponse = responses.default

    if (keywords.includes('policy') || keywords.includes('procedure')) {
      selectedResponse = responses.policy
    } else if (keywords.includes('training') || keywords.includes('education')) {
      selectedResponse = responses.training
    } else if (keywords.includes('grievance') || keywords.includes('complaint')) {
      selectedResponse = responses.grievance
    } else if (keywords.includes('bargain') || keywords.includes('contract')) {
      selectedResponse = responses.bargaining
    } else if (keywords.includes('facility') || keywords.includes('location')) {
      selectedResponse = responses.facility
    }

    return {
      role: 'ai',
      content: selectedResponse.content,
      timestamp: new Date(),
      files: selectedResponse.files,
      followUpQuestions: selectedResponse.followUpQuestions
    }
  }

  // Map Supabase row to Conversation object
  private mapRowToConversation(row: ConversationRow): Conversation {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      messages: JSON.parse(row.messages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }
  }

  // Mock AI responses for demo purposes
  private getMockAIResponses() {
    return {
      policy: {
        content: "I found several NATCA policy documents that address your question. These resources contain the most up-to-date information on procedures and guidelines.",
        files: [
          { id: 'policy-1', name: 'NATCA Constitution & Bylaws', url: '/docs/constitution.pdf' },
          { id: 'policy-2', name: 'Code of Ethics', url: '/docs/ethics.pdf' },
          { id: 'policy-3', name: 'Disciplinary Procedures Manual', url: '/docs/discipline.pdf' }
        ],
        followUpQuestions: [
          "What are the specific procedures for filing a complaint?",
          "How are policy violations investigated?",
          "Who should I contact for policy clarifications?"
        ]
      },
      training: {
        content: "Here are the current training requirements and resources available through NATCA. I've also included facility-specific information based on your profile.",
        files: [
          { id: 'train-1', name: 'Annual Training Requirements', url: '/docs/training-requirements.pdf' },
          { id: 'train-2', name: 'Online Learning Portal Guide', url: '/docs/online-learning.pdf' },
          { id: 'train-3', name: 'Facility Training Schedule', url: '/docs/facility-schedule.pdf' }
        ],
        followUpQuestions: [
          "How do I track my training completion?",
          "What are the upcoming training deadlines?",
          "How do I register for training sessions?"
        ]
      },
      grievance: {
        content: "NATCA provides comprehensive support for grievance procedures. Here's the step-by-step process and your rights as a member.",
        files: [
          { id: 'griev-1', name: 'Grievance Filing Procedures', url: '/docs/grievance-procedures.pdf' },
          { id: 'griev-2', name: 'Member Rights & Responsibilities', url: '/docs/member-rights.pdf' },
          { id: 'griev-3', name: 'Grievance Form Templates', url: '/docs/grievance-forms.pdf' }
        ],
        followUpQuestions: [
          "What information do I need to file a grievance?",
          "How long does the grievance process take?",
          "Can I get assistance with my grievance?"
        ]
      },
      bargaining: {
        content: "Here's the latest information on collective bargaining updates, current priorities, and how you can stay informed about negotiations.",
        files: [
          { id: 'bargain-1', name: 'Current Bargaining Priorities', url: '/docs/bargaining-priorities.pdf' },
          { id: 'bargain-2', name: 'Collective Bargaining Agreement', url: '/docs/cba-current.pdf' },
          { id: 'bargain-3', name: 'Negotiation Updates Newsletter', url: '/docs/negotiation-updates.pdf' }
        ],
        followUpQuestions: [
          "How can I provide input on bargaining priorities?",
          "When is the next contract negotiation?",
          "What are the key issues being negotiated?"
        ]
      },
      facility: {
        content: "I found information about NATCA facilities and can help you with location-specific details, contacts, and procedures.",
        files: [
          { id: 'facility-1', name: 'Facility Directory', url: '/docs/facility-directory.pdf' },
          { id: 'facility-2', name: 'Regional Representatives', url: '/docs/regional-reps.pdf' },
          { id: 'facility-3', name: 'Local Contact Information', url: '/docs/local-contacts.pdf' }
        ],
        followUpQuestions: [
          "Who is my local facility representative?",
          "What are the facility-specific procedures?",
          "How do I contact regional leadership?"
        ]
      },
      default: {
        content: "I'm here to help you find information about NATCA policies, procedures, training, and more. I can search through documents, answer questions about member services, and provide relevant resources.",
        files: [
          { id: 'general-1', name: 'NATCA Member Handbook', url: '/docs/member-handbook.pdf' },
          { id: 'general-2', name: 'Frequently Asked Questions', url: '/docs/faq.pdf' }
        ],
        followUpQuestions: [
          "What member services are available?",
          "How do I access my member benefits?",
          "Where can I find contact information for my representatives?"
        ]
      }
    }
  }
}

export const aiChatService = new AIChatService()

/*
SQL for creating the ai_conversations table in Supabase:

CREATE TABLE ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient user queries
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated_at ON ai_conversations(updated_at);

-- RLS (Row Level Security) policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can access own conversations" ON ai_conversations
  FOR ALL USING (auth.uid()::text = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/