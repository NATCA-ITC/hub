<template>
  <div>
    <!-- Master Search Input Bar -->
    <div class="d-flex align-center gap-3">
      <VTextField
        v-model="searchQuery"
        placeholder="Ask AI anything about NATCA, policies, procedures, or search for specific information..."
        variant="outlined"
        density="comfortable"
        hide-details
        class="ai-search-input flex-grow-1"
        @keyup.enter="initiateSearch"
        @focus="isInputFocused = true"
        @blur="isInputFocused = false"
      >
        <template #prepend-inner>
          <VIcon
            icon="mdi-robot"
            :color="isSearching ? 'primary' : 'medium-emphasis'"
            :class="{ 'rotating': isSearching }"
          />
        </template>
        <template #append-inner>
          <VBtn
            v-if="searchQuery"
            icon
            variant="text"
            size="small"
            @click="clearSearch"
          >
            <VIcon icon="mdi-close" size="20" />
          </VBtn>
        </template>
      </VTextField>

      <VBtn
        :disabled="!searchQuery.trim()"
        :loading="isSearching"
        color="primary"
        variant="flat"
        @click="initiateSearch"
      >
        <VIcon icon="mdi-send" />
        Ask AI
      </VBtn>
    </div>

    <!-- AI Chat Modal -->
    <VDialog
      v-model="isChatModalOpen"
      max-width="900"
      height="700"
      class="ai-chat-modal"
      :transition="chatModalTransition"
    >
      <VCard
        height="700"
        class="d-flex flex-column"
      >
        <!-- Chat Header -->
        <VCardTitle class="d-flex align-center justify-space-between border-b">
          <div class="d-flex align-center">
            <VAvatar
              color="primary"
              size="40"
              class="me-3"
            >
              <VIcon icon="mdi-robot" color="white" />
            </VAvatar>
            <div>
              <h3 class="text-h6 mb-0">MyNATCA AI Assistant</h3>
              <p class="text-caption text-medium-emphasis mb-0">
                Powered by intelligent search •
                <span v-if="currentConversation">
                  Conversation {{ formatDate(currentConversation.created_at) }}
                </span>
                <span v-else>New conversation</span>
              </p>
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <VBtn
              v-if="currentConversation"
              icon
              variant="text"
              size="small"
              @click="startNewConversation"
            >
              <VIcon icon="mdi-plus" />
              <VTooltip activator="parent">New Conversation</VTooltip>
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              @click="closeChatModal"
            >
              <VIcon icon="mdi-close" />
            </VBtn>
          </div>
        </VCardTitle>

        <!-- Chat Messages -->
        <VCardText class="flex-grow-1 pa-0">
          <PerfectScrollbar
            ref="chatScrollContainer"
            :options="{ wheelPropagation: false, suppressScrollX: true }"
            class="h-100 pa-4"
          >
            <div class="chat-messages">
              <!-- Welcome Message -->
              <div v-if="!messages.length" class="text-center pa-8">
                <VIcon icon="mdi-robot" size="64" color="primary" class="mb-4" />
                <h4 class="text-h5 mb-2">Welcome to MyNATCA AI Assistant</h4>
                <p class="text-body-1 text-medium-emphasis mb-4">
                  I can help you find information about NATCA policies, procedures, facilities, and more.
                </p>
                <div class="d-flex flex-wrap gap-2 justify-center">
                  <VChip
                    v-for="suggestion in quickSuggestions"
                    :key="suggestion"
                    variant="outlined"
                    class="cursor-pointer"
                    @click="searchQuery = suggestion; initiateSearch()"
                  >
                    {{ suggestion }}
                  </VChip>
                </div>
              </div>

              <!-- Message List -->
              <div
                v-for="(message, index) in messages"
                :key="index"
                class="message-container mb-4"
                :class="message.role === 'user' ? 'user-message' : 'ai-message'"
              >
                <div class="d-flex align-start gap-3">
                  <VAvatar
                    :color="message.role === 'user' ? 'primary' : 'success'"
                    size="32"
                    class="flex-shrink-0"
                  >
                    <VIcon
                      :icon="message.role === 'user' ? 'mdi-account' : 'mdi-robot'"
                      color="white"
                      size="20"
                    />
                  </VAvatar>
                  <div class="flex-grow-1">
                    <div class="d-flex align-center gap-2 mb-1">
                      <span class="text-subtitle-2 font-weight-medium">
                        {{ message.role === 'user' ? user?.name || 'You' : 'AI Assistant' }}
                      </span>
                      <span class="text-caption text-medium-emphasis">
                        {{ formatTime(message.timestamp) }}
                      </span>
                    </div>
                    <div
                      class="message-content"
                      :class="message.role === 'user' ? 'user-content' : 'ai-content'"
                    >
                      <div v-if="message.role === 'user'" class="text-body-1">
                        {{ message.content }}
                      </div>
                      <div v-else>
                        <!-- AI Response Content -->
                        <div v-if="message.content" class="text-body-1 mb-3">
                          {{ message.content }}
                        </div>

                        <!-- File/Document Links -->
                        <div v-if="message.files && message.files.length" class="mb-3">
                          <p class="text-subtitle-2 mb-2">📄 Related Documents:</p>
                          <div class="d-flex flex-column gap-1">
                            <VChip
                              v-for="file in message.files"
                              :key="file.id"
                              variant="outlined"
                              color="info"
                              size="small"
                              class="align-self-start cursor-pointer"
                              @click="openDocument(file)"
                            >
                              <VIcon start icon="mdi-file-document" />
                              {{ file.name }}
                            </VChip>
                          </div>
                        </div>

                        <!-- Follow-up Questions -->
                        <div v-if="message.followUpQuestions && message.followUpQuestions.length" class="mb-2">
                          <p class="text-subtitle-2 mb-2">💡 You might also ask:</p>
                          <div class="d-flex flex-column gap-1">
                            <VChip
                              v-for="question in message.followUpQuestions"
                              :key="question"
                              variant="tonal"
                              color="primary"
                              size="small"
                              class="align-self-start cursor-pointer"
                              @click="askFollowUp(question)"
                            >
                              {{ question }}
                            </VChip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isTyping" class="message-container ai-message mb-4">
                <div class="d-flex align-start gap-3">
                  <VAvatar color="success" size="32">
                    <VIcon icon="mdi-robot" color="white" size="20" />
                  </VAvatar>
                  <div class="typing-indicator">
                    <div class="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span class="text-caption text-medium-emphasis">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </PerfectScrollbar>
        </VCardText>

        <!-- Chat Input -->
        <VDivider />
        <VCardActions class="pa-4">
          <VTextField
            v-model="chatInput"
            placeholder="Continue the conversation..."
            variant="outlined"
            density="compact"
            hide-details
            class="flex-grow-1"
            @keyup.enter="sendMessage"
            :disabled="isTyping"
          >
            <template #append-inner>
              <VBtn
                :disabled="!chatInput.trim() || isTyping"
                :loading="isTyping"
                color="primary"
                variant="flat"
                size="small"
                @click="sendMessage"
              >
                <VIcon icon="mdi-send" />
              </VBtn>
            </template>
          </VTextField>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useAuth0 } from '@/composables/useAuth0'
