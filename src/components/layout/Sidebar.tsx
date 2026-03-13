import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Factory, ShoppingCart,
  Users, BarChart3, BookOpen, Settings, ChevronLeft, ChevronRight,
  Leaf, LogOut, FileText,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

const nav = [
  { to:'/dashboard',  icon:LayoutDashboard, label:'Dashboard'    },
  { to:'/inventory',  icon:Package,         label:'Inventario'   },
  { to:'/production', icon:Factory,         label:'Producción'   },
  { to:'/sales',      icon:ShoppingCart,    label:'Ventas'       },
  { to:'/quotations', icon:FileText,        label:'Cotizaciones'  },
  { to:'/crm',        icon:Users,           label:'Clientes'     },
  { to:'/catalog',    icon:BookOpen,        label:'Catálogo'     },
  { to:'/reports',    icon:BarChart3,       label:'Reportes'     },
  { to:'/settings',   icon:Settings,        label:'Configuración'},
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, user, logout, companySettings } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  const logo = companySettings.logo

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-amazonia-900 flex flex-col transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-amazonia-800/60">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5 animate-slideIn overflow-hidden">
            {logo ? (
              <img src={logo} alt={companySettings.companyName} className="h-9 w-9 object-contain rounded" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-amazonia-700 flex items-center justify-center flex-shrink-0">
                <Leaf size={18} className="text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">
                {companySettings.companyName || 'Amazonia ERP'}
              </p>
              <p className="text-amazonia-400 text-xs">v1.0</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          logo ? (
            <img src={logo} alt={companySettings.companyName} className="h-8 w-8 object-contain rounded mx-auto" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amazonia-700 flex items-center justify-center mx-auto">
              <Leaf size={16} className="text-white" />
            </div>
          )
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-amazonia-400 hover:text-white transition-colors ml-auto"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : 'text-amazonia-300 hover:text-white'}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="animate-slideIn">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`px-3 py-4 border-t border-amazonia-800/60 ${sidebarOpen ? '' : 'flex flex-col items-center gap-2'}`}>
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-amazonia-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          {sidebarOpen && (
            <div className="animate-slideIn min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{user?.name ?? 'Administrador'}</p>
              <p className="text-amazonia-400 text-xs truncate">{user?.email ?? 'admin@empresa.com'}</p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="text-amazonia-400 hover:text-red-400 transition-colors flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {!sidebarOpen && (
          <button
            onClick={handleLogout}
            className="text-amazonia-400 hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
