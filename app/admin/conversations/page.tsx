"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { ExportModal } from "@/components/admin/export-modal"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { AlertModal } from "@/components/admin/alert-modal"
import { ConversationDetailModal } from "@/components/admin/conversation-detail-modal"
import { Search, MessageSquare, Clock, ChevronRight, Trash2 } from "lucide-react"
import { conversationsApi } from "@/lib/api/endpoints"
import type { ConversationDetail, ConversationSummary } from "@/lib/types"

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [search, setSearch] = useState("")
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [deleteConvId, setDeleteConvId] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(
    null
  )

  const loadConversations = async () => {
    setLoadingList(true)
    const res = await conversationsApi.list()
    if (res.success && res.data) {
      setConversations(res.data.conversations || [])
      if (!selectedConv && res.data.conversations && res.data.conversations.length > 0) {
        setSelectedConv(res.data.conversations[0].id)
      }
    }
    setLoadingList(false)
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedConv) return
      setLoadingDetail(true)
      const res = await conversationsApi.detail(selectedConv)
      if (res.success && res.data) {
        setDetail(res.data as ConversationDetail)
      } else {
        setDetail(null)
      }
      setLoadingDetail(false)
    }
    fetchDetail()
  }, [selectedConv])

  const handleDeleteConversation = async () => {
    if (!deleteConvId) return

    const res = await conversationsApi.delete(deleteConvId)
    if (res.success) {
      setAlert({ title: "성공", message: "대화가 삭제되었습니다", type: "success" })
      if (selectedConv === deleteConvId) {
        setSelectedConv(null)
        setDetail(null)
      }
      await loadConversations()
    } else {
      setAlert({ title: "오류", message: "대화 삭제에 실패했습니다", type: "error" })
    }
  }

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return conversations
    return conversations.filter((c) => c.preview.toLowerCase().includes(keyword) || c.id.toLowerCase().includes(keyword))
  }, [conversations, search])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="ml-60 flex-1">
        <AdminHeader
          title="대화 내역"
          description="사용자 대화 기록을 조회합니다"
          showExport
          onExport={() => setIsExportOpen(true)}
        />

        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Conversation List */}
          <div className="w-96 border-r border-[#262626]">
            <div className="border-b border-[#262626] p-4">
              <div className="flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2">
                <Search className="h-4 w-4 text-[#888]" />
                <input
                  type="text"
                  placeholder="대화 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#888] outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto">
              {loadingList ? (
                <div className="p-4 text-sm text-[#888]">불러오는 중...</div>
              ) : filtered.length > 0 ? (
                filtered.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative w-full border-b border-[#262626] transition-colors hover:bg-[#1a1a1a] ${
                      selectedConv === conv.id ? "bg-[#1a1a1a]" : ""
                    }`}
                  >
                    <button
                      onClick={() => setSelectedConv(conv.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-[#888]">{conv.id}</span>
                        <span className="text-xs text-[#888]">{conv.createdAt}</span>
                      </div>
                      <p className="mb-2 truncate text-sm text-white">{conv.preview}</p>
                      <div className="flex items-center gap-4 text-xs text-[#888]">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {conv.messageCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {conv.tokenUsage} tokens
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConvId(conv.id)
                      }}
                      className="absolute right-2 top-2 rounded-lg p-2 text-[#888] opacity-0 transition-opacity hover:bg-[#262626] hover:text-rose-400 group-hover:opacity-100"
                      title="대화 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-[#888]">대화가 없습니다</div>
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="flex-1">
            {selectedConv ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-[#262626] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">{selectedConv}</h3>
                      <p className="text-xs text-[#888]">{detail?.messages?.[0]?.timestamp || ""}</p>
                    </div>
                    <button
                      onClick={() => setIsDetailModalOpen(true)}
                      className="flex items-center gap-1 text-xs text-[#888] hover:text-white transition-colors"
                    >
                      전체 보기 <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loadingDetail ? (
                    <div className="text-sm text-[#888]">불러오는 중...</div>
                  ) : (
                    <div className="space-y-4">
                      {detail?.messages?.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.role === "user" ? "bg-white text-black" : "bg-[#1a1a1a] text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`mt-1 text-xs ${msg.role === "user" ? "text-gray-500" : "text-[#888]"}`}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-[#262626]" />
                  <p className="text-sm text-[#888]">대화를 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ConversationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          conversation={detail}
          conversationId={selectedConv || ""}
        />

        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          title="대화 내역 내보내기"
          data={filtered.map((conv) => ({
            ID: conv.id,
            미리보기: conv.preview,
            메시지수: conv.messageCount,
            토큰사용량: conv.tokenUsage,
            생성일: conv.createdAt,
          }))}
          filename="conversations-list"
        />

        <ConfirmModal
          isOpen={deleteConvId !== null}
          onClose={() => setDeleteConvId(null)}
          onConfirm={handleDeleteConversation}
          title="대화 삭제"
          message="정말로 이 대화를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제"
          cancelText="취소"
          variant="danger"
        />

        {alert && (
          <AlertModal
            isOpen={true}
            onClose={() => setAlert(null)}
            title={alert.title}
            message={alert.message}
            type={alert.type}
          />
        )}
      </main>
    </div>
  )
}
