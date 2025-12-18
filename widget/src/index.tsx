import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChatWidget } from './ChatWidget'
import './styles.css'

export interface YuonChatConfig {
  apiUrl?: string
  wsUrl?: string
}

class YuonChat {
  private root: ReactDOM.Root | null = null
  private container: HTMLDivElement | null = null
  private config: YuonChatConfig = {}

  init(config: YuonChatConfig = {}) {
    // 기본 설정
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:8080/api/v1',
      wsUrl: config.wsUrl || 'ws://localhost:8080/api/v1/ws',
    }

    // Set environment variables for hooks to use
    if (typeof window !== 'undefined') {
      (window as any).YUON_API_URL = this.config.apiUrl;
      (window as any).YUON_WS_URL = this.config.wsUrl
    }

    // 이미 초기화된 경우 제거
    if (this.container) {
      this.destroy()
    }

    // 컨테이너 생성
    this.container = document.createElement('div')
    this.container.id = 'yuon-chat-widget'
    document.body.appendChild(this.container)

    // React 렌더링
    this.root = ReactDOM.createRoot(this.container)
    this.root.render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>
    )

    console.log('[YuonChat] Widget initialized', this.config)
  }

  destroy() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    if (this.container) {
      this.container.remove()
      this.container = null
    }
    console.log('[YuonChat] Widget destroyed')
  }

  updateConfig(config: Partial<YuonChatConfig>) {
    this.config = { ...this.config, ...config }

    // Update window globals
    if (typeof window !== 'undefined') {
      (window as any).YUON_API_URL = this.config.apiUrl;
      (window as any).YUON_WS_URL = this.config.wsUrl
    }

    if (this.root && this.container) {
      this.root.render(
        <React.StrictMode>
          <ChatWidget />
        </React.StrictMode>
      )
    }
  }
}

// 전역 객체로 노출
const yuonChat = new YuonChat()

// UMD 패턴
if (typeof window !== 'undefined') {
  ;(window as any).YuonChat = yuonChat
}

export default yuonChat
