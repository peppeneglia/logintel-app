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

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary-500/15 text-slate-100 rounded-2xl rounded-tr-sm'
              : 'bg-[#334155] text-slate-200 rounded-2xl rounded-tl-sm'
          }`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {message.content}
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
