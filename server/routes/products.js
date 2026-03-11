import { Router } from 'express'
import { pool } from '../db.js'
import { log, getUser } from '../audit.js'

const router = Router()

const SELECT_COLS = `
  id, sku, name, category, price::float, cost::float, stock, unit,
  description, image,
  recipe_id AS "recipeId",
  is_active AS "isActive"`

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${SELECT_COLS} FROM products ORDER BY name`)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, sku, name, category, price, cost, stock, unit, description, image, recipeId, isActive } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (id, sku, name, category, price, cost, stock, unit, description, image, recipe_id, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, sku ?? '', name, category, price, cost, stock, unit, description ?? '', image ?? '', recipeId ?? '', isActive ?? true]
    )
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'crear', entity: 'Producto', entityId: id, entityName: name })
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', async (req, res) => {
  const { sku, name, category, price, cost, stock, unit, description, image, recipeId, isActive } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE products SET sku=$1, name=$2, category=$3, price=$4, cost=$5, stock=$6, unit=$7,
              description=$8, image=$9, recipe_id=$10, is_active=$11 WHERE id=$12 RETURNING *`,
      [sku ?? '', name, category, price, cost, stock, unit, description ?? '', image ?? '', recipeId ?? '', isActive, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'editar', entity: 'Producto', entityId: req.params.id, entityName: name })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id=$1 RETURNING name', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'eliminar', entity: 'Producto', entityId: req.params.id, entityName: rows[0].name })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
