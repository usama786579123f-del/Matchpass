const express = require('express');
const router = express.Router();

const {
  getEvents,
  getFeaturedEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { eventValidator } = require('../validators/eventValidator');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/:slug', getEventBySlug);

router.post('/', protect, roleCheck('admin'), eventValidator, validate, createEvent);
router.patch('/:id', protect, roleCheck('admin'), updateEvent);
router.delete('/:id', protect, roleCheck('admin'), deleteEvent);

module.exports = router;