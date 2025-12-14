import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon }: StatsCardProps) {
  const changeConfig = {
    positive: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingUp },
    negative: { color: "text-rose-400", bg: "bg-rose-500/10", icon: TrendingDown },
    neutral: { color: "text-[#71717a]", bg: "bg-[#27272a]", icon: Minus },
  }

  const config = changeConfig[changeType]
  const ChangeIcon = config.icon

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#1f1f23] bg-[#0c0c0e] p-5 transition-all hover:border-[#27272a] hover:bg-[#111113]">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#71717a]">{title}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#18181b] border border-[#27272a]">
            <Icon className="h-4 w-4 text-[#a1a1aa]" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-[28px] font-semibold tracking-tight text-white">{value}</span>
          {change && (
            <div className={`flex items-center gap-1 rounded-md px-2 py-1 ${config.bg}`}>
              <ChangeIcon className={`h-3 w-3 ${config.color}`} />
              <span className={`text-[12px] font-medium ${config.color}`}>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
