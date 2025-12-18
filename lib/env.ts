/**
 * 환경 변수 헬퍼
 */

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://yuon-api.dsmhs.kr/api/v1",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "wss://yuon-api.dsmhs.kr/api/v1/ws",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || "production",
  isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === "development" || process.env.NODE_ENV === "development",
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === "production" || process.env.NODE_ENV === "production",
} as const

/**
 * 환경 변수 검증
 */
export function validateEnv() {
  const required = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_WS_URL"]

  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`Warning: ${key} is not defined in environment variables`)
    }
  }
}
