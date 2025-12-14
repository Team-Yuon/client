"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, Download, Eye } from "lucide-react"

interface Column {
  key: string
  label: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  onEdit?: (row: Record<string, unknown>) => void
  onDelete?: (row: Record<string, unknown>) => void
  onView?: (row: Record<string, unknown>) => void
  onDownload?: (row: Record<string, unknown>) => void
}

export function DataTable({ columns, data, onEdit, onDelete, onView, onDownload }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const pageSize = 10
  const totalPages = Math.ceil(data.length / pageSize)
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1f1f23] bg-[#111113]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525b]"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f23]">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#111113] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-[13px] text-[#a1a1aa]">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3.5 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === String(idx) ? null : String(idx))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuId === String(idx) && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-[#27272a] bg-[#18181b] shadow-xl">
                          {onView && (
                            <button
                              onClick={() => {
                                onView(row)
                                setOpenMenuId(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" /> 보기
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => {
                                onEdit(row)
                                setOpenMenuId(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" /> 수정
                            </button>
                          )}
                          {onDownload && (
                            <button
                              onClick={() => {
                                onDownload(row)
                                setOpenMenuId(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" /> 다운로드
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                onDelete(row)
                                setOpenMenuId(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-rose-400 hover:bg-[#27272a] transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> 삭제
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#1f1f23] px-4 py-3">
        <span className="text-[12px] text-[#52525b]">
          총 {data.length}개 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, data.length)}개
          표시
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#52525b] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-[13px] text-[#a1a1aa]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] hover:bg-[#18181b] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#52525b] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
