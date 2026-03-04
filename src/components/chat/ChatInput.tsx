import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('')

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-gray-950 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center gap-3 border border-gray-700 rounded-2xl bg-gray-900 py-3 px-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrivi un messaggio..."
          disabled={disabled}
          className="flex-1 outline-none text-sm text-gray-100 placeholder-gray-500 bg-transparent disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="p-2 rounded-xl text-primary-400 hover:bg-primary-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
