const { body } = require('express-validator');

const venueValidator = [
  body('name').trim().notEmpty().withMessage('Venue name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').optional().trim(),
  body('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
];

module.exports = { venueValidator };