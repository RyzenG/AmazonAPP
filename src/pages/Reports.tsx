import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Download, TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react'
import { salesChartData, topProductsData, revenueByCategory, productionByMonth } from '../data/mockData'
import { useStore } from '../store/useStore'

const PIE_COLORS = ['#2563eb','#0f766e','#f59e0b','#dc2626','#7c3aed']

function ExportButton({ label, format }: { label: string; format: string }) {
  return (
    <button className="btn btn-secondary btn-sm">
      <Download size={13} /> {label} ({format})
    </button>
  )
}

export default function Reports() {
  const { saleOrders, supplies, productionOrders } = useStore()

  const totalRevenue = saleOrders.reduce((a,o) => a + o.total, 0)
  const totalCost    = productionOrders.reduce((a,o) => a + (o.actualCost ?? o.estimatedCost), 0)
  const grossMargin  = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0

  const lowStockItems  = supplies.filter((s) => s.stock < s.minStock)
  const inventoryValue = supplies.reduce((a,s) => a + s.stock * s.cost, 0)

  const customerSales = saleOrders.reduce((acc, o) => {
    acc[o.customer] = (acc[o.customer] ?? 0) + o.total
    return acc
  }, {} as Record<string, number>)
  const topCustomers = Object.entries(customerSales)
    .sort(([,a],[,b]) => b - a).slice(0, 5)
    .map(([name, total]) => ({ name: name.split(' ')[0], total: parseFloat(total.toFixed(2)) }))

  const productSales = saleOrders.flatMap((o) => o.items).reduce((acc, item) => {
    acc[item.product] = (acc[item.product] ?? 0) + item.qty
    return acc
  }, {} as Record<string, number>)
  const productSalesData = Object.entries(productSales)
    .sort(([,a],[,b]) => b - a).slice(0,6)
    .map(([name, qty]) => ({ name: name.split(' ')[0], qty }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes y Analítica</h1>
          <p className="text-slate-500 text-sm">Análisis completo del negocio</p>
        </div>
        <div className="flex gap-2">
          <ExportButton label="Exportar" format="PDF" />
          <ExportButton label="Exportar" format="Excel" />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Ingresos totales', value:`$${totalRevenue.toFixed(2)}`, icon:TrendingUp,  color:'bg-blue-600',    sub:'Todas las ventas' },
          { label:'Margen bruto',     value:`${grossMargin.toFixed(1)}%`,  icon:BarChart3,   color:'bg-emerald-600', sub:'Revenue - Costos' },
          { label:'Valor inventario', value:`$${inventoryValue.toFixed(2)}`,icon:PieIcon,    color:'bg-violet-600',  sub:`${supplies.length} insumos` },
          { label:'Prod. completadas',value:productionOrders.filter(o=>o.status==='finished').length, icon:BarChart3, color:'bg-teal-600', sub:'Órdenes finalizadas' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales trend */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Tendencia de ventas — 30 días</h2>
            <p className="text-xs text-slate-500">Ventas diarias vs meta</p>
          </div>
          <ExportButton label="Descargar" format="CSV" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v)=>`$${v}`} />
            <Tooltip formatter={(v:number)=>[`$${v}`]} />
            <Legend wrapperStyle={{ fontSize:'12px' }} />
            <Line type="monotone" dataKey="meta"   stroke="#e2e8f0" strokeWidth={2} dot={false} name="Meta" />
            <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Ventas"
                  activeDot={{ r:5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top customers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Clientes más activos</h2>
            <ExportButton label="Exportar" format="Excel" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCustomers} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false}
                     tickFormatter={(v)=>`$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }}
                     tickLine={false} axisLine={false} width={70} />
              <Tooltip formatter={(v:number)=>[`$${v.toFixed(2)}`, 'Total compras']} />
              <Bar dataKey="total" fill="#7c3aed" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products sold */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Productos más vendidos</h2>
            <ExportButton label="Exportar" format="PDF" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productSalesData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v:number)=>[`${v} u`, 'Unidades']} />
              <Bar dataKey="qty" fill="#0f766e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by category */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Ingresos por categoría</h2>
          <p className="text-xs text-slate-500 mb-4">Participación en ventas</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={80}
                     dataKey="value" paddingAngle={3}>
                  {revenueByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v)=>[`${v}%`,'Participación']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {revenueByCategory.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Production trend */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Producción mensual</h2>
          <p className="text-xs text-slate-500 mb-4">Unidades producidas por mes</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={productionByMonth} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v:number)=>[`${v} u`, 'Producción']} />
              <Bar dataKey="unidades" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory alert table */}
      {lowStockItems.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">⚠️ Insumos con stock bajo</h2>
            <ExportButton label="Exportar lista" format="Excel" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-50 border-b border-red-100">
                {['Insumo','SKU','Stock actual','Stock mínimo','Déficit','Acción'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-red-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.sku}</td>
                  <td className="px-4 py-3 text-red-600 font-bold">{s.stock} {s.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{s.minStock} {s.unit}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">-{(s.minStock - s.stock).toFixed(1)} {s.unit}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-red">Reponer urgente</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
