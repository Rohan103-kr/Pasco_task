const express = require('express');
const router = express.Router();
const { createTastingBooking, getTastingBookings } = require('../controllers/tastingController');

router.post('/', createTastingBooking);
router.get('/', getTastingBookings);

module.exports = router;
