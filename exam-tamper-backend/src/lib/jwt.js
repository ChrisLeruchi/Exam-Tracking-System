import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-secret-change-in-production')

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production environment')
}

const JWT_EXPIRES_IN = '24h'

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName
    },
    JWT_SECRET,
    {expiresIn: JWT_EXPIRES_IN}
  )
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}