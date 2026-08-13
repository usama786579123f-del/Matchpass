const deliveryReminderEmail = ({ sellerName, orderNumber, eventTitle }) => ({
  subject: `Reminder: upload your ticket for ${eventTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #b45309;">Delivery deadline approaching</h2>
      <p>Hi ${sellerName},</p>
      <p>You have about 6 hours left to upload proof of delivery for order <strong>${orderNumber}</strong> (${eventTitle}).</p>
      <p>If the deadline passes without delivery, the buyer will be automatically refunded and this may affect your seller tier.</p>
      <a href="${process.env.CLIENT_URL}/seller/listings"
         style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        Upload Now
      </a>
    </div>
  `,
});

module.exports = deliveryReminderEmail;