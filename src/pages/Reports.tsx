import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { FileText, FileSpreadsheet, TrendingUp, BarChart3, PieChart as PieIcon, ShoppingCart, Package, Factory } from 'lucide-react'
import { useStore } from '../store/useStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PIE_COLORS = ['#2563eb','#0f766e','#f59e0b','#dc2626','#7c3aed','#0891b2','#65a30d']

const EMPTY_STATE = (icon: React.ReactNode, msg: string) => (
  <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-gray-600 text-sm gap-2">
    {icon}
    <span>{msg}</span>
  </div>
)

export default function Reports() {
  const { saleOrders, supplies, productionOrders, products, darkMode } = useStore()

  const totalRevenue = saleOrders.reduce((a,o) => a + o.total, 0)
  const totalCost    = productionOrders.reduce((a,o) => a + (o.actualCost ?? o.estimatedCost ?? 0), 0)
  const grossMargin  = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0

  const lowStockItems  = supplies.filter((s) => s.stock < s.minStock)
  const inventoryValue = supplies.reduce((a,s) => a + s.stock * s.cost, 0)

  // Top customers from real orders
  const customerSales = saleOrders.reduce((acc, o) => {
    acc[o.customer] = (acc[o.customer] ?? 0) + o.total
    return acc
  }, {} as Record<string, number>)
  const topCustomers = Object.entries(customerSales)
    .sort(([,a],[,b]) => b - a).slice(0, 5)
    .map(([name, total]) => ({ name: name.split(' ')[0], total: parseFloat(total.toFixed(2)) }))

  // Top products from real order items
  const productSales = saleOrders.flatMap((o) => o.items ?? []).reduce((acc, item: any) => {
    const name = item.product ?? item.productName ?? ''
    acc[name] = (acc[name] ?? 0) + (item.qty ?? item.quantity ?? 0)
    return acc
  }, {} as Record<string, number>)
  const productSalesData = Object.entries(productSales)
    .sort(([,a],[,b]) => b - a).slice(0,6)
    .map(([name, qty]) => ({ name: name.split(' ')[0], qty }))

  // Sales trend: last 30 days grouped by date
  const salesChartData = (() => {
    const salesByDay: Record<string, number> = {}
    saleOrders.forEach((o) => {
      const d = o.date?.slice(0,10) ?? ''
      if (d) salesByDay[d] = (salesByDay[d] ?? 0) + o.total
    })
    const now = new Date()
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      const key = d.toISOString().slice(0,10)
      return {
        day: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`,
        ventas: salesByDay[key] ?? 0,
      }
    })
  })()

  // Revenue by category from real products
  const revenueByCategory = (() => {
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const rev: Record<string, number> = {}
    saleOrders.forEach((o) =>
      (o.items ?? []).forEach((item: any) => {
        const cat = productMap[item.productId]?.category ?? 'Otros'
        rev[cat] = (rev[cat] ?? 0) + (item.subtotal ?? 0)
      })
    )
    const total = Object.values(rev).reduce((a, v) => a + v, 0)
    if (total === 0) return []
    return Object.entries(rev)
      .sort((a,b) => b[1] - a[1])
      .map(([name, v]) => ({ name, value: Math.round(v / total * 100) }))
  })()

  // Production by month from real production orders
  const productionByMonth = (() => {
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const byMonth: Record<string, number> = {}
    productionOrders.forEach((o) => {
      const date = o.startDate ?? o.plannedStart ?? ''
      if (!date) return
      const d = new Date(date)
      if (isNaN(d.getTime())) return
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      byMonth[key] = (byMonth[key] ?? 0) + (o.quantity ?? o.plannedQty ?? 0)
    })
    return Object.entries(byMonth)
      .slice(-6)
      .map(([month, unidades]) => ({ month: month.slice(0,3), unidades }))
  })()

  const gridColor = darkMode ? '#374151' : '#f1f5f9'
  const tickColor = darkMode ? '#9ca3af' : '#94a3b8'

  // ─── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF()
    const dateStr = format(new Date(), "d 'de' MMMM yyyy", { locale: es })

    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('ProducERP — Reporte General', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generado el ${dateStr}`, 14, 26)

    // Inventory table
    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('Inventario de Insumos', 14, 38)
    autoTable(doc, {
      startY: 42,
      head: [['Insumo', 'SKU', 'Categoría', 'Stock', 'Mín.', 'Costo unit.', 'Valor total']],
      body: supplies.map((s) => [
        s.name, s.sku, s.category,
        `${s.stock} ${s.unit}`, `${s.minStock} ${s.unit}`,
        `$${s.cost.toFixed(2)}`, `$${(s.stock * s.cost).toFixed(2)}`,
      ]),
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8 },
    })

    // Sales table
    const afterInventory = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('Órdenes de Venta', 14, afterInventory)
    autoTable(doc, {
      startY: afterInventory + 4,
      head: [['Nro. Orden', 'Cliente', 'Fecha', 'Estado', 'Pago', 'Total']],
      body: saleOrders.map((o) => [
        o.orderNumber, o.customer,
        format(new Date(o.date), 'dd/MM/yyyy'),
        o.status, o.paymentStatus, `$${o.total.toFixed(2)}`,
      ]),
      headStyles: { fillColor: [5, 150, 105] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8 },
    })

    doc.save(`reporte-erp-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  // ─── Export Excel ────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    const wb = XLSX.utils.book_new()

    // Inventory sheet
    const inventoryData = supplies.map((s) => ({
      'Insumo': s.name, 'SKU': s.sku, 'Categoría': s.category,
      'Stock': s.stock, 'Unidad': s.unit, 'Stock mínimo': s.minStock,
      'Costo unit.': s.cost, 'Valor total': parseFloat((s.stock * s.cost).toFixed(2)),
      'Estado': s.stock < s.minStock ? 'BAJO' : 'OK',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inventoryData), 'Inventario')

    // Sales sheet
    const salesData = saleOrders.map((o) => ({
      'N° Orden': o.orderNumber, 'Cliente': o.customer,
      'Fecha': format(new Date(o.date), 'dd/MM/yyyy'),
      'Entrega': o.deliveryDate ? format(new Date(o.deliveryDate), 'dd/MM/yyyy') : '',
      'Estado': o.status, 'Pago': o.paymentStatus,
      'Método pago': o.paymentMethod,
      'Subtotal': o.subtotal, 'Impuesto': o.tax, 'Total': o.total,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesData), 'Ventas')

    // Top customers sheet
    const customersData = topCustomers.map((c) => ({ 'Cliente': c.name, 'Total compras': c.total }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customersData), 'Top Clientes')

    XLSX.writeFile(wb, `reporte-erp-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reportes y Analítica</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Análisis completo del negocio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="btn btn-secondary btn-sm">
            <FileText size={13} /> Exportar PDF
          </button>
          <button onClick={handleExportExcel} className="btn btn-primary btn-sm">
            <FileSpreadsheet size={13} /> Exportar Excel
          </button>
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
              <p className="text-xs text-slate-500 dark:text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-400 dark:text-gray-500">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales trend */}
      <div className="card p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Tendencia de ventas — 30 días</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400">Ventas diarias registradas</p>
        </div>
        {saleOrders.length === 0
          ? EMPTY_STATE(<ShoppingCart size={32} className="opacity-30" />, 'Sin ventas registradas')
          : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} tickFormatter={(v)=>`$${v}`} />
                <Tooltip formatter={(v:number)=>[`$${v.toFixed(2)}`, 'Ventas']} />
                <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Ventas" activeDot={{ r:5 }} />
              </LineChart>
            </ResponsiveContainer>
          )
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top customers */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Clientes más activos</h2>
          {topCustomers.length === 0
            ? EMPTY_STATE(<ShoppingCart size={32} className="opacity-30" />, 'Sin ventas registradas')
            : (
              <ResponsiveContainer width="100%" height={Math.max(topCustomers.length * 44, 120)}>
                <BarChart data={topCustomers} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false}
                         tickFormatter={(v)=>`$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:tickColor }}
                         tickLine={false} axisLine={false} width={80} />
                  <Tooltip formatter={(v:number)=>[`$${v.toFixed(2)}`, 'Total compras']} />
                  <Bar dataKey="total" fill="#7c3aed" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Products sold */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Productos más vendidos</h2>
          {productSalesData.length === 0
            ? EMPTY_STATE(<Package size={32} className="opacity-30" />, 'Sin ventas registradas')
            : (
              <ResponsiveContainer width="100%" height={Math.max(productSalesData.length * 44, 120)}>
                <BarChart data={productSalesData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v:number)=>[`${v} u`, 'Unidades']} />
                  <Bar dataKey="qty" fill="#0f766e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Revenue by category */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Ingresos por categoría</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Participación en ventas</p>
          {revenueByCategory.length === 0
            ? EMPTY_STATE(<ShoppingCart size={32} className="opacity-30" />, 'Sin ventas registradas')
            : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={80}
                         dataKey="value" paddingAngle={3}>
                      {revenueByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v)=>[`${v}%`,'Participación']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {revenueByCategory.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 dark:text-gray-300">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-gray-200">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>

        {/* Production trend */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Producción mensual</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Unidades producidas por mes</p>
          {productionByMonth.length === 0
            ? EMPTY_STATE(<Factory size={32} className="opacity-30" />, 'Sin órdenes de producción')
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={productionByMonth} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:11, fill:tickColor }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v:number)=>[`${v} u`, 'Producción']} />
                  <Bar dataKey="unidades" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Inventory alert table */}
      {lowStockItems.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-white">⚠️ Insumos con stock bajo</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
                {['Insumo','SKU','Stock actual','Stock mínimo','Déficit','Acción'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-gray-200">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 dark:text-gray-500">{s.sku}</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">{s.stock} {s.unit}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{s.minStock} {s.unit}</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">-{(s.minStock - s.stock).toFixed(1)} {s.unit}</td>
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
