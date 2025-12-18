import { useState, useCallback } from "react"
import type { ChatRoom } from "../lib/types"

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isManaging, setIsManaging] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const markRoomAsRead = useCallback((roomId: string) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, unread: false } : r)))
  }, [])

  const handleSaveEdit = useCallback(
    (roomId: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, name: editingName } : room)))
      setEditingRoomId(null)
      setEditingName("")
    },
    [editingName]
  )

  const handleStartEdit = useCallback((room: ChatRoom, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setEditingRoomId(room.id)
    setEditingName(room.name)
  }, [])

  const handleDeleteRoom = useCallback((roomId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setRooms((prev) => prev.filter((room) => room.id !== roomId))
  }, [])

  const getTotalUnread = useCallback(() => {
    return rooms.filter((r) => r.unread).length
  }, [rooms])

  return {
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
  }
}
