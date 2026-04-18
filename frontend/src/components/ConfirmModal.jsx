import { useEffect } from 'react'

// Supports both onCancel (used by Medicines.jsx) and onClose (used by Observers.jsx)
// so you don't need to change any existing pages
function ConfirmModal({ isOpen, message, title, onConfirm, onCancel, onClose, confirmLabel = 'Delete', danger = true }) {
  const handleClose = onCancel || onClose || (() => {})

  // If used without isOpen prop (old style from Medicines.jsx), always show
  const shouldShow = isOpen === undefined ? true : isOpen

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') handleClose() }
    if (shouldShow) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shouldShow])

  if (!shouldShow) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
         onClick={handleClose}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-slate-800/80 rounded-3xl shadow-2xl w-full max-w-sm p-7"
           onClick={e => e.stopPropagation()}>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4
                         ${danger ? 'bg-coral-950/40' : 'bg-amber-950/40'}`}>
          {danger ? '🗑️' : '❓'}
        </div>

        {title && (
          <h3 className="text-lg font-bold text-slate-50 mb-2">{title}</h3>
        )}

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {message || 'Are you sure?'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-slate-300 font-semibold py-2.5 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); handleClose() }}
            className={`flex-1 font-semibold py-2.5 rounded-xl transition-all duration-200
              ${danger
                ? 'bg-coral-950/400 hover:bg-coral-600 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal




