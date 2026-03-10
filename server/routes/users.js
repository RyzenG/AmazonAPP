import { Router } from 'express'
import { pool }   from '../db.js'
import { log, getUser } from '../audit.js'

const router = Router()

// ── POST /api/users/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, is_active AS "isActive"
       FROM users
       WHERE email = $1 AND password = $2 AND is_active = true`,
      [email, password]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    }
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── GET /api/users ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role,
              is_active AS "isActive",
              to_char(created_at, 'YYYY-MM-DD') AS "createdAt"
       FROM users ORDER BY name`
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── POST /api/users ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id, name, email, password, role, isActive } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (id, name, email, password, role, is_active)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, role,
                 is_active AS "isActive",
                 to_char(created_at,'YYYY-MM-DD') AS "createdAt"`,
      [id, name, email, password, role ?? 'Ventas', isActive ?? true]
    )
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'crear', entity: 'Usuario', entityId: id, entityName: name })
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un usuario con ese correo' })
    res.status(500).json({ error: e.message })
  }
})

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { name, email, password, role, isActive } = req.body
  try {
    let rows
    if (password && password.trim() !== '') {
      ;({ rows } = await pool.query(
        `UPDATE users SET name=$1, email=$2, password=$3, role=$4, is_active=$5
         WHERE id=$6
         RETURNING id, name, email, role,
                   is_active AS "isActive",
                   to_char(created_at,'YYYY-MM-DD') AS "createdAt"`,
        [name, email, password, role, isActive ?? true, req.params.id]
      ))
    } else {
      ;({ rows } = await pool.query(
        `UPDATE users SET name=$1, email=$2, role=$3, is_active=$4
         WHERE id=$5
         RETURNING id, name, email, role,
                   is_active AS "isActive",
                   to_char(created_at,'YYYY-MM-DD') AS "createdAt"`,
        [name, email, role, isActive ?? true, req.params.id]
      ))
    }
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'editar', entity: 'Usuario', entityId: req.params.id, entityName: name })
    res.json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un usuario con ese correo' })
    res.status(500).json({ error: e.message })
  }
})

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING name', [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    const u = getUser(req)
    await log({ userName: u.name, userEmail: u.email, action: 'eliminar', entity: 'Usuario', entityId: req.params.id, entityName: rows[0].name })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
