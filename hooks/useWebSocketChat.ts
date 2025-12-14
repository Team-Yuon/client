/**
 * WebSocket 채팅 훅
 */

import { useState, useEffect, useCallback, useRef } from "react"
import {
  getWebSocketClient,
  type StreamChunkPayload,
  type StreamEndPayload,
  type MessageAckPayload,
  type ErrorPayload,
} from "@/lib/websocket/client"
import type { Message } from "@/lib/types"

interface UseWebSocketChatOptions {
  conversationId?: string
  onError?: (error: string) => void
}

export function useWebSocketChat(options: UseWebSocketChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const wsClient = useRef(getWebSocketClient())
  const conversationIdRef = useRef(options.conversationId)

  // Update conversationId ref when it changes
  useEffect(() => {
    const prevId = conversationIdRef.current
    conversationIdRef.current = options.conversationId

    // If conversation ID changed, clear messages and start new conversation
    if (prevId !== options.conversationId && options.conversationId) {
      console.log("Conversation ID changed from", prevId, "to", options.conversationId)
      setMessages([])
      setCurrentAnswer("")
      setIsTyping(false)

      // Start new conversation if connected
      if (isConnected) {
        wsClient.current.send("start_conversation", {
          conversation_id: options.conversationId,
        })
      }
    }
  }, [options.conversationId, isConnected])

  // Connect to WebSocket on mount
  useEffect(() => {
    const connect = async () => {
      try {
        await wsClient.current.connect()
        setIsConnected(true)

        // Start conversation
        wsClient.current.send("start_conversation", {
          conversation_id: conversationIdRef.current,
        })
      } catch (error) {
        console.error("Failed to connect WebSocket:", error)
        options.onError?.("채팅 서버에 연결할 수 없습니다")
      }
    }

    connect()

    // Setup event handlers
    const handleMessageAck = (payload: unknown) => {
      const data = payload as MessageAckPayload
      conversationIdRef.current = data.conversation_id
    }

    const handleStreamChunk = (payload: unknown) => {
      const data = payload as StreamChunkPayload
      setIsTyping(true)
      setCurrentAnswer((prev) => prev + data.chunk)
    }

    const handleStreamEnd = (payload: unknown) => {
      const data = payload as StreamEndPayload
      setIsTyping(false)

      // Add bot response to messages
      const botMessage: Message = {
        id: data.message_id,
        content: data.answer,
        sender: "agent",
        timestamp: new Date(),
        isRead: true,
        showFeedback: true,
        feedbackGiven: null,
      }

      setMessages((prev) => [...prev, botMessage])
      setCurrentAnswer("")
    }

    const handleError = (payload: unknown) => {
      const data = payload as ErrorPayload
      setIsTyping(false)
      options.onError?.(data.message)
    }

    wsClient.current.on("message_ack", handleMessageAck)
    wsClient.current.on("stream_chunk", handleStreamChunk)
    wsClient.current.on("stream_end", handleStreamEnd)
    wsClient.current.on("error", handleError)

    // Cleanup
    return () => {
      wsClient.current.off("message_ack", handleMessageAck)
      wsClient.current.off("stream_chunk", handleStreamChunk)
      wsClient.current.off("stream_end", handleStreamEnd)
      wsClient.current.off("error", handleError)
      wsClient.current.disconnect()
      setIsConnected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) {
        console.log("Empty message, not sending")
        return
      }

      if (!isConnected) {
        console.log("WebSocket not connected, cannot send message")
        return
      }

      console.log("Sending message:", content)

      // Add user message to messages
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content,
        sender: "user",
        timestamp: new Date(),
        isRead: true,
      }

      setMessages((prev) => [...prev, userMessage])

      // Send to server
      const messagePayload = {
        conversation_id: conversationIdRef.current,
        message_id: `msg-${Date.now()}`,
        message: content,
        use_vector_search: true,
        use_full_text: true,
        top_k: 5,
      }

      console.log("Sending to WebSocket:", messagePayload)
      wsClient.current.send("append_message", messagePayload)
    },
    [isConnected]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentAnswer("")
    setIsTyping(false)
  }, [])

  return {
    messages,
    isConnected,
    isTyping,
    currentAnswer,
    sendMessage,
    clearMessages,
  }
}