import { aiChatService, type ChatMessage, type Conversation } from '@/services/aiChatService'

// Composables
const { user } = useAuth0()

// Reactive state
const searchQuery = ref('')
const chatInput = ref('')
const isInputFocused = ref(false)
const isSearching = ref(false)
const isTyping = ref(false)
const isChatModalOpen = ref(false)
const chatScrollContainer = ref()

const messages = ref<ChatMessage[]>([])
const currentConversation = ref<Conversation | null>(null)

// Quick suggestions for new users
const quickSuggestions = [
  "What are the latest NATCA policies?",
  "How do I submit a grievance?",
  "Find training requirements for my facility",
  "What are the current bargaining updates?"
]

// Modal transition effect
const chatModalTransition = computed(() => {
  return isChatModalOpen.value ? 'dialog-bottom-transition' : 'dialog-top-transition'
})

// Load user's recent conversations on component mount
const loadRecentConversations = async () => {
  if (user.value?.sub) {
    try {
      const conversations = await aiChatService.getUserConversations(user.value.sub, 5)
      // Could store these for a conversation history feature
      if (conversations.length > 0) {
        console.log('Recent conversations:', conversations)
      } else {
        console.log('No recent conversations found')
      }
    } catch (error) {
      // This is expected in development when Supabase isn't running
      console.warn('Could not load conversations (expected in development):', error)
    }
  }
}

