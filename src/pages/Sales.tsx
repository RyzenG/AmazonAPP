import { useState } from 'react'
import { Plus, Search, X, ShoppingCart, DollarSign, Clock, CheckCircle, Trash2, Printer, FileText } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SaleOrder } from '../data/mockData'
import { usePermissions } from '../hooks/usePermissions'
import ConfirmDelete from '../components/ConfirmDelete'
import { formatCOP } from '../utils/currency'

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
  const tax      = subtotal * 0.19
  const total    = subtotal + tax

  const handleSave = () => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer || items.length === 0) return
    const order: SaleOrder = {
      id: `so${Date.now()}`, orderNumber: `VTA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      customer: customer.name, customerId,
      items: items.map((x) => ({ product:x.product, qty:x.qty, price:x.price, subtotal:x.qty*x.price })),
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      total: Math.round(total),
      status: 'confirmed', paymentStatus: 'pending',
      paymentMethod: payMethod,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: delDate || undefined,
      notes: notes || undefined,
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
                {['Efectivo','Tarjeta','Transferencia','Cheque','Nequi','Daviplata'].map((m) => <option key={m}>{m}</option>)}
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
                  {i === 0 && <label className="label">Precio (COP)</label>}
                  <input className="input" type="number" min="0" step="1" value={item.price}
                    onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="label">Sub</label>}
                  <p className="py-2 text-xs font-semibold text-slate-700 dark:text-gray-200">{formatCOP(item.qty * item.price)}</p>
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
              <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-gray-400">Subtotal</span><span className="dark:text-white">{formatCOP(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-gray-400">IVA (19%)</span><span className="dark:text-white">{formatCOP(tax)}</span></div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-white text-base pt-2 border-t border-slate-200 dark:border-gray-600">
                <span>Total</span><span>{formatCOP(total)}</span>
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

function OrderDetail({ order, onClose, onInvoice }: { order: SaleOrder; onClose: () => void; onInvoice: () => void }) {
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
              <span className={`badge ${STATUS_BADGE[order.status] ?? 'badge-yellow'}`}>{STATUS_LABELS[order.status] ?? order.status}</span></div>
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Estado pago</p>
              <span className={`badge ${PAY_BADGE[order.paymentStatus] ?? 'badge-yellow'}`}>{PAY_LABELS[order.paymentStatus] ?? order.paymentStatus}</span></div>
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Método pago</p><p className="font-medium dark:text-gray-200">{order.paymentMethod}</p></div>
            <div><p className="text-slate-400 dark:text-gray-500 text-xs">Fecha</p><p className="font-medium dark:text-gray-200">{order.date}</p></div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2">PRODUCTOS</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-gray-700">
                <span className="text-slate-700 dark:text-gray-300">{item.product}</span>
                <span className="text-slate-500 dark:text-gray-400">{item.qty} × {formatCOP(item.price)}</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatCOP(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500 dark:text-gray-400"><span>Subtotal</span><span>{formatCOP(order.subtotal)}</span></div>
            <div className="flex justify-between text-slate-500 dark:text-gray-400"><span>IVA</span><span>{formatCOP(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-slate-800 dark:text-white pt-1.5 border-t border-slate-200 dark:border-gray-600">
              <span>Total</span><span>{formatCOP(order.total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2" onClick={onInvoice}>
              <FileText size={15} /> Ver Factura
            </button>
            {order.paymentStatus !== 'paid' && (
              <button className="btn btn-success flex-1"
                onClick={() => { updateSaleOrder({ ...order, paymentStatus:'paid' }); onClose() }}>
                <CheckCircle size={16} /> Marcar como pagado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Invoice / Factura Modal ───────────────────────────────────────────────────
function InvoiceModal({ order, onClose }: { order: SaleOrder; onClose: () => void }) {
  const { customers, companySettings } = useStore()
  const customer = customers.find((c) => c.id === order.customerId)

  // Extract numeric invoice number from order number (e.g. "VTA-2024-007" → "007")
  const invoiceNum = (order.orderNumber ?? '').split('-').pop() ?? order.orderNumber ?? '001'

  const fmt = (n: number) =>
    '$ ' + n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const handlePrint = () => window.print()

  // Concrete-grey gradient for header/footer
  const concreteBg = 'linear-gradient(120deg,#888 0%,#b0aea8 20%,#ccc9c4 45%,#b5b2ad 70%,#909090 100%)'
  const darkConcreteBg = 'linear-gradient(120deg,#2c2c2c 0%,#454545 30%,#3a3a3a 60%,#252525 100%)'

  return (
    <>
      {/* Print-only style injected into head */}
      <style>{`
        @media print {
          body > *:not(#invoice-print-root) { display: none !important; }
          #invoice-print-root { position: fixed; inset: 0; z-index: 9999; background: white; }
          .invoice-no-print { display: none !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div id="invoice-print-root" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

          {/* Toolbar — hidden when printing */}
          <div className="invoice-no-print flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
            <h3 className="font-semibold text-slate-800 text-sm">Vista previa — Factura {order.orderNumber}</h3>
            <div className="flex items-center gap-3">
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Printer size={15} /> Imprimir / PDF
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Invoice body — scrollable in modal, fills page when printing */}
          <div className="overflow-y-auto flex-1">
            <div style={{ background: 'white', fontFamily: 'Arial, Helvetica, sans-serif', color: '#111' }}>

              {/* ── HEADER (concrete texture) ─────────────────── */}
              <div style={{ background: concreteBg, padding: '36px 44px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '52px', fontWeight: '900', color: '#1e3a0f', letterSpacing: '-1px', lineHeight: 1, textTransform: 'uppercase' }}>
                    FACTURA
                  </div>
                  <div style={{ marginTop: '10px', background: 'white', border: '1.5px solid #999', padding: '5px 18px', display: 'inline-block' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#222' }}>Nº: {invoiceNum}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {companySettings.logo ? (
                    <img src={companySettings.logo} alt="Logo"
                      style={{ height: '110px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e3a0f', letterSpacing: '2px' }}>AMAZONIA</div>
                      <div style={{ fontSize: '11px', letterSpacing: '5px', color: '#444', borderTop: '1px solid #666', paddingTop: '3px', marginTop: '2px' }}>CONCRETE</div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CLIENT + COMPANY INFO ─────────────────────── */}
              <div style={{ padding: '28px 44px', display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
                {/* Left: client */}
                <div style={{ flex: 1, borderRight: '1.5px solid #ccc', paddingRight: '36px' }}>
                  <p style={{ fontWeight: '800', fontSize: '12px', marginBottom: '14px', letterSpacing: '0.5px', color: '#111' }}>
                    DATOS DEL CLIENTE
                  </p>
                  <p style={{ fontSize: '14px', margin: '5px 0', color: '#111' }}>{customer?.name ?? order.customer}</p>
                  {customer?.email  && <p style={{ fontSize: '13px', margin: '4px 0', color: '#555' }}>{customer.email}</p>}
                  {customer?.phone  && <p style={{ fontSize: '13px', margin: '4px 0', color: '#555' }}>{customer.phone}</p>}
                  {customer?.city   && <p style={{ fontSize: '13px', margin: '4px 0', color: '#555' }}>{customer.city}</p>}
                </div>
                {/* Right: company */}
                <div style={{ flex: 1, paddingLeft: '36px', textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', fontSize: '15px', marginBottom: '10px', color: '#111', textTransform: 'uppercase' }}>
                    {companySettings.companyName}
                  </p>
                  {companySettings.email         && <p style={{ fontSize: '13px', margin: '4px 0', color: '#555' }}>{companySettings.email}</p>}
                  {companySettings.instagramHandle && <p style={{ fontSize: '13px', margin: '4px 0', color: '#555' }}>{companySettings.instagramHandle}</p>}
                </div>
              </div>

              {/* ── ITEMS TABLE ───────────────────────────────── */}
              <div style={{ padding: '28px 44px 16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #222' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #222' }}>
                      <th style={{ textAlign: 'left', padding: '11px 18px', fontSize: '14px', fontWeight: '700', borderRight: '1px solid #bbb' }}>Detalle</th>
                      <th style={{ textAlign: 'center', padding: '11px 16px', fontSize: '14px', fontWeight: '700', borderRight: '1px solid #bbb', width: '100px' }}>Cantidad</th>
                      <th style={{ textAlign: 'center', padding: '11px 16px', fontSize: '14px', fontWeight: '700', borderRight: '1px solid #bbb', width: '140px' }}>Precio</th>
                      <th style={{ textAlign: 'center', padding: '11px 16px', fontSize: '14px', fontWeight: '700', width: '140px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '13px 18px', fontSize: '13px', borderRight: '1px solid #eee', borderBottom: '1px solid #f0f0f0' }}>{item.product}</td>
                        <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', borderRight: '1px solid #eee', borderBottom: '1px solid #f0f0f0' }}>
                          {String(item.qty).padStart(2, '0')}
                        </td>
                        <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', borderRight: '1px solid #eee', borderBottom: '1px solid #f0f0f0' }}>
                          {fmt(item.price)}
                        </td>
                        <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', borderBottom: '1px solid #f0f0f0' }}>
                          {fmt(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                    {/* empty rows to fill space like the design */}
                    {order.items.length < 4 && Array.from({ length: 4 - order.items.length }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td style={{ padding: '13px 18px', borderRight: '1px solid #eee', borderBottom: '1px solid #f0f0f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #eee', borderBottom: '1px solid #f0f0f0' }} />
                        <td style={{ borderRight: '1px solid #eee', borderBottom: '1px solid #f0f0f0' }} />
                        <td style={{ borderBottom: '1px solid #f0f0f0' }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── DIVIDER ───────────────────────────────────── */}
              <div style={{ margin: '0 44px', borderTop: '1.5px solid #aaa' }} />

              {/* ── TOTAL ─────────────────────────────────────── */}
              <div style={{ padding: '20px 44px', display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ border: '1.5px solid #222', minWidth: '300px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '13px 24px', fontWeight: '800', fontSize: '15px', letterSpacing: '1.5px' }}>TOTAL</td>
                      <td style={{ padding: '13px 24px', textAlign: 'right', fontWeight: '700', fontSize: '15px', borderLeft: '1px solid #ccc' }}>
                        {fmt(order.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── BANK INFO ─────────────────────────────────── */}
              <div style={{ padding: '12px 44px 28px' }}>
                {(companySettings.bankKey || companySettings.bankAccountNumber) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                    {/* Bancolombia pill */}
                    <div style={{ background: '#fcd116', border: '1px solid #e8b800', borderRadius: '4px', padding: '5px 10px', fontWeight: '800', fontSize: '13px', color: '#333', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{companySettings.bankName || 'Bancolombia'}</span>
                      <span>🇨🇴</span>
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.9', color: '#333' }}>
                      {companySettings.bankKey           && <div>Llave: {companySettings.bankKey}</div>}
                      {companySettings.bankAccountNumber && <div>{companySettings.bankAccountType || 'Cuenta Ahorros'}: {companySettings.bankAccountNumber}</div>}
                    </div>
                  </div>
                )}
                {companySettings.bankMessage && (
                  <div style={{ border: '1.5px solid #222', display: 'inline-block', padding: '7px 18px', fontSize: '13px', color: '#111' }}>
                    {companySettings.bankMessage}
                  </div>
                )}
              </div>

              {/* ── FOOTER (dark concrete) ────────────────────── */}
              <div style={{ background: darkConcreteBg, padding: '22px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '13px', lineHeight: '2.2' }}>
                  {companySettings.tiktok && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#010101', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>♪</span>
                      <span>{companySettings.tiktok}</span>
                    </div>
                  )}
                  {companySettings.whatsapp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#25D366', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✆</span>
                      <span>{companySettings.whatsapp}</span>
                    </div>
                  )}
                  {companySettings.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>◉</span>
                      <span>{companySettings.instagram}</span>
                    </div>
                  )}
                  {/* fallback if no social links configured */}
                  {!companySettings.tiktok && !companySettings.whatsapp && !companySettings.instagram && (
                    <span style={{ color: '#aaa', fontSize: '12px' }}>Configure las redes sociales en Configuración → Empresa</span>
                  )}
                </div>
                <div style={{ borderLeft: '3px solid #666', paddingLeft: '20px', marginLeft: '20px' }}>
                  <div style={{ color: '#ddd', fontSize: '16px', fontStyle: 'italic', fontWeight: '300', letterSpacing: '0.5px', textAlign: 'right' }}>
                    {companySettings.slogan || 'Belleza natural en concreto'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Sales() {
  const { saleOrders, deleteSaleOrder } = useStore()
  const { canDelete } = usePermissions()
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [showModal, setShowModal]   = useState(false)
  const [detail, setDetail]         = useState<SaleOrder | null>(null)
  const [invoice, setInvoice]       = useState<SaleOrder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SaleOrder | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const filtered = saleOrders.filter((o) => {
    const matchSearch = (o.orderNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
                        (o.customer ?? '').toLowerCase().includes(search.toLowerCase())
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
          { label:'Ingresos totales', value: formatCOP(totalRevenue), icon:DollarSign, color:'bg-blue-600' },
          { label:'Por cobrar',       value: formatCOP(pendingPay),   icon:Clock,      color:'bg-amber-500' },
          { label:'Total órdenes',    value: String(todayOrders),     icon:ShoppingCart,color:'bg-teal-600'},
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
                <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{formatCOP(o.total)}</td>
                <td className="px-4 py-3"><span className={`badge ${PAY_BADGE[o.paymentStatus] ?? 'badge-yellow'}`}>{PAY_LABELS[o.paymentStatus] ?? o.paymentStatus}</span></td>
                <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-yellow'}`}>{STATUS_LABELS[o.status] ?? o.status}</span></td>
                <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-xs">{o.paymentMethod}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-xs">{o.date}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm btn-secondary" onClick={() => setDetail(o)}>Ver</button>
                    <button className="btn btn-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      onClick={() => setInvoice(o)} title="Ver factura">
                      <FileText size={12} />
                    </button>
                    {canDelete('sales') && (
                      <button className="btn btn-sm flex items-center gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
                        onClick={() => setDeleteTarget(o)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
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
      {detail    && <OrderDetail order={detail} onClose={() => setDetail(null)} onInvoice={() => { setInvoice(detail); setDetail(null) }} />}
      {invoice   && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />}
      {deleteTarget && (
        <ConfirmDelete
          name={`${deleteTarget.orderNumber} — ${deleteTarget.customer}`}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            setDeleting(true)
            await deleteSaleOrder(deleteTarget.id)
            setDeleting(false)
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}
