"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 페이지 로드 시 localStorage에서 인증 정보 확인
    const token = localStorage.getItem("auth_token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        apiClient.setAuthToken(token)
      } catch (err) {
        console.error("Failed to parse user data:", err)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
      }
    }

    setLoading(false)
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    apiClient.setAuthToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    apiClient.setAuthToken("")
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
