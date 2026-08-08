const mongoose = require('mongoose');

const tastingBookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  productCode: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String
  },
  store: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    postcode: { type: String },
    phone: { type: String }
  },
  tastingDate: {
    type: String,
    required: true
  },
  tastingTimeSlot: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    default: 1
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TastingBooking', tastingBookingSchema);
