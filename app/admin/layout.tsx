import type React from "react"
import { Suspense } from "react"
import { PageLoading } from "@/components/admin/page-loading"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#09090b]">
        <Suspense fallback={<PageLoading />}>{children}</Suspense>
      </div>
    </ProtectedRoute>
  )
}
