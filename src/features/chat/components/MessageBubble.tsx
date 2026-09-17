import type { ReactNode } from 'react'
import type { ChatMessage } from '../../../types'
import { PredictionCard } from './PredictionCard'

interface MessageBubbleProps {
  message: ChatMessage
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function renderMarkdown(text: string): ReactNode[] {
  const blocks = text.split(/\n{2,}/)
  const elements: ReactNode[] = []

  blocks.forEach((block, bi) => {
    const trimmed = block.trim()
    if (!trimmed) return

    // Bullet list block
    const lines = trimmed.split('\n')
    if (lines.every((l) => /^[-*•]\s/.test(l.trim()))) {
      elements.push(
        <ul key={bi} className="list-disc list-inside space-y-0.5">
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^[-*•]\s*/, ''))}</li>
          ))}
        </ul>
      )
      return
    }

    // Numbered list block
    if (lines.every((l) => /^\d+[.)]\s/.test(l.trim()))) {
      elements.push(
        <ol key={bi} className="list-decimal list-inside space-y-0.5">
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^\d+[.)]\s*/, ''))}</li>
          ))}
        </ol>
      )
      return
    }

    // Regular paragraph (preserve single line breaks)
    elements.push(
      <p key={bi}>
        {lines.map((l, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {renderInline(l)}
          </span>
        ))}
      </p>
    )
  })

  return elements
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(<strong key={match.index} className="font-semibold text-white">{match[1]}</strong>)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%] sm:max-w-[80%]">
        <div
          className={`px-4 py-3 text-sm sm:text-[15px] leading-relaxed ${
            isUser
              ? 'bg-primary-500/15 text-slate-100 rounded-2xl rounded-tr-sm'
              : 'bg-[#334155] text-slate-200 rounded-2xl rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          ) : (
            <div className="space-y-2 [&_ul]:my-1 [&_ol]:my-1">{renderMarkdown(message.content)}</div>
          )}
        </div>

        {message.prediction && (
          <PredictionCard prediction={message.prediction} />
        )}

        <div
          className={`text-xs text-slate-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
