/**
 * Global error handler — catches all unhandled errors
 * Must be registered AFTER all routes
 */
export function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err)

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development'

  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Something went wrong',
    ...(isDev && { stack: err.stack }),
  })
}

/**
 * 404 handler — for routes that don't exist
 */
export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' })
}
