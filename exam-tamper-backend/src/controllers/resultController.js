import prisma from '../lib/prisma.js'
import { logAuditEvent } from '../lib/audit.js'
import { evaluateFlags } from '../lib/flagging.js'
import { computeVersionHash } from '../lib/hash.js'

// Helper: compute grade from score
function computeGrade(score) {
  if (score === null || score === undefined) return null
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

/**
 * GET /api/courses/:courseId/results
 * List all results for a course
 */
export async function getResults(req, res) {
  const { courseId } = req.params

  try {
    const results = await prisma.result.findMany({
      where: { courseId: Number(courseId) },
      include: {
        student: true,
        versions: {
          orderBy: { changedAt: 'desc' },
          take: 1,  // just the latest version
        },
      },
      orderBy: { student: { matNo: 'asc' } },
    })

    res.json({ results })
  } catch (err) {
    console.error('Get results error:', err)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
}

/**
 * PUT /api/courses/:courseId/results/:resultId
 * Update a student's score.
 * This is the CORE tamper-tracking endpoint:
 * 1. Updates the results table (current score)
 * 2. Creates a new result_versions row (append-only)
 * 3. Creates an audit_log entry
 * 4. Evaluates flagging rules
 */
export async function updateResult(req, res) {
  const { courseId, resultId } = req.params
  const { score } = req.body
  const user = req.user  // from auth middleware

  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'Score is required' })
  }

  if (Number(score) > 100) {
    return res.status(400).json({ error: 'Score cannot be greater than 100' })
  }

  try {
    // 1. Fetch the current result + course info
    const result = await prisma.result.findUnique({
      where: { id: Number(resultId) },
      include: { course: true },
    })

    if (!result) {
      return res.status(404).json({ error: 'Result not found' })
    }

    // Verify the result actually belongs to the course in the URL
    if (result.courseId !== Number(courseId)) {
      return res.status(400).json({ error: 'Result does not belong to this course' })
    }

    // 2. Evaluate flagging rules
    const { flagged, flagReason } = evaluateFlags({
      result,
      newScore: Number(score),
      userRole: user.role,
      courseLecturerId: result.course.lecturerId,
      userId: user.id,
    })

    // 3. Get the previous version's hash (for the chain)
    const lastVersion = await prisma.resultVersion.findFirst({
      where: { resultId: result.id },
      orderBy: { id: 'desc' },
      select: { currentHash: true },
    })
    const previousHash = lastVersion?.currentHash || null

    // 4. Prepare the version data
    const newScore = Number(score)
    const newGrade = computeGrade(newScore)

    const versionData = {
      resultId: result.id,
      score: newScore,
      grade: newGrade,
      previousScore: result.currentScore,
      previousGrade: result.currentGrade,
      changedBy: user.id,
      changedByRole: user.role,
      changedAt: new Date().toISOString(),

      reason: 'correction',
      previousHash,
    }

    // 5. Compute the hash chain
    const currentHash = computeVersionHash(versionData, previousHash)

    // 6. Create the version row (append-only) + update the result + audit log
    // We use a transaction so all three succeed or all fail together
    const [version, updatedResult] = await prisma.$transaction([
      // Create version history entry
      prisma.resultVersion.create({
        data: {
          ...versionData,
          currentHash,
          flagged,
          flagReason,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
      // Update the current result (this is the ONLY table that updates)
      prisma.result.update({
        where: { id: result.id },
        data: {
          currentScore: newScore,
          currentGrade: newGrade,
        },
      }),
    ])

    // 7. Log to audit trail
    await logAuditEvent({
      entityType: 'result',
      entityId: result.id,
      action: 'update',
      oldValue: { score: result.currentScore, grade: result.currentGrade },
      newValue: { score: newScore, grade: newGrade },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    // 8. Return the updated result + version info
    res.json({
      result: updatedResult,
      version: {
        id: version.id,
        previousScore: version.previousScore,
        newScore: version.score,
        flagged: version.flagged,
        flagReason: version.flagReason,
        changedAt: version.changedAt,
      },
    })
  } catch (err) {
    console.error('Update result error:', err)
    res.status(500).json({ error: 'Failed to update result' })
  }
}

/**
 * POST /api/courses/:courseId/results
 * Create a new result for a student
 */
export async function createResult(req, res) {
  const { courseId } = req.params
  const { studentId, score } = req.body
  const user = req.user

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' })
  }

  try {
    // Verify the course exists
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
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

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(courseId),
        },
      },
    })

    if (!enrollment) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' })
    }

    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    })

    if (existingResult) {
      return res.status(409).json({ error: 'Result already exists for this student and course' })
    }

    const newScore = score !== undefined ? Number(score) : null
    if (newScore !== null && newScore > 100) {
      return res.status(400).json({ error: 'Score cannot be greater than 100' })
    }
    const newGrade = computeGrade(newScore)

    // Create the result
    const result = await prisma.result.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        currentScore: newScore,
        currentGrade: newGrade,
        createdBy: user.id,
      },
    })

    // Create the first version (if score was provided)
    if (newScore !== null) {
      const versionData = {
        resultId: result.id,
        score: newScore,
        grade: newGrade,
        previousScore: null,
        previousGrade: null,
        changedBy: user.id,
        changedByRole: user.role,
        changedAt: new Date().toISOString(),
        reason: 'result created',
        previousHash: null,
      }
      const currentHash = computeVersionHash(versionData, null)

      await prisma.resultVersion.create({
        data: {
          ...versionData,
          currentHash,
          flagged: false,
          flagReason: 'result created',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      })
    }

    // Log to audit
    await logAuditEvent({
      entityType: 'result',
      entityId: result.id,
      action: 'create',
      oldValue: null,
      newValue: { score: newScore, grade: newGrade },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ result })
  } catch (err) {
    console.error('Create result error:', err)
    res.status(500).json({ error: 'Failed to create result' })
  }
}

/**
 * POST /api/courses/:courseId/publish
 * Publish all results for a course (after this, changes are flagged)
 */
export async function publishResults(req, res) {
  const { courseId } = req.params
  const user = req.user

  try {
    // Update all results to published
    await prisma.result.updateMany({
      where: { courseId: Number(courseId) },
      data: { isPublished: true },
    })

    // Create a publication record
    const publication = await prisma.publication.create({
      data: {
        courseId: Number(courseId),
        publishedBy: user.id,
      },
    })

    // Log to audit
    await logAuditEvent({
      entityType: 'publication',
      entityId: publication.id,
      action: 'publish',
      oldValue: { isPublished: false },
      newValue: { isPublished: true },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Results published successfully', publication })
  } catch (err) {
    console.error('Publish error:', err)
    res.status(500).json({ error: 'Failed to publish results' })
  }
}
