import { useState } from 'react'
import { Plus, Search, X, BookOpen, Tag, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Product } from '../data/mockData'

const CAT_COLORS: Record<string, string> = {
  Tortas:'badge-blue', Panes:'badge-green', Galletas:'badge-yellow',
  Muffins:'badge-purple', default:'badge-gray',
}

function ProductModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const { addProduct, updateProduct, recipes } = useStore()
  const [form, setForm] = useState<Partial<Product>>(product ?? {
    sku:`PRD-${String(Date.now()).slice(-3)}`, name:'', category:'',
    unit:'u', stock:0, price:0, cost:0, isActive:true,
  })

  const handleSave = () => {
    if (!form.name) return
    const p = { ...form, id: product?.id ?? `p${Date.now()}` } as Product
    if (product) { updateProduct(p) } else { addProduct(p) }
    onClose()
  }

  const field = (k: keyof Product, label: string, type = 'text') => (
    <div key={k}>
      <label className="label">{label}</label>
      <input className="input" type={type}
        value={String(form[k] ?? '')}
        onChange={(e) => setForm({ ...form, [k]: type === 'number' ? parseFloat(e.target.value)||0 : e.target.value })} />
    </div>
  )

  const margin = form.price && form.cost && form.cost > 0
    ? (((form.price as number) - (form.cost as number)) / (form.price as number) * 100).toFixed(1)
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{product ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          {field('sku',  'SKU')}
          {field('name', 'Nombre *')}
          {field('category','Categoría')}
          <div>
            <label className="label">Unidad</label>
            <select className="input" value={form.unit ?? 'u'}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {['u','kg','L','doc','caja'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          {field('price','Precio venta ($)','number')}
          {field('cost', 'Costo producción ($)','number')}
          {field('stock','Stock actual','number')}
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.isActive ? 'activo':'inactivo'}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'activo' })}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="label">Receta vinculada</label>
            <select className="input" value={form.recipeId ?? ''}
              onChange={(e) => setForm({ ...form, recipeId: e.target.value || undefined })}>
              <option value="">-- Sin receta --</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        {margin && (
          <div className="mx-6 mb-4 bg-emerald-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-emerald-700">Margen de ganancia estimado</span>
            <span className="font-bold text-emerald-700">{margin}%</span>
          </div>
        )}
        <div className="flex gap-3 px-6 pb-5">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={handleSave}>
            {product ? 'Actualizar' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const margin = product.price > 0
    ? ((product.price - product.cost) / product.price * 100).toFixed(0)
    : '0'
  const catBadge = CAT_COLORS[product.category] ?? CAT_COLORS.default

  return (
    <div className={`card p-5 transition-all hover:shadow-md ${!product.isActive ? 'opacity-60' : ''}`}>
      {/* Image placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
        <span className="text-4xl">
          {product.category === 'Tortas' ? '🎂' :
           product.category === 'Panes'  ? '🍞' :
           product.category === 'Galletas'?'🍪':
           product.category === 'Muffins' ?'🧁':'🛍️'}
        </span>
      </div>
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight flex-1 pr-2">{product.name}</h3>
        <span className={`badge ${catBadge} flex-shrink-0`}>{product.category}</span>
      </div>
      <p className="text-xs font-mono text-slate-400 mb-3">{product.sku}</p>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-400">Precio</p>
          <p className="font-bold text-slate-800 text-sm">${product.price}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-400">Costo</p>
          <p className="font-bold text-slate-600 text-sm">${product.cost}</p>
        </div>
        <div className={`rounded-lg p-2 ${parseFloat(margin) > 40 ? 'bg-emerald-50' : parseFloat(margin) > 20 ? 'bg-amber-50' : 'bg-red-50'}`}>
          <p className="text-xs text-slate-400">Margen</p>
          <p className={`font-bold text-sm ${parseFloat(margin) > 40 ? 'text-emerald-700' : parseFloat(margin) > 20 ? 'text-amber-700' : 'text-red-700'}`}>
            {margin}%
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`badge ${product.isActive ? 'badge-green' : 'badge-gray'}`}>
            {product.isActive ? 'Activo' : 'Inactivo'}
          </span>
          {product.recipeId && <span className="badge badge-blue">Con receta</span>}
        </div>
        <button className="btn btn-sm btn-secondary" onClick={onEdit}>Editar</button>
      </div>
    </div>
  )
}

export default function Catalog() {
  const { products } = useStore()
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))]
  const filtered = products.filter((p) => {
    const matchS = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchC = catFilter === 'Todos' || p.category === catFilter
    return matchS && matchC
  })

  const avgMargin = products.reduce((a,p) => a + (p.price > 0 ? (p.price-p.cost)/p.price*100 : 0), 0) / products.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catálogo de Productos</h1>
          <p className="text-slate-500 text-sm">Gestión de productos y precios</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProduct(undefined); setShowModal(true) }}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total productos', value:products.length, icon:BookOpen },
          { label:'Activos',         value:products.filter(p=>p.isActive).length, icon:Tag },
          { label:'Categorías',      value:categories.length-1, icon:Tag },
          { label:'Margen promedio', value:`${avgMargin.toFixed(1)}%`, icon:TrendingUp },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <s.icon size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar producto..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                catFilter === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onEdit={() => { setEditProduct(p); setShowModal(true) }} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => setShowModal(false)} />}
    </div>
  )
}
