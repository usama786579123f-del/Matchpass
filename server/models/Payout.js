const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    platformFeeDeducted: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'GBP',
    },

    stripeTransferId: String,
    stripeConnectAccountId: String,

    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'reversed', 'manual_override'],
      default: 'pending',
    },

    scheduledReleaseAt: Date, // 24hrs post-match grace period
    releasedAt: Date,

    // ---- Admin manual override ----
    isManualOverride: {
      type: Boolean,
      default: false,
    },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    overrideNote: String,

    failureReason: String,
  },
  { timestamps: true }
);

payoutSchema.index({ seller: 1 });
payoutSchema.index({ order: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ scheduledReleaseAt: 1 });

module.exports = mongoose.model('Payout', payoutSchema);