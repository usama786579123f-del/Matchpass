const { body } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Please provide a valid phone number'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

module.exports = { updateProfileValidator, changePasswordValidator };