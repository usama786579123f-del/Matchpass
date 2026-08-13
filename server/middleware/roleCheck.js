const { ApiError } = require('../utils/apiResponse');

/**
 * Restricts a route to specific roles.
 * Usage: router.get('/admin-only', protect, roleCheck('admin'), handler)
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. This action requires role: ${allowedRoles.join(' or ')}.`)
      );
    }
    next();
  };
};

/**
 * Seller-specific gate: seller must have completed KYC before listing/selling actions.
 */
const requireVerifiedSeller = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return next(new ApiError(403, 'Only sellers can perform this action.'));
  }
  if (req.user.kyc.status !== 'verified') {
    return next(
      new ApiError(403, 'KYC verification required before you can list tickets. Please complete verification.')
    );
  }
  if (req.user.sellerTier === 'banned' || req.user.sellerTier === 'restricted') {
    return next(new ApiError(403, 'Your seller account is currently restricted.'));
  }
  next();
};

module.exports = { roleCheck, requireVerifiedSeller };