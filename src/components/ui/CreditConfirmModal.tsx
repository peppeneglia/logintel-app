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
      <div className="relative bg-[#1e293b] border border-[#334155] rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Conferma predizione
        </h3>

        <p className="text-slate-300 mb-2">
          Questa predizione costa 1 credito.
        </p>

        <p className="text-slate-300 mb-6">
          Crediti rimanenti: <span className="font-semibold text-white">{creditsRemaining}/200</span>
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-[#334155] transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}
