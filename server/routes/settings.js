import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT company_name AS "companyName", slogan, email, phone, address,
              currency, timezone, logo
       FROM settings WHERE id = 1`
    )
    res.json(rows[0] ?? {})
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/', async (req, res) => {
  const { companyName, slogan, email, phone, address, currency, timezone, logo } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE settings SET
         company_name=$1, slogan=$2, email=$3, phone=$4, address=$5,
         currency=$6, timezone=$7, logo=$8
       WHERE id=1 RETURNING *`,
      [companyName, slogan, email, phone, address, currency, timezone, logo ?? null]
    )
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
