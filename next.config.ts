import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // 프로덕션 최적화
  reactStrictMode: true,

  // 이미지 최적화
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // 실험적 기능 (성능 최적화)
  experimental: {
    // 서버 액션 최적화
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console 제거 (선택적)
    // removeConsole: process.env.NODE_ENV === "production",
  },

  // PoweredByHeader 제거 (보안)
  poweredByHeader: false,

  // 압축 활성화
  compress: true,
}

export default nextConfig
