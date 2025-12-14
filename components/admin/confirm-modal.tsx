import { X, AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      icon: "text-red-400",
      bg: "bg-red-500/10",
      button: "bg-red-600 hover:bg-red-500",
    },
    warning: {
      icon: "text-amber-400",
      bg: "bg-amber-500/10",
      button: "bg-amber-600 hover:bg-amber-500",
    },
    info: {
      icon: "text-blue-400",
      bg: "bg-blue-500/10",
      button: "bg-blue-600 hover:bg-blue-500",
    },
  }

  const styles = variantStyles[variant]

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
        <div className={`mb-6 rounded-lg ${styles.bg} p-4`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
            <p className="text-sm text-[#a1a1aa]">{message}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#27272a] px-4 py-2 text-sm font-medium text-white hover:bg-[#27272a] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
