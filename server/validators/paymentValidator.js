const { body } = require('express-validator');

const manualPayoutValidator = [
  body('orderId').isMongoId().withMessage('A valid order is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('A valid payout amount is required'),
  body('note').trim().notEmpty().withMessage('An override note is required for audit purposes'),
];

module.exports = { manualPayoutValidator };