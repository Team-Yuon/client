"use client"

import type React from "react"
import { useState } from "react"
import { GripVertical, X } from "lucide-react"

interface DraggableWidgetProps {
  id: string
  title: string
  children: React.ReactNode
  onRemove?: (id: string) => void
  onDragStart?: (e: React.DragEvent, id: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, id: string) => void
}

export function DraggableWidget({
  id,
  title,
  children,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        onDragStart?.(e, id)
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver?.(e)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop?.(e, id)
      }}
      className={`rounded-xl border border-[#27272a] bg-[#0c0c0e] transition-all ${
        isDragging ? "opacity-50 scale-[0.98] ring-2 ring-blue-500/50" : "hover:border-[#3f3f46]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#1f1f23] px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-[#52525b] hover:text-[#71717a]" />
          <span className="text-[13px] font-medium text-white">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#52525b] hover:bg-[#27272a] hover:text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
