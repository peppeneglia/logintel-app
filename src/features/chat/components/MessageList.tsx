import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../../types'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) return null

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-3 sm:gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
