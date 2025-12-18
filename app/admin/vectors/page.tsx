"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AlertModal } from "@/components/admin/alert-modal"
import { Hash, Database, RefreshCw, RotateCcw, X, Download, Trash2 } from "lucide-react"
import { vectorApi, documentApi } from "@/lib/api/endpoints"

interface VectorDoc {
  id: string
  title: string
  category: string
  chunks: number
  dimensions: number
  createdAt: string
  similarity: number
  x: number
  y: number
  content: string
}


const defaultCategoryColors: Record<string, string> = {
  기술: "#3b82f6",
  매뉴얼: "#a855f7",
  보고서: "#f59e0b",
  정책: "#10b981",
  기타: "#6b7280",
  introduction: "#3b82f6",
  demo: "#a855f7",
}

const generateColorForCategory = (category: string): string => {
  // 카테고리 문자열을 해시하여 일관된 색상 생성
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ["#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"]
  return colors[Math.abs(hash) % colors.length]
}

export default function VectorsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null)
  const [vectorDocs, setVectorDocs] = useState<VectorDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [totalVectors, setTotalVectors] = useState(0)
  const [similarDocs, setSimilarDocs] = useState<VectorDoc[]>([])
  const [showingSimilar, setShowingSimilar] = useState(false)
  const [reindexing, setReindexing] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(defaultCategoryColors)
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  useEffect(() => {
    loadVectors()
  }, [])

  const loadVectors = async () => {
    try {
      setLoading(true)

      // Load documents
      const docsResponse = await documentApi.list({ pageSize: 100 })
      console.log("Documents response:", docsResponse)

      if (docsResponse.success && docsResponse.data) {
        const docs = docsResponse.data.documents || []
        console.log("Documents loaded:", docs.length, docs)
        setTotalVectors(docsResponse.data.total || docs.length)

        // Transform API data to VectorDoc format
        const transformed: VectorDoc[] = docs.map((doc) => {
          const metadata = doc.metadata || {}
          return {
            id: doc.id,
            title: (metadata as { title?: string }).title || doc.content.slice(0, 30) || `문서 ${doc.id}`,
            category: (metadata as { category?: string }).category || "기타",
            chunks: 1,
            dimensions: 1536,
            createdAt: new Date().toISOString().split("T")[0],
            similarity: doc.score || 0.9,
            x: (Math.random() * 80) + 10,
            y: (Math.random() * 80) + 10,
            content: doc.content || "",
          }
        })

        console.log("Transformed vectors:", transformed)
        setVectorDocs(transformed)

        // Extract unique categories and assign colors
        const uniqueCategories = Array.from(new Set(transformed.map(d => d.category)))
        setCategories(uniqueCategories)

        const newCategoryColors = { ...defaultCategoryColors }
        uniqueCategories.forEach(cat => {
          if (!newCategoryColors[cat]) {
            newCategoryColors[cat] = generateColorForCategory(cat)
          }
        })
        setCategoryColors(newCategoryColors)

        // Load vector projection for better positioning
        const projResponse = await vectorApi.projection(100)
        if (projResponse.success && projResponse.data) {
          const projData = projResponse.data as { vectors?: Array<{ id: string; x: number; y: number }> }
          if (projData.vectors && projData.vectors.length > 0) {
            // Find min/max for normalization
            const xValues = projData.vectors.map(v => v.x)
            const yValues = projData.vectors.map(v => v.y)
            const minX = Math.min(...xValues)
            const maxX = Math.max(...xValues)
            const minY = Math.min(...yValues)
            const maxY = Math.max(...yValues)

            // Normalize to 10-90% range (add padding)
            const normalizeX = (x: number) => {
              if (maxX === minX) return 50
              return 10 + ((x - minX) / (maxX - minX)) * 80
            }
            const normalizeY = (y: number) => {
              if (maxY === minY) return 50
              return 10 + ((y - minY) / (maxY - minY)) * 80
            }

            // Update positions with projection data
            setVectorDocs((prev) =>
              prev.map((doc) => {
                const proj = projData.vectors?.find((p) => p.id === doc.id)
                if (proj) {
                  return {
                    ...doc,
                    x: normalizeX(proj.x),
                    y: normalizeY(proj.y)
                  }
                }
                return doc
              })
            )
          }
        }
      }
    } catch (error) {
      console.error("Failed to load vectors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindSimilar = async () => {
    if (!selectedDoc) return

    try {
      setShowingSimilar(true)
      setSimilarDocs([])

      const response = await vectorApi.query([selectedDoc], 5)
      console.log("Similar documents response:", response)

      if (response.success && response.data) {
        const data = response.data as { vectors?: Array<{ id: string; content: string; metadata?: Record<string, unknown> }> }
        if (data.vectors && data.vectors.length > 0) {
          const similar: VectorDoc[] = data.vectors
            .filter(doc => doc.id !== selectedDoc) // 자기 자신 제외
            .map((doc) => {
              const metadata = doc.metadata || {}
              const score = typeof metadata.score === 'number' ? metadata.score : 0
              return {
                id: doc.id,
                title: (metadata as { title?: string }).title || doc.content.slice(0, 30) || `문서 ${doc.id}`,
                category: (metadata as { category?: string }).category || "기타",
                chunks: 1,
                dimensions: 1536,
                createdAt: new Date().toISOString().split("T")[0],
                similarity: score,
                x: 0,
                y: 0,
                content: doc.content || "",
              }
            })
          setSimilarDocs(similar)
        }
      }
    } catch (error) {
      console.error("Failed to find similar documents:", error)
      setAlertModal({
        isOpen: true,
        title: "오류",
        message: "유사 문서 검색에 실패했습니다",
        type: "error",
      })
    }
  }

  const handleReindex = async () => {
    if (!selectedDoc) return

    try {
      setReindexing(true)
      const response = await documentApi.reindex([selectedDoc])
      console.log("Reindex response:", response)

      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: "성공",
          message: "재인덱싱이 완료되었습니다",
          type: "success",
        })
        await loadVectors()
      } else {
        setAlertModal({
          isOpen: true,
          title: "실패",
          message: "재인덱싱에 실패했습니다",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Failed to reindex:", error)
      setAlertModal({
        isOpen: true,
        title: "오류",
        message: "재인덱싱 중 오류가 발생했습니다",
        type: "error",
      })
    } finally {
      setReindexing(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedDoc) return

    try {
      console.log("Downloading document:", selectedDoc)
      const response = await documentApi.downloadFile(selectedDoc)
      console.log("Download response:", response)

      if (response.success && response.data) {
        // Create blob and download
        const blob = response.data as Blob
        console.log("Blob created:", blob.size, blob.type)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = selected?.title || `document-${selectedDoc}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setAlertModal({
          isOpen: true,
          title: "성공",
          message: "문서 다운로드가 완료되었습니다",
          type: "success",
        })
      } else {
        console.error("Download failed:", response.error)
        setAlertModal({
          isOpen: true,
          title: "실패",
          message: response.error?.message || "문서 다운로드에 실패했습니다",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Failed to download document:", error)
      setAlertModal({
        isOpen: true,
        title: "오류",
        message: "문서 다운로드 중 오류가 발생했습니다",
        type: "error",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedDoc) return

    try {
      const response = await documentApi.delete(selectedDoc)

      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: "성공",
          message: "문서가 삭제되었습니다",
          type: "success",
        })
        setSelectedDoc(null)
        await loadVectors()
      } else {
        setAlertModal({
          isOpen: true,
          title: "실패",
          message: "문서 삭제에 실패했습니다",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
      setAlertModal({
        isOpen: true,
        title: "오류",
        message: "문서 삭제 중 오류가 발생했습니다",
        type: "error",
      })
    }
  }

  const selected = vectorDocs.find((d) => d.id === selectedDoc)
  const hovered = vectorDocs.find((d) => d.id === hoveredDoc)

  console.log("Rendering with vectorDocs:", vectorDocs.length, "loading:", loading)

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <AdminSidebar />
      <main className="ml-[240px] flex-1">
        <AdminHeader title="벡터 DB" description="문서 벡터 시각화 및 관리" />

        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Vector Visualization */}
          <div className="flex-1 border-r border-[#1f1f23]">
            {/* Stats Bar */}
            <div className="flex items-center justify-between border-b border-[#1f1f23] px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#52525b]" />
                  <span className="text-[13px] text-[#71717a]">총 벡터</span>
                  <span className="text-[13px] font-semibold text-white">{totalVectors.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[#52525b]" />
                  <span className="text-[13px] text-[#71717a]">차원</span>
                  <span className="text-[13px] font-semibold text-white">1,536</span>
                </div>
              </div>
              {/* Category Legend */}
              <div className="flex items-center gap-4">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
                    <span className="text-[11px] text-[#52525b]">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vector Canvas */}
            <div className="relative h-[calc(100%-4rem)] p-6">
              <div className="relative h-full w-full rounded-xl border border-[#1f1f23] bg-[#0a0a0c] overflow-hidden">
                {/* Grid Pattern */}
                <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f1f23" strokeWidth="0.5" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Loading or Empty State */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[#52525b]">벡터 로딩 중...</div>
                  </div>
                )}

                {!loading && vectorDocs.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[#52525b] mb-2">벡터 데이터가 없습니다</div>
                      <div className="text-[#3f3f46] text-xs">문서를 업로드하면 벡터가 생성됩니다</div>
                    </div>
                  </div>
                )}

                {/* Vector Points */}
                {!loading && vectorDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    onMouseEnter={() => setHoveredDoc(doc.id)}
                    onMouseLeave={() => setHoveredDoc(null)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                      selectedDoc === doc.id ? "z-20 scale-150" : hoveredDoc === doc.id ? "z-10 scale-125" : "z-0"
                    }`}
                    style={{
                      left: `${doc.x}%`,
                      top: `${doc.y}%`,
                    }}
                  >
                    <div
                      className={`h-4 w-4 rounded-full transition-all duration-200 ${
                        selectedDoc === doc.id
                          ? "ring-4 ring-white/20"
                          : hoveredDoc === doc.id
                            ? "ring-2 ring-white/10"
                            : ""
                      }`}
                      style={{
                        backgroundColor: categoryColors[doc.category] || "#6b7280",
                        boxShadow: `0 0 ${selectedDoc === doc.id ? "20px" : "10px"} ${categoryColors[doc.category] || "#6b7280"}60`,
                      }}
                    />
                  </button>
                ))}

                {/* Hover Tooltip */}
                {hovered && !selectedDoc && (
                  <div
                    className="absolute z-30 pointer-events-none transform -translate-x-1/2 transition-opacity duration-150"
                    style={{
                      left: `${hovered.x}%`,
                      top: `${hovered.y - 8}%`,
                    }}
                  >
                    <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-2 shadow-xl">
                      <p className="text-[12px] font-medium text-white whitespace-nowrap">{hovered.title}</p>
                      <p className="text-[11px] text-[#52525b]">{hovered.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedDoc && selected && (
            <div className="w-[480px] flex flex-col bg-[#09090b]">
              {/* Detail Header */}
              <div className="border-b border-[#1f1f23] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${categoryColors[selected.category]}20`,
                          color: categoryColors[selected.category],
                        }}
                      >
                        {selected.category}
                      </span>
                      <span className="text-[11px] text-[#52525b] font-mono">{selected.id}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-white">{selected.title}</h3>
                    <p className="text-[12px] text-[#52525b] mt-1">
                      {selected.createdAt} · {selected.chunks}개 청크 · {selected.dimensions}차원
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272a] text-[#71717a] hover:text-red-400 hover:border-red-400/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedDoc(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto">
                {/* 문서 내용 섹션 */}
                <div className="border-b border-[#1f1f23] p-4">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">문서 내용</h4>
                  <p className="text-[13px] leading-relaxed text-[#d4d4d8]">{selected.content}</p>
                </div>

                {/* 벡터 정보 섹션 */}
                <div className="border-b border-[#1f1f23] p-4">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">벡터 정보</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">유사도 점수</span>
                      <span className="text-[13px] font-semibold text-emerald-400">
                        {(selected.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">임베딩 모델</span>
                      <span className="text-[13px] text-white font-mono">text-embedding-3-small</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">벡터 차원</span>
                      <span className="text-[13px] text-white">{selected.dimensions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">청크 수</span>
                      <span className="text-[13px] text-white">{selected.chunks}개</span>
                    </div>
                  </div>
                </div>

                {/* 메타데이터 섹션 */}
                <div className="p-4">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">메타데이터</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">생성일</span>
                      <span className="text-[13px] text-white">{selected.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">카테고리</span>
                      <span className="text-[13px] font-medium" style={{ color: categoryColors[selected.category] }}>
                        {selected.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#71717a]">문서 ID</span>
                      <span className="text-[13px] text-white font-mono">{selected.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#1f1f23] p-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleFindSimilar}
                    disabled={showingSimilar}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showingSimilar ? "검색 중..." : "유사 문서 찾기"}
                  </button>
                  <button
                    onClick={handleReindex}
                    disabled={reindexing}
                    className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2.5 text-[13px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reindexing ? "처리 중..." : "재인덱싱"}
                  </button>
                </div>
              </div>

              {/* Similar Documents */}
              {showingSimilar && similarDocs.length > 0 && (
                <div className="border-t border-[#1f1f23] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider">
                      유사 문서 ({similarDocs.length})
                    </h4>
                    <button
                      onClick={() => {
                        setShowingSimilar(false)
                        setSimilarDocs([])
                      }}
                      className="text-[11px] text-[#52525b] hover:text-white transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {similarDocs.map((doc, idx) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        className="rounded-lg border border-[#27272a] bg-[#0a0a0c] p-3 hover:border-[#3f3f46] cursor-pointer transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[12px] font-medium text-white">{doc.title}</span>
                          <span className="text-[11px] text-emerald-400">
                            {(doc.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#71717a] line-clamp-2">{doc.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showingSimilar && similarDocs.length === 0 && (
                <div className="border-t border-[#1f1f23] p-4">
                  <div className="text-center py-8">
                    <div className="text-[12px] text-[#52525b]">유사 문서를 찾을 수 없습니다</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
