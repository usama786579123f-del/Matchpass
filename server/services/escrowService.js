const { PLATFORM_FEE_PERCENT, DELIVERY_WINDOW_HOURS, POST_MATCH_GRACE_HOURS } = require('../utils/constants');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Listing = require('../models/Listing');
const User = require('../models/User');
const stripeService = require('./stripeService');
const auditLogService = require('./auditLogService');
const logger = require('../utils/logger');
const { sendEmail } = require('./emailService');
const payoutNoticeEmail = require('../templates/payoutNoticeEmail');

/**
 * Central place for every money-moving business rule in the escrow
 * lifecycle. Controllers and cron jobs call into here rather than
 * touching Stripe or the Order model directly — keeps the sensitive
 * logic in ONE place, easy to audit.
 */

const calculateFees = (pricePerTicket, quantity) => {
  const subtotal = Math.round(pricePerTicket * quantity * 100) / 100;
  const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + platformFee) * 100) / 100;
  return { subtotal, platformFee, totalAmount };
};

const generateOrderNumber = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MP-${Date.now().toString().slice(-6)}-${rand}`;
};

/**
 * Called right after Stripe confirms payment succeeded (via webhook).
 * Moves order into escrow-held state and starts the 48hr delivery clock.
 */
const markOrderEscrowHeld = async (order) => {
  order.status = 'paid_escrow_held';
  order.deliveryDeadline = new Date(Date.now() + DELIVERY_WINDOW_HOURS * 60 * 60 * 1000);
  await order.save();

  // Lock the listing so it can't be sold twice
  await Listing.findByIdAndUpdate(order.listing, { status: 'sold' });

  await auditLogService.log({
    action: 'ORDER_ESCROW_HELD',
    entityType: 'Order',
    entityId: order._id,
    details: { deliveryDeadline: order.deliveryDeadline },
  });

  return order;
};

/**
 * Seller uploads delivery proof. Once uploaded, we know the match date
 * to schedule the eventual grace-period release.
 */
const markProofUploaded = async (order, proofFileUrl, matchDate) => {
  order.status = 'proof_uploaded';
  order.proofUploadedAt = new Date();
  order.proofFileUrl = proofFileUrl;
  order.matchDate = matchDate;
  order.graceReleaseAt = new Date(new Date(matchDate).getTime() + POST_MATCH_GRACE_HOURS * 60 * 60 * 1000);
  await order.save();

  await auditLogService.log({
    action: 'ORDER_PROOF_UPLOADED',
    entityType: 'Order',
    entityId: order._id,
    details: { graceReleaseAt: order.graceReleaseAt },
  });

  return order;
};

/**
 * Buyer explicitly confirms receipt — releases funds immediately
 * rather than waiting for the full grace period.
 */
const confirmDeliveryAndRelease = async (order) => {
  if (!['proof_uploaded'].includes(order.status)) {
    throw new Error(`Cannot confirm delivery for order in status: ${order.status}`);
  }
  order.buyerConfirmedAt = new Date();
  order.status = 'delivered';
  await order.save();

  return releaseFundsToSeller(order);
};

/**
 * Core release: transfers seller's share via Stripe Connect, creates
 * a Payout record, marks order completed. Called either by buyer
 * confirmation or by the automated grace-period cron job.
 */
const releaseFundsToSeller = async (order) => {
  const seller = await User.findById(order.seller);

  if (!seller.stripeConnect?.accountId || !seller.stripeConnect?.payoutsEnabled) {
    logger.error(`Cannot release funds for order ${order._id} — seller Connect account not ready.`);
    // Leave order as-is; admin will see this in reports and can manually override.
    return null;
  }

  const sellerAmount = Math.round((order.subtotal) * 100) / 100;

  const transfer = await stripeService.transferToSeller({
    amount: sellerAmount,
    currency: order.currency,
    connectAccountId: seller.stripeConnect.accountId,
    orderId: order._id.toString(),
  });

  const payout = await Payout.create({
    order: order._id,
    seller: seller._id,
    amount: sellerAmount,
    platformFeeDeducted: order.platformFee,
    currency: order.currency,
    stripeTransferId: transfer.id,
    stripeConnectAccountId: seller.stripeConnect.accountId,
    status: 'paid',
    scheduledReleaseAt: order.graceReleaseAt,
    releasedAt: new Date(),
  });

  order.status = 'completed';
  order.fundsReleasedAt = new Date();
  await order.save();

  await auditLogService.log({
    action: 'FUNDS_RELEASED',
    entityType: 'Order',
    entityId: order._id,
    details: { payoutId: payout._id, amount: sellerAmount },
  });

  if (seller.email) {
    await sendEmail({
      to: seller.email,
      ...payoutNoticeEmail({
        sellerName: seller.name,
        orderNumber: order.orderNumber,
        amount: sellerAmount,
        currency: order.currency,
      }),
    });
  }

  return payout;
};

/**
 * EDGE CASE: seller misses the 48hr delivery deadline entirely.
 * Auto-refund the buyer in full, reverse escrow, cancel the order,
 * relist nothing (listing stays 'sold' -> flip back to withdrawn since
 * the seller failed), and penalize the seller's tier.
 */
const handleMissedDeliveryDeadline = async (order) => {
  const Payment = require('../models/Payment');
  const payment = await Payment.findOne({ order: order._id, status: 'succeeded' });

  if (payment) {
    const refund = await stripeService.refundPayment({
      paymentIntentId: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundedAt = new Date();
    payment.refundReason = 'Seller missed 48-hour delivery deadline';
    payment.stripeRefundId = refund.id;
    await payment.save();
  }

  order.status = 'cancelled';
  await order.save();

  await Listing.findByIdAndUpdate(order.listing, { status: 'expired' });

  await penalizeSellerTier(order.seller, 'Missed delivery deadline');

  await auditLogService.log({
    action: 'ORDER_AUTO_REFUNDED_MISSED_DEADLINE',
    entityType: 'Order',
    entityId: order._id,
  });

  return order;
};

/**
 * EDGE CASE: repeated valid disputes downgrade seller tier, per brief.
 */
const penalizeSellerTier = async (sellerId, reasonNote) => {
  const { VALID_DISPUTE_DOWNGRADE_THRESHOLD } = require('../utils/constants');
  const seller = await User.findById(sellerId);
  if (!seller) return;

  seller.validDisputeCount += 1;

  if (seller.validDisputeCount >= VALID_DISPUTE_DOWNGRADE_THRESHOLD) {
    if (seller.sellerTier === 'trusted') seller.sellerTier = 'standard';
    else if (seller.sellerTier === 'standard' || seller.sellerTier === 'new') seller.sellerTier = 'restricted';
    seller.validDisputeCount = 0; // reset counter after applying downgrade
  }

  await seller.save({ validateBeforeSave: false });

  await auditLogService.log({
    action: 'SELLER_TIER_PENALTY',
    entityType: 'User',
    entityId: seller._id,
    details: { reason: reasonNote, newTier: seller.sellerTier },
  });
};

module.exports = {
  calculateFees,
  generateOrderNumber,
  markOrderEscrowHeld,
  markProofUploaded,
  confirmDeliveryAndRelease,
  releaseFundsToSeller,
  handleMissedDeliveryDeadline,
  penalizeSellerTier,
};