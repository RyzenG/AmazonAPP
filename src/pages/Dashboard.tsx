import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Package, Factory,
  AlertTriangle, ShoppingCart, DollarSign, Users, Clock,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCOP } from '../utils/currency'

const PIE_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#65a30d']

function KPICard({
  icon: Icon, label, value, sub, trend, color,
}: {
  icon: any; label: string; value: string; sub: string
  trend?: 'up' | 'down'; color: string
}) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up'   && <TrendingUp  size={13} className="text-emerald-500" />}
          {trend === 'down' && <TrendingDown size={13} className="text-red-500" />}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500 dark:text-gray-400'
          }`}>{sub}</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: 'badge-green', paid: 'badge-green',
    processing: 'badge-blue', partial: 'badge-yellow',
    confirmed: 'badge-blue', pending: 'badge-yellow',
    in_progress: 'badge-blue', finished: 'badge-green',
    cancelled: 'badge-red',
  }
  const labels: Record<string, string> = {
    delivered:'Entregado', paid:'Pagado', processing:'En proceso',
    partial:'Parcial', confirmed:'Confirmado', pending:'Pendiente',
    in_progress:'En producción', finished:'Finalizado', cancelled:'Cancelado',
  }
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{labels[status] ?? status}</span>
}

export default function Dashboard() {
  const { supplies, saleOrders, productionOrders, products, darkMode } = useStore()

  const lowStock    = supplies.filter((s) => s.stock < s.minStock)
  const pendingOrds = saleOrders.filter((o) => o.status === 'pending' || o.status === 'processing')
  const inProd      = productionOrders.filter((o) => o.status === 'in_progress')
  const totalSales  = saleOrders.reduce((a, o) => a + o.total, 0)
  const recentSales = [...saleOrders].reverse().slice(0, 5)

  const gridColor = darkMode ? '#374151' : '#f1f5f9'
  const tickColor = darkMode ? '#9ca3af' : '#94a3b8'

  // ── Sales chart: group orders by date over last 30 days ──────────────────
  const salesChartData = (() => {
    const days: { day: string; ventas: number }[] = []
    const now = new Date()
    const salesByDay: Record<string, number> = {}
    saleOrders.forEach((o) => {
      const d = o.date?.slice(0, 10) ?? ''
      if (d) salesByDay[d] = (salesByDay[d] ?? 0) + o.total
    })
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
      days.push({ day: label, ventas: salesByDay[key] ?? 0 })
    }
    return days
  })()

  // ── Top products: sum units sold per product name ────────────────────────
  const topProductsData = (() => {
    const qty: Record<string, number> = {}
    saleOrders.forEach((o) =>
      (o.items ?? []).forEach((item: any) => {
        const name = item.product ?? item.productName ?? ''
        if (name) qty[name] = (qty[name] ?? 0) + (item.qty ?? item.quantity ?? 0)
      })
    )
    return Object.entries(qty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, ventas]) => ({ name, ventas }))
  })()

  // ── Revenue by category: join items → products → category ───────────────
  const revenueByCategory = (() => {
    const rev: Record<string, number> = {}
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    saleOrders.forEach((o) =>
      (o.items ?? []).forEach((item: any) => {
        const prod = productMap[item.productId]
        const cat = prod?.category ?? 'Otros'
        rev[cat] = (rev[cat] ?? 0) + (item.subtotal ?? 0)
      })
    )
    const total = Object.values(rev).reduce((a, v) => a + v, 0)
    if (total === 0) return []
    return Object.entries(rev)
      .sort((a, b) => b[1] - a[1])
      .map(([name, v]) => ({ name, value: Math.round(v / total * 100) }))
  })()

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs">
          <p className="font-semibold text-slate-700 dark:text-gray-200 mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name === 'ventas' ? 'Ventas' : 'Meta'}: ${p.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Panel de Control</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">
          Resumen general del negocio —{' '}
          {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{lowStock.length} insumos</strong> están por debajo del stock mínimo:{' '}
            {lowStock.map((s) => s.name).join(', ')}.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={DollarSign}   label="Ventas totales"        value={formatCOP(totalSales)} sub={`${saleOrders.length} órdenes registradas`} color="bg-blue-600" />
        <KPICard icon={Factory}      label="En producción"         value={`${inProd.length}`}    sub={`${productionOrders.filter(o=>o.status==='pending').length} órdenes pendientes`} color="bg-teal-600" />
        <KPICard icon={Package}      label="Alertas de inventario" value={`${lowStock.length}`}  sub="Insumos bajo mínimo"   trend={lowStock.length>0?'down':undefined} color="bg-amber-500" />
        <KPICard icon={ShoppingCart} label="Pedidos activos"       value={`${pendingOrds.length}`} sub="Requieren atención" color="bg-violet-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales line chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">Ventas — Últimos 30 días</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">Comparado con meta diaria</p>
            </div>
            {saleOrders.length === 0 && <span className="text-xs text-slate-400 dark:text-gray-500">Sin ventas aún</span>}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ fontSize:'12px' }} />
              <Line type="monotone" dataKey="meta"   stroke={darkMode ? '#4b5563' : '#e2e8f0'} strokeWidth={2} dot={false} name="Meta" />
              <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Ventas" activeDot={{ r:5, fill:'#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by category donut */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Ingresos por categoría</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Distribución del mes</p>
          {revenueByCategory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-gray-600 text-sm gap-2">
              <ShoppingCart size={32} className="opacity-30" />
              <span>Sin ventas registradas</span>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                       dataKey="value" paddingAngle={3}>
                    {revenueByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Participación']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {revenueByCategory.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-slate-600 dark:text-gray-300">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-gray-200">{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Productos más vendidos</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Unidades este mes</p>
          {topProductsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-gray-600 text-sm gap-2">
              <Package size={32} className="opacity-30" />
              <span>Sin ventas registradas</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(topProductsData.length * 44, 120)}>
              <BarChart data={topProductsData} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:tickColor }} tickLine={false}
                       axisLine={false} width={120} />
                <Tooltip formatter={(v) => [`${v} u`, 'Vendidas']} />
                <Bar dataKey="ventas" fill="#2563eb" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent sales */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-white">Últimas ventas</h2>
            <a href="/sales" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Ver todas →</a>
          </div>
          <div className="space-y-0">
            <div className="grid grid-cols-4 text-xs text-slate-400 dark:text-gray-500 font-medium pb-2 border-b border-slate-100 dark:border-gray-700">
              <span>Orden</span><span>Cliente</span><span className="text-right">Total</span><span className="text-right">Estado</span>
            </div>
            {recentSales.map((o) => (
              <div key={o.id} className="grid grid-cols-4 items-center py-3 border-b border-slate-50 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-lg px-1 transition-colors">
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{o.orderNumber}</span>
                <span className="text-xs text-slate-700 dark:text-gray-300 truncate pr-2">{o.customer}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white text-right">{formatCOP(o.total)}</span>
                <div className="flex justify-end"><StatusBadge status={o.paymentStatus} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production status */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Estado de producción</h2>
          <a href="/production" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Ver todas →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {productionOrders.map((o) => (
            <div key={o.id} className="border border-slate-100 dark:border-gray-700 rounded-lg p-3 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500 dark:text-gray-400">{o.orderNumber}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{o.product}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Package size={11} /> {o.plannedQty} u
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {o.plannedStart?.split(' ')[0] ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} /> {o.assignedTo?.split(' ')[0] ?? '—'}
                </span>
              </div>
              {o.status === 'in_progress' && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full">
                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">60% completado</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
