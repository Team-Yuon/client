"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api/endpoints"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("admin")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다")
      return
    }

    // 비밀번호 길이 확인
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다")
      return
    }

    setLoading(true)

    try {
      const response = await authApi.signup(email, password, role)

      if (response.success && response.data) {
        const data = response.data as {
          token: string
          user: { id: string; email: string; role: string }
        }

        // JWT 토큰 및 사용자 컨텍스트 설정
        login(data.token, {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        })

        // 관리자 대시보드로 이동
        router.push("/admin")
      } else {
        setError(response.error?.message || "회원가입에 실패했습니다")
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다")
      console.error("Signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#18181b] rounded-lg border border-[#27272a] p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">관리자 회원가입</h1>
        <p className="text-sm text-[#a1a1aa]">
          YUON 관리 시스템 계정을 생성하세요
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#a1a1aa] mb-2"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white placeholder-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="admin@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#a1a1aa] mb-2"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white placeholder-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-[#71717a]">최소 8자 이상</p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-[#a1a1aa] mb-2"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white placeholder-[#52525b] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-[#a1a1aa] mb-2"
          >
            역할
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="admin">관리자</option>
            <option value="user">사용자</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-md transition-colors"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#a1a1aa]">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/auth/login"
            className="text-blue-500 hover:text-blue-400 font-medium"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
