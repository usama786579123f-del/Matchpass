const User = require('../models/User');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const { ApiError, success } = require('../utils/apiResponse');
const gdprService = require('../services/gdprService');
const auditLogService = require('../services/auditLogService');
const { sendEmail } = require('../services/emailService');

/**
 * @route   POST /api/gdpr/request-deletion
 * @desc    User requests their account/data be deleted. If they have
 *          no active orders/listings that would be disrupted, this
 *          can be actioned immediately by an admin; otherwise it's
 *          flagged for manual review (e.g. an order mid-escrow can't
 *          just vanish).
 * @access  Any authenticated user
 */
const requestDeletion = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.user._id);

    user.deletionRequested = true;
    user.deletionRequestedAt = new Date();
    user.deletionReason = reason;
    await user.save({ validateBeforeSave: false });

    await auditLogService.log({
      action: 'GDPR_DELETION_REQUESTED',
      entityType: 'User',
      entityId: user._id,
      actorId: user._id,
      details: { reason },
    });

    return success(
      res,
      200,
      'Your deletion request has been received. Our team will process it within 30 days as required by UK GDPR.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/gdpr/request-export
 * @desc    User requests a copy of their personal data (GDPR "right
 *          to access"). Returns a JSON export directly for MVP -
 *          a background job + emailed download link is the production
 *          upgrade path for large accounts.
 * @access  Any authenticated user
 */
const exportMyData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -twoFactorSecret');
    const orders = await Order.find({ buyer: req.user._id }).select(
      'orderNumber status totalAmount currency createdAt'
    );
    const listings = await Listing.find({ seller: req.user._id }).select(
      'section pricePerTicket status createdAt'
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: user,
      orders,
      listings,
    };

    await auditLogService.log({
      action: 'GDPR_DATA_EXPORTED',
      entityType: 'User',
      entityId: user._id,
      actorId: user._id,
    });

    res.setHeader('Content-Disposition', 'attachment; filename="matchpass-my-data.json"');
    return res.status(200).json(exportData);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/gdpr/admin/deletion-requests
 * @desc    Admin queue of pending deletion requests.
 * @access  Admin only
 */
const getDeletionRequests = async (req, res, next) => {
  try {
    const users = await User.find({ deletionRequested: true }).select(
      'name email role deletionRequestedAt deletionReason'
    );
    return success(res, 200, 'Deletion requests fetched.', { users });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/gdpr/admin/process-deletion/:userId
 * @desc    Admin approves and executes a deletion request - anonymizes
 *          the user record while preserving transaction history.
 * @access  Admin only
 */
const processDeletion = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) throw new ApiError(404, 'User not found.');

    const activeOrders = await Order.countDocuments({
      $or: [{ buyer: targetUser._id }, { seller: targetUser._id }],
      status: { $in: ['pending_payment', 'paid_escrow_held', 'proof_uploaded', 'disputed'] },
    });

    if (activeOrders > 0) {
      throw new ApiError(
        409,
        `Cannot delete this account - it has ${activeOrders} order(s) still in progress. Ask the user to wait until they complete, or handle manually.`
      );
    }

    const userEmailBeforeAnonymize = targetUser.email;
    const userName = targetUser.name;

    await gdprService.anonymizeUser(targetUser._id);

    await auditLogService.log({
      action: 'GDPR_DELETION_PROCESSED',
      entityType: 'User',
      entityId: targetUser._id,
      actorId: req.user._id,
    });

    await sendEmail({
      to: userEmailBeforeAnonymize,
      subject: 'Your MatchPass account has been deleted',
      html: `<p>Hi ${userName},</p><p>As requested, your MatchPass account and personal data have been deleted. Transaction records are retained as required by UK financial regulations, but are no longer linked to your identity.</p>`,
    });

    return success(res, 200, 'User account anonymized and deletion processed.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestDeletion,
  exportMyData,
  getDeletionRequests,
  processDeletion,
};