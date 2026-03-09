import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// GET /api/audit?limit=100&entity=Cliente&action=editar
router.get('/', async (req, res) => {
  const { limit = 200, entity, action, user } = req.query
  const conditions = []
  const params = []

  if (entity) { params.push(entity); conditions.push(`entity = $${params.length}`) }
  if (action)  { params.push(action);  conditions.push(`action = $${params.length}`) }
  if (user)    { params.push(`%${user}%`); conditions.push(`(user_name ILIKE $${params.length} OR user_email ILIKE $${params.length})`) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.push(Number(limit))

  try {
    const { rows } = await pool.query(
      `SELECT id, user_name AS "userName", user_email AS "userEmail",
              action, entity, entity_id AS "entityId", entity_name AS "entityName",
              details, created_at AS "createdAt"
       FROM audit_log ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
