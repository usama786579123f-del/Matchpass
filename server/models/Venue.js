const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'United Kingdom',
    },
    address: String,
    capacity: Number,
    imageUrl: String,
    // Simple section list used for listing form dropdowns (e.g. "North Stand", "Block 12")
    sections: [String],
  },
  { timestamps: true }
);

venueSchema.index({ name: 1, city: 1 });

module.exports = mongoose.model('Venue', venueSchema);