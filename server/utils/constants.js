module.exports = {
  ROLES: {
    BUYER: 'buyer',
    SELLER: 'seller',
    ADMIN: 'admin',
  },

  ORDER_STATUS: {
    PENDING_PAYMENT: 'pending_payment',
    PAID_ESCROW_HELD: 'paid_escrow_held',
    PROOF_UPLOADED: 'proof_uploaded',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    DISPUTED: 'disputed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
    CANCELLED: 'cancelled',
  },

  LISTING_STATUS: {
    ACTIVE: 'active',
    SOLD: 'sold',
    WITHDRAWN: 'withdrawn',
    EXPIRED: 'expired',
    FLAGGED: 'flagged',
    REMOVED: 'removed',
  },

  DISPUTE_STATUS: {
    OPEN: 'open',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  },

  DISPUTE_RESOLUTION: {
    FULL_REFUND: 'full_refund',
    PARTIAL_REFUND: 'partial_refund',
    NO_REFUND: 'no_refund',
  },

  SELLER_TIER: {
    NEW: 'new',
    STANDARD: 'standard',
    TRUSTED: 'trusted',
    RESTRICTED: 'restricted',
    BANNED: 'banned',
  },

  KYC_STATUS: {
    NOT_STARTED: 'not_started',
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },

  PAYOUT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PAID: 'paid',
    FAILED: 'failed',
    REVERSED: 'reversed',
    MANUAL_OVERRIDE: 'manual_override',
  },

  // ---- Business rules (also in .env, mirrored here as fallback defaults) ----
  DELIVERY_WINDOW_HOURS: parseInt(process.env.DELIVERY_WINDOW_HOURS, 10) || 48,
  POST_MATCH_GRACE_HOURS: parseInt(process.env.POST_MATCH_GRACE_HOURS, 10) || 24,
  PLATFORM_FEE_PERCENT: parseFloat(process.env.PLATFORM_FEE_PERCENT) || 10,
  DISPUTE_REVIEW_WINDOW_HOURS: 48,

  // Repeated valid disputes threshold before tier downgrade
  VALID_DISPUTE_DOWNGRADE_THRESHOLD: 3,

  FILE_UPLOAD: {
    MAX_SIZE_MB: 10,
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
};