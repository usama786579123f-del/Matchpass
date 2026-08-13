const welcomeEmail = ({ name, verifyUrl }) => ({
  subject: 'Verify your MatchPass account',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #0f172a;">Welcome to MatchPass, ${name}!</h2>
      <p>You're one step away from buying and selling match tickets with confidence.</p>
      <p>Please verify your email address to activate your account:</p>
      <a href="${verifyUrl}"
         style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #64748b; font-size: 14px;">If you didn't create a MatchPass account, you can safely ignore this email.</p>
      <p style="color: #64748b; font-size: 14px;">This link expires in 24 hours.</p>
    </div>
  `,
});

module.exports = welcomeEmail;