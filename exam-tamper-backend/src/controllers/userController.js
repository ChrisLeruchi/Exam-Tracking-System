import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'
import { logAuditEvent } from '../lib/audit.js'

/**
 * GET /api/users
 * List all users (admin only)
 * Query params: ?role=ADMIN&page=1
 */
export async function getUsers(req, res) {
  const { role, page = 1 } = req.query
  const limit = 20
  const skip = (Number(page) - 1) * limit

  try {
    const where = {}

    if (role && role !== 'all') {
      where.role = role.toUpperCase()
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            resultsCreated: true,
            resultVersions: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.user.count({ where })

    const formatted = users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLogin: u.lastLogin?.toISOString() || null,
      createdAt: u.createdAt.toISOString(),
      resultsCreated: u._count.resultsCreated,
      changesMade: u._count.resultVersions,
      auditEntries: u._count.auditLogs,
    }))

    res.json({
      users: formatted,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 * Body: { username, password, fullName, role, email }
 */
export async function createUser(req, res) {
  const { username, password, fullName, role, email } = req.body
  const adminUser = req.user

  if (!username || !password || !fullName || !role) {
    return res.status(400).json({ error: 'Username, password, full name, and role are required' })
  }

  const validRoles = ['ADMIN', 'LECTURER', 'EXAM_OFFICER']
  if (!validRoles.includes(role.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid role. Must be ADMIN, LECTURER, or EXAM_OFFICER' })
  }

  try {
    // Check if username already exists
    const existing = await prisma.user.findUnique({
      where: { username },
    })

    if (existing) {
      return res.status(409).json({ error: 'A user with this username already exists' })
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        role: role.toUpperCase(),
        email: email || null,
      },
    })

    // Log to audit
    await logAuditEvent({
      entityType: 'user',
      entityId: user.id,
      action: 'create',
      oldValue: null,
      newValue: { username, fullName, role: role.toUpperCase(), email },
      userId: adminUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (err) {
    console.error('Create user error:', err)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

/**
 * PATCH /api/users/:id/deactivate
 * Deactivate a user account (admin only)
 */
export async function deactivateUser(req, res) {
  const { id } = req.params
  const adminUser = req.user

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.id === adminUser.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' })
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: false },
    })

    await logAuditEvent({
      entityType: 'user',
      entityId: Number(id),
      action: 'deactivate',
      oldValue: { isActive: true },
      newValue: { isActive: false },
      userId: adminUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({
      message: 'User deactivated successfully',
      user: {
        id: updated.id,
        username: updated.username,
        isActive: updated.isActive,
      },
    })
  } catch (err) {
    console.error('Deactivate user error:', err)
    res.status(500).json({ error: 'Failed to deactivate user' })
  }
}

/**
 * PATCH /api/users/:id/activate
 * Reactivate a user account (admin only)
 */
export async function activateUser(req, res) {
  const { id } = req.params
  const adminUser = req.user

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: true },
    })

    await logAuditEvent({
      entityType: 'user',
      entityId: Number(id),
      action: 'activate',
      oldValue: { isActive: false },
      newValue: { isActive: true },
      userId: adminUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({
      message: 'User activated successfully',
      user: {
        id: updated.id,
        username: updated.username,
        isActive: updated.isActive,
      },
    })
  } catch (err) {
    console.error('Activate user error:', err)
    res.status(500).json({ error: 'Failed to activate user' })
  }
}

/**
 * PATCH /api/users/:id/reset-password
 * Reset a user's password (admin only)
 * Body: { newPassword }
 */
export async function resetPassword(req, res) {
  const { id } = req.params
  const { newPassword } = req.body
  const adminUser = req.user

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: Number(id) },
      data: { passwordHash },
    })

    await logAuditEvent({
      entityType: 'user',
      entityId: Number(id),
      action: 'password_reset',
      oldValue: null,
      newValue: { reset: true },
      userId: adminUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Failed to reset password' })
  }
}