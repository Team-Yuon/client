import { X } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "success" | "error" | "info"
}

export function AlertModal({ isOpen, onClose, title, message, type = "info" }: AlertModalProps) {
  if (!isOpen) return null

  const iconColors = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
  }

  const bgColors = {
    success: "bg-emerald-500/10",
    error: "bg-red-500/10",
    info: "bg-blue-500/10",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#27272a] bg-[#18181b] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#71717a] hover:bg-[#27272a] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`mb-6 rounded-lg ${bgColors[type]} p-4`}>
          <p className={`text-sm ${iconColors[type]}`}>{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
