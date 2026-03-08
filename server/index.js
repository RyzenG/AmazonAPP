import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import suppliesRouter       from './routes/supplies.js'
import productsRouter       from './routes/products.js'
import productionOrdersRouter from './routes/productionOrders.js'
import customersRouter      from './routes/customers.js'
import saleOrdersRouter     from './routes/saleOrders.js'
import recipesRouter        from './routes/recipes.js'
import settingsRouter       from './routes/settings.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' })) // limit amplio para logos base64

app.use('/api/supplies',          suppliesRouter)
app.use('/api/products',          productsRouter)
app.use('/api/production-orders', productionOrdersRouter)
app.use('/api/customers',         customersRouter)
app.use('/api/sale-orders',       saleOrdersRouter)
app.use('/api/recipes',           recipesRouter)
app.use('/api/settings',          settingsRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`✅ Servidor ERP corriendo en http://localhost:${PORT}`)
})
