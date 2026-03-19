import { Router } from 'express'
import { pool } from '../db.js'
import { log, getUser } from '../audit.js'
import crypto from 'crypto'

const router = Router()

// ── Column alias maps ────────────────────────────────────────────────────────

const SUPPLY_ALIASES = {
  name: ['name', 'nombre', 'insumo'],
  sku: ['sku', 'código', 'codigo', 'code'],
  category: ['category', 'categoría', 'categoria'],
  unit: ['unit', 'unidad'],
  stock: ['stock', 'cantidad', 'qty'],
  minStock: ['minstock', 'min_stock', 'stock_minimo', 'stock_mínimo', 'mínimo', 'minimo'],
  cost: ['cost', 'costo', 'precio_costo'],
  supplier: ['supplier', 'proveedor'],
}

const PRODUCT_ALIASES = {
  name: ['name', 'nombre', 'producto'],
  sku: ['sku', 'código', 'codigo', 'code'],
  category: ['category', 'categoría', 'categoria'],
  unit: ['unit', 'unidad'],
  price: ['price', 'precio', 'precio_venta'],
  cost: ['cost', 'costo', 'precio_costo'],
  stock: ['stock', 'cantidad', 'qty'],
  description: ['description', 'descripción', 'descripcion'],
  isActive: ['isactive', 'is_active', 'activo', 'active'],
}

const CUSTOMER_ALIASES = {
  name: ['name', 'nombre', 'cliente'],
  code: ['code', 'código', 'codigo'],
  company: ['company', 'empresa'],
  email: ['email', 'correo', 'correo_electrónico'],
  phone: ['phone', 'teléfono', 'telefono', 'celular'],
  city: ['city', 'ciudad'],
  segment: ['segment', 'segmento'],
  notes: ['notes', 'notas', 'observaciones'],
}

/**
 * Given a row object and an alias map, returns a normalised record.
 */
function mapRow(row, aliasMap) {
  const mapped = {}
  const lowerKeys = {}
  for (const k of Object.keys(row)) {
    lowerKeys[k.toLowerCase().trim()] = k
  }
  for (const [field, aliases] of Object.entries(aliasMap)) {
    for (const alias of aliases) {
      const originalKey = lowerKeys[alias.toLowerCase()]
      if (originalKey !== undefined && row[originalKey] !== undefined && row[originalKey] !== '') {
        mapped[field] = row[originalKey]
        break
      }
    }
  }
  return mapped
}

function generateId() {
  return crypto.randomUUID()
}

// ── POST /api/import/supplies ────────────────────────────────────────────────

router.post('/supplies', async (req, res) => {
  const { rows } = req.body
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ imported: 0, errors: ['No se recibieron filas para importar'] })
  }

  const errors = []
  let imported = 0
  const u = getUser(req)

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const m = mapRow(raw, SUPPLY_ALIASES)
    if (!m.name) {
      errors.push(`Fila ${i + 1}: campo "name" (nombre) es requerido`)
      continue
    }
    try {
      const id = m.id || generateId()
      await pool.query(
        `INSERT INTO supplies (id, sku, name, category, stock, min_stock, unit, cost, supplier)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           sku = EXCLUDED.sku,
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           stock = EXCLUDED.stock,
           min_stock = EXCLUDED.min_stock,
           unit = EXCLUDED.unit,
           cost = EXCLUDED.cost,
           supplier = EXCLUDED.supplier`,
        [
          id,
          m.sku ?? `INS-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
          m.name,
          m.category ?? '',
          parseFloat(m.stock) || 0,
          parseFloat(m.minStock) || 0,
          m.unit ?? 'u',
          parseFloat(m.cost) || 0,
          m.supplier ?? '',
        ]
      )
      imported++
    } catch (e) {
      errors.push(`Fila ${i + 1} (${m.name}): ${e.message}`)
    }
  }

  await log({
    userName: u.name, userEmail: u.email,
    action: 'importar', entity: 'Insumos',
    details: `Importados: ${imported}, Errores: ${errors.length}`,
  })

  res.json({ imported, errors })
})

// ── POST /api/import/products ────────────────────────────────────────────────

router.post('/products', async (req, res) => {
  const { rows } = req.body
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ imported: 0, errors: ['No se recibieron filas para importar'] })
  }

  const errors = []
  let imported = 0
  const u = getUser(req)

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const m = mapRow(raw, PRODUCT_ALIASES)
    if (!m.name) {
      errors.push(`Fila ${i + 1}: campo "name" (nombre) es requerido`)
      continue
    }
    try {
      const id = m.id || generateId()
      const isActive = m.isActive === undefined ? true
        : typeof m.isActive === 'string'
          ? ['true', '1', 'si', 'sí', 'yes', 'activo'].includes(m.isActive.toLowerCase())
          : Boolean(m.isActive)
      await pool.query(
        `INSERT INTO products (id, sku, name, category, price, cost, stock, unit, description, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           sku = EXCLUDED.sku,
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           price = EXCLUDED.price,
           cost = EXCLUDED.cost,
           stock = EXCLUDED.stock,
           unit = EXCLUDED.unit,
           description = EXCLUDED.description,
           is_active = EXCLUDED.is_active`,
        [
          id,
          m.sku ?? '',
          m.name,
          m.category ?? '',
          parseFloat(m.price) || 0,
          parseFloat(m.cost) || 0,
          parseFloat(m.stock) || 0,
          m.unit ?? 'u',
          m.description ?? '',
          isActive,
        ]
      )
      imported++
    } catch (e) {
      errors.push(`Fila ${i + 1} (${m.name}): ${e.message}`)
    }
  }

  await log({
    userName: u.name, userEmail: u.email,
    action: 'importar', entity: 'Productos',
    details: `Importados: ${imported}, Errores: ${errors.length}`,
  })

  res.json({ imported, errors })
})

// ── POST /api/import/customers ───────────────────────────────────────────────

router.post('/customers', async (req, res) => {
  const { rows } = req.body
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ imported: 0, errors: ['No se recibieron filas para importar'] })
  }

  const errors = []
  let imported = 0
  const u = getUser(req)

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const m = mapRow(raw, CUSTOMER_ALIASES)
    if (!m.name) {
      errors.push(`Fila ${i + 1}: campo "name" (nombre) es requerido`)
      continue
    }
    try {
      const id = m.id || generateId()
      await pool.query(
        `INSERT INTO customers (id, code, name, company, email, phone, city, segment, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           code = EXCLUDED.code,
           name = EXCLUDED.name,
           company = EXCLUDED.company,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           city = EXCLUDED.city,
           segment = EXCLUDED.segment,
           notes = EXCLUDED.notes`,
        [
          id,
          m.code ?? null,
          m.name,
          m.company ?? null,
          m.email ?? null,
          m.phone ?? null,
          m.city ?? null,
          m.segment ?? 'regular',
          m.notes ?? null,
        ]
      )
      imported++
    } catch (e) {
      errors.push(`Fila ${i + 1} (${m.name}): ${e.message}`)
    }
  }

  await log({
    userName: u.name, userEmail: u.email,
    action: 'importar', entity: 'Clientes',
    details: `Importados: ${imported}, Errores: ${errors.length}`,
  })

  res.json({ imported, errors })
})

export default router
