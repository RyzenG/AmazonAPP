-- Insumos / Inventario
CREATE TABLE IF NOT EXISTS supplies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  stock       NUMERIC NOT NULL DEFAULT 0,
  min_stock   NUMERIC NOT NULL DEFAULT 0,
  unit        TEXT NOT NULL,
  cost        NUMERIC NOT NULL DEFAULT 0,
  supplier    TEXT,
  last_update DATE
);

-- Productos del catálogo
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       NUMERIC NOT NULL DEFAULT 0,
  cost        NUMERIC NOT NULL DEFAULT 0,
  stock       INTEGER NOT NULL DEFAULT 0,
  unit        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Recetas
CREATE TABLE IF NOT EXISTS recipes (
  id          TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL,
  product_name TEXT NOT NULL,
  yield       NUMERIC NOT NULL DEFAULT 1,
  yield_unit  TEXT NOT NULL,
  prep_time   INTEGER DEFAULT 0,
  notes       TEXT
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id          SERIAL PRIMARY KEY,
  recipe_id   TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  supply_id   TEXT NOT NULL,
  supply_name TEXT NOT NULL,
  quantity    NUMERIC NOT NULL,
  unit        TEXT NOT NULL
);

-- Clientes
CREATE TABLE IF NOT EXISTS customers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  created_at  DATE,
  total_orders INTEGER DEFAULT 0,
  total_spent  NUMERIC DEFAULT 0,
  status      TEXT DEFAULT 'active'
);

-- Órdenes de producción
CREATE TABLE IF NOT EXISTS production_orders (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  quantity      NUMERIC NOT NULL,
  unit          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  start_date    DATE,
  end_date      DATE,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Órdenes de venta
CREATE TABLE IF NOT EXISTS sale_orders (
  id            TEXT PRIMARY KEY,
  customer_id   TEXT,
  customer_name TEXT NOT NULL,
  date          DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  subtotal      NUMERIC DEFAULT 0,
  tax           NUMERIC DEFAULT 0,
  total         NUMERIC DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_order_items (
  id            SERIAL PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  quantity      NUMERIC NOT NULL,
  unit_price    NUMERIC NOT NULL,
  subtotal      NUMERIC NOT NULL
);

-- Configuración de empresa
CREATE TABLE IF NOT EXISTS settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  company_name  TEXT DEFAULT 'Amazonia Concrete',
  slogan        TEXT DEFAULT '',
  email         TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  currency      TEXT DEFAULT 'COP',
  timezone      TEXT DEFAULT 'America/Bogota',
  logo          TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;
