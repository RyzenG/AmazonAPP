import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useStore } from '../../store/useStore'

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

export default function Layout({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useStore()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
      >
        <Topbar title={titles[pathname]} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
