const Order = require('../models/Order');
const escrowService = require('../services/escrowService');
const logger = require('../utils/logger');

/**
 * Runs periodically. Finds orders where:
 *  - Seller uploaded proof (status: proof_uploaded)
 *  - The 24hr post-match grace period has elapsed
 *  - Buyer never raised a dispute
 * ...and auto-releases funds to the seller, per brief:
 * "24-hour grace after match. No issue raised. -> Funds transferred to seller."
 */
const runGracePeriodRelease = async () => {
  try {
    const now = new Date();

    const readyOrders = await Order.find({
      status: 'proof_uploaded',
      graceReleaseAt: { $lt: now },
      disputeRaised: false,
    });

    if (readyOrders.length === 0) {
      logger.debug('[cron] gracePeriodRelease: no orders ready for release.');
      return;
    }

    logger.info(`[cron] gracePeriodRelease: releasing funds for ${readyOrders.length} order(s).`);

    for (const order of readyOrders) {
      try {
        order.status = 'delivered'; // grace period passing counts as implicit delivery confirmation
        await order.save();
        await escrowService.releaseFundsToSeller(order);
        logger.info(`[cron] Order ${order.orderNumber} funds released (grace period elapsed).`);
      } catch (err) {
        logger.error(`[cron] Failed to release funds for order ${order._id}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`[cron] gracePeriodRelease fatal error: ${err.message}`);
  }
};

module.exports = runGracePeriodRelease;