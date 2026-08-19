import { verifyToken } from '../lib/jwt.js'

/**
 * Middleware: checks if the user is logged in (has a valid JWT token)
 * If valid, attaches the user data to req.user
 * If invalid, returns 401 Unauthorized
 */
export function requireAuth(req, res, next) {
  // The token is sent in the Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' })
  }

  const token = authHeader.split(' ')[1]  // extract the token part

  try {
    const decoded = verifyToken(token)
    req.user = decoded  // attach user info to the request
    next()  // continue to the route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' })
  }
}

/**
 * Middleware: checks if the user has a specific role
 * Use after requireAuth: requireAuth, requireRole('ADMIN')
 * @param  {...string} roles - the allowed roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      })
    }

    next()
  }
}
