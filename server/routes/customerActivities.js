import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, customer_id AS "customerId", type, date, subject, notes,
             done, created_at AS "createdAt"
      FROM customer_activities
      ORDER BY date DESC, created_at DESC
    `)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  const { id, customerId, type, date, subject, notes, done, createdAt } = req.body
  try {
    await pool.query(
      `INSERT INTO customer_activities (id, customer_id, type, date, subject, notes, done, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, customerId, type, date, subject, notes ?? '', done ?? false, createdAt ?? new Date().toISOString()]
    )
    res.status(201).json({ id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  const { customerId, type, date, subject, notes, done } = req.body
  try {
    await pool.query(
      `UPDATE customer_activities
       SET customer_id=$1, type=$2, date=$3, subject=$4, notes=$5, done=$6
       WHERE id=$7`,
      [customerId, type, date, subject, notes ?? '', done ?? false, req.params.id]
    )
    res.json({ id: req.params.id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customer_activities WHERE id=$1', [req.params.id])
    res.json({ id: req.params.id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
