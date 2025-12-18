import { useState, useRef, useEffect, useCallback } from "react"
import type { Message, ChatRoom, QuickReply } from "../lib/types"
import { WELCOME_MESSAGE, QUICK_REPLY_RESPONSES } from "../lib/constants"
import { useWebSocketChat } from "./useWebSocketChat"

interface UseChatOptions {
  selectedRoom: ChatRoom | null
  initialMessages?: Message[]
}

export function useChat(selectedRoom: ChatRoom | null, initialMessages?: Message[]) {
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // WebSocket chat
  const { messages: wsMessages, isConnected, isTyping, currentAnswer, sendMessage } = useWebSocketChat({
    conversationId: selectedRoom?.id,
    onError: (error) => {
      console.error("WebSocket error:", error)
    },
  })

  // Combine welcome message with WebSocket messages or initial messages
  const [messages, setMessages] = useState<Message[]>(initialMessages || [WELCOME_MESSAGE])

  useEffect(() => {
    // If we have initial messages (from saved conversation), use them until we get new WebSocket messages
    if (initialMessages && initialMessages.length > 0 && wsMessages.length === 0) {
      setMessages(initialMessages)
    } else if (wsMessages.length > 0) {
      setMessages([WELCOME_MESSAGE, ...wsMessages])
    } else {
      setMessages([WELCOME_MESSAGE])
    }
  }, [wsMessages, initialMessages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedRoom])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px"
    }
  }, [inputValue])

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      const response = QUICK_REPLY_RESPONSES[reply.id as keyof typeof QUICK_REPLY_RESPONSES]
      if (response) {
        sendMessage(reply.label)
      }
    },
    [sendMessage]
  )

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue.trim())
      setInputValue("")
    }
  }, [inputValue, isConnected, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const handleFeedback = useCallback((messageId: string, feedbackType: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              feedbackGiven: feedbackType,
            }
          : msg
      )
    )
  }, [])

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    currentAnswer,
    isConnected,
    messagesEndRef,
    inputRef,
    handleQuickReply,
    handleSendMessage,
    handleKeyDown,
    handleFeedback,
    sendMessage, // Export the direct sendMessage function
  }
}
