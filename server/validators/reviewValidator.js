const { body } = require('express-validator');

const createReviewValidator = [
  body('orderId').isMongoId().withMessage('A valid order is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
];

module.exports = { createReviewValidator };