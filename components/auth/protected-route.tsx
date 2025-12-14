"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PageLoading } from "@/components/admin/page-loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }

    if (!loading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push("/admin")
    }
  }, [loading, isAuthenticated, user, requiredRole, router])

  if (loading) {
    return <PageLoading />
  }

  if (!isAuthenticated) {
    return <PageLoading />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <PageLoading />
  }

  return <>{children}</>
}
