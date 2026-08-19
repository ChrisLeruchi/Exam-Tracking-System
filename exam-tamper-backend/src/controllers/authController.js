import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'
import { createToken } from '../lib/jwt.js'
import { logAuditEvent } from '../lib/audit.js'

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, user }
 */
export async function login(req, res) {
  const { username, password } = req.body

  // 1. Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    // 2. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { username },
    })

    // 3. Check if user exists and is active
    if (!user || !user.isActive) {
      // Log failed login attempt (user not found or inactive)
      if (user) {
        await logAuditEvent({
          entityType: 'user',
          entityId: user.id,
          action: 'login_failed',
          oldValue: null,
          newValue: { reason: 'account inactive' },
          userId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        })
      }
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // 4. Compare the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      // Log failed login attempt (wrong password)
      await logAuditEvent({
        entityType: 'user',
        entityId: user.id,
        action: 'login_failed',
        oldValue: null,
        newValue: { reason: 'incorrect password' },
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // 5. Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // 6. Log successful login to audit trail
    await logAuditEvent({
      entityType: 'user',
      entityId: user.id,
      action: 'login',
      oldValue: null,
      newValue: { username: user.username, role: user.role },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    // 7. Create a JWT token
    const token = createToken(user)

    // 8. Return the token and user info (never return the password hash!)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

/**
 * GET /api/auth/me
 * Returns the current logged-in user's info
 * (Protected route — requires auth middleware)
 */
export async function getMe(req, res) {
  res.json({
    user: req.user,  // this was attached by the requireAuth middleware
  })
}

/**
 * PATCH /api/auth/change-password
 * Allows a logged-in user to change their own password
 * Body: { currentPassword, newPassword }
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  const userId = req.user.id

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash and save the new password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // Log to audit trail
    await logAuditEvent({
      entityType: 'user',
      entityId: userId,
      action: 'password_change',
      oldValue: null,
      newValue: { changed: true },
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
}
