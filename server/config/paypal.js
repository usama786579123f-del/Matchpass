const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * PayPal sandbox by default; switch to LiveEnvironment once real
 * merchant credentials are configured for production.
 */
const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.PAYPAL_MODE === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => new checkoutNodeJssdk.core.PayPalHttpClient(environment());

module.exports = { client, checkoutNodeJssdk };