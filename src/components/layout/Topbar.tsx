import { Bell, Search, AlertTriangle, Info, CheckCircle, XCircle, Sun, Moon, Check, Trash2, LogOut } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

function UserAvatar({ name, size = 32, className = '' }: { name: string; size?: number; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  // Deterministic color from name
  const colors = ['bg-emerald-500','bg-blue-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-teal-500','bg-pink-500','bg-indigo-500']
  const color  = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      className={`${color} ${className} rounded-full flex items-center justify-center text-white font-bold select-none`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {initials}
    </div>
  )
}

export { UserAvatar }

const typeIcon = {
  warning: <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />,
  info:    <Info          size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />,
  success: <CheckCircle  size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
  error:   <XCircle      size={14} className="text-red-500 flex-shrink-0 mt-0.5" />,
}

export default function Topbar({ title }: { title?: string }) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, darkMode, toggleDarkMode, user, logout } = useStore()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser]   = useState(false)
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-slate-200 dark:border-gray-600 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-amazonia-600 focus:border-transparent"
            placeholder="Buscar producto, cliente, orden..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode
            ? <Sun  size={16} className="text-amber-400" />
            : <Moon size={16} className="text-slate-600" />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-lg bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Bell size={16} className="text-slate-600 dark:text-slate-300" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-xl z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-800 dark:text-gray-100">
                  Notificaciones {unread > 0 && <span className="text-amazonia-600 dark:text-amazonia-400">({unread})</span>}
                </p>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-amazonia-600 dark:text-amazonia-400 hover:underline flex items-center gap-1"
                      title="Marcar todo como leído"
                    >
                      <Check size={12} /> Leído
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                      title="Limpiar todo"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-gray-700 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-gray-500 text-center py-6">No hay notificaciones</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${
                        n.read ? 'opacity-50' : ''
                      }`}
                    >
                      {typeIcon[n.type]}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-700 dark:text-gray-300 leading-snug">{n.message}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                          {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: es })}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 bg-amazonia-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 dark:border-gray-700">
                <button
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowNotif(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="hidden md:block text-right ml-1">
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* User avatar + dropdown */}
        {user && (
          <div className="relative ml-2">
            <button onClick={() => setShowUser(!showUser)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
              <UserAvatar name={user.name} size={32} />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-gray-200 leading-tight">{user.name.split(' ')[0]}</p>
                <p className="text-xs text-slate-400 dark:text-gray-500 leading-tight">{user.role}</p>
              </div>
            </button>

            {showUser && (
              <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-xl z-50 animate-fadeIn overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-700 flex items-center gap-3">
                  <UserAvatar name={user.name} size={36} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={15} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
