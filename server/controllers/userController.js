const User = require('../models/User');
const { ApiError, success } = require('../utils/apiResponse');
const kycService = require('../services/kycService');

/**
 * @route   PATCH /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    return success(res, 200, 'Profile updated successfully.', { user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      throw new ApiError(401, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    return success(res, 200, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/kyc/start
 * @desc    Kicks off Stripe Identity verification for a seller.
 *          Returns a hosted verification URL the frontend redirects to.
 */
const startKycVerification = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== 'seller') {
      throw new ApiError(403, 'Only sellers need to complete KYC verification.');
    }

    if (user.kyc.status === 'verified') {
      throw new ApiError(400, 'Your account is already KYC verified.');
    }

    const session = await kycService.createVerificationSession(user);

    user.kyc.status = 'pending';
    user.kyc.provider = 'stripe_identity';
    user.kyc.providerReferenceId = session.id;
    await user.save({ validateBeforeSave: false });

    return success(res, 200, 'Verification session created.', {
      verificationUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/kyc/status
 * @desc    Polled by frontend after seller returns from Stripe Identity hosted flow.
 */
const getKycStatus = async (req, res, next) => {
  try {
    return success(res, 200, 'KYC status fetched.', { kyc: req.user.kyc });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/connect/onboard
 * @desc    Starts (or resumes) Stripe Connect Express onboarding for payouts.
 *          Requires KYC to already be verified.
 */
const startConnectOnboarding = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.kyc.status !== 'verified') {
      throw new ApiError(403, 'Please complete identity verification before setting up payouts.');
    }

    const account = await kycService.createConnectAccount(user);

    if (!user.stripeConnect?.accountId) {
      user.stripeConnect = { ...user.stripeConnect, accountId: account.id };
      await user.save({ validateBeforeSave: false });
    }

    const link = await kycService.createConnectOnboardingLink(account.id);

    return success(res, 200, 'Onboarding link created.', { onboardingUrl: link.url });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/:id/public
 * @desc    Public seller profile snippet shown on listing detail pages
 *          (name, tier, rating) — never expose email/phone/KYC details here.
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name sellerTier createdAt');
    if (!user) throw new ApiError(404, 'User not found.');

    return success(res, 200, 'Profile fetched.', {
      user: {
        id: user._id,
        name: user.name,
        sellerTier: user.sellerTier,
        memberSince: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---- helpers ----
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  kycStatus: user.kyc?.status,
  sellerTier: user.sellerTier,
  stripeConnectComplete: user.stripeConnect?.onboardingComplete || false,
});

module.exports = {
  updateProfile,
  changePassword,
  startKycVerification,
  getKycStatus,
  startConnectOnboarding,
  getPublicProfile,
};