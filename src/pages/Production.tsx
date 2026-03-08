import { useState } from 'react'
import { Plus, Play, CheckCircle, XCircle, Clock, Factory, X, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ProductionOrder } from '../data/mockData'

const STATUS_LABELS: Record<string, string> = {
  pending:'Pendiente', in_progress:'En producción', finished:'Finalizado', cancelled:'Cancelado'
}
const STATUS_BADGE: Record<string, string> = {
  pending:'badge-yellow', in_progress:'badge-blue', finished:'badge-green', cancelled:'badge-red'
}
const PRIORITY_LABELS: Record<number, string> = { 1:'🔴 Urgente', 2:'🟠 Alta', 3:'🟡 Normal', 4:'🟢 Baja', 5:'⚪ Muy baja' }

function OrderCard({ order }: { order: ProductionOrder }) {
  const { updateProductionOrderStatus } = useStore()
  const [expanded, setExpanded] = useState(false)

  const actions: { label: string; status: ProductionOrder['status']; cls: string }[] = []
  if (order.status === 'pending')     actions.push({ label:'Iniciar', status:'in_progress', cls:'btn-primary' })
  if (order.status === 'in_progress') actions.push({ label:'Finalizar', status:'finished', cls:'btn-success' })
  if (['pending','in_progress'].includes(order.status))
    actions.push({ label:'Cancelar', status:'cancelled', cls:'btn-danger' })

  return (
    <div className={`card overflow-hidden border-l-4 ${
      order.status === 'in_progress' ? 'border-l-blue-500' :
      order.status === 'finished'    ? 'border-l-emerald-500' :
      order.status === 'cancelled'   ? 'border-l-red-400' : 'border-l-amber-400'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400 dark:text-gray-500">{order.orderNumber}</span>
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABELS[order.status]}</span>
              <span className="text-xs text-slate-400 dark:text-gray-500">{PRIORITY_LABELS[order.priority]}</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white truncate">{order.product}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{order.recipe}</p>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 mt-1">
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Cantidad', val: `${order.plannedQty} u` },
            { label: 'Costo est.', val: `$${order.estimatedCost}` },
            { label: 'Responsable', val: order.assignedTo.split(' ')[0] },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 dark:bg-gray-700 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 dark:text-gray-400">{item.label}</p>
              <p className="font-bold text-slate-700 dark:text-gray-200 text-xs truncate">{item.val}</p>
            </div>
          ))}
        </div>

        {order.status === 'in_progress' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
              <span>Progreso estimado</span><span>60%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-700 space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
              <Clock size={12} /><span>Inicio: {order.plannedStart}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
              <Clock size={12} /><span>Fin planificado: {order.plannedEnd}</span>
            </div>
            {order.actualCost && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                <CheckCircle size={12} /><span>Costo real: ${order.actualCost}</span>
              </div>
            )}
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-gray-700">
            {actions.map((a) => (
              <button key={a.status} className={`btn btn-sm ${a.cls} flex-1`}
                onClick={() => updateProductionOrderStatus(order.id, a.status)}>
                {a.status === 'in_progress' && <Play size={12} />}
                {a.status === 'finished'    && <CheckCircle size={12} />}
                {a.status === 'cancelled'   && <XCircle size={12} />}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NewOrderModal({ onClose }: { onClose: () => void }) {
  const { recipes, addProductionOrder } = useStore()
  const [recipeId, setRecipeId] = useState('')
  const [qty, setQty]           = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [assigned, setAssigned] = useState('María García')

  const recipe = recipes.find((r) => r.id === recipeId)

  const handleSave = () => {
    if (!recipe || !qty) return
    const n = parseFloat(qty)
    const order: ProductionOrder = {
      id: `po${Date.now()}`, orderNumber: `OP-2024-${String(Date.now()).slice(-3)}`,
      recipe: recipe.name, product: recipe.name.split('(')[0].trim(),
      plannedQty: n, status: 'pending', priority: 3,
      plannedStart: `${date} 08:00`, plannedEnd: `${date} 16:00`,
      estimatedCost: parseFloat((recipe.costPerUnit * n).toFixed(2)),
      assignedTo: assigned,
    }
    addProductionOrder(order)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700">
          <h3 className="font-semibold text-slate-800 dark:text-white">Nueva orden de producción</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Receta</label>
            <select className="input" value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
              <option value="">-- Seleccionar receta --</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {recipe && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1 animate-fadeIn">
              <p><strong>Rendimiento:</strong> {recipe.yieldQty} {recipe.yieldUnit} por lote</p>
              <p><strong>Costo/unidad:</strong> ${recipe.costPerUnit.toFixed(2)}</p>
              <p><strong>Ingredientes:</strong> {recipe.ingredients.length} insumos</p>
            </div>
          )}
          <div>
            <label className="label">Cantidad a producir</label>
            <input className="input" type="number" min="1" value={qty}
              onChange={(e) => setQty(e.target.value)} placeholder="ej. 20" />
          </div>
          <div>
            <label className="label">Fecha de producción</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Asignado a</label>
            <select className="input" value={assigned} onChange={(e) => setAssigned(e.target.value)}>
              {['María García','Carlos López','Ana Ramos'].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          {recipe && qty && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-xs animate-fadeIn">
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                Costo estimado total: ${(recipe.costPerUnit * parseFloat(qty || '0')).toFixed(2)}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={handleSave}>Crear orden</button>
        </div>
      </div>
    </div>
  )
}

export default function Production() {
  const { productionOrders, recipes } = useStore()
  const [filter, setFilter]   = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders'|'recipes'>('orders')

  const filtered = filter === 'all' ? productionOrders
    : productionOrders.filter((o) => o.status === filter)

  const counts = {
    pending:     productionOrders.filter((o) => o.status === 'pending').length,
    in_progress: productionOrders.filter((o) => o.status === 'in_progress').length,
    finished:    productionOrders.filter((o) => o.status === 'finished').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Producción</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Órdenes de producción y recetas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva orden
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Pendientes', count:counts.pending, color:'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
          { label:'En producción', count:counts.in_progress, color:'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
          { label:'Finalizadas', count:counts.finished, color:'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className={`card border p-4 text-center ${s.color}`}>
            <p className="text-3xl font-bold">{s.count}</p>
            <p className="text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        {(['orders','recipes'] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === t
                ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
            }`}>
            {t === 'orders' ? '📋 Órdenes' : '📖 Recetas'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {[['all','Todas'],['pending','Pendientes'],['in_progress','En producción'],['finished','Finalizadas'],['cancelled','Canceladas']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === v
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600'
                }`}>{l}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((o) => <OrderCard key={o.id} order={o} />)}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-slate-400 dark:text-gray-600">
                <Factory size={40} className="mx-auto mb-3 opacity-30" />
                <p>No hay órdenes en este estado</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{r.name}</h3>
                <span className="badge badge-blue">{r.yieldQty} {r.yieldUnit}</span>
              </div>
              <div className="space-y-1.5">
                {r.ingredients.map((ing) => (
                  <div key={ing.supplyId} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-gray-300">{ing.supplyName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-gray-400">{ing.qty} {ing.unit}</span>
                      <span className="text-slate-700 dark:text-gray-200 font-medium w-12 text-right">${ing.cost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-gray-400">Costo total</span>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-white">${r.totalCost.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500">${r.costPerUnit.toFixed(2)} / u</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewOrderModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
