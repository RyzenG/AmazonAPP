import { useState } from 'react'
import { Plus, Search, X, ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SaleOrder } from '../data/mockData'

const STATUS_BADGE: Record<string, string> = {
  pending:'badge-yellow', confirmed:'badge-blue', processing:'badge-blue',
  delivered:'badge-green', cancelled:'badge-red',
}
const PAY_BADGE: Record<string, string> = {
  pending:'badge-yellow', partial:'badge-yellow', paid:'badge-green', refunded:'badge-red',
}
const STATUS_LABELS: Record<string, string> = {
  pending:'Pendiente', confirmed:'Confirmado', processing:'En proceso',
  delivered:'Entregado', cancelled:'Cancelado',
}
const PAY_LABELS: Record<string, string> = {
  pending:'Sin pagar', partial:'Pago parcial', paid:'Pagado', refunded:'Reembolsado',
}

function NewSaleModal({ onClose }: { onClose: () => void }) {
  const { customers, products, addSaleOrder } = useStore()
  const [customerId, setCustomerId] = useState('')
  const [payMethod, setPayMethod]   = useState('Efectivo')
  const [items, setItems]           = useState<{productId:string;product:string;qty:number;price:number}[]>([])
  const [delDate, setDelDate]       = useState('')
  const [notes, setNotes]           = useState('')

  const addItem = () => setItems([...items, { productId:'', product:'', qty:1, price:0 }])
  const removeItem = (i: number) => setItems(items.filter((_,j) => j !== i))
  const updateItem = (i: number, field: string, value: string | number) => {
    const copy = [...items]
    if (field === 'productId') {
      const p = products.find((x) => x.id === value)
      copy[i] = { ...copy[i], productId: String(value), product: p?.name ?? '', price: p?.price ?? 0 }
    } else {
      copy[i] = { ...copy[i], [field]: value }
    }
    setItems(copy)
  }

  const subtotal = items.reduce((a, x) => a + x.qty * x.price, 0)
  const tax      = subtotal * 0.16
  const total    = subtotal + tax

  const handleSave = () => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer || items.length === 0) return
    const order: SaleOrder = {
      id: `so${Date.now()}`, orderNumber: `VTA-2024-${String(Date.now()).slice(-3)}`,
      customer: customer.name, customerId,
      items: items.map((x) => ({ product:x.product, qty:x.qty, price:x.price, subtotal:x.qty*x.price })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: 'confirmed', paymentStatus: 'pending',
      paymentMethod: payMethod,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: delDate || undefined,
    }
    addSaleOrder(order)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-slate-800 dark:text-white">Nueva venta</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cliente *</label>
              <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">-- Seleccionar --</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Método de pago</label>
              <select className="input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {['Efectivo','Tarjeta','Transferencia','Cheque'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fecha de entrega</label>
              <input className="input" type="date" value={delDate} onChange={(e) => setDelDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Notas</label>
              <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Comentarios..." />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Productos *</label>
              <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={12} /> Agregar</button>
            </div>
            {items.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-gray-600 rounded-lg text-slate-400 dark:text-gray-500 text-sm">
                Agrega productos a la venta
              </div>
            )}
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5">
                  {i === 0 && <label className="label">Producto</label>}
                  <select className="input" value={item.productId}
                    onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                    <option value="">-- Producto --</option>
                    {products.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="label">Cant.</label>}
                  <input className="input" type="number" min="1" value={item.qty}
                    onChange={(e) => updateItem(i, 'qty', parseFloat(e.target.value) || 1)} />
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="label">Precio ($)</label>}
                  <input className="input" type="number" min="0" step="0.01" value={item.price}
                    onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="label">Sub</label>}
                  <p className="py-2 text-sm font-semibold text-slate-700 dark:text-gray-200">${(item.qty * item.price).toFixed(2)}</p>
                </div>
                <div className="col-span-1">
                  <button onClick={() => removeItem(i)} className="w-8 h-9 flex items-center justify-center text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          {items.length > 0 && (
            <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4 space-y-2 animate-fadeIn">
              <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-gray-400">Subtotal</span><span className="dark:text-white">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-gray-400">IVA (16%)</span><span className="dark:text-white">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-white text-base pt-2 border-t border-slate-200 dark:border-gray-600">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-5 sticky bottom-0 bg-white dark:bg-gray-800 border-t border-slate-100 dark:border-gray-700 pt-4">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={handleSave}>Confirmar venta</button>
        </div>
      </div>
    </div>
  )
}

