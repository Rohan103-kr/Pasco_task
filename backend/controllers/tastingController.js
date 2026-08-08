const TastingBooking = require('../models/TastingBooking');
const fs = require('fs');
const path = require('path');

const tastingJsonPath = path.join(__dirname, '../data/tasting_bookings.json');

// Helper to get local bookings
const getLocalTastingBookings = () => {
  try {
    if (!fs.existsSync(tastingJsonPath)) {
      fs.writeFileSync(tastingJsonPath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(tastingJsonPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Helper to save local booking
const saveLocalTastingBooking = (booking) => {
  try {
    const bookings = getLocalTastingBookings();
    bookings.unshift(booking);
    fs.writeFileSync(tastingJsonPath, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local tasting booking:', e.message);
  }
};

// @desc    Create new taste slot booking
// @route   POST /api/tastings
// @access  Public
const createTastingBooking = async (req, res) => {
  try {
    const { productCode, productName, productImage, store, tastingDate, tastingTimeSlot, partySize, customer } = req.body;

    if (!productCode || !productName || !store || !tastingDate || !tastingTimeSlot || !customer || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields for booking a taste slot.'
      });
    }

    const bookingReference = `PASCO-TASTE-${Math.floor(10000 + Math.random() * 90000)}`;

    const bookingData = {
      bookingReference,
      productCode,
      productName,
      productImage: productImage || '',
      store,
      tastingDate,
      tastingTimeSlot,
      partySize: partySize || 1,
      customer,
      createdAt: new Date().toISOString()
    };

    // Try MongoDB
    try {
      const newBooking = new TastingBooking(bookingData);
      const savedBooking = await newBooking.save();
      saveLocalTastingBooking(savedBooking.toObject());

      return res.status(201).json({
        success: true,
        message: 'Taste slot booked successfully!',
        booking: savedBooking
      });
    } catch (dbErr) {
      console.log('MongoDB unavailable for tasting booking, using local JSON storage fallback:', dbErr.message);
      saveLocalTastingBooking(bookingData);

      return res.status(201).json({
        success: true,
        message: 'Taste slot booked successfully! (Saved locally)',
        booking: bookingData
      });
    }
  } catch (error) {
    console.error('Error creating tasting booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while booking taste slot.'
    });
  }
};

// @desc    Get all taste bookings
// @route   GET /api/tastings
// @access  Public
const getTastingBookings = async (req, res) => {
  try {
    try {
      const bookings = await TastingBooking.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, bookings });
    } catch (e) {
      const localBookings = getLocalTastingBookings();
      return res.status(200).json({ success: true, bookings: localBookings });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving tasting bookings.' });
  }
};

module.exports = {
  createTastingBooking,
  getTastingBookings
};
