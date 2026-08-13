const Venue = require('../models/Venue');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @route   GET /api/venues
 * @desc    List all venues (used in admin event form + public filters)
 */
const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find().sort({ name: 1 });
    return success(res, 200, 'Venues fetched.', { venues });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/venues/:id
 */
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) throw new ApiError(404, 'Venue not found.');
    return success(res, 200, 'Venue fetched.', { venue });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/venues
 * @access  Admin only
 */
const createVenue = async (req, res, next) => {
  try {
    const venue = await Venue.create(req.body);
    return success(res, 201, 'Venue created.', { venue });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/venues/:id
 * @access  Admin only
 */
const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!venue) throw new ApiError(404, 'Venue not found.');
    return success(res, 200, 'Venue updated.', { venue });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/venues/:id
 * @access  Admin only
 */
const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) throw new ApiError(404, 'Venue not found.');
    return success(res, 200, 'Venue deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getVenues, getVenueById, createVenue, updateVenue, deleteVenue };