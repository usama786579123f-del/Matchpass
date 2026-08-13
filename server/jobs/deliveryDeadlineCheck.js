const Order = require('../models/Order');
const escrowService = require('../services/escrowService');
const logger = require('../utils/logger');

/**
 * Runs periodically (every 15 min, see jobs/index.js).
 * Finds orders where the seller was supposed to upload delivery proof
 * within 48 hours but didn't — auto-refunds the buyer and penalizes
 * the seller's tier, per brief: "Failed deliveries trigger automatic
 * refund to buyer, escrow reversal, and seller tier penalty."
 */
const runDeliveryDeadlineCheck = async () => {
  try {
    const now = new Date();

    const missedOrders = await Order.find({
      status: 'paid_escrow_held',
      deliveryDeadline: { $lt: now },
    });

    if (missedOrders.length === 0) {
      logger.debug('[cron] deliveryDeadlineCheck: no missed deadlines.');
      return;
    }

    logger.info(`[cron] deliveryDeadlineCheck: processing ${missedOrders.length} missed deadline(s).`);

    for (const order of missedOrders) {
      try {
        await escrowService.handleMissedDeliveryDeadline(order);
        logger.info(`[cron] Order ${order.orderNumber} auto-refunded (missed delivery deadline).`);
      } catch (err) {
        // One bad order should never stop the batch — log and continue.
        logger.error(`[cron] Failed to process missed deadline for order ${order._id}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`[cron] deliveryDeadlineCheck fatal error: ${err.message}`);
  }
};

module.exports = runDeliveryDeadlineCheck;