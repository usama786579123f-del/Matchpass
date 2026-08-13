const Order = require('../models/Order');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Sends a reminder to sellers who are approaching (but haven't yet
 * missed) their 48hr delivery deadline — good UX, reduces missed
 * deadlines and therefore reduces disputes/refunds.
 * Runs once per hour; sends when deadline is between 6-7 hours away
 * (a 1-hour window keeps this idempotent-ish without needing a
 * "reminderSent" flag on the Order model for MVP).
 */
const runDeliveryReminders = async () => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const orders = await Order.find({
      status: 'paid_escrow_held',
      deliveryDeadline: { $gte: windowStart, $lte: windowEnd },
    })
      .populate('seller', 'name email')
      .populate('event', 'title eventDate');

    if (orders.length === 0) {
      logger.debug('[cron] reminderEmails: nothing to send.');
      return;
    }

    for (const order of orders) {
      await sendEmail({
        to: order.seller.email,
        subject: `Reminder: upload your ticket for ${order.event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
            <h2>Delivery deadline approaching</h2>
            <p>Hi ${order.seller.name},</p>
            <p>You have about 6 hours left to upload proof of delivery for order <strong>${order.orderNumber}</strong> (${order.event.title}).</p>
            <p>If the deadline passes without delivery, the buyer will be automatically refunded and this may affect your seller tier.</p>
            <a href="${process.env.CLIENT_URL}/seller/listings" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Upload Now</a>
          </div>
        `,
      });
    }

    logger.info(`[cron] reminderEmails: sent ${orders.length} deadline reminder(s).`);
  } catch (err) {
    logger.error(`[cron] reminderEmails fatal error: ${err.message}`);
  }
};

module.exports = runDeliveryReminders;