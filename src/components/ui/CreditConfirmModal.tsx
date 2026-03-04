interface CreditConfirmModalProps {
  isOpen: boolean
  creditsRemaining: number
  onConfirm: () => void
  onCancel: () => void
}

export function CreditConfirmModal({
  isOpen,
  creditsRemaining,
  onConfirm,
  onCancel,
}: CreditConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Conferma predizione
        </h3>

        <p className="text-gray-300 mb-2">
          Questa predizione costa 1 credito.
        </p>

        <p className="text-gray-300 mb-6">
          Crediti rimanenti: <span className="font-semibold text-white">{creditsRemaining}/200</span>
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}
