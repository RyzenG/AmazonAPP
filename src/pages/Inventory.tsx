import { useState } from 'react'
import { Plus, AlertTriangle, Search, Package, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Supply } from '../data/mockData'

function StockBar({ value, min }: { value: number; min: number }) {
  const pct = Math.min((value / (min * 2)) * 100, 100)
  const color = value < min ? 'bg-red-500' : value < min * 1.5 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="w-20 h-1.5 bg-slate-100 rounded-full">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function MovementModal({ supply, onClose }: { supply: Supply; onClose: () => void }) {
  const { updateSupply } = useStore()
  const [type, setType] = useState<'entry' | 'exit'>('entry')
  const [qty, setQty] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    const n = parseFloat(qty)
    if (!n || n <= 0) return
    const newStock = type === 'entry' ? supply.stock + n : Math.max(0, supply.stock - n)
    updateSupply({ ...supply, stock: newStock })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Registrar movimiento</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Insumo</p>
            <p className="font-semibold text-slate-800">{supply.name}</p>
            <p className="text-xs text-slate-400">Stock actual: {supply.stock} {supply.unit}</p>
          </div>
          <div>
            <label className="label">Tipo de movimiento</label>
            <div className="grid grid-cols-2 gap-2">
              {(['entry','exit'] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    type === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {t === 'entry' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                  {t === 'entry' ? 'Entrada' : 'Salida'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Cantidad ({supply.unit})</label>
            <input className="input" type="number" min="0" step="0.01" value={qty}
              onChange={(e) => setQty(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Notas (opcional)</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Motivo del movimiento..." />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

function SupplyModal({ supply, onClose }: { supply?: Supply; onClose: () => void }) {
  const { addSupply, updateSupply } = useStore()
  const [form, setForm] = useState<Partial<Supply>>(supply ?? {
    sku: `INS-${String(Date.now()).slice(-3)}`, name: '', category: '', unit: 'kg',
    stock: 0, minStock: 0, cost: 0, supplier: '',
  })

  const handleSave = () => {
    if (!form.name) return
    const s = form as Supply
    if (supply) { updateSupply({ ...supply, ...s }) } else {
      addSupply({ ...s, id: `s${Date.now()}` })
    }
    onClose()
  }

  const field = (k: keyof Supply, label: string, type = 'text') => (
    <div key={k}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={String(form[k] ?? '')}
        onChange={(e) => setForm({ ...form, [k]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })} />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{supply ? 'Editar insumo' : 'Nuevo insumo'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          {field('sku', 'SKU')}
          {field('name', 'Nombre')}
          {field('category', 'Categoría')}
          <div>
            <label className="label">Unidad</label>
            <select className="input" value={form.unit ?? 'kg'} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {['kg','g','L','mL','u','doc','caja'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          {field('stock',    'Stock actual', 'number')}
          {field('minStock', 'Stock mínimo', 'number')}
          {field('cost',     'Costo / unidad ($)', 'number')}
          {field('supplier', 'Proveedor')}
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={handleSave}>
            {supply ? 'Actualizar' : 'Crear insumo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Inventory() {
  const { supplies } = useStore()
  const [search, setSearch]           = useState('')
  const [catFilter, setCatFilter]     = useState('Todos')
  const [movSupply, setMovSupply]     = useState<Supply | null>(null)
  const [editSupply, setEditSupply]   = useState<Supply | undefined>()
  const [showModal, setShowModal]     = useState(false)

  const categories = ['Todos', ...Array.from(new Set(supplies.map((s) => s.category)))]
  const filtered   = supplies.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'Todos' || s.category === catFilter
    return matchSearch && matchCat
  })

  const lowStock  = supplies.filter((s) => s.stock < s.minStock).length
  const totalVal  = supplies.reduce((a, s) => a + s.stock * s.cost, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500 text-sm">Gestión de insumos y materias primas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditSupply(undefined); setShowModal(true) }}>
          <Plus size={16} /> Nuevo insumo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total insumos', value: supplies.length, icon: Package, color:'bg-blue-50 text-blue-600' },
          { label:'Bajo stock',    value: lowStock,         icon: AlertTriangle, color:'bg-red-50 text-red-600' },
          { label:'Categorías',    value: categories.length - 1, icon: Package, color:'bg-teal-50 text-teal-600' },
          { label:'Valor inventario', value:`$${totalVal.toFixed(0)}`, icon: Package, color:'bg-violet-50 text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar insumo..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                catFilter === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['SKU','Nombre','Categoría','Stock','Mínimo','Estado','Costo/u','Valor total','Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const status = s.stock < s.minStock ? 'bajo' : s.stock < s.minStock * 1.5 ? 'alerta' : 'ok'
              return (
                <tr key={s.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${status === 'bajo' ? 'text-red-600' : status === 'alerta' ? 'text-amber-600' : 'text-slate-800'}`}>
                        {s.stock} {s.unit}
                      </span>
                      <StockBar value={s.stock} min={s.minStock} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.minStock} {s.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${status === 'bajo' ? 'badge-red' : status === 'alerta' ? 'badge-yellow' : 'badge-green'}`}>
                      {status === 'bajo' ? 'Bajo stock' : status === 'alerta' ? 'Alerta' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">${s.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">${(s.stock * s.cost).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => setMovSupply(s)}>
                        Movimiento
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setEditSupply(s); setShowModal(true) }}>
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Package size={36} className="mx-auto mb-3 opacity-30" />
            <p>No se encontraron insumos</p>
          </div>
        )}
      </div>

      {movSupply && <MovementModal supply={movSupply} onClose={() => setMovSupply(null)} />}
      {showModal && <SupplyModal supply={editSupply} onClose={() => setShowModal(false)} />}
    </div>
  )
}
