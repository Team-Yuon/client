"use client"

import { useState, useCallback, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Database,
  Users,
  Sparkles,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/documents", icon: FileText, label: "문서 관리" },
  { href: "/admin/analytics", icon: BarChart3, label: "분석" },
  { href: "/admin/conversations", icon: MessageSquare, label: "대화 내역" },
  { href: "/admin/vectors", icon: Database, label: "벡터 DB" },
  { href: "/admin/users", icon: Users, label: "사용자 관리" },
]

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  collapsed: boolean
}

const NavItem = memo(function NavItem({ href, icon: Icon, label, isActive, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
        isActive ? "bg-[#18181b] text-white" : "text-[#71717a] hover:bg-[#18181b]/50 hover:text-[#a1a1aa]"
      }`}
    >
      <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-blue-500" : ""}`} />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
})

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-[#1f1f23] bg-[#0c0c0e] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[#1f1f23] px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-semibold text-white">CONSOLE</span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-[#27272a] bg-[#18181b] text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
        aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Navigation */}
      <nav className="mt-6 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-20 left-0 right-0 px-3">
        <div
          className={`flex items-center gap-2.5 rounded-lg bg-[#18181b]/50 border border-[#27272a] px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
            <span className="text-xs font-medium">{user?.email?.[0].toUpperCase()}</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[11px] font-medium text-white truncate">{user?.email}</span>
              <span className="text-[10px] text-[#52525b] capitalize">{user?.role}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-[#27272a] text-[#71717a] hover:text-red-400 transition-colors flex-shrink-0"
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <div
          className={`flex items-center gap-2.5 rounded-lg bg-[#18181b]/50 border border-[#27272a] px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-white">시스템 정상</span>
              <span className="text-[10px] text-[#52525b]">모든 서비스 운영중</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
