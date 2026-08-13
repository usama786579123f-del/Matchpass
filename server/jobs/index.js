const cron = require('node-cron');
const logger = require('../utils/logger');

const runDeliveryDeadlineCheck = require('./deliveryDeadlineCheck');
const runGracePeriodRelease = require('./gracePeriodRelease');
const runDeliveryReminders = require('./reminderEmails');

/**
 * Registers all scheduled jobs. Called once from server.js on boot.
 *
 * Schedule rationale:
 *  - Deadline check + grace release run every 15 min: money-moving
 *    logic should be checked frequently so nothing sits stale for hours.
 *  - Reminder emails run hourly: no need for tighter precision on a
 *    courtesy notification.
 */
const initCronJobs = () => {
  cron.schedule('*/15 * * * *', () => {
    logger.debug('[cron] Running deliveryDeadlineCheck...');
    runDeliveryDeadlineCheck();
  });

  cron.schedule('*/15 * * * *', () => {
    logger.debug('[cron] Running gracePeriodRelease...');
    runGracePeriodRelease();
  });

  cron.schedule('0 * * * *', () => {
    logger.debug('[cron] Running reminderEmails...');
    runDeliveryReminders();
  });

  logger.info('Cron jobs initialized: deliveryDeadlineCheck (15m), gracePeriodRelease (15m), reminderEmails (1h).');
};

module.exports = { initCronJobs };