import { Router } from 'express'
import { pool } from '../db.js'
import { log, getUser } from '../audit.js'

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
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'crear', entity: 'Cliente', entityId: id, entityName: name })
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', async (req, res) => {
  const { code, name, company, email, phone, city, segment, totalPurchases, lastPurchase, isActive } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE customers SET code=$1, name=$2, company=$3, email=$4, phone=$5, city=$6,
              segment=$7, total_purchases=$8, last_purchase=$9, is_active=$10
       WHERE id=$11
       RETURNING id, code, name, company, email, phone, city, segment,
                 total_purchases::float AS "totalPurchases",
                 to_char(last_purchase,'YYYY-MM-DD') AS "lastPurchase",
                 is_active AS "isActive"`,
      [code, name, company, email, phone, city, segment, totalPurchases ?? 0, lastPurchase ?? null, isActive ?? true, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'editar', entity: 'Cliente', entityId: req.params.id, entityName: name })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM customers WHERE id=$1 RETURNING name', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'eliminar', entity: 'Cliente', entityId: req.params.id, entityName: rows[0].name })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
