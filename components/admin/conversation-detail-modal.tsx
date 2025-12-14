import { X } from "lucide-react"
import type { ConversationDetail } from "@/lib/types"

interface ConversationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: ConversationDetail | null
  conversationId: string
}

export function ConversationDetailModal({
  isOpen,
  onClose,
  conversation,
  conversationId,
}: ConversationDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-[#27272a] bg-[#18181b] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">대화 상세</h3>
            <p className="mt-1 text-sm text-[#71717a]">{conversationId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#71717a] hover:bg-[#27272a] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {!conversation ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[#71717a]">불러오는 중...</p>
            </div>
          ) : conversation.messages && conversation.messages.length > 0 ? (
            <div className="space-y-6">
              {conversation.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex max-w-[80%] flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${msg.role === "user" ? "text-blue-400" : "text-emerald-400"}`}
                      >
                        {msg.role === "user" ? "사용자" : "어시스턴트"}
                      </span>
                      <span className="text-xs text-[#52525b]">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-blue-600/10 border border-blue-600/20"
                          : "bg-[#27272a] border border-[#3f3f46]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm text-white">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[#71717a]">메시지가 없습니다</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#27272a] p-6">
          <div className="flex gap-6 text-sm text-[#71717a]">
            {conversation?.messages && (
              <>
                <div>
                  <span className="font-medium text-white">{conversation.messages.length}</span> 메시지
                </div>
                <div>
                  <span className="font-medium text-white">
                    {conversation.messages.filter((m) => m.role === "user").length}
                  </span>{" "}
                  사용자 메시지
                </div>
                <div>
                  <span className="font-medium text-white">
                    {conversation.messages.filter((m) => m.role === "assistant").length}
                  </span>{" "}
                  어시스턴트 응답
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
