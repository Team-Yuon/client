/**
 * 대화 내역 저장 및 불러오기 훅
 */

import { useState, useEffect, useCallback } from "react"
import type { ChatRoom, Message } from "../lib/types"

interface ConversationHistory {
  id: string
  room: ChatRoom
  messages: Message[]
  lastMessageTime: string
  updatedAt: number
}

const STORAGE_KEY = "yuon_conversation_history"
const MAX_CONVERSATIONS = 50 // 최대 저장 대화 수

export function useConversationHistory() {
  const [conversations, setConversations] = useState<ConversationHistory[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const conversations = parsed.map((conv: ConversationHistory) => ({
          ...conv,
          messages: conv.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setConversations(conversations)
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error)
    }
  }, [])

  // Save conversation
  const saveConversation = useCallback(
    (conversationId: string, room: ChatRoom, messages: Message[]) => {
      if (messages.length === 0) return

      const lastMessage = messages[messages.length - 1]
      const conversation: ConversationHistory = {
        id: conversationId,
        room: {
          ...room,
          lastMessage: lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? "..." : ""),
          time: formatTime(lastMessage.timestamp),
        },
        messages,
        lastMessageTime: lastMessage.timestamp.toISOString(),
        updatedAt: Date.now(),
      }

      setConversations((prev) => {
        // Remove existing conversation with same ID
        const filtered = prev.filter((c) => c.id !== conversationId)

        // Add new conversation at the beginning
        const updated = [conversation, ...filtered]

        // Keep only MAX_CONVERSATIONS
        const limited = updated.slice(0, MAX_CONVERSATIONS)

        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
        } catch (error) {
          console.error("Failed to save conversation history:", error)
        }

        return limited
      })
    },
    []
  )

  // Get conversation by ID
  const getConversation = useCallback(
    (conversationId: string): ConversationHistory | undefined => {
      return conversations.find((c) => c.id === conversationId)
    },
    [conversations]
  )

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== conversationId)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      } catch (error) {
        console.error("Failed to delete conversation:", error)
      }

      return filtered
    })
  }, [])

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear conversations:", error)
    }
  }, [])

  // Get conversation rooms for chat list
  const getConversationRooms = useCallback((): ChatRoom[] => {
    return conversations.map((c) => c.room)
  }, [conversations])

  return {
    conversations,
    saveConversation,
    getConversation,
    deleteConversation,
    clearAllConversations,
    getConversationRooms,
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "방금"
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}
