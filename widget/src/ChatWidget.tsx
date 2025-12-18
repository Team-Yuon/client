import { useState, useEffect, useCallback, memo, useRef } from "react"
import {
  MessageSquare,
  Send,
  ChevronLeft,
  Paperclip,
  Home,
  ThumbsUp,
  ThumbsDown,
  Check,
  CheckCheck,
  Trash2,
  Pencil,
  Plus,
  Settings2,
  HelpCircle,
  FileText,
  Phone,
} from "lucide-react"
import { cn } from "./lib/utils"
import { useChat } from "./hooks/useChat"
import { useChatRooms } from "./hooks/useChatRooms"
import { useConversationHistory } from "./hooks/useConversationHistory"
import { BUBBLE_AUTO_HIDE_DELAY, WELCOME_MESSAGE } from "./lib/constants"
import type { ChatRoom, Message, QuickReply } from "./lib/types"

const QUICK_REPLIES: QuickReply[] = [
  { id: "1", label: "자주 묻는 질문", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "2", label: "이용 가이드", icon: <FileText className="h-4 w-4" /> },
  { id: "3", label: "상담원 연결", icon: <Phone className="h-4 w-4" /> },
]

// ============ 서브 컴포넌트들 ============

interface MessageBubbleProps {
  message: Message
  selectedRoom: ChatRoom | null
  onFeedback: (messageId: string, type: "up" | "down") => void
}

const MessageBubble = memo(function MessageBubble({ message, selectedRoom, onFeedback }: MessageBubbleProps) {
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  if (message.sender === "system") {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-[#f5f5f5] px-4 py-1.5 text-xs text-[#666]">{message.content}</span>
      </div>
    )
  }

  return (
    <div
      className={cn("flex gap-2.5 animate-[fadeIn_0.3s_ease]", message.sender === "user" ? "flex-row-reverse" : "")}
    >
      {message.sender === "agent" && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
            selectedRoom?.avatarStyle,
          )}
        >
          {selectedRoom?.avatar}
        </div>
      )}
      <div className={cn("max-w-[75%]", message.sender === "user" && "flex flex-col items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed",
            message.sender === "user" ? "bg-[#191919] text-white" : "bg-[#f5f5f5] text-[#191919]",
          )}
        >
          {message.content}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[11px] text-[#aaa]">{formatTime(message.timestamp)}</span>
          {message.sender === "user" &&
            (message.isRead ? (
              <CheckCheck className="h-3 w-3 text-[#667eea]" />
            ) : (
              <Check className="h-3 w-3 text-[#aaa]" />
            ))}
        </div>
        {message.showFeedback && message.sender === "agent" && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="mr-1 text-[11px] text-[#aaa]">도움이 되었나요?</span>
            <button
              onClick={() => onFeedback(message.id, "up")}
              className="rounded-full p-1 text-[#aaa] transition-colors hover:bg-[#f0f0f0] hover:text-[#22c55e]"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => onFeedback(message.id, "down")}
              className="rounded-full p-1 text-[#aaa] transition-colors hover:bg-[#f0f0f0] hover:text-[#ef4444]"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

interface TypingIndicatorProps {
  selectedRoom: ChatRoom | null
  currentAnswer?: string
}

const TypingIndicator = memo(function TypingIndicator({ selectedRoom, currentAnswer }: TypingIndicatorProps) {
  // If there's a current answer being streamed, show it
  if (currentAnswer) {
    return (
      <div className="flex gap-2.5 animate-[fadeIn_0.3s_ease]">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
            selectedRoom?.avatarStyle,
          )}
        >
          {selectedRoom?.avatar}
        </div>
        <div className="max-w-[75%]">
          <div className="whitespace-pre-wrap rounded-2xl bg-[#f5f5f5] px-4 py-2.5 text-[14px] leading-relaxed text-[#191919]">
            {currentAnswer}
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[#191919]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
          selectedRoom?.avatarStyle,
        )}
      >
        {selectedRoom?.avatar}
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-[#f5f5f5] px-4 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999] [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999] [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999]" />
      </div>
    </div>
  )
})

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  placeholder?: string
  onFileSelect?: (file: File) => void
  selectedFile?: File | null
  onRemoveFile?: () => void
}

