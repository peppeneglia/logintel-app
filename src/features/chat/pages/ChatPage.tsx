import { useState } from 'react'
import type { ChatMessage } from '../../../types'
import { mockSinglePrediction, mockConversations } from '../../../data/mockData'
import { useAuthStore } from '../../../stores/authStore'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { MessageList } from '../components/MessageList'
import { ChatInput } from '../components/ChatInput'
import { ChatSidebar } from '../components/ChatSidebar'
import { sendChatMessage } from '../../../services/api'

const PREDICTION_KEYWORDS = ['predizione', 'calcola', 'prevedi', 'eta']

function isPredictionRequest(text: string): boolean {
  const lower = text.toLowerCase()
  return PREDICTION_KEYWORDS.some((kw) => lower.includes(kw))
}

function createUserMessage(content: string): ChatMessage {
  return {
    id: `msg-${Date.now()}-user`,
    role: 'user',
    content,
    timestamp: new Date(),
  }
}

function createAssistantMessage(
  content: string,
  prediction?: typeof mockSinglePrediction
): ChatMessage {
  return {
    id: `msg-${Date.now()}-assistant`,
    role: 'assistant',
    content,
    timestamp: new Date(),
    prediction,
  }
}

interface ConversationItem {
  id: string
  title: string
  updatedAt: string
}

function getDemoConversations(): ConversationItem[] {
  return mockConversations.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.createdAt.toISOString(),
  }))
}

export function ChatPage() {
  const isDemo = useAuthStore((s) => s.isDemo)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const conversations: ConversationItem[] = isDemo ? getDemoConversations() : []

  function handleSelectConversation(id: string) {
    setActiveConversationId(id)
    if (isDemo) {
      const conv = mockConversations.find((c) => c.id === id)
      setMessages(conv ? conv.messages : [])
    } else {
      setMessages([])
    }
  }

  function handleNewChat() {
    setActiveConversationId(null)
    setMessages([])
  }

  async function handleSend(text: string) {
    const userMsg = createUserMessage(text)
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    const isPrediction = isPredictionRequest(text)

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const { response: responseText } = await sendChatMessage(text, history)

      const prediction = isPrediction && isDemo ? mockSinglePrediction : undefined
      const content = isPrediction && isDemo
        ? `${responseText}\n\nEcco la predizione per la tua rotta:`
        : responseText

      const assistantMsg = createAssistantMessage(content, prediction)
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error('Chat API error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto'
      const assistantMsg = createAssistantMessage(
        `⚠️ Errore nella comunicazione con l'AI: ${errorMsg}\n\nRiprova tra qualche secondo.`
      )
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSuggestionClick(text: string) {
    handleSend(text)
  }

  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <ChatSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        conversations={conversations}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <MessageList messages={messages} />
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
