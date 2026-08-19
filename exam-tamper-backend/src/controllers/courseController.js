import prisma from '../lib/prisma.js'
import { logAuditEvent } from '../lib/audit.js'

/**
 * GET /api/courses
 * List all courses
 * Query params: ?lecturerId=1&semester=First
 */
export async function getCourses(req, res) {
  const { lecturerId, semester } = req.query

  try {
    const where = {}

    if (lecturerId) {
      where.lecturerId = Number(lecturerId)
    }

    if (semester) {
      where.semester = semester
    }

    // If the user is a lecturer, only show their courses
    if (req.user.role === 'LECTURER') {
      where.lecturerId = req.user.id
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        lecturer: {
          select: { id: true, username: true, fullName: true },
        },
        _count: {
          select: {
            enrollments: true,
            results: true,
            publications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = courses.map(c => ({
      id: c.id,
      code: c.code,
      title: c.title,
      semester: c.semester,
      academicSession: c.academicSession,
      lecturer: c.lecturer,
      enrolledStudents: c._count.enrollments,
      resultsCount: c._count.results,
      publicationsCount: c._count.publications,
      createdAt: c.createdAt.toISOString(),
    }))

    res.json({ courses: formatted })
  } catch (err) {
    console.error('Get courses error:', err)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
}

/**
 * GET /api/courses/:id
 * Get a single course with details
 */
export async function getCourse(req, res) {
  const { id } = req.params

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        lecturer: {
          select: { id: true, username: true, fullName: true },
        },
        _count: {
          select: {
            enrollments: true,
            results: true,
          },
        },
      },
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    res.json({
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        semester: course.semester,
        academicSession: course.academicSession,
        lecturer: course.lecturer,
        enrolledStudents: course._count.enrollments,
        resultsCount: course._count.results,
        createdAt: course.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('Get course error:', err)
    res.status(500).json({ error: 'Failed to fetch course' })
  }
}

/**
 * POST /api/courses
 * Create a new course (admin only)
 * Body: { code, title, lecturerId, semester, academicSession }
 */
export async function createCourse(req, res) {
  const { code, title, lecturerId, semester, academicSession } = req.body
  const user = req.user

  if (!code || !title || !lecturerId) {
    return res.status(400).json({ error: 'Course code, title, and lecturer ID are required' })
  }

  try {
    // Verify the lecturer exists and is a LECTURER
    const lecturer = await prisma.user.findUnique({
      where: { id: Number(lecturerId) },
    })

    if (!lecturer) {
      return res.status(404).json({ error: 'Lecturer not found' })
    }

    if (lecturer.role !== 'LECTURER') {
      return res.status(400).json({ error: 'The assigned user must have the LECTURER role' })
    }

    // Check if course code already exists
    const existing = await prisma.course.findUnique({
      where: { code },
    })

    if (existing) {
      return res.status(409).json({ error: 'A course with this code already exists' })
    }

    const course = await prisma.course.create({
      data: {
        code,
        title,
        lecturerId: Number(lecturerId),
        semester: semester || 'First',
        academicSession: academicSession || '2025/2026',
      },
    })

    await logAuditEvent({
      entityType: 'course',
      entityId: course.id,
      action: 'create',
      oldValue: null,
      newValue: { code, title, lecturerId: Number(lecturerId), semester, academicSession },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ course })
  } catch (err) {
    console.error('Create course error:', err)
    res.status(500).json({ error: 'Failed to create course' })
  }
}

/**
 * GET /api/courses/:id/roster
 * Returns the students enrolled in a course and their current result status
 */
export async function getCourseRoster(req, res) {
  const { id } = req.params

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    if (req.user.role === 'LECTURER' && req.user.id !== course.lecturerId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: Number(id) },
      include: {
        student: true,
      },
      orderBy: {
        student: {
          matNo: 'asc',
        },
      },
    })

    const roster = await Promise.all(enrollments.map(async (enrollment) => {
      const result = await prisma.result.findFirst({
        where: {
          studentId: enrollment.studentId,
          courseId: Number(id),
        },
        select: {
          id: true,
          currentScore: true,
          currentGrade: true,
          isPublished: true,
        },
      })

      return {
        studentId: enrollment.student.id,
        matNo: enrollment.student.matNo,
        fullName: enrollment.student.fullName,
        department: enrollment.student.department,
        level: enrollment.student.level,
        enrolledAt: enrollment.student.createdAt,
        result: result || null,
      }
    }))

    res.json({
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
      },
      roster,
    })
  } catch (err) {
    console.error('Get course roster error:', err)
    res.status(500).json({ error: 'Failed to fetch course roster' })
  }
}

/**
 * POST /api/courses/:id/enroll
 * Enroll a student in a course
 */
export async function enrollStudent(req, res) {
  const { id } = req.params
  const { studentId } = req.body
  const user = req.user

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(id),
        },
      },
    })

    if (existingEnrollment) {
      return res.status(409).json({ error: 'Student is already enrolled in this course' })
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(id),
      },
      include: {
        student: true,
      },
    })

    await logAuditEvent({
      entityType: 'enrollment',
      entityId: enrollment.id,
      action: 'enroll',
      oldValue: null,
      newValue: { courseId: Number(id), studentId: Number(studentId) },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ enrollment })
  } catch (err) {
    console.error('Enroll student error:', err)
    res.status(500).json({ error: 'Failed to enroll student' })
  }
}

/**
 * GET /api/lecturers
 * List all lecturers (for course assignment dropdown)
 */
export async function getLecturers(req, res) {
  try {
    const lecturers = await prisma.user.findMany({
      where: {
        role: 'LECTURER',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
      },
      orderBy: { fullName: 'asc' },
    })

    res.json({ lecturers })
  } catch (err) {
    console.error('Get lecturers error:', err)
    res.status(500).json({ error: 'Failed to fetch lecturers' })
  }
}