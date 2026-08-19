import prisma from '../lib/prisma.js'
import { logAuditEvent } from '../lib/audit.js'
import { computeVersionHash } from '../lib/hash.js'

// Helper to compute grade from score
function computeGrade(score) {
  if (score === null || score === undefined) return null
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

/**
 * GET /api/flags
 * List all flagged changes (admin view)
 * Query params: ?resolved=false&page=1
 */
export async function getFlags(req, res) {
  const { resolved, page = 1, courseId } = req.query
  const limit = 20
  const skip = (Number(page) - 1) * limit

  try {
    const where = { flagged: true }

    // Filter by resolution status using the flag_resolutions relation
    if (resolved === 'false') {
      // Unresolved = has no resolution records
      where.resolutions = { none: {} }
    } else if (resolved === 'true') {
      // Resolved = has at least one resolution record
      where.resolutions = { some: {} }
    }

    const whereClause = { ...where }
    if (courseId) {
      whereClause.result = { courseId: Number(courseId) }
    }

    const flags = await prisma.resultVersion.findMany({
      where: whereClause,
      include: {
        result: {
          include: {
            student: true,
            course: true,
          },
        },
        changedByUser: {
          select: { username: true, fullName: true, role: true },
        },
        resolutions: {
          include: {
            resolvedByUser: {
              select: { username: true, fullName: true },
            },
          },
          orderBy: { resolvedAt: 'desc' },
          take: 1, // just the latest resolution
        },
      },
      orderBy: { changedAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.resultVersion.count({ where: whereClause })

    const formatted = flags.map(f => {
      const resolution = f.resolutions[0]
      return {
        id: f.id,
        studentName: f.result.student.fullName,
        matNo: f.result.student.matNo,
        courseCode: f.result.course.code,
        previousValue: f.previousScore,
        newValue: f.score,
        changedBy: f.changedByUser.username,
        changedByRole: f.changedByRole,
        timestamp: f.changedAt.toISOString(),
        flagged: f.flagged,
        flagReason: f.flagReason,
        resolved: !!resolution,
        resolution: resolution?.resolution || null,
        resolvedBy: resolution?.resolvedByUser.username || null,
        resolvedAt: resolution?.resolvedAt?.toISOString() || null,
      }
    })

    res.json({
      flags: formatted,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (err) {
    console.error('Get flags error:', err)
    res.status(500).json({ error: 'Failed to fetch flags' })
  }
}

/**
 * PATCH /api/flags/:id/resolve
 * Admin resolves a flag with a reason
 * Body: { resolution: "explanation of why this is ok" }
 */
export async function resolveFlag(req, res) {
  const { id } = req.params
  const { resolution } = req.body
  const user = req.user

  if (!resolution) {
    return res.status(400).json({ error: 'Resolution reason is required' })
  }

  try {
    // result_versions is append-only (DB triggers block UPDATE/DELETE)
    // So we create a NEW row in flag_resolutions to mark this flag as resolved
    const flag = await prisma.resultVersion.findUnique({
      where: { id: Number(id) },
    })

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' })
    }

    if (!flag.flagged) {
      return res.status(400).json({ error: 'This version is not flagged' })
    }

    // Create a resolution record (append-only — never updates result_versions)
    const resolutionRecord = await prisma.flagResolution.create({
      data: {
        versionId: Number(id),
        resolvedBy: user.id,
        resolution,
      },
    })

    // Log to audit
    await logAuditEvent({
      entityType: 'flag',
      entityId: Number(id),
      action: 'flag_resolve',
      oldValue: { flagReason: flag.flagReason, flagged: true },
      newValue: { resolution, resolvedBy: user.id },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({
      message: 'Flag resolved successfully',
      flag: {
        id: flag.id,
        flagReason: flag.flagReason,
        resolved: true,
        resolution: resolutionRecord.resolution,
        resolvedAt: resolutionRecord.resolvedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('Resolve flag error:', err)
    res.status(500).json({ error: 'Failed to resolve flag' })
  }
}

/**
 * PATCH /api/flags/:id/reject
 * Admin rejects a flagged change and reverts the result to the previous value
 * Body: { resolution?: string }
 */
export async function rejectFlag(req, res) {
  const { id } = req.params
  const { resolution } = req.body
  const user = req.user

  try {
    const flagged = await prisma.resultVersion.findUnique({
      where: { id: Number(id) },
      include: { result: true },
    })

    if (!flagged) return res.status(404).json({ error: 'Flag not found' })
    if (!flagged.flagged) return res.status(400).json({ error: 'This version is not flagged' })
    if (flagged.previousScore === null || flagged.previousScore === undefined) {
      return res.status(400).json({ error: 'Cannot revert: no previous value available' })
    }

    // Build the reverting version data
    const lastVersion = await prisma.resultVersion.findFirst({
      where: { resultId: flagged.resultId },
      orderBy: { id: 'desc' },
      select: { currentHash: true },
    })
    const previousHash = lastVersion?.currentHash || null

    const newScore = flagged.previousScore
    const newGrade = computeGrade(newScore)

    const versionData = {
      resultId: flagged.resultId,
      score: newScore,
      grade: newGrade,
      previousScore: flagged.score,
      previousGrade: flagged.grade,
      changedBy: user.id,
      changedByRole: user.role,
      changedAt: new Date().toISOString(),
      reason: 'rejected change',
      previousHash,
    }

    const currentHash = computeVersionHash(versionData, previousHash)

    // transaction: create new version, update result, create flag resolution
    const [version, updatedResult, resolutionRecord] = await prisma.$transaction([
      prisma.resultVersion.create({
        data: {
          ...versionData,
          currentHash,
          flagged: false,
          flagReason: 'revert after rejection',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
      prisma.result.update({
        where: { id: flagged.resultId },
        data: { currentScore: newScore, currentGrade: newGrade },
      }),
      prisma.flagResolution.create({
        data: {
          versionId: Number(id),
          resolvedBy: user.id,
          resolution: resolution || 'rejected change',
        },
      }),
    ])

    // Audit log the revert
    await logAuditEvent({
      entityType: 'result',
      entityId: flagged.resultId,
      action: 'reject_change',
      oldValue: { score: flagged.score, grade: flagged.grade },
      newValue: { score: newScore, grade: newGrade },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    // Also log the flag resolution action for traceability
    await logAuditEvent({
      entityType: 'flag',
      entityId: Number(id),
      action: 'flag_reject',
      oldValue: { flagged: true, flagReason: flagged.flagReason },
      newValue: { resolution: resolution || 'rejected change', resolvedBy: user.id },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({
      message: 'Change rejected and result reverted',
      result: updatedResult,
      version: { id: version.id, score: version.score, previousScore: version.previousScore },
      resolution: { id: resolutionRecord.id, resolution: resolutionRecord.resolution },
    })
  } catch (err) {
    console.error('Reject flag error:', err)
    res.status(500).json({ error: 'Failed to reject flag and revert change' })
  }
}
