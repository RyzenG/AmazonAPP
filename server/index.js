import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { pool } from './db.js'
import usersRouter          from './routes/users.js'
import emailRouter          from './routes/email.js'
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
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes           TEXT;
      ALTER TABLE sale_orders ADD COLUMN IF NOT EXISTS order_number   TEXT;
      ALTER TABLE sale_orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';
      ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS cost NUMERIC NOT NULL DEFAULT 0;
      ALTER TABLE supplies ADD COLUMN IF NOT EXISTS sku TEXT;
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_name          TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_key           TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_account_type  TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_account_number TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_message       TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS tiktok             TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp           TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS instagram          TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS instagram_handle   TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_host     TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_port     INTEGER DEFAULT 587;
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_user     TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_pass     TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_from          TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS resend_api_key     TEXT DEFAULT '';
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS invoice_prefix     TEXT DEFAULT 'VTA';
      ALTER TABLE products   ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
      ALTER TABLE products   ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
      ALTER TABLE products   ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
      ALTER TABLE products   ADD COLUMN IF NOT EXISTS recipe_id TEXT DEFAULT '';
      ALTER TABLE products   ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';
      CREATE TABLE IF NOT EXISTS users (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL UNIQUE,
        password   TEXT NOT NULL,
        role       TEXT NOT NULL DEFAULT 'Ventas',
        is_active  BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
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
    // Seed default admin if no users exist
    const { rowCount } = await pool.query('SELECT 1 FROM users LIMIT 1')
    if (rowCount === 0) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role, is_active)
         VALUES ('u1','Admin General','admin@empresa.com','admin123','Administrador',true),
                ('u2','María García','maria@empresa.com','maria123','Producción',true),
                ('u3','Carlos López','carlos@empresa.com','carlos123','Producción',true),
                ('u4','Ana Ramos','ana@empresa.com','ana123','Ventas',true),
                ('u5','Roberto Méndez','roberto@empresa.com','roberto123','Inventario',false)
         ON CONFLICT (id) DO NOTHING`
      )
      console.log('✅ Default users seeded')
    }
    console.log('✅ Migrations OK')
  } catch (e) {
    console.error('⚠️  Migration error:', e.message)
  }
}
migrate()

app.use(cors())
app.use(express.json({ limit: '50mb' })) // limit amplio para logos y PDF base64

app.use('/api/users',             usersRouter)
app.use('/api/email',             emailRouter)
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
