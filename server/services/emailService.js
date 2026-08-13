const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM = {
  email: process.env.EMAIL_FROM || 'noreply@matchpass.com',
  name: process.env.EMAIL_FROM_NAME || 'MatchPass',
};

/**
 * Generic sender - all template files (in /templates) build { subject, html }
 * and pass it here. Keeps SendGrid coupling in one place so swapping to
 * Postmark later only requires changing this file.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      logger.warn(`SENDGRID_API_KEY not set - skipping email to ${to} (subject: ${subject})`);
      return;
    }
    await sgMail.send({ to, from: FROM, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    // Intentionally not re-throwing - a failed notification email should
    // never break the main business flow (signup, order, payout, etc.)
  }
};

module.exports = { sendEmail };