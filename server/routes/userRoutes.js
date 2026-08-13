const express = require('express');
const router = express.Router();

const {
  updateProfile,
  changePassword,
  startKycVerification,
  getKycStatus,
  startConnectOnboarding,
  getPublicProfile,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileValidator, changePasswordValidator } = require('../validators/userValidator');

router.patch('/profile', protect, updateProfileValidator, validate, updateProfile);
router.patch('/change-password', protect, changePasswordValidator, validate, changePassword);

router.post('/kyc/start', protect, startKycVerification);
router.get('/kyc/status', protect, getKycStatus);

router.post('/connect/onboard', protect, startConnectOnboarding);

router.get('/:id/public', getPublicProfile);

module.exports = router;