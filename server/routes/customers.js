import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, code, name, company, email, phone, city, segment,
              total_purchases::float AS "totalPurchases",
              to_char(last_purchase, 'YYYY-MM-DD') AS "lastPurchase",
              is_active AS "isActive"
       FROM customers ORDER BY name`
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, code, name, company, email, phone, city, segment,
          totalPurchases, lastPurchase, isActive } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO customers
         (id, code, name, company, email, phone, city, segment,
          total_purchases, last_purchase, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING
         id, code, name, company, email, phone, city, segment,
         total_purchases::float AS "totalPurchases",
         to_char(last_purchase, 'YYYY-MM-DD') AS "lastPurchase",
         is_active AS "isActive"`,
      [
        id, code ?? null, name, company ?? null, email ?? null,
        phone ?? null, city ?? null, segment ?? 'regular',
        totalPurchases ?? 0, lastPurchase ?? null, isActive ?? true,
      ]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
