import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT id, customer_id AS "customerId", customer_name AS "customerName",
              date, status, payment_method AS "paymentMethod",
              subtotal::float, tax::float, total::float, notes
       FROM sale_orders ORDER BY created_at DESC`
    )
    const { rows: items } = await pool.query(
      `SELECT order_id AS "orderId", product_id AS "productId", product_name AS "productName",
              quantity::float, unit_price::float AS "unitPrice", subtotal::float
       FROM sale_order_items`
    )
    const itemsByOrder = items.reduce((acc, item) => {
      if (!acc[item.orderId]) acc[item.orderId] = []
      acc[item.orderId].push(item)
      return acc
    }, {})
    res.json(orders.map((o) => ({ ...o, items: itemsByOrder[o.id] ?? [] })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const { id, customerId, customerName, date, status, paymentMethod, subtotal, tax, total, notes, items } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `INSERT INTO sale_orders (id, customer_id, customer_name, date, status, payment_method, subtotal, tax, total, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, customerId, customerName, date, status ?? 'pending', paymentMethod, subtotal, tax, total, notes]
    )
    if (items?.length) {
      for (const item of items) {
        await client.query(
          `INSERT INTO sale_order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, item.productId, item.productName, item.quantity, item.unitPrice, item.subtotal]
        )
      }
    }
    await client.query('COMMIT')
    res.status(201).json({ id })
  } catch (e) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: e.message })
  } finally {
    client.release()
  }
})

router.put('/:id', async (req, res) => {
  const { status, paymentMethod } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE sale_orders SET status=$1, payment_method=$2 WHERE id=$3 RETURNING id`,
      [status, paymentMethod, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
