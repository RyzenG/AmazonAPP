import { Bell, Search, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useState } from 'react'

export default function Topbar({ title }: { title?: string }) {
  const { supplies } = useStore()
  const [showNotif, setShowNotif] = useState(false)
  const lowStock = supplies.filter((s) => s.stock < s.minStock)

  const alerts = [
    ...lowStock.map((s) => ({
      type: 'warning' as const,
      msg: `Stock bajo: ${s.name} (${s.stock} ${s.unit}, mín ${s.minStock})`,
    })),
    { type: 'info' as const, msg: '2 órdenes de producción pendientes para hoy' },
    { type: 'info' as const, msg: '1 pago pendiente de confirmación' },
  ]

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Buscar producto, cliente, orden..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <Bell size={16} className="text-slate-600" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-sm text-slate-800">Notificaciones</p>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                    <AlertTriangle
                      size={15}
                      className={`mt-0.5 flex-shrink-0 ${a.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}
                    />
                    <p className="text-xs text-slate-600">{a.msg}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="text-xs text-blue-600 hover:underline" onClick={() => setShowNotif(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
      </div>
    </header>
  )
}
