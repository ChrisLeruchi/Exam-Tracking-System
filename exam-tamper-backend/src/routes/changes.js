import { Router } from 'express'
import { getChanges, getChangeDetail, getAuditLogs, verifyIntegrity } from '../controllers/changeController.js'
import { getFlags, resolveFlag, rejectFlag } from '../controllers/flagController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(requireAuth)

// Change history routes
router.get('/courses/:courseId/changes', getChanges)
router.get('/changes/:id', getChangeDetail)

// Audit log routes (admin only for full audit log)
router.get('/audit/logs', requireRole('ADMIN'), getAuditLogs)

// Integrity verification route
router.get('/audit/verify', verifyIntegrity)

// Flag routes
router.get('/flags', getFlags)
router.patch('/flags/:id/resolve', requireRole('ADMIN'), resolveFlag)
router.patch('/flags/:id/reject', requireRole('ADMIN'), rejectFlag)

export default router