const MessageInput = memo(function MessageInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  inputRef,
  placeholder = "메시지를 입력하세요",
  onFileSelect,
  selectedFile,
  onRemoveFile,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
  }

  return (
    <div className="border-t border-[#f0f0f0] bg-white px-4 py-3">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 py-2">
          <FileText className="h-4 w-4 text-[#666]" />
          <span className="flex-1 truncate text-sm text-[#191919]">{selectedFile.name}</span>
          <span className="text-xs text-[#999]">{(selectedFile.size / 1024).toFixed(1)}KB</span>
          {onRemoveFile && (
            <button
              onClick={onRemoveFile}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[#999] hover:bg-[#e8e8e8]"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      <div className="relative flex items-end">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        />
        <button
          onClick={handleFileClick}
          className="absolute bottom-1.5 left-3 flex h-7 w-7 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#e8e8e8]"
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </button>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none rounded-full bg-[#f5f5f5] py-2.5 pl-12 pr-11 text-[14px] text-[#191919] outline-none transition-colors placeholder:text-[#999] focus:bg-[#f0f0f0]"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() && !selectedFile}
          className={cn(
            "absolute bottom-1 right-1.5 flex h-8 w-8 items-center justify-center rounded-full transition-all",
            value.trim() || selectedFile ? "bg-[#191919] text-white hover:bg-[#333]" : "bg-transparent text-[#ccc]",
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

// ============ 메인 컴포넌트 ============

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "chat">("home")
  const [chatView, setChatView] = useState<"list" | "detail">("list")
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [showBubble, setShowBubble] = useState(true)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [savedMessages, setSavedMessages] = useState<Message[] | undefined>(undefined)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const {
    rooms,
    isManaging,
    editingRoomId,
    editingName,
    setIsManaging,
    setEditingName,
    markRoomAsRead,
    handleSaveEdit,
    handleStartEdit,
    handleDeleteRoom,
    getTotalUnread,
  } = useChatRooms()

  const { saveConversation, getConversation, deleteConversation, getConversationRooms } = useConversationHistory()

  const {
    messages,
    inputValue,
    isTyping,
    currentAnswer,
    isConnected,
    messagesEndRef,
    inputRef,
    setInputValue,
    handleQuickReply,
    handleFeedback,
    handleSendMessage,
    handleKeyDown,
    sendMessage,
  } = useChat(selectedRoom, savedMessages)

  // Get saved conversation rooms
  const savedRooms = getConversationRooms()
  const allRooms = [...savedRooms, ...rooms]

  // Save conversation when messages change
  useEffect(() => {
    if (conversationId && selectedRoom && messages.length > 0) {
      saveConversation(conversationId, selectedRoom, messages)
    }
  }, [conversationId, selectedRoom, messages, saveConversation])

  // Send pending message when room is set
  useEffect(() => {
    if (pendingMessage && selectedRoom && isConnected) {
      const timer = setTimeout(() => {
        // Directly send the pending message without using inputValue
        sendMessage(pendingMessage)
        setPendingMessage(null)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [pendingMessage, selectedRoom, isConnected, sendMessage])

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), BUBBLE_AUTO_HIDE_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const handleRoomClick = useCallback(
    (room: ChatRoom) => {
      setSelectedRoom(room)
      setChatView("detail")
      markRoomAsRead(room.id)
      setConversationId(room.id)

      // Load saved conversation if exists
      const savedConversation = getConversation(room.id)
      if (savedConversation && savedConversation.messages.length > 0) {
        setSavedMessages(savedConversation.messages)
        console.log("Loaded saved conversation:", savedConversation.id, "with", savedConversation.messages.length, "messages")
      } else {
        setSavedMessages(undefined)
      }
    },
    [markRoomAsRead, getConversation]
  )

  const handleNewChat = useCallback(() => {
    setActiveTab("chat")
    setChatView("detail")
    const newConversationId = `conv-${Date.now()}`
    setConversationId(newConversationId)
    setSavedMessages(undefined) // Clear saved messages for new chat
    setSelectedRoom({
      id: newConversationId,
      name: "AI 상담 도우미",
      avatar: "AI",
      avatarStyle: "bg-gradient-to-br from-[#667eea] to-[#764ba2]",
      lastMessage: "",
      time: "",
      unread: false,
      status: "online",
    })
  }, [])

  const handleBack = useCallback(() => {
    setChatView("list")
    setSelectedRoom(null)
  }, [])

  const handleDeleteRoomWithHistory = useCallback(
    (roomId: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      handleDeleteRoom(roomId, e)
      deleteConversation(roomId)
    },
    [handleDeleteRoom, deleteConversation]
  )

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  const handleHomeInputSend = useCallback(() => {
    if (!inputValue.trim() && !selectedFile) return

    // Save the message to send after room is created
    let messageToSend = inputValue.trim()
    if (selectedFile) {
      messageToSend += selectedFile ? `\n[첨부파일: ${selectedFile.name}]` : ""
    }
    setPendingMessage(messageToSend)
    // Clear input value and file immediately to prevent duplicate sending
    setInputValue("")
    setSelectedFile(null)

    setActiveTab("chat")
    setChatView("detail")
    const newConversationId = `conv-${Date.now()}`
    setConversationId(newConversationId)
    setSavedMessages(undefined) // Clear saved messages for new chat
    setSelectedRoom({
      id: newConversationId,
      name: "AI 상담 도우미",
      avatar: "AI",
      avatarStyle: "bg-gradient-to-br from-[#667eea] to-[#764ba2]",
      lastMessage: "",
      time: "",
      unread: false,
      status: "online",
    })
  }, [inputValue, selectedFile, setInputValue])

  const handleHomeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault()
        handleHomeInputSend()
      }
    },
    [handleHomeInputSend],
  )

  const renderHomeTab = () => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <p className="text-center text-xl font-medium text-[#191919]">안녕하세요</p>
        <p className="mt-1 text-center text-xl font-medium text-[#191919]">무엇을 도와드릴까요?</p>
      </div>
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleHomeInputSend}
        onKeyDown={handleHomeKeyDown}
        inputRef={inputRef}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  )

  const renderChatListTab = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] bg-white px-6 py-5">
        <h2 className="text-xl font-semibold text-[#191919]">대화</h2>
        <button
          onClick={() => setIsManaging(!isManaging)}
          className={cn(
            "flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all",
            isManaging ? "bg-[#667eea] text-white hover:bg-[#5a6fd6]" : "bg-[#f5f5f5] text-[#666] hover:bg-[#eee]",
          )}
        >
          {isManaging ? (
            <>
              <Check className="h-4 w-4" />
              완료
            </>
          ) : (
            <>
              <Settings2 className="h-4 w-4" />
              관리
            </>
          )}
        </button>
      </div>
      <div className="relative flex-1 overflow-y-auto pb-20">
        {allRooms.length > 0 ? (
          allRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => !isManaging && handleRoomClick(room)}
              className={cn(
                "flex items-center gap-4 border-b border-[#f5f5f5] px-6 py-4 transition-colors",
                !isManaging && "cursor-pointer hover:bg-[#fafafa]",
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                    room.avatarStyle,
                  )}
                >
                  {room.avatar}
                </div>
                {!isManaging && (
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                      room.status === "online"
                        ? "bg-[#22c55e]"
                        : room.status === "busy"
                          ? "bg-[#f59e0b]"
                          : "bg-[#9ca3af]",
                    )}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  {editingRoomId === room.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded-lg border border-[#ddd] px-2 py-1 text-[15px] font-semibold text-[#191919] outline-none focus:border-[#667eea]"
                      autoFocus
                    />
                  ) : (
                    <span className="text-[15px] font-semibold text-[#191919]">{room.name}</span>
                  )}
                  {!isManaging && <span className="text-xs text-[#999]">{room.time}</span>}
                </div>
                {(!editingRoomId || editingRoomId !== room.id) && (
                  <p className={cn("truncate text-sm", room.unread ? "font-medium text-[#191919]" : "text-[#666]")}>
                    {room.lastMessage}
                  </p>
                )}
              </div>
              {isManaging ? (
                <div className="flex items-center gap-2">
                  {editingRoomId === room.id ? (
                    <button
                      onClick={(e) => handleSaveEdit(room.id, e)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e] text-white transition-all hover:bg-[#16a34a]"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleStartEdit(room, e)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[#666] transition-all hover:bg-[#eee]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteRoomWithHistory(room.id, e)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fee2e2] text-[#ef4444] transition-all hover:bg-[#fecaca]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                room.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#667eea]" />
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f5]">
              <MessageSquare className="h-7 w-7 text-[#999]" />
            </div>
            <p className="text-[#666]">아직 대화가 없습니다</p>
          </div>
        )}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={handleNewChat}
            className="flex h-12 items-center gap-2 rounded-full bg-[#191919] px-6 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#333] hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />새 대화
          </button>
        </div>
      </div>
    </div>
  )

  const renderChatDetail = () => (
    <div className="flex h-full flex-col bg-white">
      {/* 상단 탭바 */}
      <div className="flex border-b border-[#e5e5e5] bg-[#fafafa]">
        <button
          onClick={() => {
            handleBack()
            setActiveTab("home")
          }}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#888] transition-colors hover:text-[#666]"
        >
          <Home className="h-3.5 w-3.5" />홈
        </button>
        <button
          onClick={handleBack}
          className="relative flex flex-1 items-center justify-center gap-1.5 border-b-2 border-[#191919] bg-white py-2.5 text-xs font-medium text-[#191919] transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          대화
        </button>
      </div>

      {/* 대화방 헤더 */}
      <div className="flex items-center gap-3 border-b border-[#f0f0f0] bg-white px-4 py-3">
        <button
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#666] transition-colors hover:bg-[#f5f5f5]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white",
              selectedRoom?.avatarStyle,
            )}
          >
            {selectedRoom?.avatar}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#191919]">{selectedRoom?.name}</div>
            <div className="text-[12px] text-[#22c55e]">온라인</div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-white px-4 py-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} selectedRoom={selectedRoom} onFeedback={handleFeedback} />
        ))}
        {isTyping && <TypingIndicator selectedRoom={selectedRoom} currentAnswer={currentAnswer} />}
        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 답장 */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-[#f0f0f0] bg-white px-4 py-3">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply.id}
              onClick={() => handleQuickReply(reply)}
              className="flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3 py-2 text-[13px] text-[#666] transition-all hover:bg-[#eee]"
            >
              {reply.icon}
              {reply.label}
            </button>
          ))}
        </div>
      )}

      {/* 메시지 입력 */}
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  )

  const renderContent = () => {
    if (chatView === "detail" && selectedRoom) {
      return renderChatDetail()
    }

    switch (activeTab) {
      case "home":
        return renderHomeTab()
      case "chat":
        return renderChatListTab()
      default:
        return renderHomeTab()
    }
  }

  const totalUnread = getTotalUnread()

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showBubble && !isOpen && (
          <div className="animate-[fadeIn_0.3s_ease] rounded-xl bg-white px-4 py-3 text-sm text-[#191919] shadow-lg">
            안녕하세요! 무엇을 도와드릴까요?
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#191919] text-white shadow-lg transition-all hover:scale-105"
        >
          <MessageSquare className="h-6 w-6" />
          {totalUnread > 0 && !isOpen && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ef4444] text-xs font-bold text-white">
              {totalUnread}
            </span>
          )}
        </button>
      </div>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-[slideUp_0.3s_ease]">
          {chatView === "list" && (
            <div className="flex border-b border-[#e5e5e5] bg-[#fafafa]">
              <button
                onClick={() => setActiveTab("home")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                  activeTab === "home"
                    ? "border-b-2 border-[#191919] bg-white text-[#191919]"
                    : "text-[#888] hover:text-[#666]",
                )}
              >
                <Home className="h-3.5 w-3.5" />홈
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                  activeTab === "chat"
                    ? "border-b-2 border-[#191919] bg-white text-[#191919]"
                    : "text-[#888] hover:text-[#666]",
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                대화
                {totalUnread > 0 && (
                  <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white">
                    {totalUnread}
                  </span>
                )}
              </button>
            </div>
          )}
          <div className="flex-1 overflow-hidden">{renderContent()}</div>
        </div>
      )}
    </>
  )
}
