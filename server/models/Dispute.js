const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
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
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reason: {
      type: String,
      enum: [
        'ticket_not_received',
        'invalid_ticket',
        'wrong_ticket',
        'denied_entry',
        'seller_unresponsive',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidenceUrls: [String], // photo evidence uploaded by buyer

    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open',
    },

    // ---- Admin resolution (must resolve within 48hrs per brief) ----
    reviewDeadline: Date,
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: {
      type: String,
      enum: ['full_refund', 'partial_refund', 'no_refund', null],
      default: null,
    },
    resolutionAmount: Number,
    resolutionNote: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,

    // ---- Seller tier impact ----
    countedAgainstSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

disputeSchema.index({ order: 1 });
disputeSchema.index({ buyer: 1 });
disputeSchema.index({ seller: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ reviewDeadline: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);