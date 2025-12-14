"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

export type DateRange = "today" | "7days" | "30days" | "90days" | "custom"

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const rangeLabels: Record<DateRange, string> = {
  today: "오늘",
  "7days": "최근 7일",
  "30days": "최근 30일",
  "90days": "최근 90일",
  custom: "직접 설정",
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-1.5 text-[13px] font-medium text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] transition-colors"
      >
        <Calendar className="h-4 w-4 text-[#52525b]" />
        <span>{rangeLabels[value]}</span>
        <ChevronDown className="h-3 w-3 text-[#52525b]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[#27272a] bg-[#18181b] shadow-xl shadow-black/20">
            {Object.entries(rangeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  onChange(key as DateRange)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2.5 text-left text-[13px] transition-colors ${
                  value === key ? "bg-blue-500/10 text-blue-400" : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
