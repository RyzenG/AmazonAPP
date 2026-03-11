// ──────────────────────────────────────────────
//  MOCK DATA — ERP Producción
// ──────────────────────────────────────────────

export interface Supply {
  id: string; sku: string; name: string; category: string
  unit: string; stock: number; minStock: number; cost: number
  supplier?: string
}

export interface Product {
  id: string; sku: string; name: string; category: string
  unit: string; stock: number; price: number; cost: number
  isActive: boolean; recipeId?: string; image?: string; description?: string
}

export interface Recipe {
  id: string; name: string; productId: string
  yieldQty: number; yieldUnit: string
  ingredients: { supplyId: string; supplyName: string; qty: number; unit: string; cost: number }[]
  totalCost: number; costPerUnit: number
}

export interface ProductionOrder {
  id: string; orderNumber: string; recipe: string; product: string; recipeId?: string
  plannedQty: number; actualQty?: number; status: 'pending' | 'in_progress' | 'finished' | 'cancelled'
  priority: 1|2|3|4|5; plannedStart: string; plannedEnd: string
  estimatedCost: number; actualCost?: number; assignedTo: string
}

export interface Customer {
  id: string; code: string; name: string; company?: string
  email: string; phone: string; city: string; segment: string
  totalPurchases: number; lastPurchase: string; isActive: boolean
  notes?: string
}

export interface SaleOrder {
  id: string; orderNumber: string; customer: string; customerId: string
  items: { product: string; qty: number; price: number; subtotal: number }[]
  subtotal: number; tax: number; total: number; status: string
  paymentStatus: string; paymentMethod: string; date: string; deliveryDate?: string
  notes?: string
}

// ── Supplies ────────────────────────────────
export const supplies: Supply[] = [
  { id:'s1', sku:'INS-001', name:'Harina de trigo',    category:'Harinas',     unit:'kg',  stock:45,  minStock:20, cost:1.20, supplier:'Molinos SA' },
  { id:'s2', sku:'INS-002', name:'Azúcar blanca',      category:'Azúcares',    unit:'kg',  stock:32,  minStock:15, cost:0.90, supplier:'Dulcería Norte' },
  { id:'s3', sku:'INS-003', name:'Mantequilla',        category:'Lácteos',     unit:'kg',  stock:8,   minStock:10, cost:4.50, supplier:'Lácteos del Sur' },
  { id:'s4', sku:'INS-004', name:'Huevos',             category:'Proteínas',   unit:'u',   stock:120, minStock:50, cost:0.18, supplier:'Granja El Sol' },
  { id:'s5', sku:'INS-005', name:'Leche entera',       category:'Lácteos',     unit:'L',   stock:20,  minStock:10, cost:1.10, supplier:'Lácteos del Sur' },
  { id:'s6', sku:'INS-006', name:'Cacao en polvo',     category:'Saborizantes',unit:'kg',  stock:5,   minStock:8,  cost:6.80, supplier:'CacaoShop' },
  { id:'s7', sku:'INS-007', name:'Levadura seca',      category:'Leudantes',   unit:'kg',  stock:3,   minStock:2,  cost:8.50, supplier:'BioLev' },
  { id:'s8', sku:'INS-008', name:'Vainilla líquida',   category:'Saborizantes',unit:'mL',  stock:500, minStock:200,cost:0.03, supplier:'AromaShop' },
  { id:'s9', sku:'INS-009', name:'Sal fina',           category:'Condimentos', unit:'kg',  stock:12,  minStock:5,  cost:0.40, supplier:'Salinera' },
  { id:'s10',sku:'INS-010', name:'Aceite vegetal',     category:'Aceites',     unit:'L',   stock:15,  minStock:8,  cost:2.20, supplier:'AceitesPro' },
]

