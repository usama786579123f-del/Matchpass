const express = require('express');
const router = express.Router();

const { createReview, getReviewsForUser, hideReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { createReviewValidator } = require('../validators/reviewValidator');

router.post('/', protect, createReviewValidator, validate, createReview);
router.get('/user/:userId', getReviewsForUser);
router.patch('/:id/hide', protect, roleCheck('admin'), hideReview);

module.exports = router;