import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, address, city, created_at AS "createdAt",
              total_orders AS "totalOrders", total_spent::float AS "totalSpent", status
       FROM customers ORDER BY name`
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, name, email, phone, address, city, createdAt, totalOrders, totalSpent, status } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO customers (id, name, email, phone, address, city, created_at, total_orders, total_spent, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, name, email, phone, address, city, createdAt, totalOrders ?? 0, totalSpent ?? 0, status ?? 'active']
    )
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
