const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;

// General API limiter - generous, just to stop abuse
const generalLimiter = rateLimit({
  windowMs,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.',
  },
});

// Strict limiter for auth endpoints (login, signup, password reset)
const authLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX_AUTH, 10) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

// Checkout limiter - prevents card-testing / bot abuse on payment endpoints
const checkoutLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX_CHECKOUT, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many checkout attempts. Please try again later.',
  },
});

module.exports = { generalLimiter, authLimiter, checkoutLimiter };