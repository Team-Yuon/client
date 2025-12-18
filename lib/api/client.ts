/**
 * API 클라이언트
 */

import type { ApiResponse } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://yuon-api.dsmhs.kr/api/v1"

class ApiClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.headers = {
      "Content-Type": "application/json",
    }
  }

  /**
   * JWT 토큰 설정
   */
  setAuthToken(token: string) {
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  /**
   * JWT 토큰 제거
   */
  clearAuthToken() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Authorization, ...rest } = this.headers as Record<string, string>
    this.headers = rest
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value)
          }
        })
      }

      console.log("GET request:", url.toString())
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.headers,
      })

      console.log("GET response status:", response.status, response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.log("GET error response data:", errorData)

        if (errorData && errorData.error) {
          return {
            success: false,
            error: errorData.error,
          }
        }

        return {
          success: false,
          error: {
            code: "HTTP_ERROR",
            message: errorData?.message || `요청 실패: ${response.status}`,
          },
        }
      }

      const data = await response.json()
      console.log("GET success response data:", data)
      return data
    } catch (error) {
      console.error("GET request error:", error)
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "네트워크 오류가 발생했습니다",
        },
      }
    }
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || {
            code: "HTTP_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "네트워크 오류가 발생했습니다",
        },
      }
    }
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || {
            code: "HTTP_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "네트워크 오류가 발생했습니다",
        },
      }
    }
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || {
            code: "HTTP_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "네트워크 오류가 발생했습니다",
        },
      }
    }
  }

  /**
   * 파일 업로드
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { "Content-Type": _, ...headersWithoutContentType } = this.headers as Record<string, string>

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: headersWithoutContentType,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.log("Upload error response:", response.status, errorData)

        if (errorData && errorData.error) {
          return {
            success: false,
            error: errorData.error,
          }
        }

        return {
          success: false,
          error: {
            code: "HTTP_ERROR",
            message: errorData?.message || `파일 업로드 실패: ${response.status}`,
          },
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다",
        },
      }
    }
  }

  /**
   * 파일 다운로드
   */
  async download(endpoint: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: this.headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || {
            code: "HTTP_ERROR",
            message: `파일 다운로드 실패: ${response.status}`,
          },
        }
      }

      const blob = await response.blob()
      return {
        success: true,
        data: blob,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "파일 다운로드 중 오류가 발생했습니다",
        },
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
