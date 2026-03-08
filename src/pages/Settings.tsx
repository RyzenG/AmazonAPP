import { useState } from 'react'
import { Settings as SettingsIcon, Users, CreditCard, Percent, Building, Bell, Shield, Save } from 'lucide-react'

const TAB_ICONS: Record<string, any> = {
  empresa: Building, usuarios: Users, pagos: CreditCard,
  impuestos: Percent, notificaciones: Bell, seguridad: Shield,
}

const tabs = ['empresa','usuarios','pagos','impuestos','notificaciones','seguridad']
const TAB_LABELS: Record<string, string> = {
  empresa:'Empresa', usuarios:'Usuarios y roles', pagos:'Métodos de pago',
  impuestos:'Impuestos', notificaciones:'Notificaciones', seguridad:'Seguridad',
}

const USERS = [
  { id:1, name:'Admin General',    email:'admin@empresa.com',    role:'Administrador', isActive:true  },
  { id:2, name:'María García',     email:'maria@empresa.com',    role:'Producción',    isActive:true  },
  { id:3, name:'Carlos López',     email:'carlos@empresa.com',   role:'Producción',    isActive:true  },
  { id:4, name:'Ana Ramos',        email:'ana@empresa.com',      role:'Ventas',        isActive:true  },
  { id:5, name:'Roberto Méndez',   email:'roberto@empresa.com',  role:'Inventario',    isActive:false },
]

const ROLES = [
  { name:'Administrador', perms:['Todo el sistema'],   color:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { name:'Producción',    perms:['Producción','Inventario (lectura)'], color:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { name:'Ventas',        perms:['Ventas','CRM','Catálogo (lectura)'], color:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { name:'Inventario',    perms:['Inventario','Catálogo'],             color:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { name:'Contabilidad',  perms:['Reportes','Facturación','Costos'],   color:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
]

function SaveButton() {
  const [saved, setSaved] = useState(false)
  return (
    <button className="btn btn-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
      <Save size={15} /> {saved ? '¡Guardado!' : 'Guardar cambios'}
    </button>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('empresa')
  const [company, setCompany]     = useState({
    name:'Empresa de Producción SA',
    slogan:'Calidad artesanal desde 2010',
    email:'contacto@empresa.com',
    phone:'+57 310 000 0000',
    address:'Calle 123 #45-67, Bogotá',
    currency:'COP',
    timezone:'America/Bogota',
  })

  const [payMethods] = useState([
    { id:1, name:'Efectivo',        isActive:true  },
    { id:2, name:'Tarjeta débito',  isActive:true  },
    { id:3, name:'Tarjeta crédito', isActive:true  },
    { id:4, name:'Transferencia',   isActive:true  },
    { id:5, name:'Cheque',          isActive:false },
  ])

  const [taxes] = useState([
    { id:1, name:'IVA 16%',       rate:16, isDefault:true,  isActive:true  },
    { id:2, name:'IVA 0%',        rate:0,  isDefault:false, isActive:true  },
    { id:3, name:'Exento',        rate:0,  isDefault:false, isActive:true  },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm">Personalización del sistema</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {tabs.map((t) => {
            const Icon = TAB_ICONS[t]
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === t
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700'
                }`}>
                <Icon size={16} />{TAB_LABELS[t]}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6 animate-fadeIn">
          {activeTab === 'empresa' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Building size={18} /> Datos de la empresa</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Nombre de la empresa', 'name'],
                  ['Eslogan / descripción', 'slogan'],
                  ['Correo electrónico', 'email'],
                  ['Teléfono', 'phone'],
                  ['Dirección', 'address'],
                ].map(([label, key]) => (
                  <div key={key} className={key === 'address' ? 'col-span-2' : ''}>
                    <label className="label">{label}</label>
                    <input className="input" value={company[key as keyof typeof company]}
                      onChange={(e) => setCompany({ ...company, [key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="label">Moneda</label>
                  <select className="input" value={company.currency}
                    onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
                    {['COP','USD','MXN','PEN','ARS','CLP'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Zona horaria</label>
                  <select className="input" value={company.timezone}
                    onChange={(e) => setCompany({ ...company, timezone: e.target.value })}>
                    {['America/Bogota','America/Mexico_City','America/Lima','America/Buenos_Aires'].map((tz) => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Users size={18} /> Usuarios y roles</h2>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300 mb-3">Usuarios del sistema</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                      {['Nombre','Email','Rol','Estado','Acciones'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {USERS.map((u) => (
                      <tr key={u.id} className="table-row">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-gray-200">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="badge badge-blue">{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>
                            {u.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="btn btn-sm btn-secondary">Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300 mb-3">Roles y permisos</h3>
                <div className="space-y-3">
                  {ROLES.map((r) => (
                    <div key={r.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`badge ${r.color}`}>{r.name}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {r.perms.map((p) => (
                            <span key={p} className="text-xs text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 px-2 py-0.5 rounded">{p}</span>
                          ))}
                        </div>
                      </div>
                      <button className="btn btn-sm btn-secondary">Editar permisos</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagos' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><CreditCard size={18} /> Métodos de pago</h2>
              <div className="space-y-2">
                {payMethods.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-gray-600 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{m.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${m.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {m.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={m.isActive} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary"><span>+ Agregar método</span></button>
              <SaveButton />
            </div>
          )}

          {activeTab === 'impuestos' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Percent size={18} /> Tasas de impuesto</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                    {['Nombre','Tasa','Por defecto','Estado'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxes.map((t) => (
                    <tr key={t.id} className="table-row">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-gray-200">{t.name}</td>
                      <td className="px-4 py-3 font-bold text-slate-700 dark:text-gray-200">{t.rate}%</td>
                      <td className="px-4 py-3">
                        {t.isDefault && <span className="badge badge-blue">Por defecto</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${t.isActive ? 'badge-green' : 'badge-gray'}`}>
                          {t.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <SaveButton />
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Bell size={18} /> Configuración de alertas</h2>
              <div className="space-y-3">
                {[
                  ['Alertas de stock bajo',              true ],
                  ['Recordatorio de pagos pendientes',   true ],
                  ['Resumen diario de ventas',           true ],
                  ['Notificaciones de nuevas órdenes',   true ],
                  ['Reporte semanal automático',         false],
                  ['Alertas por email',                  true ],
                  ['Notificaciones push',                true ],
                ].map(([label, def]: any) => (
                  <div key={label} className="flex items-center justify-between p-3 border border-slate-200 dark:border-gray-600 rounded-lg">
                    <span className="text-sm text-slate-700 dark:text-gray-200">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={def} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:peer-checked:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
              <SaveButton />
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Shield size={18} /> Seguridad del sistema</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">🔐 Autenticación de dos factores (2FA)</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Agrega una capa extra de seguridad a todas las cuentas</p>
                  <button className="btn btn-secondary btn-sm mt-2">Configurar 2FA</button>
                </div>
                <div>
                  <label className="label">Tiempo de sesión (minutos)</label>
                  <select className="input w-48">
                    {['30','60','120','240','480'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">IPs permitidas (dejar vacío para permitir todas)</label>
                  <textarea className="input h-20 resize-none" placeholder="192.168.1.1&#10;10.0.0.0/24" />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-gray-300">POLÍTICA DE CONTRASEÑAS</p>
                  {['Mínimo 8 caracteres','Incluir número','Incluir mayúscula','Incluir símbolo especial'].map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:peer-checked:translate-x-full"></div>
                      </label>
                      <span className="text-sm text-slate-600 dark:text-gray-300">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
              <SaveButton />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
