import crypto from 'crypto'
export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function computeVersionHash(row, previousHash) {
  const data = JSON.stringify({
    resultId: row.resultId,
    score: row.score,
    grade: row.grade,
    previousScore: row.previousScore,
    previousGrade: row.previousGrade,
    changedBy: row.changedBy,
    changedByRole: row.changedByRole,
    changedAt: row.changedAt,  // now a Unix timestamp (number)
    reason: row.reason,
    previousHash: previousHash || '',
  })

  return sha256(data)
}



export function computeAuditHash(row, previousHash) {
  const data = JSON.stringify({
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action,
    oldValue: row.oldValue,
    newValue: row.newValue,
    userId: row.userId,
    timestamp: row.timestamp,
    previousHash: previousHash || '',
  })

  return sha256(data)
}