// ── Products ─────────────────────────────────
export const products: Product[] = [
  { id:'p1', sku:'PRD-001', name:'Torta de chocolate',  category:'Tortas',   unit:'u',  stock:12, price:28.00, cost:11.20, isActive:true,  recipeId:'r1' },
  { id:'p2', sku:'PRD-002', name:'Torta de vainilla',   category:'Tortas',   unit:'u',  stock:8,  price:25.00, cost:9.80,  isActive:true,  recipeId:'r2' },
  { id:'p3', sku:'PRD-003', name:'Pan brioche (x12)',   category:'Panes',    unit:'doc',stock:6,  price:18.00, cost:6.40,  isActive:true,  recipeId:'r3' },
  { id:'p4', sku:'PRD-004', name:'Galletas mantequilla',category:'Galletas', unit:'kg', stock:14, price:12.00, cost:4.20,  isActive:true,  recipeId:'r4' },
  { id:'p5', sku:'PRD-005', name:'Muffins de arándano', category:'Muffins',  unit:'u',  stock:24, price:3.50,  cost:1.10,  isActive:true,  recipeId:'r5' },
  { id:'p6', sku:'PRD-006', name:'Croissant artesanal', category:'Panes',    unit:'u',  stock:18, price:4.50,  cost:1.80,  isActive:true  },
  { id:'p7', sku:'PRD-007', name:'Cheesecake NY',       category:'Tortas',   unit:'u',  stock:4,  price:32.00, cost:14.00, isActive:true  },
]

// ── Recipes ───────────────────────────────────
export const recipes: Recipe[] = [
  {
    id:'r1', name:'Torta de chocolate (1u)', productId:'p1',
    yieldQty:1, yieldUnit:'u',
    ingredients:[
      { supplyId:'s1', supplyName:'Harina de trigo',  qty:0.4, unit:'kg', cost:0.48 },
      { supplyId:'s2', supplyName:'Azúcar blanca',    qty:0.3, unit:'kg', cost:0.27 },
      { supplyId:'s3', supplyName:'Mantequilla',      qty:0.2, unit:'kg', cost:0.90 },
      { supplyId:'s4', supplyName:'Huevos',           qty:4,   unit:'u',  cost:0.72 },
      { supplyId:'s6', supplyName:'Cacao en polvo',   qty:0.1, unit:'kg', cost:0.68 },
      { supplyId:'s5', supplyName:'Leche entera',     qty:0.2, unit:'L',  cost:0.22 },
    ],
    totalCost:3.27, costPerUnit:3.27,
  },
  {
    id:'r2', name:'Torta de vainilla (1u)', productId:'p2',
    yieldQty:1, yieldUnit:'u',
    ingredients:[
      { supplyId:'s1', supplyName:'Harina de trigo',  qty:0.4, unit:'kg', cost:0.48 },
      { supplyId:'s2', supplyName:'Azúcar blanca',    qty:0.25,unit:'kg', cost:0.23 },
      { supplyId:'s3', supplyName:'Mantequilla',      qty:0.18,unit:'kg', cost:0.81 },
      { supplyId:'s4', supplyName:'Huevos',           qty:3,   unit:'u',  cost:0.54 },
      { supplyId:'s8', supplyName:'Vainilla líquida', qty:10,  unit:'mL', cost:0.30 },
    ],
    totalCost:2.36, costPerUnit:2.36,
  },
  {
    id:'r3', name:'Pan brioche (12 u)', productId:'p3',
    yieldQty:12, yieldUnit:'u',
    ingredients:[
      { supplyId:'s1', supplyName:'Harina de trigo', qty:0.5, unit:'kg', cost:0.60 },
      { supplyId:'s3', supplyName:'Mantequilla',     qty:0.1, unit:'kg', cost:0.45 },
      { supplyId:'s4', supplyName:'Huevos',          qty:2,   unit:'u',  cost:0.36 },
      { supplyId:'s7', supplyName:'Levadura seca',   qty:0.01,unit:'kg', cost:0.09 },
      { supplyId:'s5', supplyName:'Leche entera',    qty:0.1, unit:'L',  cost:0.11 },
    ],
    totalCost:1.61, costPerUnit:0.13,
  },
]

