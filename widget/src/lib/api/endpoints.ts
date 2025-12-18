/**
 * API 엔드포인트 정의
 */

import { apiClient } from "./client"
import type {
  Document,
  PaginatedResponse,
  ConversationSummary,
  ConversationDetail,
  UserItem,
} from "../types"

// ============ 인증 API ============

export const authApi = {
  /**
   * 회원가입
   */
  signup: (email: string, password: string, role?: string) =>
    apiClient.post("/auth/signup", { email, password, role }),

  /**
   * 로그인
   */
  login: (email: string, password: string) => apiClient.post<{ token: string }>("/auth/login", { email, password }),
}

// ============ 문서 API ============

export const documentApi = {
  /**
   * 문서 목록 조회
   */
  list: (params?: { page?: number; pageSize?: number; q?: string; category?: string }) => {
    const queryParams: Record<string, string> = {}
    if (params?.page) queryParams.page = String(params.page)
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize)
    if (params?.q) queryParams.q = params.q
    if (params?.category) queryParams.category = params.category
    return apiClient.get<PaginatedResponse<Document>>("/documents", queryParams)
  },

  /**
   * 문서 생성
   */
  create: (document: Partial<Document>) => apiClient.post<Document>("/documents", document),

  /**
   * 문서 조회
   */
  get: (id: string) => apiClient.get<Document>(`/documents/${id}`),

  /**
   * 문서 수정
   */
  update: (id: string, document: Partial<Document>) => apiClient.put<Document>(`/documents/${id}`, document),

  /**
   * 문서 삭제
   */
  delete: (id: string) => apiClient.delete(`/documents/${id}`),

  /**
   * 파일 업로드
   */
  upload: (file: File, metadata?: Record<string, unknown>) => {
    const formData = new FormData()
    formData.append("file", file)
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }
    return apiClient.upload<Document>("/documents/upload", formData)
  },

  /**
   * 파일 다운로드
   */
  downloadFile: (id: string) => apiClient.download(`/documents/${id}/file`),

  /**
   * 문서 통계
   */
  stats: () => apiClient.get("/documents/stats"),

  /**
   * 대량 문서 등록
   */
  bulkIngest: (documents: Partial<Document>[]) => apiClient.post("/documents/bulk-ingest", documents),

  /**
   * 재인덱싱
   */
  reindex: (documentIds: string[]) => apiClient.post("/documents/reindex", { documentIds }),
}

// ============ 벡터 API ============

export const vectorApi = {
  /**
   * 벡터 조회
   */
  get: (id: string, withPayload = true) =>
    apiClient.get(`/documents/${id}/vector`, { withPayload: String(withPayload) }),

  /**
   * 벡터 쿼리 (유사 문서 검색)
   */
  query: (documentIds: string[], limit?: number, withPayload = true) =>
    apiClient.post("/documents/vectors/query", { documentIds, limit, withPayload }),

  /**
   * 벡터 2D 투영
   */
  projection: (limit?: number, withPayload = true) =>
    apiClient.post("/documents/vectors/projection", { limit, withPayload }),
}

// ============ 분석 API ============

export const analyticsApi = {
  /**
   * 채팅 통계
   */
  chatStats: () => apiClient.get("/analytics/chat"),

  /**
   * 지식 격차 분석
   */
  knowledgeNeeds: () => apiClient.get("/analytics/needs"),
}

// ============ 헬스체크 API ============

export const healthApi = {
  /**
   * 기본 헬스체크
   */
  check: () => apiClient.get("/health"),

  /**
   * 시스템 헬스체크
   */
  system: () => apiClient.get("/system/health"),
}

// ============ 대시보드 API ============

export const dashboardApi = {
  /**
   * 대시보드 통계
   */
  stats: () => apiClient.get("/documents/stats"),

  /**
   * 채팅 통계 (월별)
   */
  chatStats: () => apiClient.get("/analytics/chat"),

  /**
   * 지식 격차 분석
   */
  knowledgeNeeds: () => apiClient.get("/analytics/needs"),
}

// ============ 대화/사용자 API ============

export const conversationsApi = {
  list: () => apiClient.get<{ conversations: ConversationSummary[] }>("/conversations"),
  detail: (id: string) => apiClient.get<ConversationDetail>(`/conversations/${id}`),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/conversations/${id}`),
}

export const usersApi = {
  list: () => apiClient.get<{ users: UserItem[] }>("/users"),
  create: (email: string, password: string, role?: string) =>
    apiClient.post<{ id: string; email: string; role: string; message: string }>("/users", { email, password, role }),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/users/${id}`),
}
