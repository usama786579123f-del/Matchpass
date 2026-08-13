const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const Event = require('../models/Event');
const Listing = require('../models/Listing');
const { ApiError, success } = require('../utils/apiResponse');
const { buildEventFilter, buildSortOption } = require('../services/searchService');

/**
 * @route   GET /api/events
 * @desc    Public browse/search with pagination — powers homepage + search results page
 */
const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = buildEventFilter(req.query);
    const sort = buildSortOption(req.query.sort);

    const [events, total] = await Promise.all([
      Event.find(filter).populate('venue', 'name city').sort(sort).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    return success(res, 200, 'Events fetched.', { events }, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/featured
 * @desc    Homepage "featured events" section
 */
const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, isActive: true, status: 'upcoming' })
      .populate('venue', 'name city')
      .sort({ eventDate: 1 })
      .limit(8);

    return success(res, 200, 'Featured events fetched.', { events });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/:slug
 * @desc    Event detail page — includes active listings sorted by price
 */
const getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, isActive: true }).populate('venue');
    if (!event) throw new ApiError(404, 'Event not found.');

    const listings = await Listing.find({ event: event._id, status: 'active', moderationStatus: 'approved' })
      .populate('seller', 'name sellerTier')
      .sort({ pricePerTicket: 1 });

    return success(res, 200, 'Event fetched.', { event, listings });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/events
 * @access  Admin only
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, homeTeam, awayTeam, eventDate } = req.body;

    const baseSlug = slugify(`${homeTeam}-vs-${awayTeam}-${new Date(eventDate).toISOString().split('T')[0]}`);
    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const event = await Event.create({ ...req.body, slug });
    return success(res, 201, 'Event created.', { event });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/events/:id
 * @access  Admin only
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) throw new ApiError(404, 'Event not found.');
    return success(res, 200, 'Event updated.', { event });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/events/:id
 * @access  Admin only
 * @desc    Soft delete — keeps historical order/listing references intact
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!event) throw new ApiError(404, 'Event not found.');
    return success(res, 200, 'Event removed.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  getFeaturedEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
};