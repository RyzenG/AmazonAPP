import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, product_id AS "productId", product_name AS "productName",
              quantity::float, unit, status, start_date AS "startDate",
              end_date AS "endDate", notes
       FROM production_orders ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, productId, productName, quantity, unit, status, startDate, endDate, notes } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO production_orders (id, product_id, product_name, quantity, unit, status, start_date, end_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, productId, productName, quantity, unit, status ?? 'pending', startDate, endDate, notes]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id/status', async (req, res) => {
  const { status } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE production_orders SET status=$1 WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
