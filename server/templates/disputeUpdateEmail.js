const disputeUpdateEmail = ({ name, orderNumber, resolution, resolutionNote }) => ({
  subject: `Update on your dispute — order ${orderNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #0f172a;">Dispute resolved</h2>
      <p>Hi ${name},</p>
      <p>Your dispute for order <strong>${orderNumber}</strong> has been reviewed and resolved.</p>
      <p style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px;">
        <strong>Outcome:</strong> ${resolution.replace(/_/g, ' ')}
      </p>
      ${resolutionNote ? `<p>${resolutionNote}</p>` : ''}
      <a href="${process.env.CLIENT_URL}"
         style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        View Order
      </a>
    </div>
  `,
});

module.exports = disputeUpdateEmail;