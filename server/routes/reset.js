import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// DELETE /api/reset  – wipes all business data and settings
router.delete('/', async (req, res) => {
  try {
    await pool.query(`
      TRUNCATE TABLE
        supplies,
        products,
        production_orders,
        customers,
        sale_orders,
        recipes,
        settings
      RESTART IDENTITY CASCADE
    `)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
