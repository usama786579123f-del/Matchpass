const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

/**
 * Runs after express-validator chain(s) in a route.
 * Usage: router.post('/x', [body('email').isEmail()], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(400, 'Validation failed.', formatted));
  }
  next();
};

module.exports = validate;