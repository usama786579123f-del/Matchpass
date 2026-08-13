const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    league: {
      type: String,
      required: true,
      trim: true,
    },
    homeTeam: {
      type: String,
      required: true,
      trim: true,
    },
    awayTeam: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    imageUrl: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
      default: 'upcoming',
    },
    // Cached for performance - updated when listings change
    lowestPrice: {
      type: Number,
      default: null,
    },
    listingCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ eventDate: 1 });
eventSchema.index({ league: 1 });
eventSchema.index({ homeTeam: 'text', awayTeam: 'text', title: 'text' });

module.exports = mongoose.model('Event', eventSchema);