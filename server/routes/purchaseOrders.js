import { Router } from 'express'
import { pool }   from '../db.js'

const router = Router()

const toRow = (row) => ({
  id:           row.id,
  orderNumber:  row.order_number,
  supplier:     row.supplier,
  status:       row.status,
  date:         row.date ? String(row.date).split('T')[0] : null,
  expectedDate: row.expected_date ? String(row.expected_date).split('T')[0] : undefined,
  receivedDate: row.received_date ? String(row.received_date).split('T')[0] : undefined,
  items:        row.items ?? [],
  subtotal:     parseFloat(row.subtotal ?? 0),
  total:        parseFloat(row.total    ?? 0),
  notes:        row.notes ?? '',
})

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM purchase_orders ORDER BY date DESC, created_at DESC'
    )
    res.json(rows.map(toRow))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', async (req, res) => {
  const { id, orderNumber, supplier, status, date, expectedDate, receivedDate, items, subtotal, total, notes } = req.body
  try {
    await pool.query(
      `INSERT INTO purchase_orders (id, order_number, supplier, status, date, expected_date, received_date, items, subtotal, total, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, orderNumber, supplier, status ?? 'draft', date, expectedDate ?? null, receivedDate ?? null,
       JSON.stringify(items ?? []), subtotal ?? 0, total ?? 0, notes ?? '']
    )
    res.status(201).json({ id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', async (req, res) => {
  const { orderNumber, supplier, status, date, expectedDate, receivedDate, items, subtotal, total, notes } = req.body
  try {
    await pool.query(
      `UPDATE purchase_orders
       SET order_number=$1, supplier=$2, status=$3, date=$4, expected_date=$5, received_date=$6,
           items=$7, subtotal=$8, total=$9, notes=$10
       WHERE id=$11`,
      [orderNumber, supplier, status, date, expectedDate ?? null, receivedDate ?? null,
       JSON.stringify(items ?? []), subtotal ?? 0, total ?? 0, notes ?? '', req.params.id]
    )
    res.json({ id: req.params.id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM purchase_orders WHERE id=$1', [req.params.id])
    res.json({ id: req.params.id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
