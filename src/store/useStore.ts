import { create } from 'zustand'
import {
  supplies as initSupplies, products as initProducts,
  productionOrders as initProdOrders, customers as initCustomers,
  saleOrders as initSaleOrders, recipes as initRecipes,
  Supply, Product, ProductionOrder, Customer, SaleOrder, Recipe,
} from '../data/mockData'

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
  // Actions
  setSidebarOpen: (v: boolean) => void
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

export const useStore = create<AppState>((set) => ({
  supplies:         initSupplies,
  products:         initProducts,
  productionOrders: initProdOrders,
  customers:        initCustomers,
  saleOrders:       initSaleOrders,
  recipes:          initRecipes,
  sidebarOpen:      true,

  setSidebarOpen: (v) => set({ sidebarOpen: v }),

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
