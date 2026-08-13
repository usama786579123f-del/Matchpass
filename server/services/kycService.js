const stripe = require('../config/stripe');
const logger = require('../utils/logger');

/**
 * Creates a Stripe Identity VerificationSession for a seller.
 * Frontend redirects the seller to session.url to complete document capture.
 * We store the session id on the user and confirm status via webhook.
 */
const createVerificationSession = async (user) => {
  const session = await stripe.identity.verificationSessions.create({
    type: 'document',
    metadata: { userId: user._id.toString() },
    options: {
      document: {
        require_id_number: false,
        require_live_capture: true,
        require_matching_selfie: true,
      },
    },
    return_url: `${process.env.CLIENT_URL}/seller/kyc?status=complete`,
  });

  return session;
};

const retrieveVerificationSession = async (sessionId) => {
  return stripe.identity.verificationSessions.retrieve(sessionId);
};

/**
 * Creates (or reuses) a Stripe Connect Express account for seller payouts.
 * Called once, first time a seller starts onboarding.
 *
 * NOTE: GB accounts require card_payments to be requested alongside
 * transfers (Stripe API requirement for the default "full" service
 * agreement) - without it, account creation fails with an error about
 * needing the "recipient" service agreement type instead.
 */
const createConnectAccount = async (user) => {
  if (user.stripeConnect?.accountId) {
    return { id: user.stripeConnect.accountId };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'GB',
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: { userId: user._id.toString() },
  });

  logger.info(`Stripe Connect account created for user ${user._id}: ${account.id}`);
  return account;
};

const createConnectOnboardingLink = async (accountId) => {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.CLIENT_URL}/seller/payouts?refresh=true`,
    return_url: `${process.env.CLIENT_URL}/seller/payouts?onboarding=complete`,
    type: 'account_onboarding',
  });
};

module.exports = {
  createVerificationSession,
  retrieveVerificationSession,
  createConnectAccount,
  createConnectOnboardingLink,
};