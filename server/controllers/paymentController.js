const Payment = require('../models/Payment');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @route   GET /api/payments/order/:orderId
 * @desc    Fetch payment record for an order (used on order detail /
 *          receipt view)
 */
const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId });
    if (!payment) throw new ApiError(404, 'Payment record not found.');

    const isParty =
      payment.buyer.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isParty) throw new ApiError(403, 'Access denied.');

    return success(res, 200, 'Payment fetched.', { payment });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPaymentByOrder };