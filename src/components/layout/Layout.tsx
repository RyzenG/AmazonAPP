import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '../../store/useStore'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { useSessionTimeout }    from '../../hooks/useSessionTimeout'
import InstallPWA from '../InstallPWA'

const titles: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/inventory':  'Inventario',
  '/production': 'Producción',
  '/sales':      'Ventas',
  '/crm':        'Clientes — CRM',
  '/reports':    'Reportes y Analítica',
  '/catalog':    'Catálogo de Productos',
  '/settings':   'Configuración',
}

export default function Layout() {
  const { sidebarOpen } = useStore()
  const { pathname } = useLocation()
  usePushNotifications()
  useSessionTimeout()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
      >
        <Topbar title={titles[pathname]} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
      <InstallPWA />
    </div>
  )
}
