const { verifyAccessToken } = require('../utils/tokenGen');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Protects routes - requires a valid JWT (from cookie or Authorization header).
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized. Please log in.');
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    if (!user.isActive || user.isSuspended) {
      throw new ApiError(403, 'Your account has been suspended. Contact support.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired session. Please log in again.'));
    }
    next(err);
  }
};

/**
 * Optional auth - attaches req.user if a valid token exists,
 * but does not block the request if it doesn't (used on public pages
 * that show slightly different content to logged-in users).
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive && !user.isSuspended) {
      req.user = user;
    }
    next();
  } catch (err) {
    // Invalid token on an optional route - just proceed unauthenticated
    next();
  }
};

module.exports = { protect, optionalAuth };