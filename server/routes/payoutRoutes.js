const express = require('express');
const router = express.Router();

const {
  getMyPayouts,
  getPayoutById,
  getAllPayoutsAdmin,
  manualPayoutOverride,
} = require('../controllers/payoutController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { manualPayoutValidator } = require('../validators/paymentValidator');

router.get('/my-payouts', protect, roleCheck('seller'), getMyPayouts);
router.get('/admin/all', protect, roleCheck('admin'), getAllPayoutsAdmin);
router.post(
  '/admin/manual-override',
  protect,
  roleCheck('admin'),
  manualPayoutValidator,
  validate,
  manualPayoutOverride
);
router.get('/:id', protect, getPayoutById);

module.exports = router;