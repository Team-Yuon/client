import { useState } from "react"
import { X } from "lucide-react"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (email: string, password: string, role: string) => Promise<void>
}

export function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요")
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다")
      return
    }

    setLoading(true)
    try {
      await onCreate(email, password, role)
      setEmail("")
      setPassword("")
      setRole("user")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "사용자 생성에 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setEmail("")
      setPassword("")
      setRole("user")
      setError("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#27272a] bg-[#18181b] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">사용자 추가</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-1 text-[#71717a] hover:bg-[#27272a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#a1a1aa]">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="user@example.com"
                className="w-full rounded-lg border border-[#27272a] bg-[#09090b] px-3 py-2 text-sm text-white placeholder-[#52525b] outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#a1a1aa]">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="최소 6자 이상"
                className="w-full rounded-lg border border-[#27272a] bg-[#09090b] px-3 py-2 text-sm text-white placeholder-[#52525b] outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-[#a1a1aa]">
                권한
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-[#27272a] bg-[#09090b] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              >
                <option value="user">사용자</option>
                <option value="admin">관리자</option>
                <option value="editor">편집자</option>
                <option value="viewer">뷰어</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-[#27272a] px-4 py-2 text-sm font-medium text-white hover:bg-[#27272a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
