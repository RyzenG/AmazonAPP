import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { pool } from './db.js'
import suppliesRouter       from './routes/supplies.js'
import productsRouter       from './routes/products.js'
import productionOrdersRouter from './routes/productionOrders.js'
import customersRouter      from './routes/customers.js'
import saleOrdersRouter     from './routes/saleOrders.js'
import recipesRouter        from './routes/recipes.js'
import settingsRouter       from './routes/settings.js'
import resetRouter          from './routes/reset.js'
import auditLogRouter       from './routes/auditLog.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ── Run DB migrations on startup ───────────────────────────────────────────
async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS code            TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS company         TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS segment         TEXT DEFAULT 'regular';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchases NUMERIC DEFAULT 0;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_purchase   DATE;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active       BOOLEAN DEFAULT TRUE;
      CREATE TABLE IF NOT EXISTS audit_log (
        id          SERIAL PRIMARY KEY,
        user_name   TEXT NOT NULL DEFAULT 'Sistema',
        user_email  TEXT NOT NULL DEFAULT '',
        action      TEXT NOT NULL,
        entity      TEXT NOT NULL,
        entity_id   TEXT,
        entity_name TEXT,
        details     TEXT,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('✅ Migrations OK')
  } catch (e) {
    console.error('⚠️  Migration error:', e.message)
  }
}
migrate()

app.use(cors())
app.use(express.json({ limit: '10mb' })) // limit amplio para logos base64

app.use('/api/supplies',          suppliesRouter)
app.use('/api/products',          productsRouter)
app.use('/api/production-orders', productionOrdersRouter)
app.use('/api/customers',         customersRouter)
app.use('/api/sale-orders',       saleOrdersRouter)
app.use('/api/recipes',           recipesRouter)
app.use('/api/settings',          settingsRouter)
app.use('/api/reset',             resetRouter)
app.use('/api/audit',             auditLogRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`✅ Servidor ERP corriendo en http://localhost:${PORT}`)
})
