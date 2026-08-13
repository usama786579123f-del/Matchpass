const Listing = require('../models/Listing');
const Event = require('../models/Event');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @route   GET /api/listings/price-suggestion
 * @desc    Suggests a price based on the average of active listings
 *          for the same event + section (used on the listing form)
 */
const getPriceSuggestion = async (req, res, next) => {
  try {
    const { eventId, section } = req.query;
    if (!eventId) throw new ApiError(400, 'eventId is required.');

    const filter = { event: eventId, status: 'active', moderationStatus: 'approved' };
    if (section) filter.section = section;

    const listings = await Listing.find(filter).select('pricePerTicket');

    if (listings.length === 0) {
      return success(res, 200, 'No comparable listings yet.', { suggestedPrice: null, sampleSize: 0 });
    }

    const avg =
      listings.reduce((sum, l) => sum + l.pricePerTicket, 0) / listings.length;
    const lowest = Math.min(...listings.map((l) => l.pricePerTicket));

    return success(res, 200, 'Price suggestion calculated.', {
      suggestedPrice: Math.round(avg),
      lowestPrice: lowest,
      sampleSize: listings.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/listings
 * @access  Verified seller only (requireVerifiedSeller middleware)
 */
const createListing = async (req, res, next) => {
  try {
    const event = await Event.findById(req.body.event);
    if (!event || !event.isActive) throw new ApiError(404, 'Event not found.');
    if (event.status === 'completed' || event.status === 'cancelled') {
      throw new ApiError(400, 'Cannot list tickets for a completed or cancelled event.');
    }

    const listing = await Listing.create({
      ...req.body,
      seller: req.user._id,
      moderationStatus: 'pending', // goes through admin moderation before going live
    });

    return success(res, 201, 'Listing created and pending review.', { listing });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/listings/my-listings
 * @access  Seller only
 */
const getMyListings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { seller: req.user._id };
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .populate('event', 'title eventDate homeTeam awayTeam')
      .sort({ createdAt: -1 });

    return success(res, 200, 'Listings fetched.', { listings });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/listings/:id
 */
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('event')
      .populate('seller', 'name sellerTier createdAt');

    if (!listing) throw new ApiError(404, 'Listing not found.');

    // increment view count (fire and forget, not blocking response)
    Listing.updateOne({ _id: listing._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    return success(res, 200, 'Listing fetched.', { listing });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/listings/:id
 * @access  Owning seller only — can only edit price/description/photo while still active
 */
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ApiError(404, 'Listing not found.');

    if (listing.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only edit your own listings.');
    }

    if (listing.status !== 'active') {
      throw new ApiError(400, `Cannot edit a listing that is ${listing.status}.`);
    }

    const { pricePerTicket, description, photoUrl } = req.body;
    if (pricePerTicket !== undefined) listing.pricePerTicket = pricePerTicket;
    if (description !== undefined) listing.description = description;
    if (photoUrl !== undefined) listing.photoUrl = photoUrl;

    // Price edits re-enter moderation queue to prevent bait-and-switch pricing
    if (pricePerTicket !== undefined) {
      listing.moderationStatus = 'pending';
    }

    await listing.save();

    return success(res, 200, 'Listing updated.', { listing });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/listings/:id/withdraw
 * @access  Owning seller only
 */
const withdrawListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ApiError(404, 'Listing not found.');

    if (listing.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only withdraw your own listings.');
    }

    if (listing.status !== 'active') {
      throw new ApiError(400, `Cannot withdraw a listing that is already ${listing.status}.`);
    }

    listing.status = 'withdrawn';
    await listing.save();

    return success(res, 200, 'Listing withdrawn.', { listing });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPriceSuggestion,
  createListing,
  getMyListings,
  getListingById,
  updateListing,
  withdrawListing,
};