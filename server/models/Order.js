const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },
    pricePerTicket: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'GBP',
    },

    // ---- Order lifecycle ----
    status: {
      type: String,
      enum: [
        'pending_payment', // checkout started
        'paid_escrow_held', // payment succeeded, funds held
        'proof_uploaded', // seller uploaded delivery proof
        'delivered', // buyer confirmed OR grace period passed
        'completed', // funds released to seller
        'disputed', // buyer raised dispute
        'refunded', // full refund issued
        'partially_refunded',
        'cancelled', // seller missed delivery deadline
      ],
      default: 'pending_payment',
    },

    // ---- Delivery tracking ----
    deliveryDeadline: Date, // 48hrs after sale
    proofUploadedAt: Date,
    proofFileUrl: String,
    buyerConfirmedAt: Date,

    // ---- Escrow / settlement ----
    matchDate: Date,
    graceReleaseAt: Date, // 24hrs after match
    fundsReleasedAt: Date,

    disputeRaised: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryDeadline: 1 });
orderSchema.index({ graceReleaseAt: 1 });

module.exports = mongoose.model('Order', orderSchema);