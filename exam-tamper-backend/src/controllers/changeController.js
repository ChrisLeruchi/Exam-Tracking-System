import prisma from '../lib/prisma.js'

/**
 * GET /api/courses/:courseId/changes
 * List all score changes for a course, with filtering
 * Query params: ?flagged=true&role=lecturer&q=searchterm&page=1
 */
export async function getChanges(req, res) {
  const { courseId } = req.params
  const { flagged, role, q, page = 1 } = req.query
  const limit = 20
  const skip = (Number(page) - 1) * limit

  try {
    const where = {
      result: { courseId: Number(courseId) },
    }

    if (flagged === 'true') {
      where.flagged = true
    } else if (flagged === 'false') {
      where.flagged = false
    }

    if (role && role !== 'all') {
      where.changedByRole = role.toUpperCase()
    }

    if (q) {
      where.OR = [
        { result: { student: { fullName: { contains: q, mode: 'insensitive' } } } },
        { result: { student: { matNo: { contains: q, mode: 'insensitive' } } } },
      ]
    }

    const changes = await prisma.resultVersion.findMany({
      where,
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
            resolvedByUser: { select: { username: true, fullName: true } }
          },
          take: 1,
        },
      },
      orderBy: { changedAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.resultVersion.count({ where })

    const formatted = changes.map(c => ({
      id: c.id,
      studentName: c.result.student.fullName,
      matNo: c.result.student.matNo,
      courseCode: c.result.course.code,
      previousValue: c.previousScore,
      newValue: c.score,
      changedBy: c.changedByUser.username,
      changedByRole: c.changedByRole.toLowerCase(),
      timestamp: c.changedAt.toISOString(),
      flagged: c.flagged,
      flagReason: c.flagReason,
      resolved: (c.resolutions && c.resolutions.length > 0),
      resolvedBy: c.resolutions && c.resolutions[0]?.resolvedByUser?.username || null,
    }))

    res.json({
      changes: formatted,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (err) {
    console.error('Get changes error:', err)
    res.status(500).json({ error: 'Failed to fetch change history' })
  }
}

/**
 * GET /api/changes/:id
 * Get a single change with full version history for that result
 */
export async function getChangeDetail(req, res) {
  const { id } = req.params

  try {
    const change = await prisma.resultVersion.findUnique({
      where: { id: Number(id) },
      include: {
        result: {
          include: {
            student: true,
            course: true,
            versions: {
              orderBy: { changedAt: 'desc' },
              include: {
                changedByUser: {
                  select: { username: true, fullName: true, role: true },
                },
              },
            },
          },
        },
      },
    })

    if (!change) {
      return res.status(404).json({ error: 'Change not found' })
    }

    const history = change.result.versions.map(v => ({
      id: v.id,
      score: v.score,
      previousScore: v.previousScore,
      changedBy: v.changedByUser.username,
      changedByRole: v.changedByRole,
      changedAt: v.changedAt,
      reason: v.reason,
      flagged: v.flagged,
      flagReason: v.flagReason,
      currentHash: v.currentHash,
    }))

    res.json({
      change: {
        id: change.id,
        studentName: change.result.student.fullName,
        matNo: change.result.student.matNo,
        courseCode: change.result.course.code,
        previousValue: change.previousScore,
        newValue: change.score,
        changedBy: change.changedByUser.username,
        changedByRole: change.changedByRole,
        timestamp: change.changedAt,
        flagged: change.flagged,
        flagReason: change.flagReason,
      },
      fullHistory: history,
    })
  } catch (err) {
    console.error('Get change detail error:', err)
    res.status(500).json({ error: 'Failed to fetch change detail' })
  }
}

/**
 * GET /api/audit/logs
 * List all audit log entries (admin view)
 * Query params: ?action=login&entityType=user&userId=1&page=1
 */
export async function getAuditLogs(req, res) {
  const { action, entityType, userId, page = 1, limit: reqLimit } = req.query
  // Default to 50 per page, but allow a higher limit for CSV export (capped at 10000)
  const limit = Math.min(Number(reqLimit) || 50, 10000)
  const skip = (Number(page) - 1) * limit

  try {
    const where = {}

    if (action && action !== 'all') {
      where.action = action
    }

    if (entityType && entityType !== 'all') {
      where.entityType = entityType
    }

    if (userId) {
      where.userId = Number(userId)
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, fullName: true, role: true },
        },
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.auditLog.count({ where })

    const formatted = logs.map(l => ({
      id: l.id,
      entityType: l.entityType,
      entityId: l.entityId,
      action: l.action,
      oldValue: l.oldValue,
      newValue: l.newValue,
      // Human-readable details
      details: (() => {
        try {
          const a = l.action
          const e = l.entityType
          if (a === 'login') return `${l.user?.fullName || l.user?.username || 'User'} logged in`
          if (a === 'create' && e === 'user') return `Account created: ${l.newValue?.fullName || l.newValue?.username || ''}`
          if (a === 'create' && e === 'result') return `Result created: score=${l.newValue?.score ?? '—'}`
          if (a === 'update' && e === 'result') {
            const oldS = l.oldValue?.score ?? '—'
            const newS = l.newValue?.score ?? '—'
            return `Result updated: ${oldS} → ${newS}`
          }
          if (a === 'flag_resolve' || a === 'flag_reject') {
            return `${a === 'flag_resolve' ? 'Flag resolved' : 'Flag rejected'}: ${l.newValue?.resolution ?? ''}`
          }
          // Fallback: stringify a short summary
          if (l.newValue && typeof l.newValue === 'object') {
            const keys = Object.keys(l.newValue).slice(0,3)
            return keys.map(k => `${k}: ${JSON.stringify(l.newValue[k])}`).join(', ')
          }
          return ''
        } catch (e) {
          return ''
        }
      })(),
      user: l.user ? {
        username: l.user.username,
        fullName: l.user.fullName,
        role: l.user.role,
      } : null,
      timestamp: l.timestamp.toISOString(),
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      currentHash: l.currentHash?.substring(0, 16) + '...', // truncated for display
    }))

    res.json({
      logs: formatted,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (err) {
    console.error('Get audit logs error:', err)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
}

/**
 * GET /api/audit/verify
 * Verify the hash chain integrity — walks the entire chain and checks for breaks
 */
export async function verifyIntegrity(req, res) {
  try {
    const { computeVersionHash } = await import('../lib/hash.js')

    const versions = await prisma.resultVersion.findMany({
      orderBy: { id: 'asc' },
    })

    const breaks = []
    let previousHash = null

    for (const version of versions) {
      // IMPORTANT: The hash was originally computed using the ISO string
      // (e.g. new Date().toISOString()) in resultController.js, so we must
      // reproduce the exact same value here or verification will fail.
      const rowData = {
        resultId: version.resultId,
        score: version.score,
        grade: version.grade,
        previousScore: version.previousScore,
        previousGrade: version.previousGrade,
        changedBy: version.changedBy,
        changedByRole: version.changedByRole,
        changedAt: version.changedAt.toISOString(),

        reason: version.reason,
        previousHash: previousHash || '',
      }

      const computedHash = computeVersionHash(rowData, previousHash)

      if (computedHash !== version.currentHash) {
        breaks.push({
          versionId: version.id,
          storedHash: version.currentHash,
          computedHash: computedHash,
          message: 'Hash mismatch — this row may have been tampered with',
        })
      }

      previousHash = version.currentHash
    }

    res.json({
      verified: breaks.length === 0,
      totalVersions: versions.length,
      breaks,
      message: breaks.length === 0
        ? 'Hash chain intact — no tampering detected'
        : `${breaks.length} hash break(s) detected — possible tampering!`,
    })
  } catch (err) {
    console.error('Verify integrity error:', err)
    res.status(500).json({ error: 'Failed to verify integrity' })
  }
}
