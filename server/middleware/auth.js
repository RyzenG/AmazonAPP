import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

/**
 * JWT authentication middleware.
 * Accepts BOTH:
 *   - Authorization: Bearer <token>  (new JWT flow)
 *   - x-user header with JSON        (legacy flow, for backwards compat)
 *
 * Skipped for public routes (login, health).
 */
export function authMiddleware(req, res, next) {
  // Public routes that skip authentication
  const publicPaths = [
    { method: 'POST', path: '/api/users/login' },
    { method: 'GET',  path: '/api/health' },
  ]

  const isPublic = publicPaths.some(
    (r) => req.method === r.method && req.path === r.path
  )
  if (isPublic) return next()

  // 1. Try JWT from Authorization header
  const authHeader = req.headers['authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.authUser = decoded          // { id, name, email, role }
      // Also set x-user header so downstream getUser() keeps working
      if (!req.headers['x-user']) {
        req.headers['x-user'] = JSON.stringify({
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        })
      }
      return next()
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }
  }

  // 2. Fall back to legacy x-user header (backwards compatibility)
  const xUser = req.headers['x-user']
  if (xUser) {
    try {
      const parsed = JSON.parse(xUser)
      if (parsed && parsed.email) {
        req.authUser = parsed
        return next()
      }
    } catch {
      // invalid JSON – fall through to 401
    }
  }

  return res.status(401).json({ error: 'Se requiere autenticación' })
}

export { JWT_SECRET }
