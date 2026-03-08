import { create } from 'zustand'
import {
  supplies as initSupplies, products as initProducts,
  productionOrders as initProdOrders, customers as initCustomers,
  saleOrders as initSaleOrders, recipes as initRecipes,
  Supply, Product, ProductionOrder, Customer, SaleOrder, Recipe,
} from '../data/mockData'

export interface Notification {
  id: string
  type: 'warning' | 'info' | 'success' | 'error'
  message: string
  timestamp: Date
  read: boolean
}

export interface AuthUser {
  name: string
  email: string
  role: string
}

interface AppState {
  // Data
  supplies:         Supply[]
  products:         Product[]
  productionOrders: ProductionOrder[]
  customers:        Customer[]
  saleOrders:       SaleOrder[]
  recipes:          Recipe[]
  // UI
  sidebarOpen: boolean
  darkMode:    boolean
  // Auth
  isAuthenticated: boolean
  user: AuthUser | null
  // Notifications
  notifications: Notification[]
  // Actions
  setSidebarOpen: (v: boolean) => void
  toggleDarkMode: () => void
  login:  (user: AuthUser) => void
  logout: () => void
  addNotification:  (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead:       (id: string) => void
  markAllAsRead:    () => void
  clearNotifications: () => void
  updateProductionOrderStatus: (id: string, status: ProductionOrder['status']) => void
  addSupply:    (s: Supply)    => void
  updateSupply: (s: Supply)    => void
  addProduct:   (p: Product)   => void
  updateProduct:(p: Product)   => void
  addCustomer:  (c: Customer)  => void
  addSaleOrder: (o: SaleOrder) => void
  updateSaleOrder: (o: SaleOrder) => void
  addProductionOrder: (o: ProductionOrder) => void
}

// Persist helpers
const getAuth = (): { isAuthenticated: boolean; user: AuthUser | null } => {
  try {
    const raw = localStorage.getItem('erp_auth')
    if (!raw) return { isAuthenticated: false, user: null }
    return { isAuthenticated: true, user: JSON.parse(raw) }
  } catch {
    return { isAuthenticated: false, user: null }
  }
}

const getNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem('erp_notifications')
    if (!raw) return []
    return JSON.parse(raw).map((n: Notification) => ({ ...n, timestamp: new Date(n.timestamp) }))
  } catch {
    return []
  }
}

const getDarkMode = (): boolean => {
  return localStorage.getItem('erp_theme') === 'dark'
}

// Apply dark class on initial load (before React renders)
if (getDarkMode()) document.documentElement.classList.add('dark')

// Generate initial business notifications from mock data
const buildInitialNotifications = (existing: Notification[]): Notification[] => {
  const existingIds = new Set(existing.map((n) => n.id))
  const auto: Notification[] = []

  initSupplies.forEach((s) => {
    const id = `lowstock_${s.id}`
    if (s.stock < s.minStock && !existingIds.has(id)) {
      auto.push({ id, type: 'warning', message: `Stock bajo: ${s.name} (${s.stock} ${s.unit}, mín ${s.minStock})`, timestamp: new Date(), read: false })
    }
  })

  const pending = initProdOrders.filter((o) => o.status === 'pending')
  const pendingId = 'pending_orders'
  if (pending.length > 0 && !existingIds.has(pendingId)) {
    auto.push({ id: pendingId, type: 'info', message: `${pending.length} órdenes de producción pendientes`, timestamp: new Date(), read: false })
  }

  return [...existing, ...auto]
}

const initialAuth = getAuth()
const initialNotifications = buildInitialNotifications(getNotifications())
const initialDark = getDarkMode()

export const useStore = create<AppState>((set) => ({
  supplies:         initSupplies,
  products:         initProducts,
  productionOrders: initProdOrders,
  customers:        initCustomers,
  saleOrders:       initSaleOrders,
  recipes:          initRecipes,
  sidebarOpen:      true,
  darkMode:         initialDark,
  isAuthenticated:  initialAuth.isAuthenticated,
  user:             initialAuth.user,
  notifications:    initialNotifications,

  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('erp_theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('erp_theme', 'light')
      }
      return { darkMode: next }
    }),

  login: (user) => {
    localStorage.setItem('erp_auth', JSON.stringify(user))
    set({ isAuthenticated: true, user })
  },

  logout: () => {
    localStorage.removeItem('erp_auth')
    set({ isAuthenticated: false, user: null })
  },

  addNotification: (n) =>
    set((s) => {
      const notif: Notification = { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false }
      const updated = [notif, ...s.notifications]
      localStorage.setItem('erp_notifications', JSON.stringify(updated))
      return { notifications: updated }
    }),

  markAsRead: (id) =>
    set((s) => {
      const updated = s.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem('erp_notifications', JSON.stringify(updated))
      return { notifications: updated }
    }),

  markAllAsRead: () =>
    set((s) => {
      const updated = s.notifications.map((n) => ({ ...n, read: true }))
      localStorage.setItem('erp_notifications', JSON.stringify(updated))
      return { notifications: updated }
    }),

  clearNotifications: () => {
    localStorage.removeItem('erp_notifications')
    set({ notifications: [] })
  },

  updateProductionOrderStatus: (id, status) =>
    set((s) => ({
      productionOrders: s.productionOrders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    })),

  addSupply:    (supply)    => set((s) => ({ supplies:  [...s.supplies,  supply]  })),
  updateSupply: (supply)    => set((s) => ({ supplies:  s.supplies.map((x) => x.id === supply.id ? supply : x) })),
  addProduct:   (product)   => set((s) => ({ products:  [...s.products,  product] })),
  updateProduct:(product)   => set((s) => ({ products:  s.products.map((x) => x.id === product.id ? product : x) })),
  addCustomer:  (customer)  => set((s) => ({ customers: [...s.customers, customer]})),
  addSaleOrder: (order)     => set((s) => ({ saleOrders:[...s.saleOrders, order]  })),
  updateSaleOrder:(order)   => set((s) => ({ saleOrders: s.saleOrders.map((x) => x.id === order.id ? order : x) })),
  addProductionOrder:(order)=> set((s) => ({ productionOrders:[...s.productionOrders, order] })),
}))
