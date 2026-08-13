const { body } = require('express-validator');

const createDisputeValidator = [
  body('orderId').isMongoId().withMessage('A valid order is required'),
  body('reason')
    .isIn([
      'ticket_not_received',
      'invalid_ticket',
      'wrong_ticket',
      'denied_entry',
      'seller_unresponsive',
      'other',
    ])
    .withMessage('Invalid dispute reason'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Please describe the issue')
    .isLength({ max: 2000 }),
];

const resolveDisputeValidator = [
  body('resolution')
    .isIn(['full_refund', 'partial_refund', 'no_refund'])
    .withMessage('Invalid resolution type'),
  body('resolutionAmount')
    .if(body('resolution').equals('partial_refund'))
    .isFloat({ min: 0.01 })
    .withMessage('Partial refund amount is required'),
  body('resolutionNote').optional().trim().isLength({ max: 1000 }),
];

module.exports = { createDisputeValidator, resolveDisputeValidator };