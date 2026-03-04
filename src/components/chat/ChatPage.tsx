import { useState } from 'react'
import type { ChatMessage } from '../../types'
import { mockSinglePrediction, mockConversations } from '../../data/mockData'
import { WelcomeScreen } from './WelcomeScreen'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ChatSidebar } from './ChatSidebar'

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

const GENERIC_RESPONSES = [
  'Le condizioni meteo lungo i corridoi principali sono nella norma per questa settimana. Non si prevedono particolari criticit\u00e0 sulle tratte autostradali del Nord Italia. Per il Centro-Sud, attenzione a possibili piogge tra marted\u00ec e mercoled\u00ec nella zona appenninica.',
  'I corridoi alpini al momento sono tutti percorribili senza restrizioni particolari. Il Brennero e il Frejus presentano condizioni stabili. Ti consiglio comunque di monitorare le previsioni 24h prima della partenza per eventuali variazioni.',
  'Per le rotte che hai indicato, le condizioni generali sono buone. La visibilit\u00e0 potrebbe ridursi nelle prime ore del mattino nella Pianura Padana per banchi di nebbia, ma dovrebbero dissolversi entro le 10:00. Posso calcolare una predizione dettagliata se vuoi.',
]

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  function addAssistantReply() {
    const response =
      GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)]
    setTimeout(() => {
      setMessages((prev) => [...prev, createAssistantMessage(response)])
    }, 1000)
  }

  function addPredictionReply() {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(
          'Ecco la predizione per la tua rotta:',
          mockSinglePrediction
        ),
      ])
    }, 1000)
  }

  function handleSend(text: string) {
    setMessages((prev) => [...prev, createUserMessage(text)])
    if (isPredictionRequest(text)) {
      addPredictionReply()
    } else {
      addAssistantReply()
    }
  }

  function handleSuggestionClick(text: string) {
    handleSend(text)
  }

  function handleSelectConversation(id: string) {
    const conversation = mockConversations.find((c) => c.id === id)
    if (conversation) {
      setActiveConversationId(id)
      setMessages([...conversation.messages])
    }
  }

  function handleNewChat() {
    setActiveConversationId(null)
    setMessages([])
  }

  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <ChatSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <MessageList messages={messages} />
        )}

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
