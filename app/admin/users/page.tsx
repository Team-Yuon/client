"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { ChartCard } from "@/components/admin/chart-card"
import { ExportModal } from "@/components/admin/export-modal"
import { CreateUserModal } from "@/components/admin/create-user-modal"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { AlertModal } from "@/components/admin/alert-modal"
import { Search, Shield, ShieldCheck, ShieldAlert, UserPlus, Mail, Edit2, Trash2, ChevronDown } from "lucide-react"
import { usersApi } from "@/lib/api/endpoints"
import type { UserItem } from "@/lib/types"

const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
  admin: { label: "관리자", icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  editor: { label: "편집자", icon: ShieldCheck, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  viewer: { label: "뷰어", icon: Shield, color: "text-[#71717a] bg-[#27272a] border-[#3f3f46]" },
  user: { label: "사용자", icon: Shield, color: "text-[#71717a] bg-[#27272a] border-[#3f3f46]" },
}

const statusConfig = {
  active: { label: "활성", color: "text-emerald-400 bg-emerald-500/10" },
  inactive: { label: "비활성", color: "text-[#52525b] bg-[#27272a]" },
  pending: { label: "대기중", color: "text-amber-400 bg-amber-500/10" },
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "editor" | "viewer">("all")
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(
    null
  )
  const [loading, setLoading] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    const res = await usersApi.list()
    if (res.success && res.data) {
      setUsers(res.data.users || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreateUser = async (email: string, password: string, role: string) => {
    const res = await usersApi.create(email, password, role)
    if (res.success) {
      setAlert({ title: "성공", message: "사용자가 생성되었습니다", type: "success" })
      await loadUsers()
    } else {
      throw new Error(res.error || "사용자 생성에 실패했습니다")
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return

    const res = await usersApi.delete(deleteUserId)
    if (res.success) {
      setAlert({ title: "성공", message: "사용자가 삭제되었습니다", type: "success" })
      await loadUsers()
    } else {
      setAlert({ title: "오류", message: res.error || "사용자 삭제에 실패했습니다", type: "error" })
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch = user.name?.includes(search) || user.email?.includes(search)
      const matchRole = roleFilter === "all" || user.role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <AdminSidebar />
      <main className="ml-[240px] flex-1">
        <AdminHeader
          title="사용자 관리"
          description="시스템 사용자 및 권한을 관리합니다"
          showExport
          onExport={() => setIsExportOpen(true)}
        />

        <div className="p-6">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {[
              { title: "전체 사용자", value: users.length, color: "text-white" },
              { title: "관리자", value: users.filter((u) => u.role === "admin").length, color: "text-rose-400" },
              {
                title: "활성 사용자",
                value: users.filter((u) => u.status === "active").length,
                color: "text-emerald-400",
              },
              { title: "대기중", value: users.filter((u) => u.status === "pending").length, color: "text-amber-400" },
            ].map((stat, idx) => (
              <ChartCard key={idx} title={stat.title}>
                <p className={`text-[28px] font-semibold ${stat.color}`}>{loading ? "-" : stat.value}</p>
              </ChartCard>
            ))}
          </div>

          {/* Users Table */}
          <ChartCard title="사용자 목록">
            {/* Filters */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-1.5">
                  <Search className="h-4 w-4 text-[#52525b]" />
                  <input
                    type="text"
                    placeholder="이름 또는 이메일 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 bg-transparent text-[13px] text-white placeholder-[#52525b] outline-none"
                  />
                </div>

                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="appearance-none rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-1.5 pr-8 text-[13px] text-[#a1a1aa] outline-none hover:border-[#3f3f46] transition-colors"
                  >
                    <option value="all">모든 권한</option>
                    <option value="admin">관리자</option>
                    <option value="editor">편집자</option>
                    <option value="viewer">뷰어</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525b] pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-blue-500 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                사용자 추가
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[#1f1f23]">
              <table className="w-full">
                <thead className="bg-[#111113]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                      사용자
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                      권한
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                      마지막 활동
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                      가입일
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f23]">
                  {filteredUsers.map((user) => {
                    const role = roleConfig[user.role] || roleConfig.user
                    const status = statusConfig[user.status] || statusConfig.inactive
                    const RoleIcon = role.icon

                    return (
                      <tr key={user.id} className="hover:bg-[#111113] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-[13px] font-medium text-white">
                              {user.name[0]}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-white">{user.name}</p>
                              <p className="text-[11px] text-[#52525b]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium ${role.color}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#52525b]">{user.lastActive}</td>
                        <td className="px-4 py-3.5 text-[13px] text-[#52525b]">{user.createdAt}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-white transition-colors">
                              <Mail className="h-4 w-4" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-white transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteUserId(user.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          title="사용자 목록 내보내기"
          data={filteredUsers.map((user) => ({
            이름: user.name,
            이메일: user.email,
            역할: user.role,
            상태: user.status,
            마지막활동: user.lastActive || "-",
          }))}
          filename="users-list"
        />

        <CreateUserModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateUser}
        />

        <ConfirmModal
          isOpen={deleteUserId !== null}
          onClose={() => setDeleteUserId(null)}
          onConfirm={handleDeleteUser}
          title="사용자 삭제"
          message="정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제"
          cancelText="취소"
          variant="danger"
        />

        {alert && (
          <AlertModal
            isOpen={true}
            onClose={() => setAlert(null)}
            title={alert.title}
            message={alert.message}
            type={alert.type}
          />
        )}
      </main>
    </div>
  )
}
