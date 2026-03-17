import { Router } from 'express'
import { pool } from '../db.js'
import { log, getUser } from '../audit.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, discount_percent::float AS "discountPercent", is_active AS "isActive"
       FROM price_lists ORDER BY name`
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, name, discountPercent, isActive } = req.body
  try {
    await pool.query(
      `INSERT INTO price_lists (id, name, discount_percent, is_active) VALUES ($1,$2,$3,$4)`,
      [id, name, discountPercent ?? 0, isActive ?? true]
    )
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'crear', entity: 'Lista de precios', entityId: id, entityName: name })
    res.status(201).json({ id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', async (req, res) => {
  const { name, discountPercent, isActive } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE price_lists SET name=$1, discount_percent=$2, is_active=$3 WHERE id=$4 RETURNING id`,
      [name, discountPercent ?? 0, isActive ?? true, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'editar', entity: 'Lista de precios', entityId: req.params.id, entityName: name })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM price_lists WHERE id=$1 RETURNING name', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'eliminar', entity: 'Lista de precios', entityId: req.params.id, entityName: rows[0].name })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
