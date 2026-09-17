import { Plus, MessageSquare, X } from 'lucide-react'
import { SidebarFooter } from '../../../components/SidebarFooter'

interface ConversationItem {
  id: string
  title: string
  updatedAt: string
}

interface ChatSidebarProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  conversations?: ConversationItem[]
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function formatDateItalian(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
  })
}

export function ChatSidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  conversations = [],
  mobileOpen,
  onMobileClose,
}: ChatSidebarProps) {
  const handleSelect = (id: string) => {
    onSelectConversation(id)
    onMobileClose?.()
  }

  const handleNew = () => {
    onNewChat()
    onMobileClose?.()
  }

  const content = (
    <>
      <div className="p-3">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-[#334155] hover:border-primary-500/50 transition-colors cursor-pointer text-sm font-medium"
        >
          <Plus size={18} />
          Nuova chat
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 px-3">
            Nessuna conversazione. Inizia una nuova chat.
          </p>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId
            return (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                  isActive
                    ? 'bg-[#334155] text-white'
                    : 'text-slate-400 hover:bg-[#334155]'
                }`}
              >
                <MessageSquare size={16} className="shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{conv.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDateItalian(conv.updatedAt)}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <SidebarFooter />
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 shrink-0 bg-[#1e293b] border border-[#334155] rounded-2xl flex-col overflow-y-auto select-none mb-3">
        {content}
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <div className="relative w-72 max-w-[85vw] bg-[#1e293b] border-r border-[#334155] flex flex-col overflow-y-auto select-none">
            <button
              onClick={onMobileClose}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#334155] rounded-lg transition-colors z-10"
            >
              <X size={18} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  )
}
