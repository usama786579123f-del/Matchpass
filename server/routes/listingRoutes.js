const express = require('express');
const router = express.Router();

const {
  getPriceSuggestion,
  createListing,
  getMyListings,
  getListingById,
  updateListing,
  withdrawListing,
} = require('../controllers/listingController');

const { protect } = require('../middleware/auth');
const { requireVerifiedSeller } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { createListingValidator, updateListingValidator } = require('../validators/listingValidator');

router.get('/price-suggestion', protect, getPriceSuggestion);
router.get('/my-listings', protect, getMyListings);

router.post('/', protect, requireVerifiedSeller, createListingValidator, validate, createListing);
router.patch('/:id', protect, requireVerifiedSeller, updateListingValidator, validate, updateListing);
router.patch('/:id/withdraw', protect, requireVerifiedSeller, withdrawListing);

// Public detail route — must come AFTER /price-suggestion and /my-listings
// so those specific paths aren't swallowed by the :id param
router.get('/:id', getListingById);

module.exports = router;