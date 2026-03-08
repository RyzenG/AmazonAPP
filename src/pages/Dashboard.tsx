import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Package, Factory,
  AlertTriangle, ShoppingCart, DollarSign, Users, Clock,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { salesChartData, topProductsData, revenueByCategory } from '../data/mockData'

const PIE_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#7c3aed']

function KPICard({
  icon: Icon, label, value, sub, trend, color,
}: {
  icon: any; label: string; value: string; sub: string
  trend?: 'up' | 'down'; color: string
}) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up'   && <TrendingUp  size={13} className="text-emerald-500" />}
          {trend === 'down' && <TrendingDown size={13} className="text-red-500" />}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
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
  const { supplies, saleOrders, productionOrders } = useStore()

  const lowStock    = supplies.filter((s) => s.stock < s.minStock)
  const pendingOrds = saleOrders.filter((o) => o.status === 'pending' || o.status === 'processing')
  const inProd      = productionOrders.filter((o) => o.status === 'in_progress')
  const todaySales  = saleOrders.reduce((a, o) => a + o.total, 0)
  const recentSales = [...saleOrders].reverse().slice(0, 5)

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
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
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Resumen general del negocio —{' '}
          {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{lowStock.length} insumos</strong> están por debajo del stock mínimo:{' '}
            {lowStock.map((s) => s.name).join(', ')}.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={DollarSign}   label="Ventas del mes"        value={`$${todaySales.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`} sub="+18% vs mes anterior"  trend="up"   color="bg-blue-600" />
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
              <h2 className="font-semibold text-slate-800">Ventas — Últimos 30 días</h2>
              <p className="text-xs text-slate-500">Comparado con meta diaria</p>
            </div>
            <span className="badge badge-green">+18% mes</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                     interval={4} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                     tickFormatter={(v) => `$${v}`} />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ fontSize:'12px' }} />
              <Line type="monotone" dataKey="meta"   stroke="#e2e8f0" strokeWidth={2} dot={false} name="Meta" />
              <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Ventas"
                    activeDot={{ r:5, fill:'#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by category donut */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Ingresos por categoría</h2>
          <p className="text-xs text-slate-500 mb-4">Distribución del mes</p>
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
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Productos más vendidos</h2>
          <p className="text-xs text-slate-500 mb-4">Unidades este mes</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProductsData} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false}
                     axisLine={false} width={110} />
              <Tooltip formatter={(v) => [`${v} u`, 'Vendidas']} />
              <Bar dataKey="ventas" fill="#2563eb" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent sales */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Últimas ventas</h2>
            <a href="/sales" className="text-xs text-blue-600 hover:underline">Ver todas →</a>
          </div>
          <div className="space-y-0">
            <div className="grid grid-cols-4 text-xs text-slate-400 font-medium pb-2 border-b border-slate-100">
              <span>Orden</span><span>Cliente</span><span className="text-right">Total</span><span className="text-right">Estado</span>
            </div>
            {recentSales.map((o) => (
              <div key={o.id} className="grid grid-cols-4 items-center py-3 border-b border-slate-50 hover:bg-slate-50 rounded-lg px-1 transition-colors">
                <span className="text-xs font-mono text-blue-600">{o.orderNumber}</span>
                <span className="text-xs text-slate-700 truncate pr-2">{o.customer}</span>
                <span className="text-xs font-semibold text-slate-800 text-right">${o.total.toFixed(2)}</span>
                <div className="flex justify-end"><StatusBadge status={o.paymentStatus} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production status */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Estado de producción</h2>
          <a href="/production" className="text-xs text-blue-600 hover:underline">Ver todas →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {productionOrders.map((o) => (
            <div key={o.id} className="border border-slate-100 rounded-lg p-3 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500">{o.orderNumber}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-sm font-medium text-slate-800 truncate">{o.product}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Package size={11} /> {o.plannedQty} u
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {o.plannedStart.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} /> {o.assignedTo.split(' ')[0]}
                </span>
              </div>
              {o.status === 'in_progress' && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">60% completado</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
