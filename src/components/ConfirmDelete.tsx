import { Trash2, AlertTriangle } from 'lucide-react'

interface Props {
  name: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDelete({ name, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">¿Eliminar registro?</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">
            Se eliminará <span className="font-semibold text-slate-700 dark:text-gray-200">"{name}"</span> de forma permanente. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Trash2 size={14} />
              }
              {loading ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
