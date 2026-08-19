import prisma from './prisma.js'
import { computeAuditHash } from './hash.js'

/**
 * Creates an append-only audit log entry with hash chaining.
 * This function should be called for EVERY action in the system.
 *
 * @param {Object} params
 * @param {string} params.entityType - "result", "user", "course", "publication"
 * @param {number} params.entityId - ID of the thing that changed
 * @param {string} params.action - "create", "update", "publish", "login", etc.
 * @param {Object|null} params.oldValue - previous state (JSON)
 * @param {Object|null} params.newValue - new state (JSON)
 * @param {number} params.userId - who did it
 * @param {string|null} params.ipAddress - request IP
 * @param {string|null} params.userAgent - browser info
 * @returns {Promise<Object>} - the created audit log entry
 */
export async function logAuditEvent({ entityType, entityId, action, oldValue, newValue, userId, ipAddress, userAgent }) {
  // Get the previous audit log entry's hash (for the chain)
  const lastEntry = await prisma.auditLog.findFirst({
    orderBy: { id: 'desc' },
    select: { currentHash: true },
  })

  const previousHash = lastEntry?.currentHash || null

  // Prepare the row data
  const timestamp = new Date().toISOString()
  const rowData = {
    entityType,
    entityId,
    action,
    oldValue,
    newValue,
    userId,
    timestamp,
  }

  // Compute the hash: SHA256(row data + previous hash)
  const currentHash = computeAuditHash(rowData, previousHash)

  // Insert the audit log entry (append-only — never update or delete)
  const entry = await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      oldValue: oldValue || undefined,
      newValue: newValue || undefined,
      userId,
      previousHash,
      currentHash,
      ipAddress,
      userAgent,
    },
  })

  return entry
}
