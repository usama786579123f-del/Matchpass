const User = require('../models/User');
const { ApiError, success } = require('../utils/apiResponse');
const twoFactorService = require('../services/twoFactorService');
const { generateAccessToken, setTokenCookie } = require('../utils/tokenGen');
const auditLogService = require('../services/auditLogService');

/**
 * @route   POST /api/2fa/setup
 * @desc    Generates a new TOTP secret + QR code for the logged-in
 *          admin to scan. Not yet enabled until verify-setup succeeds.
 * @access  Admin only
 */
const setupTwoFactor = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Two-factor setup is only available for admin accounts.');
    }

    const secret = twoFactorService.generateSecret(req.user.email);
    const qrCodeDataUrl = await twoFactorService.generateQRCode(secret.otpauth_url);

    // Store the secret but don't enable 2FA until they confirm with a code
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret.base32 });

    return success(res, 200, 'Scan this QR code with your authenticator app.', {
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret.base32,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/2fa/verify-setup
 * @desc    Confirms the admin can generate valid codes before turning
 *          2FA on for their account.
 * @access  Admin only
 */
const verifySetup = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      throw new ApiError(400, 'No 2FA setup in progress. Please start setup first.');
    }

    const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new ApiError(400, 'Invalid code. Please check your authenticator app and try again.');
    }

    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    await auditLogService.log({
      action: 'ADMIN_2FA_ENABLED',
      entityType: 'User',
      entityId: user._id,
      actorId: user._id,
    });

    return success(res, 200, 'Two-factor authentication enabled.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/2fa/verify-login
 * @desc    Second step of login for admins with 2FA enabled. Called
 *          after password auth succeeds but before issuing the final
 *          session token - see authController.login for the first step.
 * @access  Requires a valid pending2FAToken (short-lived, password-only token)
 */
const verifyLogin = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled) {
      throw new ApiError(400, 'Invalid 2FA verification request.');
    }

    const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new ApiError(401, 'Invalid authentication code.');
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id, user.role);
    setTokenCookie(res, accessToken);

    return success(res, 200, 'Logged in successfully.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/2fa/disable
 * @desc    Turns off 2FA - requires current password re-entry as a
 *          safety check (prevents a hijacked session from silently
 *          disabling protection).
 * @access  Admin only
 */
const disableTwoFactor = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');

    if (!(await user.matchPassword(password))) {
      throw new ApiError(401, 'Incorrect password.');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save({ validateBeforeSave: false });

    await auditLogService.log({
      action: 'ADMIN_2FA_DISABLED',
      entityType: 'User',
      entityId: user._id,
      actorId: user._id,
    });

    return success(res, 200, 'Two-factor authentication disabled.');
  } catch (err) {
    next(err);
  }
};

module.exports = { setupTwoFactor, verifySetup, verifyLogin, disableTwoFactor };