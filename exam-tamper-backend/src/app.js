import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import resultRoutes from './routes/results.js'
import changeRoutes from './routes/changes.js'
import studentRoutes from './routes/students.js'
import userRoutes from './routes/users.js'
import courseRoutes from './routes/courses.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import prisma from './lib/prisma.js'


dotenv.config();

const app = express()

// CORS — restrict to the frontend origin (Vite dev server).
// For production, replace with the deployed frontend URL.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
app.use(cors({ origin: allowedOrigins }))

app.use(express.json())

// Security headers
app.use(helmet())

// Rate limiting — prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // max 100 requests per IP per window
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Stricter rate limit for login (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,  // limit failed login attempts without blocking normal retries
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
})
// Vercel functions do not share reliable in-memory state between instances.
// Keep the dedicated limiter for local/server deployments and rely on the
// broader API limiter on Vercel.
if (process.env.VERCEL !== '1') {
  app.use('/api/auth/login', loginLimiter)
}

// Health endpoint (no auth) — verifies both Express and PostgreSQL
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', message: 'Server and database are running' })
  } catch (error) {
    console.error('Health check database error:', error)
    res.status(503).json({ status: 'error', message: 'Database is unavailable' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api', resultRoutes)
app.use('/api', changeRoutes)
app.use('/api', studentRoutes)
app.use('/api', courseRoutes)
app.use('/api', userRoutes)

// 404 handler — for routes that don't exist
app.use(notFound)

// Global error handler — catches all unhandled errors (must be last)
app.use(errorHandler)

export default app
