const currencyService = require('../services/currencyService');
const { success } = require('../utils/apiResponse');

/**
 * @route   GET /api/currency/rates
 * @desc    Returns current conversion rates from GBP (base currency).
 *          Used by the frontend to show a "display only" estimate in
 *          the buyer's local currency next to the real GBP price.
 *          Actual checkout/payment always happens in GBP via Stripe.
 */
const getRates = async (req, res, next) => {
  try {
    const rates = await currencyService.getRates();
    return success(res, 200, 'Rates fetched.', { base: 'GBP', rates });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRates };