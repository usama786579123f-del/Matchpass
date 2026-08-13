const payoutNoticeEmail = ({ sellerName, orderNumber, amount, currency }) => ({
  subject: `You've been paid — order ${orderNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #16a34a;">Payout sent 🎉</h2>
      <p>Hi ${sellerName},</p>
      <p>Great news — your payout for order <strong>${orderNumber}</strong> has been sent to your bank account via Stripe.</p>
      <p style="background: #f0fdf4; padding: 12px 16px; border-radius: 8px; font-size: 18px; font-weight: 600;">
        ${currency} ${amount}
      </p>
      <a href="${process.env.CLIENT_URL}/seller/payouts"
         style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        View Payout History
      </a>
    </div>
  `,
});

module.exports = payoutNoticeEmail;