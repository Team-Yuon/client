"use client"

import { useState } from "react"
import { X, FileSpreadsheet, FileText, Download, Loader2 } from "lucide-react"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data?: any[]
  filename?: string
}

export function ExportModal({ isOpen, onClose, title, data = [], filename = "export" }: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      if (data.length === 0) {
        alert("내보낼 데이터가 없습니다")
        return
      }

      switch (format) {
        case "csv":
          exportAsCSV(data, filename)
          break
        case "excel":
          // Excel은 추가 라이브러리 필요, CSV로 대체
          exportAsCSV(data, filename)
          break
        case "pdf":
          exportAsPDF(data, filename, title)
          break
      }

      onClose()
    } catch (error) {
      console.error("Export failed:", error)
      alert("내보내기에 실패했습니다")
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    // Get headers from first object
    const headers = Object.keys(data[0])

    // Create CSV content
    const csvRows = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header]
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value ?? "").replace(/"/g, '""')
          return escaped.includes(",") ? `"${escaped}"` : escaped
        }).join(",")
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" }) // BOM for Excel
    downloadBlob(blob, `${filename}.csv`)
  }

  const exportAsPDF = (data: any[], filename: string, title: string) => {
    // Simple HTML to PDF conversion
    const headers = Object.keys(data[0] || {})

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>생성일: ${new Date().toLocaleString("ko-KR")}</p>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${data.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    downloadBlob(blob, `${filename}.html`)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#27272a] bg-[#0c0c0e] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-[#52525b] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-5 text-[13px] text-[#71717a]">내보내기 형식을 선택하세요</p>

        <div className="mb-6 space-y-2">
          {[
            {
              key: "csv",
              icon: FileSpreadsheet,
              color: "text-emerald-400",
              label: "CSV",
              desc: "스프레드시트 호환 형식",
            },
            {
              key: "excel",
              icon: FileSpreadsheet,
              color: "text-green-400",
              label: "Excel (.xlsx)",
              desc: "Microsoft Excel 형식",
            },
            { key: "pdf", icon: FileText, color: "text-rose-400", label: "PDF", desc: "인쇄용 리포트 형식" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFormat(item.key as typeof format)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 transition-all ${
                format === item.key
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46]"
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <div className="text-left">
                <p className="text-[13px] font-medium text-white">{item.label}</p>
                <p className="text-[11px] text-[#52525b]">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#27272a] px-4 py-2.5 text-[13px] font-medium text-[#71717a] hover:bg-[#18181b] hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                내보내는 중...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                내보내기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
