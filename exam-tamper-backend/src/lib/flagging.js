/**
 * Evaluates whether a result modification should be flagged as suspicious.
 *
 * Flagging rules:
 * 1. Changes after publication (non-admin) — only admins can correct published results
 * 2. Non-course-lecturer editing — someone other than the assigned lecturer edits
 * 3. Score changed by more than 20 marks — large jump may indicate manipulation
 * 4. Score changed to grade boundary — suspicious (e.g., 44 → 45, 49 → 50)
 *
 * @param {Object} params
 * @param {Object} params.result - the current result record (with course relation)
 * @param {number} params.newScore - the proposed new score
 * @param {string} params.userRole - role of the user making the change
 * @param {number} params.courseLecturerId - ID of the lecturer assigned to the course
 * @param {number} params.userId - ID of the user making the change
 * @returns {{flagged: boolean, flagReason: string|null}}
 */
export function evaluateFlags({result, newScore, userRole, courseLecturerId, userId}) {
  const previousScore = result.currentScore
  const isPublished = result.isPublished
  // New behaviour: ANY change made by a non-ADMIN should be flagged.
  // This ensures edits by lecturers, exam officers, or other users are visible
  // to all accounts until an ADMIN resolves the flag.
  if (userRole !== 'ADMIN') {
    // Prefer more specific reasons when applicable
    if (isPublished) {
      return { flagged: true, flagReason: 'changed after publication' }
    }

    if (userRole === 'EXAM_OFFICER' && userId !== courseLecturerId) {
      return { flagged: true, flagReason: 'edited by exam officer (not course lecturer)' }
    }

    return { flagged: true, flagReason: 'edited by non-admin' }
  }

  // If the editor is an ADMIN, fall back to the existing heuristic checks
  // Rule 3: Score changed by more than 20 marks
  if (previousScore !== null && newScore !== null) {
    const delta = Math.abs(newScore - previousScore)

    if (delta > 20) {
      return {
        flagged: true,
        flagReason: 'score changed by more than 20 marks'
      }
    }
  }

  // Rule 4: Score changed to a grade boundary
  // Grade boundaries: 45 (D/C), 50 (C/B), 60 (B/A), 70 (A)
  const boundaries = [45, 50, 60, 70]

  if (previousScore !== null && newScore !== null && boundaries.includes(newScore) && !boundaries.includes(previousScore)) {
    return {
      flagged: true,
      flagReason: 'score changed to grade boundary'
    }
  }

  return {
    flagged: false,
    flagReason: null,
  }
}
