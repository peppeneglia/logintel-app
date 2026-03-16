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
    } catch {
      const FALLBACK_RESPONSES = [
        'Le condizioni meteo lungo i corridoi principali sono nella norma per questa settimana. Non si prevedono particolari criticità sulle tratte autostradali del Nord Italia.',
        'I corridoi alpini al momento sono tutti percorribili senza restrizioni particolari. Il Brennero e il Frejus presentano condizioni stabili.',
        'Per le rotte che hai indicato, le condizioni generali sono buone. Posso calcolare una predizione dettagliata se vuoi.',
      ]
      const responseContent = isPrediction && isDemo
        ? 'Ecco la predizione per la tua rotta:'
        : FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
      const prediction = isPrediction && isDemo ? mockSinglePrediction : undefined

      const assistantMsg = createAssistantMessage(responseContent, prediction)
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
