"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { ChartCard } from "@/components/admin/chart-card"
import { StatsCard } from "@/components/admin/stats-card"
import { MessageSquare, Users, Clock, TrendingUp } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { analyticsApi } from "@/lib/api/endpoints"

interface AnalyticsStats {
  totalMessages: number
  topKeywords: Array<{ keyword: string; count: number }>
  topCategories: Array<{ keyword: string; count: number }>
  requestsByHour: Array<{ keyword: string; count: number }>
}

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#6b7280"]

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [knowledgeNeed, setKnowledgeNeed] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load chat stats
      const statsResponse = await analyticsApi.chatStats()
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as AnalyticsStats)
      }

      // Load knowledge needs
      const needsResponse = await analyticsApi.knowledgeNeeds()
      if (needsResponse.success && needsResponse.data) {
        setKnowledgeNeed((needsResponse.data as { analysis: string }).analysis)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Transform data for charts
  const hourlyData =
    stats?.requestsByHour.map((item) => ({
      hour: item.keyword,
      count: item.count,
    })) || []

  const categoryData =
    stats?.topCategories.map((item, index) => ({
      name: item.keyword,
      value: item.count,
      color: COLORS[index % COLORS.length],
    })) || []

  const keywordData =
    stats?.topKeywords.slice(0, 5).map((item, index) => ({
      topic: item.keyword,
      count: item.count,
      priority: index < 2 ? "높음" : index < 4 ? "중간" : "낮음",
    })) || []

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <AdminSidebar />
      <main className="ml-[240px] flex-1">
        <AdminHeader title="분석" description="채팅 통계 및 지식 격차 분석" />

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[13px] text-[#52525b]">로딩 중...</div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 grid grid-cols-4 gap-4">
                <StatsCard
                  title="총 메시지 수"
                  value={stats?.totalMessages.toLocaleString() || "0"}
                  icon={MessageSquare}
                />
                <StatsCard
                  title="상위 키워드 수"
                  value={stats?.topKeywords.length.toString() || "0"}
                  icon={TrendingUp}
                />
                <StatsCard
                  title="카테고리 수"
                  value={stats?.topCategories.length.toString() || "0"}
                  icon={Users}
                />
                <StatsCard
                  title="시간대 분포"
                  value={stats?.requestsByHour.length.toString() || "0"}
                  icon={Clock}
                />
              </div>

              {/* Charts */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <ChartCard title="상위 키워드" subtitle="빈도순">
                  <div className="h-64">
                    {stats && stats.topKeywords.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topKeywords.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="keyword" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #262626",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[13px] text-[#52525b]">데이터가 없습니다</p>
                      </div>
                    )}
                  </div>
                </ChartCard>

                <ChartCard title="시간대별 활동" subtitle="24시간">
                  <div className="h-64">
                    {hourlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="hour" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #262626",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[13px] text-[#52525b]">데이터가 없습니다</p>
                      </div>
                    )}
                  </div>
                </ChartCard>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-3 gap-4">
                <ChartCard title="카테고리 분포">
                  <div className="h-48">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #262626",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[13px] text-[#52525b]">데이터가 없습니다</p>
                      </div>
                    )}
                  </div>
                </ChartCard>

                <div className="col-span-2">
                  <ChartCard title="지식 격차 분석 (AI 추천)" subtitle="부족한 문서 영역">
                    <div className="space-y-3">
                      {knowledgeNeed ? (
                        <>
                          <p className="text-xs text-[#888] leading-relaxed whitespace-pre-wrap">{knowledgeNeed}</p>
                          <div className="space-y-2 mt-4">
                            {keywordData.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-md bg-[#1a1a1a] px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-white">{item.topic}</span>
                                  <span className="text-xs text-[#52525b]">({item.count}회)</span>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs ${
                                    item.priority === "높음"
                                      ? "bg-red-500/20 text-red-500"
                                      : item.priority === "중간"
                                        ? "bg-yellow-500/20 text-yellow-500"
                                        : "bg-[#262626] text-[#888]"
                                  }`}
                                >
                                  {item.priority}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-[13px] text-[#52525b]">분석 데이터가 없습니다</p>
                        </div>
                      )}
                    </div>
                  </ChartCard>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
