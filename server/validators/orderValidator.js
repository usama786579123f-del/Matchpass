const { body } = require('express-validator');

const createOrderValidator = [
  body('listingId').isMongoId().withMessage('A valid listing is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = { createOrderValidator };