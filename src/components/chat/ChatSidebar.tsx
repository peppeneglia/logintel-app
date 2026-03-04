import { Plus, MessageSquare } from 'lucide-react'
import { mockConversations } from '../../data/mockData'
import { SidebarFooter } from '../ui/SidebarFooter'

interface ChatSidebarProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
}

function formatDateItalian(date: Date): string {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
  })
}

export function ChatSidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <div className="w-72 shrink-0 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-y-auto select-none mb-3">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-primary-500/50 transition-colors cursor-pointer text-sm font-medium"
        >
          <Plus size={18} />
          Nuova chat
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-2 pb-3">
        {mockConversations.map((conv) => {
          const isActive = conv.id === activeConversationId
          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <MessageSquare size={16} className="shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDateItalian(conv.createdAt)}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <SidebarFooter />
    </div>
  )
}
