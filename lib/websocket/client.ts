/**
 * WebSocket 클라이언트
 */

import { env } from "@/lib/env"

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

export interface WebSocketEnvelope {
  type: WebSocketEventType
  payload: unknown
}

export interface AppendMessagePayload {
  conversation_id?: string
  message_id?: string
  message: string
  use_vector_search?: boolean
  use_full_text?: boolean
  top_k?: number
  history?: Array<{ role: string; content: string }>
}

export interface StreamChunkPayload {
  conversation_id: string
  message_id: string
  chunk: string
  index: number
}

export interface StreamEndPayload {
  conversation_id: string
  message_id: string
  answer: string
  sources?: Array<{
    id: string
    content: string
    metadata?: Record<string, unknown>
  }>
  tokens_used?: number
}

export interface MessageAckPayload {
  conversation_id: string
  message_id: string
}

export interface ErrorPayload {
  message: string
}

type MessageHandler = (payload: unknown) => void

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private handlers: Map<WebSocketEventType, MessageHandler[]> = new Map()
  private reconnectTimeout: number = 3000
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private isIntentionallyClosed: boolean = false

  constructor(url?: string) {
    this.url = url || env.wsUrl
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        this.isIntentionallyClosed = false

        this.ws.onopen = () => {
          console.log("WebSocket connected")
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const envelope = JSON.parse(event.data) as WebSocketEnvelope
            this.handleMessage(envelope)
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onerror = () => {
          // WebSocket error - will be handled by onclose
          reject(new Error("WebSocket connection failed"))
        }

        this.ws.onclose = () => {
          console.log("WebSocket disconnected")
          this.ws = null

          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`Reconnecting in ${this.reconnectTimeout}ms (attempt ${this.reconnectAttempts})`)
            setTimeout(() => this.connect(), this.reconnectTimeout)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect() {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(type: WebSocketEventType, payload: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected")
      return
    }

    const envelope: WebSocketEnvelope = { type, payload }
    this.ws.send(JSON.stringify(envelope))
  }

  on(type: WebSocketEventType, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, [])
    }
    this.handlers.get(type)!.push(handler)
  }

  off(type: WebSocketEventType, handler: MessageHandler) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private handleMessage(envelope: WebSocketEnvelope) {
    const handlers = this.handlers.get(envelope.type)
    if (handlers) {
      handlers.forEach((handler) => handler(envelope.payload))
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}
