const express = require('express');
const router = express.Router();

const {
  createCheckout,
  createCheckoutPaypal,
  capturePaypalOrder,
  getMyOrders,
  getMySales,
  getOrderById,
  uploadDeliveryProof,
  confirmDelivery,
} = require('../controllers/orderController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { checkoutLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { createOrderValidator } = require('../validators/orderValidator');

router.post(
  '/checkout',
  protect,
  roleCheck('buyer'),
  checkoutLimiter,
  createOrderValidator,
  validate,
  createCheckout
);

router.post(
  '/checkout-paypal',
  protect,
  roleCheck('buyer'),
  checkoutLimiter,
  createOrderValidator,
  validate,
  createCheckoutPaypal
);

router.post('/:id/capture-paypal', protect, roleCheck('buyer'), capturePaypalOrder);

router.get('/my-orders', protect, roleCheck('buyer'), getMyOrders);
router.get('/my-sales', protect, roleCheck('seller'), getMySales);
router.get('/:id', protect, getOrderById);

router.post('/:id/upload-proof', protect, roleCheck('seller'), uploadDeliveryProof);
router.post('/:id/confirm-delivery', protect, roleCheck('buyer'), confirmDelivery);

module.exports = router;