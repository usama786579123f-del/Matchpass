const kycStatusEmail = ({ name, status, rejectionReason }) => {
  const isVerified = status === 'verified';
  return {
    subject: isVerified ? 'Identity verified — you can now list tickets' : 'Identity verification update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: ${isVerified ? '#16a34a' : '#b45309'};">
          ${isVerified ? 'Verification complete ✓' : 'Verification needs attention'}
        </h2>
        <p>Hi ${name},</p>
        ${
          isVerified
            ? `<p>Your identity has been verified. You can now list tickets and set up payouts.</p>`
            : `<p>We couldn't verify your identity: ${rejectionReason || 'please check your submitted documents and try again.'}</p>`
        }
        <a href="${process.env.CLIENT_URL}/seller/kyc"
           style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          ${isVerified ? 'Start Listing' : 'Try Again'}
        </a>
      </div>
    `,
  };
};

module.exports = kycStatusEmail;