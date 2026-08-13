const express = require('express');
const router = express.Router();

const { getPaymentByOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/order/:orderId', protect, getPaymentByOrder);

module.exports = router;