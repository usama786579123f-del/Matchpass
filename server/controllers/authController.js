const crypto = require('crypto');
const User = require('../models/User');
const { ApiError, success } = require('../utils/apiResponse');
const {
  generateAccessToken,
  generateRandomToken,
  hashToken,
  setTokenCookie,
} = require('../utils/tokenGen');
const { sendEmail } = require('../services/emailService');
const welcomeEmail = require('../templates/welcomeEmail');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new buyer or seller (light KYC at this stage —
 *          full seller KYC happens later via /api/users/kyc)
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const rawToken = generateRandomToken();
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'seller' ? 'seller' : 'buyer',
      emailVerificationToken: hashToken(rawToken),
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
    const { subject, html } = welcomeEmail({ name: user.name, verifyUrl });
    await sendEmail({ to: user.email, subject, html });

    const accessToken = generateAccessToken(user._id, user.role);
    setTokenCookie(res, accessToken);

    return success(res, 201, 'Account created. Please check your email to verify your account.', {
      user: sanitizeUser(user),
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.isActive || user.isSuspended) {
      throw new ApiError(403, user.suspensionReason || 'Your account has been suspended. Contact support.');
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id, user.role);
    setTokenCookie(res, accessToken);

    return success(res, 200, 'Logged in successfully.', {
      user: sanitizeUser(user),
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return success(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user (used by frontend AuthContext on refresh)
 */
const getMe = async (req, res, next) => {
  try {
    return success(res, 200, 'User fetched.', { user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, 'Verification token is required.');

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Verification link is invalid or has expired.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return success(res, 200, 'Email verified successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way whether or not the user exists —
    // prevents account enumeration via this endpoint.
    if (!user) {
      return success(res, 200, 'If an account exists for that email, a reset link has been sent.');
    }

    const rawToken = generateRandomToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your MatchPass password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>Password reset requested</h2>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
          <p style="color:#64748b;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return success(res, 200, 'If an account exists for that email, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new ApiError(400, 'Reset link is invalid or has expired.');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    return success(res, 200, 'Password reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
};

// ---- helpers ----
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  kycStatus: user.kyc?.status,
  sellerTier: user.sellerTier,
});

module.exports = {
  signup,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
};