// ── Production Orders ─────────────────────────
export const productionOrders: ProductionOrder[] = [
  { id:'po1', orderNumber:'OP-2024-001', recipe:'Torta de chocolate (1u)', product:'Torta de chocolate', plannedQty:20, actualQty:20, status:'finished',    priority:2, plannedStart:'2024-11-01 08:00', plannedEnd:'2024-11-01 12:00', estimatedCost:65.4, actualCost:63.2, assignedTo:'María García' },
  { id:'po2', orderNumber:'OP-2024-002', recipe:'Pan brioche (12 u)',      product:'Pan brioche (x12)',   plannedQty:15, actualQty:14, status:'finished',    priority:3, plannedStart:'2024-11-02 07:00', plannedEnd:'2024-11-02 10:00', estimatedCost:24.2, actualCost:22.5, assignedTo:'Carlos López' },
  { id:'po3', orderNumber:'OP-2024-003', recipe:'Torta de vainilla (1u)',  product:'Torta de vainilla',  plannedQty:10, status:'in_progress', priority:1,  plannedStart:'2024-11-08 08:00', plannedEnd:'2024-11-08 14:00', estimatedCost:23.6, assignedTo:'María García' },
  { id:'po4', orderNumber:'OP-2024-004', recipe:'Torta de chocolate (1u)', product:'Torta de chocolate', plannedQty:25, status:'pending',     priority:2,  plannedStart:'2024-11-09 08:00', plannedEnd:'2024-11-09 15:00', estimatedCost:81.8, assignedTo:'Carlos López' },
  { id:'po5', orderNumber:'OP-2024-005', recipe:'Pan brioche (12 u)',      product:'Pan brioche (x12)',   plannedQty:20, status:'pending',     priority:3,  plannedStart:'2024-11-10 07:00', plannedEnd:'2024-11-10 11:00', estimatedCost:32.2, assignedTo:'Ana Ramos' },
]

// ── Customers ────────────────────────────────
export const customers: Customer[] = [
  { id:'c1', code:'CLI-001', name:'Laura Martínez',   company:'Eventos Laura',    email:'laura@eventos.com',   phone:'+57 310 1234567', city:'Bogotá',    segment:'vip',     totalPurchases:4850, lastPurchase:'2024-11-07', isActive:true },
  { id:'c2', code:'CLI-002', name:'Pedro Sánchez',    company:'Cafetería Central',email:'pedro@cafeteria.com', phone:'+57 311 2345678', city:'Medellín',  segment:'mayorista',totalPurchases:9200, lastPurchase:'2024-11-06', isActive:true },
  { id:'c3', code:'CLI-003', name:'Valentina Ríos',   company:undefined,          email:'vale@gmail.com',      phone:'+57 312 3456789', city:'Cali',      segment:'regular', totalPurchases:1200, lastPurchase:'2024-10-28', isActive:true },
  { id:'c4', code:'CLI-004', name:'Andrés Torres',    company:'Panadería El Pan', email:'andres@elpan.com',    phone:'+57 313 4567890', city:'Bogotá',    segment:'mayorista',totalPurchases:6700, lastPurchase:'2024-11-05', isActive:true },
  { id:'c5', code:'CLI-005', name:'Sofía Herrera',    company:undefined,          email:'sofia@outlook.com',   phone:'+57 314 5678901', city:'Barranquilla',segment:'regular',totalPurchases:850,  lastPurchase:'2024-10-15', isActive:true },
  { id:'c6', code:'CLI-006', name:'Martín Castillo',  company:'Hotel Plaza',      email:'mcastillo@hotel.com', phone:'+57 315 6789012', city:'Cartagena', segment:'vip',     totalPurchases:3400, lastPurchase:'2024-11-02', isActive:true },
]

