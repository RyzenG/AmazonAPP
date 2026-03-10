import { create } from 'zustand'
import {
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

export interface CompanySettings {
  companyName: string
  slogan: string
  email: string
  phone: string
  address: string
  currency: string
  timezone: string
  logo: string | null
  // Invoice / factura fields
  bankName: string
  bankKey: string
  bankAccountType: string
  bankAccountNumber: string
  bankMessage: string
  tiktok: string
  whatsapp: string
  instagram: string
  instagramHandle: string
  // SMTP / email
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  smtpFrom: string
}

interface AppState {
  // Data
  supplies:         Supply[]
  products:         Product[]
  productionOrders: ProductionOrder[]
  customers:        Customer[]
  saleOrders:       SaleOrder[]
  recipes:          Recipe[]
  // Company settings
  companySettings:  CompanySettings
  // UI
  sidebarOpen: boolean
  darkMode:    boolean
  dataLoaded:  boolean
  // Auth
  isAuthenticated: boolean
  user: AuthUser | null
  // Notifications
  notifications: Notification[]
  // Actions – data loading
  loadAllData: () => Promise<void>
  // Actions – UI
  setSidebarOpen: (v: boolean) => void
  toggleDarkMode: () => void
  // Actions – auth
  login:  (user: AuthUser) => void
  logout: () => void
  // Actions – notifications
  addNotification:  (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead:       (id: string) => void
  markAllAsRead:    () => void
  clearNotifications: () => void
  // Actions – business data
  updateProductionOrderStatus: (id: string, status: ProductionOrder['status']) => void
  addSupply:    (s: Supply)    => Promise<void>
  updateSupply: (s: Supply)    => Promise<void>
  deleteSupply: (id: string)   => Promise<void>
  addProduct:   (p: Product)   => Promise<void>
  updateProduct:(p: Product)   => Promise<void>
  deleteProduct:(id: string)   => Promise<void>
  addCustomer:  (c: Customer)  => Promise<void>
  updateCustomer:(c: Customer) => Promise<void>
  deleteCustomer:(id: string)  => Promise<void>
  addSaleOrder: (o: SaleOrder) => Promise<void>
  updateSaleOrder: (o: SaleOrder) => Promise<void>
  deleteSaleOrder: (id: string) => Promise<void>
  addProductionOrder: (o: ProductionOrder) => Promise<void>
  deleteProductionOrder:(id: string) => Promise<void>
  addRecipe:    (r: Recipe)  => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
  // Actions – company settings
  saveCompanySettings: (s: CompanySettings) => Promise<void>
  // Actions – factory reset
  factoryReset: () => Promise<void>
}

// ── localStorage helpers (solo para auth, theme, notifications, logo) ────────

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch { return fallback }
}

function lsSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

const getAuth = (): { isAuthenticated: boolean; user: AuthUser | null } => {
  try {
    const raw = localStorage.getItem('erp_auth')
    if (!raw) return { isAuthenticated: false, user: null }
    return { isAuthenticated: true, user: JSON.parse(raw) }
  } catch { return { isAuthenticated: false, user: null } }
}

const getNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem('erp_notifications')
    if (!raw) return []
    return JSON.parse(raw).map((n: Notification) => ({ ...n, timestamp: new Date(n.timestamp) }))
  } catch { return [] }
}

const getDarkMode = (): boolean => localStorage.getItem('erp_theme') === 'dark'

if (getDarkMode()) document.documentElement.classList.add('dark')

// ── API helpers ──────────────────────────────────────────────────────────────

function getUserHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem('erp_auth')
    return raw ? { 'x-user': raw } : {}
  } catch { return {} }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...getUserHeader() },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

// ── Initial state ────────────────────────────────────────────────────────────

const initialAuth          = getAuth()
const initialNotifications = getNotifications()
const initialDark          = getDarkMode()

const defaultCompanySettings: CompanySettings = {
  companyName: 'Amazonia Concrete',
  slogan: 'Belleza natural en concreto',
  email: '',
  phone: '',
  address: '',
  currency: 'COP',
  timezone: 'America/Bogota',
  logo: lsGet<string | null>('erp_logo', null),
  bankName: 'Bancolombia',
  bankKey: '',
  bankAccountType: 'Cuenta Ahorros',
  bankAccountNumber: '',
  bankMessage: '',
  tiktok: '',
  whatsapp: '',
  instagram: '',
  instagramHandle: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
}

