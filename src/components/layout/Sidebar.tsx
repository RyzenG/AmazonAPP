import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Factory, ShoppingCart,
  Users, BarChart3, BookOpen, Settings, ChevronLeft, ChevronRight,
  TrendingUp, LogOut,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

const nav = [
  { to:'/dashboard',  icon:LayoutDashboard, label:'Dashboard'    },
  { to:'/inventory',  icon:Package,         label:'Inventario'   },
  { to:'/production', icon:Factory,         label:'Producción'   },
  { to:'/sales',      icon:ShoppingCart,    label:'Ventas'       },
  { to:'/crm',        icon:Users,           label:'Clientes'     },
  { to:'/catalog',    icon:BookOpen,        label:'Catálogo'     },
  { to:'/reports',    icon:BarChart3,       label:'Reportes'     },
  { to:'/settings',   icon:Settings,        label:'Configuración'},
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, user, logout } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 flex flex-col transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5 animate-slideIn">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">ProducERP</p>
              <p className="text-slate-400 text-xs">v1.0</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
            <TrendingUp size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
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
              `sidebar-link ${isActive ? 'active' : 'text-slate-400 hover:text-white'}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="animate-slideIn">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`px-3 py-4 border-t border-slate-700/50 ${sidebarOpen ? '' : 'flex flex-col items-center gap-2'}`}>
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          {sidebarOpen && (
            <div className="animate-slideIn min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{user?.name ?? 'Administrador'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email ?? 'admin@empresa.com'}</p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {!sidebarOpen && (
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
