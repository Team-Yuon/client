/**
 * 환경 변수 헬퍼 (위젯용)
 */

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "https://yuon-api.dsmhs.kr/api/v1",
  wsUrl: import.meta.env.VITE_WS_URL || "wss://yuon-api.dsmhs.kr/api/v1/ws",
  appEnv: "development",
  isDevelopment: true,
  isProduction: false,
} as const

/**
 * 환경 변수 검증
 */
export function validateEnv() {
  if (!import.meta.env.VITE_API_URL) {
    console.warn('Warning: VITE_API_URL is not defined in environment variables')
  }
  if (!import.meta.env.VITE_WS_URL) {
    console.warn('Warning: VITE_WS_URL is not defined in environment variables')
  }
}
