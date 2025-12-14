"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { ChartCard } from "@/components/admin/chart-card"
import { ExportModal } from "@/components/admin/export-modal"
import { DraggableWidget } from "@/components/admin/draggable-widget"
import type { DateRange } from "@/components/admin/date-range-picker"
import { FileText, MessageSquare, Users, TrendingUp, Database, Cpu, Settings2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { dashboardApi, healthApi } from "@/lib/api/endpoints"

type WidgetId = "chart-messages" | "keywords" | "system" | "knowledge"

const defaultWidgets: WidgetId[] = ["chart-messages", "keywords", "system", "knowledge"]

interface DashboardStats {
  total_documents: number
  total_conversations: number
  active_users: number
  avg_response_time?: number
  documents_trend?: number
  conversations_trend?: number
  active_users_trend?: number
  response_time_trend?: number
}

interface ChatStats {
  totalMessages?: number
  topKeywords?: Array<{ keyword: string; count: number }>
  topCategories?: Array<{ keyword: string; count: number }>
  requestsByHour?: Array<{ keyword: string; count: number }>
}

interface KnowledgeNeeds {
  analysis?: string
}

export default function AdminDashboard() {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [, setDateRange] = useState<DateRange>("30days")
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [widgets, setWidgets] = useState<WidgetId[]>(defaultWidgets)
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chatStats, setChatStats] = useState<ChatStats | null>(null)
  const [knowledgeNeeds, setKnowledgeNeeds] = useState<KnowledgeNeeds | null>(null)
  const [systemHealthOk, setSystemHealthOk] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load document stats
      const statsResponse = await dashboardApi.stats()
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as DashboardStats)
      }

      // Load chat stats
      const chatResponse = await dashboardApi.chatStats()
      if (chatResponse.success && chatResponse.data) {
        setChatStats(chatResponse.data as ChatStats)
      }

      // Load knowledge needs
      const needsResponse = await dashboardApi.knowledgeNeeds()
      if (needsResponse.success && needsResponse.data) {
        setKnowledgeNeeds(needsResponse.data as KnowledgeNeeds)
      }

      // Load system health
      const healthResponse = await healthApi.system()
      setSystemHealthOk(healthResponse.success)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidget(id as WidgetId)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!draggedWidget || draggedWidget === targetId) return
    const newWidgets = [...widgets]
    const draggedIndex = newWidgets.indexOf(draggedWidget)
    const targetIndex = newWidgets.indexOf(targetId as WidgetId)
    newWidgets.splice(draggedIndex, 1)
    newWidgets.splice(targetIndex, 0, draggedWidget)
    setWidgets(newWidgets)
    setDraggedWidget(null)
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w !== id))
  }

  const resetWidgets = () => {
    setWidgets(defaultWidgets)
  }

  const renderWidget = (widgetId: WidgetId) => {
    const widgetContent: Record<WidgetId, { title: string; content: React.ReactNode }> = {
      "chart-messages": {
        title: "시간대별 요청 추이",
        content: (
          <div className="h-64">
            {chatStats?.requestsByHour && chatStats.requestsByHour.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chatStats.requestsByHour.map(d => ({ name: d.keyword, count: d.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[#52525b]">
                데이터가 없습니다
              </div>
            )}
          </div>
        ),
      },
      keywords: {
        title: "인기 검색 키워드",
        content: (
          <div className="space-y-3">
            {chatStats?.topKeywords && chatStats.topKeywords.length > 0 ? (
              chatStats.topKeywords.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#18181b] text-[11px] font-medium text-[#52525b] group-hover:bg-[#27272a] group-hover:text-[#71717a] transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] text-[#a1a1aa] group-hover:text-white transition-colors">
                      {item.keyword}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#52525b]">{item.count}회</span>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-[#52525b]">
                데이터가 없습니다
              </div>
            )}
          </div>
        ),
      },
      system: {
        title: "시스템 상태",
        content: (
          <div className="space-y-3">
            {[
              { name: "Qdrant", status: systemHealthOk ? "정상" : "확인 필요", ok: systemHealthOk, icon: Database },
              { name: "OpenSearch", status: systemHealthOk ? "정상" : "확인 필요", ok: systemHealthOk, icon: Database },
              { name: "OpenAI API", status: systemHealthOk ? "정상" : "확인 필요", ok: systemHealthOk, icon: Cpu },
              { name: "S3 Storage", status: systemHealthOk ? "정상" : "확인 필요", ok: systemHealthOk, icon: Database },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 text-[#52525b]" />
                  <span className="text-[13px] text-[#a1a1aa]">{item.name}</span>
                </div>
                <span
                  className={`flex items-center gap-1.5 text-[12px] ${item.ok ? "text-emerald-400" : "text-amber-400"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${item.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      knowledge: {
        title: "지식 격차 분석",
        content: (
          <div className="space-y-3">
            {knowledgeNeeds?.analysis ? (
              <p className="text-[13px] text-[#d4d4d8] leading-relaxed whitespace-pre-wrap">
                {knowledgeNeeds.analysis}
              </p>
            ) : (
              <div className="flex items-center justify-center py-8 text-[#52525b]">
                데이터가 없습니다
              </div>
            )}
          </div>
        ),
      },
    }

    const widget = widgetContent[widgetId]
    if (!widget) return null

    if (isCustomizing) {
      return (
        <DraggableWidget
          key={widgetId}
          id={widgetId}
          title={widget.title}
          onRemove={removeWidget}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        >
          {widget.content}
        </DraggableWidget>
      )
    }

    return (
      <ChartCard key={widgetId} title={widget.title}>
        {widget.content}
      </ChartCard>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#09090b]">
        <AdminSidebar />
        <main className="ml-[240px] flex-1">
          <div className="flex h-screen items-center justify-center">
            <div className="text-[#52525b]">로딩 중...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <AdminSidebar />
      <main className="ml-[240px] flex-1">
        <AdminHeader
          title="대시보드"
          description="AI 챗봇 시스템 현황을 한눈에 확인하세요"
          showDatePicker
          showExport
          onExport={() => setIsExportOpen(true)}
          onDateRangeChange={setDateRange}
        />

        <div className="p-6">
          {/* Customize Toggle */}
          <div className="mb-5 flex items-center justify-end gap-2">
            {isCustomizing && (
              <button
                onClick={resetWidgets}
                className="rounded-lg border border-[#27272a] px-3 py-1.5 text-[12px] font-medium text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
              >
                기본값으로 복원
              </button>
            )}
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                isCustomizing
                  ? "bg-blue-600 text-white"
                  : "bg-[#18181b] border border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              {isCustomizing ? "편집 완료" : "대시보드 편집"}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatsCard
              title="총 문서 수"
              value={stats?.total_documents?.toString() || "0"}
              change={stats?.documents_trend ? `${stats.documents_trend > 0 ? '+' : ''}${stats.documents_trend.toFixed(1)}%` : undefined}
              changeType={stats?.documents_trend ? (stats.documents_trend > 0 ? "positive" : stats.documents_trend < 0 ? "negative" : "neutral") : undefined}
              icon={FileText}
            />
            <StatsCard
              title="총 대화 수"
              value={stats?.total_conversations?.toString() || "0"}
              change={stats?.conversations_trend ? `${stats.conversations_trend > 0 ? '+' : ''}${stats.conversations_trend.toFixed(1)}%` : undefined}
              changeType={stats?.conversations_trend ? (stats.conversations_trend > 0 ? "positive" : stats.conversations_trend < 0 ? "negative" : "neutral") : undefined}
              icon={MessageSquare}
            />
            <StatsCard
              title="일일 활성 사용자"
              value={stats?.active_users?.toString() || "0"}
              change={stats?.active_users_trend ? `${stats.active_users_trend > 0 ? '+' : ''}${stats.active_users_trend.toFixed(1)}%` : undefined}
              changeType={stats?.active_users_trend ? (stats.active_users_trend > 0 ? "positive" : stats.active_users_trend < 0 ? "negative" : "neutral") : undefined}
              icon={Users}
            />
            <StatsCard
              title="평균 응답 시간"
              value={stats?.avg_response_time ? `${stats.avg_response_time.toFixed(2)}s` : "N/A"}
              change={stats?.response_time_trend ? `${stats.response_time_trend > 0 ? '+' : ''}${stats.response_time_trend.toFixed(1)}%` : undefined}
              changeType={stats?.response_time_trend ? (stats.response_time_trend < 0 ? "positive" : stats.response_time_trend > 0 ? "negative" : "neutral") : undefined}
              icon={TrendingUp}
            />
          </div>

          {/* Charts Row */}
          <div className="mb-6">
            {widgets.slice(0, 1).map((widgetId) => renderWidget(widgetId))}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-4">{widgets.slice(1).map((widgetId) => renderWidget(widgetId))}</div>
        </div>

        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          title="대시보드 데이터 내보내기"
          data={[
            {
              총문서수: stats?.total_documents || 0,
              총대화수: stats?.total_conversations || 0,
              활성사용자: stats?.active_users || 0,
              평균응답시간: stats?.avg_response_time ? `${stats.avg_response_time.toFixed(2)}s` : "N/A",
              문서증감률: stats?.documents_trend ? `${stats.documents_trend.toFixed(1)}%` : "-",
              대화증감률: stats?.conversations_trend ? `${stats.conversations_trend.toFixed(1)}%` : "-",
            },
          ]}
          filename="dashboard-stats"
        />
      </main>
    </div>
  )
}
