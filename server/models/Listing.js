const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    // ---- Ticket details ----
    section: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      trim: true,
    },
    seats: {
      type: String, // e.g. "12-13" or "GA" for general admission
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    ticketType: {
      type: String,
      enum: ['e-ticket', 'mobile-transfer', 'physical', 'season-card'],
      required: true,
    },

    // ---- Pricing ----
    pricePerTicket: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'GBP',
    },
    faceValue: Number,
    systemSuggestedPrice: Number,

    // ---- Status ----
    status: {
      type: String,
      enum: ['active', 'sold', 'withdrawn', 'expired', 'flagged', 'removed'],
      default: 'active',
    },

    // ---- Moderation ----
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderationNote: String,

    description: String,
    // Seller-uploaded photo of the actual ticket (builds buyer trust) —
    // uploaded via POST /uploads then the returned URL is saved here.
    photoUrl: String,
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

listingSchema.index({ event: 1, status: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ pricePerTicket: 1 });

module.exports = mongoose.model('Listing', listingSchema);