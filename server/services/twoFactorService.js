const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * TOTP-based 2FA for admin accounts (Google Authenticator, Authy, etc.).
 * Flow: generateSecret() -> show QR to admin -> admin scans it ->
 * verifyToken() confirms setup -> secret saved on User -> every
 * subsequent login also calls verifyToken() with a fresh code.
 */

const generateSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `MatchPass Admin (${email})`,
    length: 20,
  });
  return secret; // { base32, otpauth_url, ... }
};

const generateQRCode = async (otpauthUrl) => {
  return QRCode.toDataURL(otpauthUrl); // returns a base64 PNG data URL
};

const verifyToken = (secretBase32, token) => {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token,
    window: 1, // allows the code from 30s before/after for clock drift
  });
};

module.exports = { generateSecret, generateQRCode, verifyToken };