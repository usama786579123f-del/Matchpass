const express = require('express');
const router = express.Router();

const { getMyTaxSummary, getAllSellersTaxSummary } = require('../controllers/taxController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/my-summary', protect, roleCheck('seller'), getMyTaxSummary);
router.get('/admin/all-sellers', protect, roleCheck('admin'), getAllSellersTaxSummary);

module.exports = router;