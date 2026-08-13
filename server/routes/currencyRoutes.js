const express = require('express');
const router = express.Router();

const { getRates } = require('../controllers/currencyController');

router.get('/rates', getRates);

module.exports = router;