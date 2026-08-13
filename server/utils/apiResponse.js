/**
 * Standardized API response helpers.
 * Keeps every controller returning the same shape:
 * { success, message, data, meta }
 */

const success = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const error = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

/**
 * Custom error class used across controllers/services so the
 * global errorHandler can read statusCode consistently.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { success, error, ApiError };