import prisma from '../lib/prisma.js'
import { logAuditEvent } from '../lib/audit.js'

export async function getStudents(req, res) {
  const { q } = req.query

  try {
    const where = {}

    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { matNo: { contains: q, mode: 'insensitive' } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { matNo: 'asc' },
      include: {
        _count: {
          select: { results: true },
        },
      },
    })

    res.json({
      students: students.map((s) => ({
        id: s.id,
        matNo: s.matNo,
        fullName: s.fullName,
        department: s.department,
        level: s.level,
        resultsCount: s._count.results,
        createdAt: s.createdAt,
      })),
      total: students.length,
    })
  } catch (err) {
    console.error('Get students error:', err)
    res.status(500).json({ error: 'Failed to fetch students' })
  }
}

export async function getStudent(req, res) {
  const { id } = req.params

  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        results: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    res.json({ student })
  } catch (err) {
    console.error('Get student error:', err)
    res.status(500).json({ error: 'Failed to fetch student' })
  }
}

export async function createStudent(req, res) {
  const { matNo, fullName, department, level } = req.body
  const user = req.user

  if (!matNo || !fullName) {
    return res.status(400).json({ error: 'Matric number and full name are required' })
  }

  try {
    const existing = await prisma.student.findUnique({
      where: { matNo },
    })

    if (existing) {
      return res.status(409).json({ error: 'A student with this matric number already exists' })
    }

    const student = await prisma.student.create({
      data: {
        matNo,
        fullName,
        department: department || 'Computer Engineering',
        level: level || '500',
      },
    })

    await logAuditEvent({
      entityType: 'student',
      entityId: student.id,
      action: 'create',
      oldValue: null,
      newValue: { matNo, fullName, department, level },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ student })
  } catch (err) {
    console.error('Create student error:', err)
    res.status(500).json({ error: 'Failed to create student' })
  }
}

export async function updateStudent(req, res) {
  const { id } = req.params
  const { fullName, department, level } = req.body
  const user = req.user

  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    const updateData = {}
    if (fullName !== undefined) updateData.fullName = fullName
    if (department !== undefined) updateData.department = department
    if (level !== undefined) updateData.level = level

    const updated = await prisma.student.update({
      where: { id: Number(id) },
      data: updateData,
    })

    await logAuditEvent({
      entityType: 'student',
      entityId: Number(id),
      action: 'update',
      oldValue: {
        fullName: student.fullName,
        department: student.department,
        level: student.level,
      },
      newValue: updateData,
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({ student: updated })
  } catch (err) {
    console.error('Update student error:', err)
    res.status(500).json({ error: 'Failed to update student' })
  }
}