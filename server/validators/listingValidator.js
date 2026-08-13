const { body } = require('express-validator');

const createListingValidator = [
  body('event').isMongoId().withMessage('A valid event must be selected'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('row').optional().trim(),
  body('seats').optional().trim(),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('ticketType')
    .isIn(['e-ticket', 'mobile-transfer', 'physical', 'season-card'])
    .withMessage('Invalid ticket type'),
  body('pricePerTicket').isFloat({ min: 1 }).withMessage('Price must be at least £1'),
  body('faceValue').optional().isFloat({ min: 0 }),
  body('description').optional().trim().isLength({ max: 1000 }),
];

const updateListingValidator = [
  body('pricePerTicket').optional().isFloat({ min: 1 }).withMessage('Price must be at least £1'),
  body('description').optional().trim().isLength({ max: 1000 }),
];

module.exports = { createListingValidator, updateListingValidator };