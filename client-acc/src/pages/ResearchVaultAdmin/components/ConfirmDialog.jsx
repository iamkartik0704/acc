/**
 * ConfirmDialog — blocks a destructive action behind an accessible modal.
 * Props:
 *   open      boolean
 *   title     string
 *   message   string
 *   confirmLabel string (default "Confirm")
 *   danger    boolean (red confirm button)
 *   onConfirm () => void
 *   onCancel  () => void
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-base font-bold text-slate-900">{title}</h2>
        {message && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
