const express = require('express');
const router = express.Router();

const {
  setupTwoFactor,
  verifySetup,
  verifyLogin,
  disableTwoFactor,
} = require('../controllers/twoFactorController');

const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/setup', protect, setupTwoFactor);
router.post('/verify-setup', protect, verifySetup);
router.post('/verify-login', authLimiter, verifyLogin); // no `protect` - user isn't fully logged in yet
router.post('/disable', protect, disableTwoFactor);

module.exports = router;