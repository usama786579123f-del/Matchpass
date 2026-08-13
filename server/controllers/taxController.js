const taxReportService = require('../services/taxReportService');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @route   GET /api/tax/my-summary
 * @desc    Seller's own earnings summary for the current (or specified)
 *          UK tax year - for their personal records, not a filed return.
 * @access  Seller only
 * @query   year (optional) - a date string; defaults to today
 */
const getMyTaxSummary = async (req, res, next) => {
  try {
    const referenceDate = req.query.year ? new Date(req.query.year) : new Date();
    const summary = await taxReportService.getSellerTaxSummary(req.user._id, referenceDate);
    return success(res, 200, 'Tax summary fetched.', { summary });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/tax/admin/all-sellers
 * @desc    All sellers' earnings for the given UK tax year - compliance
 *          overview / export source.
 * @access  Admin only
 */
const getAllSellersTaxSummary = async (req, res, next) => {
  try {
    const referenceDate = req.query.year ? new Date(req.query.year) : new Date();
    const summary = await taxReportService.getAllSellersTaxSummary(referenceDate);
    return success(res, 200, 'Sellers tax summary fetched.', { summary });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyTaxSummary, getAllSellersTaxSummary };