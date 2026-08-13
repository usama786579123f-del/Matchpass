const Payout = require('../models/Payout');
const Order = require('../models/Order');
const User = require('../models/User');
const { ApiError, success } = require('../utils/apiResponse');
const stripeService = require('../services/stripeService');
const auditLogService = require('../services/auditLogService');

/**
 * @route   GET /api/payouts/my-payouts
 * @access  Seller only
 */
const getMyPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find({ seller: req.user._id })
      .populate({
        path: 'order',
        select: 'orderNumber event',
        populate: { path: 'event', select: 'title eventDate' },
      })
      .sort({ createdAt: -1 });

    const totalEarned = payouts
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return success(res, 200, 'Payouts fetched.', { payouts }, { totalEarned });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/payouts/:id
 * @access  Owning seller or admin
 */
const getPayoutById = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id).populate('order');
    if (!payout) throw new ApiError(404, 'Payout not found.');

    if (payout.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'Access denied.');
    }

    return success(res, 200, 'Payout fetched.', { payout });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/payouts/admin/all
 * @desc    Admin view of all payouts — supports status filter, used
 *          on the admin Payouts / Reports screens.
 * @access  Admin only
 */
const getAllPayoutsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const payouts = await Payout.find(filter)
      .populate('seller', 'name email sellerTier')
      .populate({
        path: 'order',
        select: 'orderNumber totalAmount',
      })
      .sort({ createdAt: -1 });

    return success(res, 200, 'Payouts fetched.', { payouts });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/payouts/admin/manual-override
 * @desc    Admin manually triggers or corrects a payout — used for
 *          edge cases like a stuck order where automated release
 *          failed (e.g. seller Connect account wasn't ready when the
 *          grace period cron ran), or a goodwill correction after a
 *          support ticket.
 * @access  Admin only
 */
const manualPayoutOverride = async (req, res, next) => {
  try {
    const { orderId, amount, note } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found.');

    const seller = await User.findById(order.seller);
    if (!seller.stripeConnect?.accountId) {
      throw new ApiError(400, 'Seller has no connected Stripe account to receive payouts.');
    }

    // Guard against double-paying — check if a paid payout already exists for this order
    const existingPaid = await Payout.findOne({ order: order._id, status: 'paid' });
    if (existingPaid) {
      throw new ApiError(409, 'A payout has already been completed for this order. Reversal must be handled separately.');
    }

    const transfer = await stripeService.transferToSeller({
      amount,
      currency: order.currency,
      connectAccountId: seller.stripeConnect.accountId,
      orderId: order._id.toString(),
    });

    const payout = await Payout.create({
      order: order._id,
      seller: seller._id,
      amount,
      platformFeeDeducted: order.platformFee,
      currency: order.currency,
      stripeTransferId: transfer.id,
      stripeConnectAccountId: seller.stripeConnect.accountId,
      status: 'manual_override',
      isManualOverride: true,
      overriddenBy: req.user._id,
      overrideNote: note,
      releasedAt: new Date(),
    });

    if (order.status !== 'completed') {
      order.status = 'completed';
      order.fundsReleasedAt = new Date();
      await order.save();
    }

    await auditLogService.log({
      action: 'PAYOUT_MANUAL_OVERRIDE',
      entityType: 'Payout',
      entityId: payout._id,
      actorId: req.user._id,
      details: { orderId: order._id, amount, note },
    });

    return success(res, 201, 'Manual payout processed.', { payout });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPayouts,
  getPayoutById,
  getAllPayoutsAdmin,
  manualPayoutOverride,
};