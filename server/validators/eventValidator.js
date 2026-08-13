const { body } = require('express-validator');

const eventValidator = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('league').trim().notEmpty().withMessage('League is required'),
  body('homeTeam').trim().notEmpty().withMessage('Home team is required'),
  body('awayTeam').trim().notEmpty().withMessage('Away team is required'),
  body('venue').isMongoId().withMessage('A valid venue must be selected'),
  body('eventDate').isISO8601().toDate().withMessage('A valid event date is required'),
];

module.exports = { eventValidator };