import { pool } from './db.js'

/**
 * Extracts the current user from the x-user request header.
 * The frontend sends JSON: { name, email, role }
 */
export function getUser(req) {
  try {
    const raw = req.headers['x-user']
    if (!raw) return { name: 'Sistema', email: '' }
    const u = JSON.parse(raw)
    return { name: u.name ?? 'Sistema', email: u.email ?? '' }
  } catch {
    return { name: 'Sistema', email: '' }
  }
}

/**
 * Inserts one row in audit_log (fire-and-forget, never throws).
 * @param {object} params
 * @param {string} params.userName
 * @param {string} params.userEmail
 * @param {'crear'|'editar'|'eliminar'|'restablecer'} params.action
 * @param {string} params.entity   Human-readable entity type (e.g. 'Insumo')
 * @param {string} [params.entityId]
 * @param {string} [params.entityName]
 * @param {string} [params.details]
 */
export async function log({ userName, userEmail, action, entity, entityId, entityName, details }) {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_name, user_email, action, entity, entity_id, entity_name, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userName, userEmail, action, entity, entityId ?? null, entityName ?? null, details ?? null]
    )
  } catch (e) {
    // Audit failures must never break the main request
    console.error('Audit log error:', e.message)
  }
}
