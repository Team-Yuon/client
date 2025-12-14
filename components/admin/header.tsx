"use client"

import { Download, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { DateRangePicker, type DateRange } from "./date-range-picker"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AdminHeaderProps {
  title: string
  description?: string
  showDatePicker?: boolean
  showExport?: boolean
  onExport?: () => void
  onDateRangeChange?: (range: DateRange) => void
}

export function AdminHeader({
  title,
  description,
  showDatePicker = false,
  showExport = false,
  onExport,
  onDateRangeChange,
}: AdminHeaderProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30days")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleDateChange = (range: DateRange) => {
    setDateRange(range)
    onDateRangeChange?.(range)
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    router.push("/login")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1f1f23] px-6 bg-[#09090b]/80 backdrop-blur-xl">
      <div>
        <h1 className="text-[15px] font-semibold text-white">{title}</h1>
        {description && <p className="text-[12px] text-[#71717a]">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        {showDatePicker && <DateRangePicker value={dateRange} onChange={handleDateChange} />}

        {showExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-1.5 text-[13px] font-medium text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] transition-colors"
          >
            <Download className="h-4 w-4" />
            내보내기
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-lg hover:bg-[#18181b] px-2 py-1.5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 ring-2 ring-[#27272a]" />
            <ChevronDown className={`h-4 w-4 text-[#71717a] transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[#27272a] bg-[#18181b] shadow-xl">
              <div className="border-b border-[#27272a] p-3">
                <p className="text-sm font-medium text-white">관리자</p>
                <p className="text-xs text-[#71717a]">admin@yuon.com</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    router.push("/admin")
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  프로필
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  설정
                </button>
              </div>
              <div className="border-t border-[#27272a] p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