export const useStore = create<AppState>((set, get) => ({
  supplies:         [],
  products:         [],
  productionOrders: [],
  customers:        [],
  saleOrders:       [],
  recipes:          [],
  companySettings:  defaultCompanySettings,
  sidebarOpen:      true,
  darkMode:         initialDark,
  dataLoaded:       false,
  isAuthenticated:  initialAuth.isAuthenticated,
  user:             initialAuth.user,
  notifications:    initialNotifications,

  // ── Load all data from API ─────────────────────────────────────────────────
  loadAllData: async () => {
    if (get().dataLoaded) return
    try {
      const [supplies, products, productionOrders, customers, saleOrders, recipes, settings] =
        await Promise.all([
          apiFetch<Supply[]>('/api/supplies'),
          apiFetch<Product[]>('/api/products'),
          apiFetch<ProductionOrder[]>('/api/production-orders'),
          apiFetch<Customer[]>('/api/customers'),
          apiFetch<SaleOrder[]>('/api/sale-orders'),
          apiFetch<Recipe[]>('/api/recipes'),
          apiFetch<Partial<CompanySettings>>('/api/settings'),
        ])

      const companySettings: CompanySettings = {
        companyName:        settings.companyName        ?? defaultCompanySettings.companyName,
        slogan:             settings.slogan             ?? defaultCompanySettings.slogan,
        email:              settings.email              ?? defaultCompanySettings.email,
        phone:              settings.phone              ?? defaultCompanySettings.phone,
        address:            settings.address            ?? defaultCompanySettings.address,
        currency:           settings.currency           ?? defaultCompanySettings.currency,
        timezone:           settings.timezone           ?? defaultCompanySettings.timezone,
        logo:               settings.logo               ?? lsGet<string | null>('erp_logo', null),
        bankName:           settings.bankName           ?? defaultCompanySettings.bankName,
        bankKey:            settings.bankKey            ?? defaultCompanySettings.bankKey,
        bankAccountType:    settings.bankAccountType    ?? defaultCompanySettings.bankAccountType,
        bankAccountNumber:  settings.bankAccountNumber  ?? defaultCompanySettings.bankAccountNumber,
        bankMessage:        settings.bankMessage        ?? defaultCompanySettings.bankMessage,
        tiktok:             settings.tiktok             ?? defaultCompanySettings.tiktok,
        whatsapp:           settings.whatsapp           ?? defaultCompanySettings.whatsapp,
        instagram:          settings.instagram          ?? defaultCompanySettings.instagram,
        instagramHandle:    settings.instagramHandle    ?? defaultCompanySettings.instagramHandle,
        smtpHost:           settings.smtpHost           ?? defaultCompanySettings.smtpHost,
        smtpPort:           settings.smtpPort           ?? defaultCompanySettings.smtpPort,
        smtpUser:           settings.smtpUser           ?? defaultCompanySettings.smtpUser,
        smtpPass:           settings.smtpPass           ?? defaultCompanySettings.smtpPass,
        smtpFrom:           settings.smtpFrom           ?? defaultCompanySettings.smtpFrom,
      }

      set({ supplies, products, productionOrders, customers, saleOrders, recipes, companySettings, dataLoaded: true })
    } catch (e) {
      console.error('No se pudo conectar con el servidor:', e)
    }
  },

  // ── UI ─────────────────────────────────────────────────────────────────────
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

  // ── Auth ───────────────────────────────────────────────────────────────────
  login: (user) => {
    localStorage.setItem('erp_auth', JSON.stringify(user))
    set({ isAuthenticated: true, user })
  },

  logout: () => {
    localStorage.removeItem('erp_auth')
    set({ isAuthenticated: false, user: null, dataLoaded: false })
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  addNotification: (n) =>
    set((s) => {
      const notif: Notification = { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false }
      const updated = [notif, ...s.notifications]
      lsSet('erp_notifications', updated)
      return { notifications: updated }
    }),

  markAsRead: (id) =>
    set((s) => {
      const updated = s.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      lsSet('erp_notifications', updated)
      return { notifications: updated }
    }),

  markAllAsRead: () =>
    set((s) => {
      const updated = s.notifications.map((n) => ({ ...n, read: true }))
      lsSet('erp_notifications', updated)
      return { notifications: updated }
    }),

  clearNotifications: () => {
    localStorage.removeItem('erp_notifications')
    set({ notifications: [] })
  },

  // ── Business data mutations (via API) ──────────────────────────────────────
  updateProductionOrderStatus: async (id, status) => {
    await apiFetch(`/api/production-orders/${id}/status`, {
      method: 'PUT', body: JSON.stringify({ status }),
    })
    set((s) => ({
      productionOrders: s.productionOrders.map((o) => o.id === id ? { ...o, status } : o),
    }))
  },

  addSupply: async (supply) => {
    await apiFetch('/api/supplies', { method: 'POST', body: JSON.stringify(supply) })
    set((s) => ({ supplies: [...s.supplies, supply] }))
  },
  updateSupply: async (supply) => {
    await apiFetch(`/api/supplies/${supply.id}`, { method: 'PUT', body: JSON.stringify(supply) })
    set((s) => ({ supplies: s.supplies.map((x) => x.id === supply.id ? supply : x) }))
  },
  deleteSupply: async (id) => {
    await apiFetch(`/api/supplies/${id}`, { method: 'DELETE' })
    set((s) => ({ supplies: s.supplies.filter((x) => x.id !== id) }))
  },

  addProduct: async (product) => {
    await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(product) })
    set((s) => ({ products: [...s.products, product] }))
  },
  updateProduct: async (product) => {
    await apiFetch(`/api/products/${product.id}`, { method: 'PUT', body: JSON.stringify(product) })
    set((s) => ({ products: s.products.map((x) => x.id === product.id ? product : x) }))
  },
  deleteProduct: async (id) => {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
    set((s) => ({ products: s.products.filter((x) => x.id !== id) }))
  },

  addCustomer: async (customer) => {
    await apiFetch('/api/customers', { method: 'POST', body: JSON.stringify(customer) })
    set((s) => ({ customers: [...s.customers, customer] }))
  },
  updateCustomer: async (customer) => {
    await apiFetch(`/api/customers/${customer.id}`, { method: 'PUT', body: JSON.stringify(customer) })
    set((s) => ({ customers: s.customers.map((x) => x.id === customer.id ? customer : x) }))
  },
  deleteCustomer: async (id) => {
    await apiFetch(`/api/customers/${id}`, { method: 'DELETE' })
    set((s) => ({ customers: s.customers.filter((x) => x.id !== id) }))
  },

  addSaleOrder: async (order) => {
    await apiFetch('/api/sale-orders', { method: 'POST', body: JSON.stringify(order) })
    set((s) => ({ saleOrders: [...s.saleOrders, order] }))
  },
  updateSaleOrder: async (order) => {
    await apiFetch(`/api/sale-orders/${order.id}`, { method: 'PUT', body: JSON.stringify(order) })
    set((s) => ({ saleOrders: s.saleOrders.map((x) => x.id === order.id ? order : x) }))
  },
  deleteSaleOrder: async (id) => {
    await apiFetch(`/api/sale-orders/${id}`, { method: 'DELETE' })
    set((s) => ({ saleOrders: s.saleOrders.filter((x) => x.id !== id) }))
  },

  addProductionOrder: async (order) => {
    await apiFetch('/api/production-orders', { method: 'POST', body: JSON.stringify(order) })
    set((s) => ({ productionOrders: [...s.productionOrders, order] }))
  },
  deleteProductionOrder: async (id) => {
    await apiFetch(`/api/production-orders/${id}`, { method: 'DELETE' })
    set((s) => ({ productionOrders: s.productionOrders.filter((x) => x.id !== id) }))
  },

  addRecipe: async (recipe) => {
    await apiFetch('/api/recipes', { method: 'POST', body: JSON.stringify(recipe) })
    set((s) => ({ recipes: [...s.recipes, recipe] }))
  },
  deleteRecipe: async (id) => {
    await apiFetch(`/api/recipes/${id}`, { method: 'DELETE' })
    set((s) => ({ recipes: s.recipes.filter((x) => x.id !== id) }))
  },

  // ── Factory reset ──────────────────────────────────────────────────────────
  factoryReset: async () => {
    await apiFetch('/api/reset', { method: 'DELETE' })
    // Clear all localStorage keys used by the app
    ;['erp_auth', 'erp_notifications', 'erp_theme', 'erp_logo'].forEach((k) =>
      localStorage.removeItem(k)
    )
    // Reset store to blank state (keep page alive, logout will redirect)
    set({
      supplies: [], products: [], productionOrders: [],
      customers: [], saleOrders: [], recipes: [],
      companySettings: defaultCompanySettings,
      notifications: [],
      dataLoaded: false,
      isAuthenticated: false,
      user: null,
    })
  },

  // ── Company settings ───────────────────────────────────────────────────────
  saveCompanySettings: async (settings) => {
    await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(settings) })
    // logo también en localStorage para carga rápida antes de la API
    lsSet('erp_logo', settings.logo)
    set({ companySettings: settings })
  },
}))
