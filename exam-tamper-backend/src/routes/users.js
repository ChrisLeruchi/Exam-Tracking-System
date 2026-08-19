import { Router } from 'express'
import { getUsers, createUser, deactivateUser, activateUser, resetPassword } from '../controllers/userController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// All user management routes require authentication + ADMIN role
router.use(requireAuth, requireRole('ADMIN'))

// GET /api/users — list all users
router.get('/users', getUsers)

// POST /api/users — create a new user
router.post('/users', createUser)

// PATCH /api/users/:id/deactivate — deactivate a user
router.patch('/users/:id/deactivate', deactivateUser)

// PATCH /api/users/:id/activate — reactivate a user
router.patch('/users/:id/activate', activateUser)

// PATCH /api/users/:id/reset-password — reset a user's password
router.patch('/users/:id/reset-password', resetPassword)

export default router