// ── Sales Orders ──────────────────────────────
export const saleOrders: SaleOrder[] = [
  { id:'so1', orderNumber:'VTA-2024-001', customer:'Laura Martínez',  customerId:'c1', items:[{product:'Torta de chocolate',qty:5,price:28,subtotal:140},{product:'Torta de vainilla',qty:3,price:25,subtotal:75}], subtotal:215,  tax:34.4,  total:249.4,  status:'delivered', paymentStatus:'paid',    paymentMethod:'Transferencia', date:'2024-11-07', deliveryDate:'2024-11-07' },
  { id:'so2', orderNumber:'VTA-2024-002', customer:'Pedro Sánchez',   customerId:'c2', items:[{product:'Pan brioche (x12)',qty:10,price:18,subtotal:180},{product:'Galletas mantequilla',qty:5,price:12,subtotal:60}], subtotal:240, tax:38.4,  total:278.4,  status:'processing',paymentStatus:'partial',  paymentMethod:'Efectivo',      date:'2024-11-07', deliveryDate:'2024-11-09' },
  { id:'so3', orderNumber:'VTA-2024-003', customer:'Valentina Ríos',  customerId:'c3', items:[{product:'Muffins de arándano',qty:12,price:3.5,subtotal:42}], subtotal:42, tax:6.72, total:48.72, status:'confirmed', paymentStatus:'paid',    paymentMethod:'Tarjeta',       date:'2024-11-06' },
  { id:'so4', orderNumber:'VTA-2024-004', customer:'Andrés Torres',   customerId:'c4', items:[{product:'Croissant artesanal',qty:24,price:4.5,subtotal:108},{product:'Pan brioche (x12)',qty:8,price:18,subtotal:144}], subtotal:252,tax:40.32, total:292.32, status:'pending',   paymentStatus:'pending', paymentMethod:'Transferencia', date:'2024-11-08', deliveryDate:'2024-11-11' },
  { id:'so5', orderNumber:'VTA-2024-005', customer:'Martín Castillo', customerId:'c6', items:[{product:'Cheesecake NY',qty:3,price:32,subtotal:96},{product:'Torta de chocolate',qty:2,price:28,subtotal:56}], subtotal:152,tax:24.32, total:176.32, status:'confirmed', paymentStatus:'paid',    paymentMethod:'Tarjeta',       date:'2024-11-05', deliveryDate:'2024-11-08' },
  { id:'so6', orderNumber:'VTA-2024-006', customer:'Sofía Herrera',   customerId:'c5', items:[{product:'Galletas mantequilla',qty:2,price:12,subtotal:24}], subtotal:24, tax:3.84, total:27.84,  status:'delivered', paymentStatus:'paid',    paymentMethod:'Efectivo',      date:'2024-11-04' },
]

// ── Sales chart data (last 30 days) ───────────
export const salesChartData = [
  {day:'01/10',ventas:480, meta:500},{day:'02/10',ventas:620,meta:500},{day:'03/10',ventas:390,meta:500},
  {day:'04/10',ventas:710,meta:500},{day:'05/10',ventas:850,meta:500},{day:'06/10',ventas:920,meta:500},
  {day:'07/10',ventas:680,meta:500},{day:'08/10',ventas:540,meta:500},{day:'09/10',ventas:760,meta:500},
  {day:'10/10',ventas:890,meta:500},{day:'11/10',ventas:1020,meta:500},{day:'12/10',ventas:780,meta:500},
  {day:'13/10',ventas:640,meta:500},{day:'14/10',ventas:550,meta:500},{day:'15/10',ventas:920,meta:500},
  {day:'16/10',ventas:1100,meta:500},{day:'17/10',ventas:980,meta:500},{day:'18/10',ventas:870,meta:500},
  {day:'19/10',ventas:740,meta:500},{day:'20/10',ventas:660,meta:500},{day:'21/10',ventas:810,meta:500},
  {day:'22/10',ventas:950,meta:500},{day:'23/10',ventas:1200,meta:500},{day:'24/10',ventas:1050,meta:500},
  {day:'25/10',ventas:880,meta:500},{day:'26/10',ventas:720,meta:500},{day:'27/10',ventas:990,meta:500},
  {day:'28/10',ventas:1150,meta:500},{day:'29/10',ventas:1300,meta:500},{day:'30/10',ventas:1420,meta:500},
]

export const topProductsData = [
  { name:'Torta chocolate', ventas:142 },
  { name:'Pan brioche',     ventas:118 },
  { name:'Torta vainilla',  ventas:96  },
  { name:'Croissant',       ventas:85  },
  { name:'Muffins',         ventas:74  },
]

export const productionByMonth = [
  {month:'Ago', unidades:380},{month:'Sep', unidades:420},{month:'Oct', unidades:465},
  {month:'Nov', unidades:510},{month:'Dic', unidades:0},
]

export const revenueByCategory = [
  {name:'Tortas',   value:38},{name:'Panes',value:27},
  {name:'Galletas', value:18},{name:'Muffins',value:11},{name:'Otros',value:6},
]
