const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Dispute = require('../models/Dispute');
const Payout = require('../models/Payout');
const { ApiError, success } = require('../utils/apiResponse');
const auditLogService = require('../services/auditLogService');
const { sendEmail } = require('../services/emailService');

// ============================================================
// USER MODERATION
// ============================================================

/**
 * @route   GET /api/admin/users
 * @desc    List/search users for moderation — filter by role, KYC status,
 *          seller tier, or search by name/email.
 * @access  Admin only
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, kycStatus, sellerTier, q, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (kycStatus) filter['kyc.status'] = kycStatus;
    if (sellerTier) filter.sellerTier = sellerTier;
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    return success(res, 200, 'Users fetched.', { users }, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @access  Admin only
 */
const getUserByIdAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -twoFactorSecret');
    if (!user) throw new ApiError(404, 'User not found.');

    const [orderCount, listingCount, disputeCount] = await Promise.all([
      Order.countDocuments({ buyer: user._id }),
      Listing.countDocuments({ seller: user._id }),
      Dispute.countDocuments({ seller: user._id, countedAgainstSeller: true }),
    ]);

    return success(res, 200, 'User fetched.', {
      user,
      stats: { orderCount, listingCount, validDisputesAgainst: disputeCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/suspend
 * @desc    Suspend or unsuspend a user account (fraud, repeated abuse, etc.)
 * @access  Admin only
 */
const toggleUserSuspension = async (req, res, next) => {
  try {
    const { suspend, reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found.');

    if (user.role === 'admin') {
      throw new ApiError(400, 'Admin accounts cannot be suspended through this endpoint.');
    }

    user.isSuspended = !!suspend;
    user.suspensionReason = suspend ? reason || 'Suspended by admin' : undefined;
    await user.save({ validateBeforeSave: false });

    await auditLogService.log({
      action: suspend ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      entityType: 'User',
      entityId: user._id,
      actorId: req.user._id,
      details: { reason },
    });

    if (suspend) {
      await sendEmail({
        to: user.email,
        subject: 'Your MatchPass account has been suspended',
        html: `<p>Hi ${user.name},</p><p>Your account has been suspended. Reason: ${reason || 'Policy violation'}.</p><p>Contact support if you believe this is a mistake.</p>`,
      });
    }

    return success(res, 200, `User ${suspend ? 'suspended' : 'unsuspended'} successfully.`, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/tier
 * @desc    Manually adjust a seller's trust tier (override the automatic
 *          dispute-based downgrade system when context warrants it).
 * @access  Admin only
 */
const updateSellerTier = async (req, res, next) => {
  try {
    const { sellerTier } = req.body;
    const validTiers = ['new', 'standard', 'trusted', 'restricted', 'banned'];

    if (!validTiers.includes(sellerTier)) {
      throw new ApiError(400, 'Invalid seller tier.');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found.');
    if (user.role !== 'seller') throw new ApiError(400, 'This user is not a seller.');

    const previousTier = user.sellerTier;
    user.sellerTier = sellerTier;
    await user.save({ validateBeforeSave: false });

    await auditLogService.log({
      action: 'SELLER_TIER_MANUAL_UPDATE',
      entityType: 'User',
      entityId: user._id,
      actorId: req.user._id,
      details: { previousTier, newTier: sellerTier },
    });

    return success(res, 200, 'Seller tier updated.', { user });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// LISTING MODERATION
// ============================================================

/**
 * @route   GET /api/admin/listings
 * @desc    Moderation queue — defaults to pending listings
 * @access  Admin only
 */
const getListingsForModeration = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const listings = await Listing.find({ moderationStatus: status })
      .populate('seller', 'name email sellerTier')
      .populate('event', 'title eventDate homeTeam awayTeam')
      .sort({ createdAt: 1 }); // oldest pending first

    return success(res, 200, 'Listings fetched.', { listings });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/listings/:id/moderate
 * @desc    Approve or reject a listing. Rejected listings are removed
 *          from public view but kept for records (not hard-deleted).
 * @access  Admin only
 */
const moderateListing = async (req, res, next) => {
  try {
    const { decision, note } = req.body; // decision: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      throw new ApiError(400, 'Decision must be either approved or rejected.');
    }

    const listing = await Listing.findById(req.params.id).populate('seller', 'name email');
    if (!listing) throw new ApiError(404, 'Listing not found.');

    listing.moderationStatus = decision;
    listing.moderationNote = note;
    if (decision === 'rejected') {
      listing.status = 'removed';
    }
    await listing.save();

    await auditLogService.log({
      action: decision === 'approved' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      entityType: 'Listing',
      entityId: listing._id,
      actorId: req.user._id,
      details: { note },
    });

    if (decision === 'rejected') {
      await sendEmail({
        to: listing.seller.email,
        subject: 'Your MatchPass listing was not approved',
        html: `<p>Hi ${listing.seller.name},</p><p>Your listing was not approved for the following reason:</p><p>${note || 'Did not meet listing guidelines.'}</p>`,
      });
    }

    return success(res, 200, `Listing ${decision}.`, { listing });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/listings/:id/flag
 * @desc    Flag a currently-live listing for suspected fraud (separate
 *          from initial moderation — this catches issues discovered later).
 * @access  Admin only
 */
const flagListing = async (req, res, next) => {
  try {
    const { note } = req.body;

    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ApiError(404, 'Listing not found.');

    listing.status = 'flagged';
    listing.moderationNote = note;
    await listing.save();

    await auditLogService.log({
      action: 'LISTING_FLAGGED',
      entityType: 'Listing',
      entityId: listing._id,
      actorId: req.user._id,
      details: { note },
    });

    return success(res, 200, 'Listing flagged and removed from public view.', { listing });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// REPORTS (revenue / disputes / sellers)
// ============================================================

/**
 * @route   GET /api/admin/reports/revenue
 * @desc    Platform fee revenue over a date range, grouped by day.
 * @access  Admin only
 */
const getRevenueReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const match = { status: { $in: ['completed', 'delivered', 'partially_refunded'] } };

    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    const dailyRevenue = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$platformFee' },
          totalGMV: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = dailyRevenue.reduce(
      (acc, day) => ({
        totalRevenue: acc.totalRevenue + day.totalRevenue,
        totalGMV: acc.totalGMV + day.totalGMV,
        totalOrders: acc.totalOrders + day.orderCount,
      }),
      { totalRevenue: 0, totalGMV: 0, totalOrders: 0 }
    );

    return success(res, 200, 'Revenue report generated.', { dailyRevenue, summary });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/reports/disputes
 * @desc    Dispute rate + resolution breakdown — key ops health metric
 *          per brief ("Dispute rate and operational cost" = admin success metric).
 * @access  Admin only
 */
const getDisputesReport = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalDisputes = await Dispute.countDocuments();

    const resolutionBreakdown = await Dispute.aggregate([
      { $match: { status: 'resolved' } },
      { $group: { _id: '$resolution', count: { $sum: 1 } } },
    ]);

    const avgResolutionTimeHours = await Dispute.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTimeHours: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      { $group: { _id: null, avgHours: { $avg: '$resolutionTimeHours' } } },
    ]);

    const openDisputes = await Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } });
    const overdueDisputes = await Dispute.countDocuments({
      status: { $in: ['open', 'under_review'] },
      reviewDeadline: { $lt: new Date() },
    });

    return success(res, 200, 'Disputes report generated.', {
      totalOrders,
      totalDisputes,
      disputeRate: totalOrders > 0 ? ((totalDisputes / totalOrders) * 100).toFixed(2) : 0,
      resolutionBreakdown,
      avgResolutionTimeHours: avgResolutionTimeHours[0]?.avgHours?.toFixed(1) || 0,
      openDisputes,
      overdueDisputes,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/reports/sellers
 * @desc    Top sellers by volume + tier distribution — per brief
 *          ("Listing rate and payout speed" = seller success metric).
 * @access  Admin only
 */
const getSellersReport = async (req, res, next) => {
  try {
    const tierDistribution = await User.aggregate([
      { $match: { role: 'seller' } },
      { $group: { _id: '$sellerTier', count: { $sum: 1 } } },
    ]);

    const topSellers = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$subtotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
      {
        $project: {
          sellerName: '$seller.name',
          sellerTier: '$seller.sellerTier',
          totalSales: 1,
          totalRevenue: 1,
        },
      },
    ]);

    const avgPayoutSpeedHours = await Payout.aggregate([
      { $match: { status: 'paid', releasedAt: { $exists: true } } },
      {
        $project: {
          speedHours: {
            $divide: [{ $subtract: ['$releasedAt', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      { $group: { _id: null, avgHours: { $avg: '$speedHours' } } },
    ]);

    return success(res, 200, 'Sellers report generated.', {
      tierDistribution,
      topSellers,
      avgPayoutSpeedHours: avgPayoutSpeedHours[0]?.avgHours?.toFixed(1) || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserByIdAdmin,
  toggleUserSuspension,
  updateSellerTier,
  getListingsForModeration,
  moderateListing,
  flagListing,
  getRevenueReport,
  getDisputesReport,
  getSellersReport,
};