// Functions
const clearSearch = () => {
  searchQuery.value = ''
}

const initiateSearch = async () => {
  if (!searchQuery.value.trim() || isSearching.value) return

  isSearching.value = true

  // Add user message
  const userMessage: ChatMessage = {
    role: 'user',
    content: searchQuery.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)

  // Open chat modal with animation
  isChatModalOpen.value = true

  // Clear search input and set chat input
  const originalQuery = searchQuery.value
  searchQuery.value = ''
  chatInput.value = ''

  // Simulate AI processing
  await simulateAIResponse(originalQuery)

  isSearching.value = false
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || isTyping.value) return

  const userMessage: ChatMessage = {
    role: 'user',
    content: chatInput.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const originalInput = chatInput.value
  chatInput.value = ''

  await simulateAIResponse(originalInput)
}

const simulateAIResponse = async (query: string) => {
  isTyping.value = true

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  try {
    // Generate AI response using the service
    const aiMessage = await aiChatService.generateAIResponse(query, messages.value)
    messages.value.push(aiMessage)

    // Scroll to bottom after response
    await nextTick()
    scrollToBottom()

    // Save conversation
    await saveConversation()
  } catch (error) {
    console.error('Error generating AI response:', error)

    // Fallback error message
    const errorMessage: ChatMessage = {
      role: 'ai',
      content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    isTyping.value = false
  }
}

const askFollowUp = (question: string) => {
  chatInput.value = question
  sendMessage()
}

const scrollToBottom = () => {
  if (chatScrollContainer.value) {
    const container = chatScrollContainer.value.$el
    container.scrollTop = container.scrollHeight
  }
}

const closeChatModal = () => {
  isChatModalOpen.value = false
  // Keep messages for conversation continuity
}

const startNewConversation = () => {
  messages.value = []
  currentConversation.value = null
  chatInput.value = ''
}

const openDocument = (file: { id: string; name: string; url: string }) => {
  console.log('Opening document:', file.name)
  // TODO: Implement document viewer
  window.open(file.url, '_blank')
}

const saveConversation = async () => {
  if (!user.value?.sub || messages.value.length === 0) return

  try {
    if (!currentConversation.value) {
      // Create new conversation
      currentConversation.value = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.value.sub,
        title: messages.value[0]?.content.substring(0, 50) + '...',
        created_at: new Date(),
        updated_at: new Date(),
        messages: messages.value
      }
    } else {
      // Update existing conversation
      currentConversation.value.updated_at = new Date()
      currentConversation.value.messages = messages.value
    }

    // Save to Supabase (or mock in development)
    await aiChatService.saveConversation(currentConversation.value)
    if (import.meta.env.DEV) {
      console.log('Conversation saved (mocked in development)')
    } else {
      console.log('Conversation saved successfully')
    }
  } catch (error) {
    console.error('Failed to save conversation:', error)
    // Continue without breaking the user experience
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

// Initialize component
onMounted(() => {
  loadRecentConversations()
})

// Watch for modal close to scroll to bottom when reopened
watch(isChatModalOpen, async (isOpen) => {
  if (isOpen && messages.value.length > 0) {
    await nextTick()
    scrollToBottom()
  }
})
</script>

<style lang="scss" scoped>
.ai-search-input {
  .v-field__input {
    font-size: 1rem;
  }
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-chat-modal {
  .chat-messages {
    min-height: 100%;
  }

  .message-container {
    &.user-message {
      .message-content {
        background: rgba(var(--v-theme-primary), 0.1);
        border-radius: 12px 12px 4px 12px;
        padding: 12px 16px;
      }
    }

    &.ai-message {
      .message-content {
        background: rgba(var(--v-theme-surface-variant), 0.3);
        border-radius: 12px 12px 12px 4px;
        padding: 12px 16px;
      }
    }
  }

  .typing-indicator {
    background: rgba(var(--v-theme-surface-variant), 0.3);
    border-radius: 12px;
    padding: 12px 16px;

    .typing-dots {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;

      span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--v-theme-primary);
        animation: typing 1.4s infinite ease-in-out;

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
      }
    }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.border-b {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>