function OrderDetail({ order, onClose }: { order: SaleOrder; onClose: () => void }) {
  const { updateSaleOrder } = useStore()
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{order.orderNumber}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">{order.customer}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Estado orden</p>
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABELS[order.status]}</span></div>
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Estado pago</p>
              <span className={`badge ${PAY_BADGE[order.paymentStatus]}`}>{PAY_LABELS[order.paymentStatus]}</span></div>
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Método pago</p><p className="font-medium dark:text-gray-200">{order.paymentMethod}</p></div>
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Fecha</p><p className="font-medium dark:text-gray-200">{order.date}</p></div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2">PRODUCTOS</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-gray-700">
                <span className="text-slate-700 dark:text-gray-300">{item.product}</span>
                <span className="text-slate-500 dark:text-gray-400">{item.qty} × ${item.price}</span>
                <span className="font-semibold text-slate-800 dark:text-white">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500 dark:text-gray-400"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-500 dark:text-gray-400"><span>IVA</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-slate-800 dark:text-white pt-1.5 border-t border-slate-200 dark:border-gray-600">
              <span>Total</span><span>${order.total.toFixed(2)}</span>
            </div>
          </div>
          {order.paymentStatus !== 'paid' && (
            <button className="btn btn-success w-full"
              onClick={() => { updateSaleOrder({ ...order, paymentStatus:'paid' }); onClose() }}>
              <CheckCircle size={16} /> Marcar como pagado
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Sales() {
  const { saleOrders } = useStore()
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [showModal, setShowModal]   = useState(false)
  const [detail, setDetail]         = useState<SaleOrder | null>(null)

  const filtered = saleOrders.filter((o) => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                        o.customer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter || o.paymentStatus === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = saleOrders.reduce((a,o) => a + o.total, 0)
  const pendingPay   = saleOrders.filter((o) => o.paymentStatus === 'pending').reduce((a,o) => a + o.total, 0)
  const todayOrders  = saleOrders.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ventas</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Gestión de órdenes de venta</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva venta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Ingresos totales', value:`$${totalRevenue.toFixed(2)}`, icon:DollarSign, color:'bg-blue-600' },
          { label:'Por cobrar',       value:`$${pendingPay.toFixed(2)}`,   icon:Clock,      color:'bg-amber-500' },
          { label:'Total órdenes',    value:todayOrders,                   icon:ShoppingCart,color:'bg-teal-600'},
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
          <input className="input pl-9" placeholder="Buscar orden o cliente..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all','Todas'],['pending','Pendiente'],['confirmed','Confirmado'],['processing','En proceso'],['delivered','Entregado']].map(([v,l]) => (
            <button key={v} onClick={() => setStatus(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
              {['Orden','Cliente','Productos','Total','Pago','Estado pedido','Método','Fecha','Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="table-row cursor-pointer" onClick={() => setDetail(o)}>
                <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{o.orderNumber}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-gray-200">{o.customer}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-xs">{o.items.length} ítem(s)</td>
                <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">${o.total.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`badge ${PAY_BADGE[o.paymentStatus]}`}>{PAY_LABELS[o.paymentStatus]}</span></td>
                <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-xs">{o.paymentMethod}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-xs">{o.date}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setDetail(o)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-gray-600">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
            <p>No se encontraron ventas</p>
          </div>
        )}
      </div>

      {showModal && <NewSaleModal onClose={() => setShowModal(false)} />}
      {detail    && <OrderDetail order={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
