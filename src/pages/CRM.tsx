import { useState } from 'react'
import { Plus, Search, X, Users, TrendingUp, Star, Phone, Mail, MapPin } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Customer } from '../data/mockData'

const SEG_BADGE: Record<string, string> = {
  vip:'badge-purple', mayorista:'badge-blue', regular:'badge-gray',
}
const SEG_LABELS: Record<string, string> = {
  vip:'VIP', mayorista:'Mayorista', regular:'Regular',
}

function CustomerModal({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const { addCustomer } = useStore()
  const [form, setForm] = useState<Partial<Customer>>(customer ?? {
    code:`CLI-${String(Date.now()).slice(-3)}`, name:'', company:'',
    email:'', phone:'', city:'', segment:'regular', isActive:true,
    totalPurchases:0, lastPurchase: new Date().toISOString().split('T')[0],
  })

  const field = (k: keyof Customer, label: string, type = 'text') => (
    <div key={k}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={String(form[k] ?? '')}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700">
          <h3 className="font-semibold text-slate-800 dark:text-white">{customer ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          {field('name', 'Nombre completo *')}
          {field('company', 'Empresa')}
          {field('email', 'Correo electrónico', 'email')}
          {field('phone', 'Teléfono')}
          {field('city', 'Ciudad')}
          <div>
            <label className="label">Segmento</label>
            <select className="input" value={String(form.segment ?? 'regular')}
              onChange={(e) => setForm({ ...form, segment: e.target.value })}>
              {['regular','mayorista','vip'].map((s) => <option key={s} value={s}>{SEG_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={() => {
            if (!form.name) return
            if (!customer) addCustomer({ ...(form as Customer), id:`c${Date.now()}` })
            onClose()
          }}>
            {customer ? 'Actualizar' : 'Crear cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  return (
    <div className="card p-5 hover:border-blue-200 dark:hover:border-blue-700 border border-transparent transition-all cursor-pointer"
      onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {customer.name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{customer.name}</h3>
            {customer.company && <p className="text-xs text-slate-500 dark:text-gray-400">{customer.company}</p>}
          </div>
        </div>
        <span className={`badge ${SEG_BADGE[customer.segment]}`}>{SEG_LABELS[customer.segment]}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <Mail size={11} /><span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <Phone size={11} /><span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <MapPin size={11} /><span>{customer.city}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 dark:text-gray-500">Total compras</p>
          <p className="font-bold text-slate-800 dark:text-white">${customer.totalPurchases.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-gray-500">Última compra</p>
          <p className="text-xs font-medium text-slate-600 dark:text-gray-300">{customer.lastPurchase}</p>
        </div>
      </div>
    </div>
  )
}

export default function CRM() {
  const { customers, saleOrders } = useStore()
  const [search, setSearch]       = useState('')
  const [segFilter, setSeg]       = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState<Customer | null>(null)

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
                        c.email.toLowerCase().includes(search.toLowerCase())
    const matchSeg = segFilter === 'all' || c.segment === segFilter
    return matchSearch && matchSeg && c.isActive
  })

  const totalRevenue = customers.reduce((a,c) => a + c.totalPurchases, 0)
  const vipCount     = customers.filter((c) => c.segment === 'vip').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Clientes — CRM</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Base de clientes y seguimiento</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total clientes', value:customers.length, icon:Users, color:'bg-blue-600' },
          { label:'Clientes VIP',   value:vipCount,         icon:Star,  color:'bg-violet-600' },
          { label:'Mayoristas',     value:customers.filter(c=>c.segment==='mayorista').length, icon:TrendingUp, color:'bg-teal-600' },
          { label:'Revenue total',  value:`$${totalRevenue.toLocaleString()}`, icon:TrendingUp, color:'bg-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar cliente..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[['all','Todos'],['regular','Regular'],['mayorista','Mayorista'],['vip','VIP']].map(([v,l]) => (
            <button key={v} onClick={() => setSeg(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                segFilter === v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <CustomerCard key={c.id} customer={c} onClick={() => setSelected(c)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400 dark:text-gray-600">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto animate-slideIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="font-semibold dark:text-white">Detalle del cliente</h3>
              <button onClick={() => setSelected(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar & info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {selected.name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selected.name}</h2>
                  {selected.company && <p className="text-slate-500 dark:text-gray-400">{selected.company}</p>}
                  <span className={`badge ${SEG_BADGE[selected.segment]} mt-1`}>{SEG_LABELS[selected.segment]}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Contacto</h4>
                {[
                  [Mail,   'Email',     selected.email],
                  [Phone,  'Teléfono',  selected.phone],
                  [MapPin, 'Ciudad',    selected.city],
                ].map(([Icon, label, value]: any) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-gray-700 flex items-center justify-center">
                      <Icon size={14} className="text-slate-400 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-gray-500">{label}</p>
                      <p className="text-slate-700 dark:text-gray-200 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purchases stats */}
              <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 dark:text-gray-400">Total compras</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">${selected.totalPurchases.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-gray-400">Última compra</p>
                  <p className="font-bold text-slate-700 dark:text-gray-200">{selected.lastPurchase}</p>
                </div>
              </div>

              {/* Purchase history */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">Historial de compras</h4>
                {saleOrders.filter((o) => o.customerId === selected.id).map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-200">{o.orderNumber}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">{o.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-white">${o.total.toFixed(2)}</p>
                      <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'} text-xs`}>
                        {o.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
                {saleOrders.filter((o) => o.customerId === selected.id).length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-gray-500">Sin compras registradas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <CustomerModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
