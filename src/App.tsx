import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Production from './pages/Production'
import Sales from './pages/Sales'
import CRM from './pages/CRM'
import Reports from './pages/Reports'
import Catalog from './pages/Catalog'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/inventory"   element={<Inventory />} />
          <Route path="/production"  element={<Production />} />
          <Route path="/sales"       element={<Sales />} />
          <Route path="/crm"         element={<CRM />} />
          <Route path="/reports"     element={<Reports />} />
          <Route path="/catalog"     element={<Catalog />} />
          <Route path="/settings"    element={<Settings />} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
