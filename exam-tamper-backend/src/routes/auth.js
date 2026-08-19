import { Router } from 'express'
import { login, getMe, changePassword } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/login — public route (no auth required)
router.post('/login', login)

// GET /api/auth/me — protected route (requires auth)
router.get('/me', requireAuth, getMe)

// PATCH /api/auth/change-password — allow user to change their own password
router.patch('/change-password', requireAuth, changePassword)

export default router
