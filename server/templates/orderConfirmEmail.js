const orderConfirmEmail = ({ name, orderNumber, eventTitle, totalAmount, currency }) => ({
  subject: `Order confirmed — ${orderNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #0f172a;">Your order is confirmed!</h2>
      <p>Hi ${name},</p>
      <p>We've received your payment for <strong>${eventTitle}</strong>. Your funds are held securely in escrow until delivery is confirmed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #64748b;">Order number</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${orderNumber}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Total paid</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${currency} ${totalAmount}</td></tr>
      </table>
      <a href="${process.env.CLIENT_URL}/buyer/orders"
         style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        Track Your Order
      </a>
      <p style="color: #64748b; font-size: 14px;">Your seller has 48 hours to upload delivery proof. We'll notify you as soon as it's ready.</p>
    </div>
  `,
});

module.exports = orderConfirmEmail;