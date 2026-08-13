const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Anonymizes a user's personally identifiable data while preserving
 * the record itself - orders, listings, disputes, and payouts all
 * reference this user by ID and must stay intact for financial/legal
 * record-keeping (UK requires transaction records to be retained even
 * after a customer requests deletion). This satisfies GDPR's "right
 * to erasure" for personal data while keeping the platform's audit
 * trail and accounting consistent.
 */
const anonymizeUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for anonymization.');
  }

  const anonymizedEmail = `deleted-${user._id}@matchpass-deleted.local`;

  user.name = 'Deleted User';
  user.email = anonymizedEmail;
  user.phone = undefined;
  user.password = require('crypto').randomBytes(32).toString('hex'); // unusable random password
  user.isActive = false;
  user.isSuspended = true;
  user.suspensionReason = 'Account deleted per user request (GDPR erasure)';
  user.kyc = { status: 'not_started', provider: null };
  user.stripeConnect = { accountId: undefined, onboardingComplete: false, payoutsEnabled: false };
  user.stripeCustomerId = undefined;
  user.deletionRequested = false;

  await user.save({ validateBeforeSave: false });

  logger.info(`User ${userId} anonymized per GDPR deletion request.`);
  return user;
};

module.exports = { anonymizeUser };