"use client"

import type React from "react"

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function ChartCard({ title, subtitle, children, action }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] p-5 transition-colors hover:border-[#27272a]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12px] text-[#52525b]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
