const express = require('express');
const router = express.Router();

const {
  createDispute,
  getMyDisputes,
  getDisputeById,
  getAllDisputesAdmin,
  resolveDispute,
} = require('../controllers/disputeController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createDisputeValidator, resolveDisputeValidator } = require('../validators/disputeValidator');

router.post(
  '/',
  protect,
  roleCheck('buyer'),
  upload.array('evidence', 5), // up to 5 evidence photos
  createDisputeValidator,
  validate,
  createDispute
);

router.get('/my-disputes', protect, roleCheck('buyer'), getMyDisputes);
router.get('/admin/all', protect, roleCheck('admin'), getAllDisputesAdmin);
router.get('/:id', protect, getDisputeById);
router.patch('/:id/resolve', protect, roleCheck('admin'), resolveDisputeValidator, validate, resolveDispute);

module.exports = router;