const { client, checkoutNodeJssdk } = require('../config/paypal');

/**
 * Mirrors stripeService's role for the Stripe flow - PayPal is the
 * alternate payment rail. Escrow semantics stay identical: funds land
 * in the platform's PayPal balance on capture, and the actual payout
 * to the seller still goes through Stripe Connect (PayPal is buyer-
 * facing only here, not used for seller payouts).
 */

const createOrder = async ({ amount, currency, orderId }) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: orderId,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      },
    ],
  });

  const response = await client().execute(request);
  return response.result; // includes id (paypalOrderId) and links (approval url)
};

const captureOrder = async (paypalOrderId) => {
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});
  const response = await client().execute(request);
  return response.result;
};

module.exports = { createOrder, captureOrder };