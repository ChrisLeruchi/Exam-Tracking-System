/**
 * Validates that the request body has all required fields
 * @param  {...string} fields - required field names
 */
export function validateBody(...fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field]
      return value === undefined || value === null || value === ''
    })

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      })
    }

    next()
  }
}

/**
 * Validates that a score is a valid number between 0 and 100
 */
export function validateScore(req, res, next) {
  const { score } = req.body

  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'Score is required' })
  }

  const numScore = Number(score)

  if (isNaN(numScore)) {
    return res.status(400).json({ error: 'Score must be a number' })
  }

  if (numScore < 0 || numScore > 100) {
    return res.status(400).json({ error: 'Score must be between 0 and 100' })
  }

  // Replace the string with a number
  req.body.score = numScore
  next()
}
