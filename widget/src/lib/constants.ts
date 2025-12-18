/**
 * 애플리케이션 상수 정의
 */

import type { Message } from "./types"

// ============ 챗봇 상수 ============

export const WELCOME_MESSAGE: Message = {
  id: "welcome",
  content: "안녕하세요! 무엇을 도와드릴까요?",
  sender: "agent",
  timestamp: new Date(),
  isRead: true,
}

export const QUICK_REPLY_ITEMS = [
  { id: "1", label: "자주 묻는 질문" },
  { id: "2", label: "이용 가이드" },
  { id: "3", label: "상담원 연결" },
] as const

export const QUICK_REPLY_RESPONSES = {
  "1": "자주 묻는 질문에 대한 답변입니다.",
  "2": "이용 가이드를 확인하시겠어요?",
  "3": "상담원 연결을 도와드리겠습니다.",
} as const

// ============ UI 상수 ============

export const TYPING_INDICATOR_DELAY = 1000
export const FEEDBACK_THANK_YOU_DELAY = 2000
export const BUBBLE_AUTO_HIDE_DELAY = 5000
