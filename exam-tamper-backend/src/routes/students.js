import { Router } from 'express'
import { getStudents, getStudent, createStudent, updateStudent } from '../controllers/studentController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// All student routes require authentication
router.use(requireAuth)

// GET /api/students — list/search students (all authenticated users)
router.get('/students', getStudents)

// GET /api/students/:id — get single student detail
router.get('/students/:id', getStudent)

// POST /api/students — create student (admin + exam_officer only)
router.post('/students', requireRole('ADMIN', 'EXAM_OFFICER'), createStudent)

// PUT /api/students/:id — update student (admin + exam_officer only)
router.put('/students/:id', requireRole('ADMIN', 'EXAM_OFFICER'), updateStudent)

export default router
