/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors || {}
    });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Authentication Error',
      error: 'Invalid or expired token'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      message: 'Access Denied',
      error: err.message
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors
    });
  }

  // Handle Prisma errors
  if (err.code) {
    // Common Prisma error codes
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          message: 'Resource already exists',
          error: `A record with this ${err.meta?.target?.join(', ')} already exists`
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          message: 'Resource not found',
          error: err.meta?.cause || 'The requested resource does not exist'
        });
    }
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

/**
 * Async error handler for route handlers
 * Wraps async functions to catch errors and pass them to error middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Middleware function
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler
};
