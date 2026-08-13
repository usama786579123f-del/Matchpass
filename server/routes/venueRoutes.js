const express = require('express');
const router = express.Router();

const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { venueValidator } = require('../validators/venueValidator');

router.get('/', getVenues);
router.get('/:id', getVenueById);

router.post('/', protect, roleCheck('admin'), venueValidator, validate, createVenue);
router.patch('/:id', protect, roleCheck('admin'), updateVenue);
router.delete('/:id', protect, roleCheck('admin'), deleteVenue);

module.exports = router;