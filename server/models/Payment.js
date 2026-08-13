const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ---- Stripe ----
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    stripeChargeId: String,
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal'],
      default: 'card',
    },

    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'GBP',
    },

    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },

    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: String,
    refundedAt: Date,
    stripeRefundId: String,

    failureReason: String,
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);