const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { ApiError, success } = require('../utils/apiResponse');
const { uploadBufferToS3, getSignedDownloadUrl } = require('../config/s3');
const stripeService = require('../services/stripeService');
const escrowService = require('../services/escrowService');
const auditLogService = require('../services/auditLogService');
const { DISPUTE_REVIEW_WINDOW_HOURS } = require('../utils/constants');
const { sendEmail } = require('../services/emailService');
const disputeUpdateEmail = require('../templates/disputeUpdateEmail');
const User = require('../models/User');

/**
 * @route   POST /api/disputes
 * @desc    Buyer flags an order with evidence. Multipart form —
 *          `evidence` files handled by multer (memoryStorage) before
 *          reaching this controller.
 * @access  Buyer only
 */
const createDispute = async (req, res, next) => {
  try {
    const { orderId, reason, description } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found.');

    if (order.buyer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only dispute your own orders.');
    }

    if (!['proof_uploaded', 'delivered'].includes(order.status)) {
      throw new ApiError(
        400,
        'Disputes can only be raised after delivery proof has been uploaded, and before the order is fully settled.'
      );
    }

    const existingDispute = await Dispute.findOne({ order: orderId, status: { $ne: 'closed' } });
    if (existingDispute) {
      throw new ApiError(409, 'A dispute is already open for this order.');
    }

    // Upload evidence files to S3 (if any provided)
    let evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      evidenceUrls = await Promise.all(
        req.files.map((file) => uploadBufferToS3(file.buffer, file.mimetype, 'dispute-evidence'))
      );
    }

    const dispute = await Dispute.create({
      order: order._id,
      buyer: order.buyer,
      seller: order.seller,
      reason,
      description,
      evidenceUrls,
      reviewDeadline: new Date(Date.now() + DISPUTE_REVIEW_WINDOW_HOURS * 60 * 60 * 1000),
    });

    // Freeze the order in disputed state — the grace-period cron job
    // checks `disputeRaised` and will skip auto-release for this order.
    order.status = 'disputed';
    order.disputeRaised = true;
    await order.save();

    await auditLogService.log({
      action: 'DISPUTE_OPENED',
      entityType: 'Dispute',
      entityId: dispute._id,
      actorId: req.user._id,
      details: { orderId: order._id, reason },
    });

    return success(res, 201, 'Dispute submitted. Our team will review within 48 hours.', { dispute });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/disputes/my-disputes
 * @access  Buyer only
 */
const getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ buyer: req.user._id })
      .populate('order', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });

    return success(res, 200, 'Disputes fetched.', { disputes });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/disputes/:id
 * @access  Buyer/seller on this dispute, or admin
 */
const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('order')
      .populate('buyer', 'name email')
      .populate('seller', 'name email sellerTier');

    if (!dispute) throw new ApiError(404, 'Dispute not found.');

    const isParty =
      dispute.buyer._id.toString() === req.user._id.toString() ||
      dispute.seller._id.toString() === req.user._id.toString();

    if (!isParty && req.user.role !== 'admin') {
      throw new ApiError(403, 'Access denied.');
    }

    // Generate temporary signed URLs for evidence (never expose raw S3 keys)
    const signedEvidenceUrls = await Promise.all(
      dispute.evidenceUrls.map((key) => getSignedDownloadUrl(key))
    );

    return success(res, 200, 'Dispute fetched.', {
      dispute: { ...dispute.toObject(), evidenceUrls: signedEvidenceUrls },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/disputes/admin/all
 * @desc    Admin dispute queue — supports filtering by status
 * @access  Admin only
 */
const getAllDisputesAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const disputes = await Dispute.find(filter)
      .populate('order', 'orderNumber totalAmount')
      .populate('buyer', 'name email')
      .populate('seller', 'name email sellerTier')
      .sort({ reviewDeadline: 1 }); // most urgent (closest deadline) first

    return success(res, 200, 'Disputes fetched.', { disputes });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/disputes/:id/resolve
 * @desc    Admin resolves a dispute: full refund, partial refund, or no refund.
 *          Handles the money movement AND the seller tier penalty when the
 *          dispute is upheld (full or partial refund = valid dispute).
 * @access  Admin only
 */
const resolveDispute = async (req, res, next) => {
  try {
    const { resolution, resolutionAmount, resolutionNote } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) throw new ApiError(404, 'Dispute not found.');

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      throw new ApiError(400, 'This dispute has already been resolved.');
    }

    const order = await Order.findById(dispute.order);
    const payment = await Payment.findOne({ order: order._id, status: { $in: ['succeeded', 'partially_refunded'] } });

    if (resolution === 'full_refund') {
      if (payment) {
        const refund = await stripeService.refundPayment({
          paymentIntentId: payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
        });
        payment.status = 'refunded';
        payment.refundAmount = payment.amount;
        payment.refundReason = resolutionNote || 'Dispute resolved: full refund';
        payment.refundedAt = new Date();
        payment.stripeRefundId = refund.id;
        await payment.save();
      }
      order.status = 'refunded';
      await escrowService.penalizeSellerTier(order.seller, 'Valid dispute - full refund issued');
      dispute.countedAgainstSeller = true;
    } else if (resolution === 'partial_refund') {
      if (payment && resolutionAmount) {
        const refund = await stripeService.refundPayment({
          paymentIntentId: payment.stripePaymentIntentId,
          amount: resolutionAmount,
          reason: 'requested_by_customer',
        });
        payment.status = 'partially_refunded';
        payment.refundAmount = resolutionAmount;
        payment.refundReason = resolutionNote || 'Dispute resolved: partial refund';
        payment.refundedAt = new Date();
        payment.stripeRefundId = refund.id;
        await payment.save();
      }
      order.status = 'partially_refunded';
      await escrowService.penalizeSellerTier(order.seller, 'Valid dispute - partial refund issued');
      dispute.countedAgainstSeller = true;

      // Seller still gets paid for the non-refunded portion, if not already released
      if (order.status !== 'completed' && !order.fundsReleasedAt) {
        await escrowService.releaseFundsToSeller(order);
      }
    } else {
      // no_refund - dispute rejected, proceed with normal fund release to seller
      order.status = 'delivered';
      await order.save();
      if (!order.fundsReleasedAt) {
        await escrowService.releaseFundsToSeller(order);
      }
      dispute.countedAgainstSeller = false;
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolutionAmount = resolutionAmount || null;
    dispute.resolutionNote = resolutionNote;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    order.disputeRaised = false;
    await order.save();

    await auditLogService.log({
      action: 'DISPUTE_RESOLVED',
      entityType: 'Dispute',
      entityId: dispute._id,
      actorId: req.user._id,
      details: { resolution, resolutionAmount },
    });

    // Notify both parties using the shared dispute update template
    const buyerUser = await User.findById(dispute.buyer);
    const sellerUser = await User.findById(dispute.seller);

    if (buyerUser?.email) {
      await sendEmail({
        to: buyerUser.email,
        ...disputeUpdateEmail({
          name: buyerUser.name,
          orderNumber: order.orderNumber,
          resolution,
          resolutionNote,
        }),
      });
    }

    if (sellerUser?.email) {
      await sendEmail({
        to: sellerUser.email,
        ...disputeUpdateEmail({
          name: sellerUser.name,
          orderNumber: order.orderNumber,
          resolution,
          resolutionNote,
        }),
      });
    }

    return success(res, 200, 'Dispute resolved.', { dispute });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDispute,
  getMyDisputes,
  getDisputeById,
  getAllDisputesAdmin,
  resolveDispute,
};