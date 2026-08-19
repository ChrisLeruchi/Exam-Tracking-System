import { Router } from 'express'
import { getCourses, getCourse, createCourse, getLecturers, getCourseRoster, enrollStudent } from '../controllers/courseController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

// All course routes require authentication
router.use(requireAuth)

// GET /api/courses — list all courses (lecturers see only their own)
router.get('/courses', getCourses)

// GET /api/courses/:id — get a single course
router.get('/courses/:id', getCourse)

// GET /api/courses/:id/roster — get enrolled students for a course
router.get('/courses/:id/roster', getCourseRoster)

// POST /api/courses/:id/enroll — enroll a student in a course
router.post('/courses/:id/enroll', requireRole('ADMIN', 'EXAM_OFFICER'), validateBody('studentId'), enrollStudent)

// GET /api/lecturers — list all lecturers (for course assignment)
router.get('/lecturers', getLecturers)

// POST /api/courses — create a new course (admin only)
router.post('/courses', requireRole('ADMIN'), createCourse)

export default router