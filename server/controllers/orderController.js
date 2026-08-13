const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { ApiError, success } = require('../utils/apiResponse');
const escrowService = require('../services/escrowService');
const stripeService = require('../services/stripeService');
const paypalService = require('../services/paypalService');

/**
 * @route   POST /api/orders/checkout
 * @desc    Buyer initiates checkout for a listing via Stripe - creates
 *          the Order (pending_payment) and a Stripe PaymentIntent
 *          (client_secret returned so the frontend can complete
 *          Stripe's Payment Element).
 * @access  Buyer only
 */
const createCheckout = async (req, res, next) => {
  try {
    const { listingId, quantity } = req.body;

    const listing = await Listing.findById(listingId).populate('event');
    if (!listing) throw new ApiError(404, 'Listing not found.');

    if (listing.status !== 'active' || listing.moderationStatus !== 'approved') {
      throw new ApiError(400, 'This listing is no longer available.');
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot purchase your own listing.');
    }

    if (quantity > listing.quantity) {
      throw new ApiError(400, `Only ${listing.quantity} ticket(s) available for this listing.`);
    }

    const { subtotal, platformFee, totalAmount } = escrowService.calculateFees(
      listing.pricePerTicket,
      quantity
    );

    let buyer = req.user;
    if (!buyer.stripeCustomerId) {
      const customer = await stripeService.createCustomer({ email: buyer.email, name: buyer.name });
      buyer.stripeCustomerId = customer.id;
      await buyer.save({ validateBeforeSave: false });
    }

    const order = await Order.create({
      orderNumber: escrowService.generateOrderNumber(),
      buyer: buyer._id,
      seller: listing.seller,
      listing: listing._id,
      event: listing.event._id,
      quantity,
      pricePerTicket: listing.pricePerTicket,
      subtotal,
      platformFee,
      totalAmount,
      currency: listing.currency,
      status: 'pending_payment',
    });

    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalAmount,
      currency: listing.currency,
      buyerStripeCustomerId: buyer.stripeCustomerId,
      orderId: order._id.toString(),
      metadata: { buyerId: buyer._id.toString(), sellerId: listing.seller.toString() },
    });

    await Payment.create({
      order: order._id,
      buyer: buyer._id,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: 'card',
      amount: totalAmount,
      currency: listing.currency,
      status: 'pending',
    });

    return success(res, 201, 'Checkout initiated.', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/orders/checkout-paypal
 * @desc    Same validation/order-creation as Stripe checkout, but
 *          creates a PayPal order instead of a Stripe PaymentIntent.
 *          Returns the PayPal order id for the frontend PayPal button.
 * @access  Buyer only
 */
const createCheckoutPaypal = async (req, res, next) => {
  try {
    const { listingId, quantity } = req.body;

    const listing = await Listing.findById(listingId).populate('event');
    if (!listing) throw new ApiError(404, 'Listing not found.');

    if (listing.status !== 'active' || listing.moderationStatus !== 'approved') {
      throw new ApiError(400, 'This listing is no longer available.');
    }
    if (listing.seller.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot purchase your own listing.');
    }
    if (quantity > listing.quantity) {
      throw new ApiError(400, `Only ${listing.quantity} ticket(s) available for this listing.`);
    }

    const { subtotal, platformFee, totalAmount } = escrowService.calculateFees(
      listing.pricePerTicket,
      quantity
    );

    const order = await Order.create({
      orderNumber: escrowService.generateOrderNumber(),
      buyer: req.user._id,
      seller: listing.seller,
      listing: listing._id,
      event: listing.event._id,
      quantity,
      pricePerTicket: listing.pricePerTicket,
      subtotal,
      platformFee,
      totalAmount,
      currency: listing.currency,
      status: 'pending_payment',
    });

    const paypalOrder = await paypalService.createOrder({
      amount: totalAmount,
      currency: listing.currency,
      orderId: order._id.toString(),
    });

    await Payment.create({
      order: order._id,
      buyer: req.user._id,
      stripePaymentIntentId: 'paypal_' + paypalOrder.id,
      paymentMethod: 'paypal',
      amount: totalAmount,
      currency: listing.currency,
      status: 'pending',
    });

    return success(res, 201, 'PayPal checkout initiated.', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paypalOrderId: paypalOrder.id,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/orders/:id/capture-paypal
 * @desc    Called by the frontend after the buyer approves payment in
 *          the PayPal popup. Captures the funds and moves the order
 *          into escrow, same as the Stripe webhook does.
 * @access  Buyer only
 */
const capturePaypalOrder = async (req, res, next) => {
  try {
    const { paypalOrderId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found.');
    if (order.buyer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied.');
    }
    if (order.status !== 'pending_payment') {
      throw new ApiError(400, `Order is already in status: ${order.status}`);
    }

    const capture = await paypalService.captureOrder(paypalOrderId);
    const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    if (captureStatus !== 'COMPLETED') {
      throw new ApiError(402, 'PayPal payment was not completed.');
    }

    const payment = await Payment.findOne({ order: order._id, paymentMethod: 'paypal' });
    if (payment) {
      payment.status = 'succeeded';
      await payment.save();
    }

    const updatedOrder = await escrowService.markOrderEscrowHeld(order);

    return success(res, 200, 'Payment captured. Funds held in escrow.', { order: updatedOrder });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders/my-orders
 * @access  Buyer only
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('event', 'title eventDate homeTeam awayTeam imageUrl')
      .populate('seller', 'name sellerTier')
      .sort({ createdAt: -1 });

    return success(res, 200, 'Orders fetched.', { orders });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders/my-sales
 * @access  Seller only
 */
const getMySales = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('event', 'title eventDate homeTeam awayTeam')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });

    return success(res, 200, 'Sales fetched.', { orders });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders/:id
 * @access  Buyer or seller on this order, or admin
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('event')
      .populate('listing')
      .populate('buyer', 'name email')
      .populate('seller', 'name sellerTier');

    if (!order) throw new ApiError(404, 'Order not found.');

    const isParty =
      order.buyer._id.toString() === req.user._id.toString() ||
      order.seller._id.toString() === req.user._id.toString();

    if (!isParty && req.user.role !== 'admin') {
      throw new ApiError(403, 'You do not have access to this order.');
    }

    return success(res, 200, 'Order fetched.', { order });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/orders/:id/upload-proof
 * @access  Seller (owner) only
 */
const uploadDeliveryProof = async (req, res, next) => {
  try {
    const { proofFileUrl } = req.body;
    if (!proofFileUrl) throw new ApiError(400, 'proofFileUrl is required.');

    const order = await Order.findById(req.params.id).populate('event');
    if (!order) throw new ApiError(404, 'Order not found.');

    if (order.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only upload proof for your own sales.');
    }

    if (order.status !== 'paid_escrow_held') {
      throw new ApiError(400, `Cannot upload proof for an order in status: ${order.status}`);
    }

    if (order.deliveryDeadline && new Date() > order.deliveryDeadline) {
      throw new ApiError(400, 'The delivery deadline for this order has passed.');
    }

    const updated = await escrowService.markProofUploaded(order, proofFileUrl, order.event.eventDate);

    return success(res, 200, 'Delivery proof uploaded. Buyer has been notified.', { order: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/orders/:id/confirm-delivery
 * @access  Buyer (owner) only
 */
const confirmDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found.');

    if (order.buyer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only confirm your own orders.');
    }

    if (order.status !== 'proof_uploaded') {
      throw new ApiError(400, `Cannot confirm delivery for an order in status: ${order.status}`);
    }

    await escrowService.confirmDeliveryAndRelease(order);
    const updated = await Order.findById(order._id);

    return success(res, 200, 'Delivery confirmed. Funds released to seller.', { order: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCheckout,
  createCheckoutPaypal,
  capturePaypalOrder,
  getMyOrders,
  getMySales,
  getOrderById,
  uploadDeliveryProof,
  confirmDelivery,
};