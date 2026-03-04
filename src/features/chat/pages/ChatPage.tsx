import { useState } from 'react'
import type { ChatMessage } from '../../../types'
import { mockSinglePrediction } from '../../../data/mockData'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { MessageList } from '../components/MessageList'
import { ChatInput } from '../components/ChatInput'
import { ChatSidebar } from '../components/ChatSidebar'
// TODO: Riabilitare persistenza conversazioni su Supabase quando configurato
// import { useAuthStore } from '../../../stores/authStore'
// import * as conversationsService from '../../../services/conversations'

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

interface ConversationItem {
  id: string
  title: string
  updatedAt: string
}

export function ChatPage() {
  // TODO: Riabilitare persistenza conversazioni su Supabase
  // const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  // TODO: Riabilitare caricamento conversazioni da Supabase
  // const [conversations, setConversations] = useState<ConversationItem[]>([])
  // const loadConversations = useCallback(async () => {
  //   if (!user) return
  //   const data = await conversationsService.getConversations(user.id)
  //   setConversations(data.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updated_at })))
  // }, [user])
  const conversations: ConversationItem[] = []

  function handleSelectConversation(id: string) {
    setActiveConversationId(id)
    // TODO: Caricare messaggi da Supabase
    setMessages([])
  }

  function handleNewChat() {
    setActiveConversationId(null)
    setMessages([])
  }

  function handleSend(text: string) {
    const userMsg = createUserMessage(text)
    setMessages((prev) => [...prev, userMsg])

    // TODO: Creare conversazione su Supabase e salvare messaggi
    // let convId = activeConversationId
    // if (!convId && user) { ... create conversation ... }
    // if (convId) { await conversationsService.sendMessage(convId, 'user', text) }

    // Genera risposta (mock per ora)
    const isPrediction = isPredictionRequest(text)
    const responseContent = isPrediction
      ? 'Ecco la predizione per la tua rotta:'
      : GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)]
    const prediction = isPrediction ? mockSinglePrediction : undefined

    setTimeout(() => {
      const assistantMsg = createAssistantMessage(responseContent, prediction)
      setMessages((prev) => [...prev, assistantMsg])
      // TODO: Salvare risposta assistant su Supabase
    }, 1000)
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

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
