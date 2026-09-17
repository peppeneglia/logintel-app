import { useState, useEffect, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import type { ChatMessage } from '../../../types'
import { mockSinglePrediction, mockConversations } from '../../../data/mockData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { MessageList } from '../components/MessageList'
import { ChatInput } from '../components/ChatInput'
import { ChatSidebar } from '../components/ChatSidebar'
import { streamChatMessage } from '../../../services/api'

const PREDICTION_KEYWORDS = ['predizione', 'calcola', 'prevedi', 'eta']
const STORAGE_KEY = 'logintel-conversations'

function isPredictionRequest(text: string): boolean {
  const lower = text.toLowerCase()
  return PREDICTION_KEYWORDS.some((kw) => lower.includes(kw))
}

interface StoredConversation {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: string
}

function loadConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(convs: StoredConversation[]) {
  // Keep max 50 conversations
  const trimmed = convs.slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

function generateTitle(firstMessage: string): string {
  // Use first 40 chars of the first user message
  const clean = firstMessage.replace(/\n/g, ' ').trim()
  return clean.length > 40 ? clean.slice(0, 40) + '…' : clean
}

export function ChatPage() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const { consume } = useCredits()

  const [conversations, setConversations] = useState<StoredConversation[]>(() => loadConversations())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Persist conversations on change
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  // Sidebar items: saved + demo mock
  const sidebarItems = isDemo
    ? [
        ...conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt })),
        ...mockConversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.createdAt.toISOString() })),
      ]
    : conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }))

  function handleSelectConversation(id: string) {
    // Save current conversation before switching
    if (activeId && messages.length > 0) {
      persistCurrentConversation()
    }

    setActiveId(id)
    // Check stored conversations
    const stored = conversations.find((c) => c.id === id)
    if (stored) {
      setMessages(stored.messages)
      return
    }
    // Check demo mock conversations
    if (isDemo) {
      const mock = mockConversations.find((c) => c.id === id)
      setMessages(mock ? mock.messages : [])
    }
  }

  const persistCurrentConversation = useCallback(() => {
    if (!activeId || messages.length === 0) return
    setConversations((prev) => {
      const existing = prev.findIndex((c) => c.id === activeId)
      const conv: StoredConversation = {
        id: activeId,
        title: generateTitle(messages.find((m) => m.role === 'user')?.content || 'Nuova chat'),
        messages,
        updatedAt: new Date().toISOString(),
      }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = conv
        return updated
      }
      return [conv, ...prev]
    })
  }, [activeId, messages])

  function handleNewChat() {
    // Save current before creating new
    if (activeId && messages.length > 0) {
      persistCurrentConversation()
    }
    setActiveId(null)
    setMessages([])
  }

  async function handleSend(text: string) {
    // Create conversation ID if this is a new chat
    let convId = activeId
    if (!convId) {
      convId = `conv-${Date.now()}`
      setActiveId(convId)
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    const isPrediction = isPredictionRequest(text)

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Create placeholder for streaming
      const streamMsgId = `msg-${Date.now()}-assistant`
      const placeholder: ChatMessage = {
        id: streamMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, placeholder])

      const responseText = await streamChatMessage(text, history, (partial) => {
        setMessages((prev) =>
          prev.map((m) => m.id === streamMsgId ? { ...m, content: partial } : m)
        )
      })

      const prediction = isPrediction && isDemo ? mockSinglePrediction : undefined
      const content = isPrediction && isDemo
        ? `${responseText}\n\nEcco la predizione per la tua rotta:`
        : responseText

      setMessages((prev) =>
        prev.map((m) => m.id === streamMsgId ? { ...m, content, prediction } : m)
      )
      consume(CREDIT_COSTS.CHAT_MESSAGE, 'CHAT_MESSAGE')
    } catch (err) {
      console.error('Chat API error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto'
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Errore nella comunicazione con l'AI: ${errorMsg}\n\nRiprova tra qualche secondo.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save on messages change
  useEffect(() => {
    if (activeId && messages.length > 0) {
      const timer = setTimeout(() => persistCurrentConversation(), 500)
      return () => clearTimeout(timer)
    }
  }, [messages, activeId, persistCurrentConversation])

  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <ChatSidebar
        activeConversationId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        conversations={sidebarItems}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 mx-3 mb-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 bg-[#1e293b] border border-[#334155] rounded-xl transition-colors self-start shrink-0"
        >
          <MessageSquare size={16} />
          Conversazioni
        </button>

        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <MessageList messages={messages} />
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
