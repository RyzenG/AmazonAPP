import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, category, stock::float, min_stock::float AS "minStock", unit, cost::float, supplier, last_update AS "lastUpdate" FROM supplies ORDER BY name'
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, name, category, stock, minStock, unit, cost, supplier, lastUpdate } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO supplies (id, name, category, stock, min_stock, unit, cost, supplier, last_update)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, name, category, stock, minStock, unit, cost, supplier, lastUpdate]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', async (req, res) => {
  const { name, category, stock, minStock, unit, cost, supplier, lastUpdate } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE supplies SET name=$1, category=$2, stock=$3, min_stock=$4, unit=$5, cost=$6, supplier=$7, last_update=$8
       WHERE id=$9 RETURNING *`,
      [name, category, stock, minStock, unit, cost, supplier, lastUpdate, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
