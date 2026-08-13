const stripe = require('../config/stripe');

/**
 * Creates a PaymentIntent with manual capture disabled (auto-capture),
 * but funds stay in MatchPass's platform balance until we explicitly
 * transfer to the seller's Connect account later (destination charge
 * pattern via separate transfer, NOT direct charge) — this IS our escrow.
 */
const createPaymentIntent = async ({ amount, currency, buyerStripeCustomerId, orderId, metadata }) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses smallest currency unit (pence)
    currency: currency.toLowerCase(),
    customer: buyerStripeCustomerId || undefined,
    metadata: { orderId, ...metadata },
    automatic_payment_methods: { enabled: true },
  });
};

const retrievePaymentIntent = async (paymentIntentId) => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Transfers the seller's share (total minus platform fee) from the
 * platform balance to the seller's Connect account. This is the
 * "release funds" step at the end of escrow.
 */
const transferToSeller = async ({ amount, currency, connectAccountId, orderId }) => {
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    destination: connectAccountId,
    metadata: { orderId },
  });
};

/**
 * Full or partial refund to the buyer. Used by dispute resolution
 * and by automatic refund-on-missed-deadline logic.
 */
const refundPayment = async ({ paymentIntentId, amount, reason }) => {
  const refundParams = { payment_intent: paymentIntentId, reason: reason || 'requested_by_customer' };
  if (amount !== undefined) {
    refundParams.amount = Math.round(amount * 100);
  }
  return stripe.refunds.create(refundParams);
};

/**
 * Reverses a transfer already sent to a seller (used when a valid
 * dispute is upheld AFTER funds were already released — rare, but
 * the brief explicitly calls out "escrow reversal" as a required flow).
 */
const reverseTransfer = async (transferId, amount) => {
  const params = {};
  if (amount !== undefined) params.amount = Math.round(amount * 100);
  return stripe.transfers.createReversal(transferId, params);
};

const createCustomer = async ({ email, name }) => {
  return stripe.customers.create({ email, name });
};

const constructWebhookEvent = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
  transferToSeller,
  refundPayment,
  reverseTransfer,
  createCustomer,
  constructWebhookEvent,
};