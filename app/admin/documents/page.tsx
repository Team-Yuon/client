"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AlertModal } from "@/components/admin/alert-modal"
import { Plus, Upload, Search, X, FileText, Clock, HardDrive, Trash2, Download } from "lucide-react"
import { documentApi } from "@/lib/api/endpoints"
import type { Document } from "@/lib/types"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadCategory, setUploadCategory] = useState("")
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "success" | "error" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  useEffect(() => {
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await documentApi.list({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        page: 1,
        pageSize: 100,
      })

      console.log("Documents API response:", response)
      console.log("Response success:", response.success)
      console.log("Response data:", response.data)
      console.log("Response error:", response.error)

      if (response.success && response.data) {
        const docs = response.data.documents || []
        console.log("Loaded documents:", docs)
        setDocuments(docs)

        // Extract unique categories from documents
        const uniqueCategories = Array.from(
          new Set(
            docs
              .map((doc) => String(doc.metadata?.category || "").trim())
              .filter(Boolean)
          )
        )
        console.log("Categories:", uniqueCategories)
        setCategories(uniqueCategories)

        // Set default upload category if not set
        if (!uploadCategory && uniqueCategories.length > 0) {
          setUploadCategory(uniqueCategories[0])
        }
      } else {
        console.error("API returned error:", response.error)
        setAlertModal({
          isOpen: true,
          title: "오류",
          message: response.error?.message || "문서 목록을 불러오는데 실패했습니다",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
      setAlertModal({
        isOpen: true,
        title: "오류",
        message: "문서 목록을 불러오는데 실패했습니다",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const file of selectedFiles) {
        console.log("Uploading file:", file.name, file.type, file.size)
        console.log("Upload category:", uploadCategory)

        const response = await documentApi.upload(file, {
          category: uploadCategory,
        })

        console.log("Upload response:", response)

        if (response.success) {
          successCount++
        } else {
          failCount++
          console.error("Upload failed for", file.name, ":", response.error)
        }
      }

      if (successCount > 0) {
        setAlertModal({
          isOpen: true,
          title: "성공",
          message: `${successCount}개의 문서가 업로드되었습니다${failCount > 0 ? ` (${failCount}개 실패)` : ""}`,
          type: failCount > 0 ? "info" : "success",
        })
        setShowUploadModal(false)
        setSelectedFiles([])
        loadDocuments()
      } else {
        setAlertModal({
          isOpen: true,
          title: "실패",
          message: "모든 문서 업로드에 실패했습니다",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Failed to upload documents:", error)
      setAlertModal({
        isOpen: true,
        title: "오류",
        message: "문서 업로드 중 오류가 발생했습니다",
        type: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await documentApi.delete(id)
      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: "성공",
          message: "문서가 삭제되었습니다",
          type: "success",
        })
        setSelectedDoc(null)
        loadDocuments()
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

  const handleDownload = async (id: string) => {
    try {
      const response = await documentApi.downloadFile(id)
      if (response.success && response.data) {
        // Create blob and download
        const doc = documents.find((d) => d.id === id)
        const filename = String(doc?.metadata?.filename || `document-${id}`)

        const url = window.URL.createObjectURL(response.data as Blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
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
        setAlertModal({
          isOpen: true,
          title: "실패",
          message: "문서 다운로드에 실패했습니다",
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

  const selectedDocument = documents.find((doc) => doc.id === selectedDoc)

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("ko-KR")
    } catch {
      return dateStr
    }
  }

  const formatSize = (size?: number) => {
    if (!size) return "N/A"
    if (size < 1024) return `${size}B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${(size / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <AdminSidebar />
      <main className="ml-[240px] flex-1">
        <AdminHeader title="문서 관리" description="AI 학습에 사용되는 문서를 관리합니다" />

        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Document List */}
          <div className="w-[400px] border-r border-[#1f1f23] flex flex-col">
            {/* Search & Filter */}
            <div className="border-b border-[#1f1f23] p-4 space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-2">
                <Search className="h-4 w-4 text-[#52525b]" />
                <input
                  type="text"
                  placeholder="문서 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-[#52525b] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-2 text-[12px] text-[#a1a1aa] outline-none hover:border-[#3f3f46] transition-colors"
                >
                  <option value="">모든 카테고리</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-medium text-white hover:bg-blue-500 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  추가
                </button>
              </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-[13px] text-[#52525b]">로딩 중...</div>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-[13px] text-[#52525b]">문서가 없습니다</div>
                </div>
              ) : (
                documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`w-full border-b border-[#1f1f23] p-4 text-left transition-colors hover:bg-[#18181b] ${
                      selectedDoc === doc.id ? "bg-[#18181b]" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-md bg-[#27272a] px-2 py-0.5 text-[10px] font-medium text-[#a1a1aa]">
                        {String(doc.metadata?.category || "기타")}
                      </span>
                      <span className="text-[11px] text-[#52525b]">
                        {formatDate(String(doc.metadata?.uploadedAt || ""))}
                      </span>
                    </div>
                    <p className="mb-2 text-[13px] font-medium text-white truncate">
                      {String(doc.metadata?.filename || doc.id)}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-[#52525b]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {String(doc.metadata?.author || "system")}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" /> {formatSize(Number(doc.metadata?.fileSize || 0))}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Document Detail */}
          <div className="flex-1 flex flex-col">
            {selectedDocument ? (
              <>
                {/* Detail Header */}
                <div className="border-b border-[#1f1f23] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md bg-[#27272a] px-2 py-0.5 text-[10px] font-medium text-[#a1a1aa]">
                          {String(selectedDocument.metadata?.category || "기타")}
                        </span>
                        <span className="text-[11px] text-[#52525b]">{selectedDocument.id}</span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-white">
                        {String(selectedDocument.metadata?.filename || selectedDocument.id)}
                      </h3>
                      <p className="text-[12px] text-[#52525b] mt-1">
                        {String(selectedDocument.metadata?.author || "system")} ·{" "}
                        {formatDate(String(selectedDocument.metadata?.uploadedAt || ""))} ·{" "}
                        {formatSize(Number(selectedDocument.metadata?.fileSize || 0))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(selectedDocument.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedDocument.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272a] text-[#71717a] hover:text-red-400 hover:border-red-400/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#d4d4d8] font-sans">
                      {selectedDocument.content || "내용이 없습니다"}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-[#27272a]" />
                  <p className="text-[13px] text-[#52525b]">문서를 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-[#27272a] bg-[#0c0c0e] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-white">파일 업로드</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                className="mb-5 rounded-xl border-2 border-dashed border-[#27272a] p-10 text-center hover:border-[#3f3f46] transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#18181b]">
                  <Upload className="h-6 w-6 text-[#52525b]" />
                </div>
                <p className="mb-1 text-[13px] font-medium text-white">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length}개의 파일 선택됨`
                    : "파일을 클릭하여 선택 (여러 개 선택 가능)"}
                </p>
                <p className="text-[12px] text-[#52525b]">PDF, DOCX, HWP, TXT 지원 (최대 20MB)</p>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.hwp,.txt"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mb-5 max-h-40 overflow-y-auto rounded-lg border border-[#27272a] bg-[#18181b] p-3">
                  <p className="mb-2 text-[12px] font-medium text-[#71717a]">선택된 파일</p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-[#0c0c0e] p-2 text-[12px]"
                      >
                        <span className="flex-1 truncate text-[#d4d4d8]">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#52525b]">{formatSize(file.size)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                            }}
                            className="text-[#52525b] hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="mb-2 block text-[12px] font-medium text-[#71717a]">카테고리</label>
                <div className="space-y-2">
                  <input
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    list="category-suggestions"
                    placeholder="카테고리를 직접 입력하세요"
                    className="w-full rounded-lg bg-[#18181b] border border-[#27272a] px-3 py-2.5 text-[13px] text-white outline-none hover:border-[#3f3f46] transition-colors"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-[12px] text-[#52525b]">직접 입력하거나 기존 카테고리를 선택하세요</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border border-[#27272a] px-4 py-2.5 text-[13px] font-medium text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
                  disabled={uploading}
                >
                  취소
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-500 transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed"
                >
                  {uploading ? "업로드 중..." : `업로드 (${selectedFiles.length}개)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />
      </main>
    </div>
  )
}
