/**
 * 공통 타입 정의
 */

// ============ 챗봇 관련 타입 ============

export type MessageSender = "user" | "agent" | "system"
export type ChatRoomStatus = "online" | "offline" | "busy"
export type FeedbackType = "up" | "down"

export interface Message {
  id: string
  content: string
  sender: MessageSender
  timestamp: Date
  isRead?: boolean
  showFeedback?: boolean
  feedbackGiven?: FeedbackType | null
}

export interface ChatRoom {
  id: string
  name: string
  avatar: string
  avatarStyle: string
  lastMessage: string
  time: string
  unread: boolean
  status: ChatRoomStatus
}

export interface QuickReply {
  id: string
  label: string
  icon?: React.ReactNode
}

// ============ 문서 관련 타입 ============

export type DocumentCategory = "기술" | "매뉴얼" | "보고서" | "정책" | "기타"

export interface Document {
  id: string
  content: string
  metadata?: Record<string, unknown>
  score?: number
  fileKey?: string
  fileUrl?: string
  // Legacy fields for UI compatibility
  title?: string
  category?: DocumentCategory
  author?: string
  createdAt?: string
  size?: string
}

// ============ 벡터 관련 타입 ============

export interface VectorDocument {
  id: string
  title: string
  category: DocumentCategory
  chunks: number
  dimensions: number
  createdAt: string
  similarity: number
  x: number // 캔버스 X 좌표 (%)
  y: number // 캔버스 Y 좌표 (%)
  content: string
}

// ============ 분석 관련 타입 ============

export type PriorityLevel = "높음" | "중간" | "낮음"

export interface ChatAnalytics {
  date: string
  count: number
}

export interface CategoryBreakdown {
  name: string
  value: number
  color: string
}

export interface HourlyActivity {
  hour: string
  count: number
}

export interface SuggestedTopic {
  topic: string
  priority: PriorityLevel
}

export interface TopKeyword {
  keyword: string
  count: number
}

// ============ 대시보드 관련 타입 ============

export type WidgetId = "chart-messages" | "chart-category" | "keywords" | "system" | "knowledge"
export type DateRange = "7days" | "30days" | "90days" | "custom"
export type ChangeType = "positive" | "negative" | "neutral"

export interface StatsCardData {
  title: string
  value: string
  change: string
  changeType: ChangeType
}

export interface SystemStatus {
  name: string
  status: string
  ok: boolean
  icon: React.ComponentType<{ className?: string }>
}

// ============ API 관련 타입 ============

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  documents?: T[]
  items?: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
}

// ============ WebSocket 관련 타입 ============

export type WebSocketEventType =
  | "start_conversation"
  | "append_message"
  | "typing"
  | "end_conversation"
  | "message_ack"
  | "stream_chunk"
  | "stream_end"
  | "system_notice"
  | "error"

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType
  data: T
}

export interface ConversationData {
  conversationId?: string
  message?: string
}

export interface StreamChunkData {
  conversationId: string
  chunk: string
}

export interface StreamEndData {
  conversationId: string
  fullResponse: string
  tokenUsage?: {
    prompt: number
    completion: number
    total: number
  }
}

// ============ 관리자 대화/사용자 타입 ============

export interface ConversationSummary {
  id: string
  preview: string
  messageCount: number
  createdAt: string
  tokenUsage: number
}

export interface ConversationDetail {
  id: string
  messages: Array<{
    role: string
    content: string
    timestamp: string
  }>
  metadata?: Record<string, unknown>
}

export interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  createdAt: string
}
