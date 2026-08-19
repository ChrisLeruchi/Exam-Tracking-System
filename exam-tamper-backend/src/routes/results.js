import { Router } from 'express'
import { getResults, updateResult, createResult, publishResults } from '../controllers/resultController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody, validateScore } from '../middleware/validate.js'

const router = Router()

// All result routes require authentication
router.use(requireAuth)

// GET results — any authenticated user can view
router.get('/courses/:courseId/results', getResults)

// POST create result — only lecturers and admins
router.post('/courses/:courseId/results', requireRole('LECTURER', 'ADMIN'), validateBody('studentId'), createResult)

// PUT update result — lecturers, exam officers, and admins
router.put('/courses/:courseId/results/:resultId', requireRole('LECTURER', 'EXAM_OFFICER', 'ADMIN'), validateScore, updateResult)

// POST publish results — only admins and exam officers
router.post('/courses/:courseId/publish', requireRole('ADMIN', 'EXAM_OFFICER'), publishResults)

export default router
