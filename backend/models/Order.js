const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    customerType: { type: String, enum: ['Retail Consumer', 'Wholesale / Foodservice'], default: 'Retail Consumer' },
    deliveryMethod: { type: String, default: 'Store Takeout / Pickup' },
    pickupStore: {
      id: { type: String },
      name: { type: String },
      address: { type: String },
      city: { type: String },
      postcode: { type: String },
      phone: { type: String }
    },
    pickupDate: { type: String },
    pickupTimeSlot: { type: String },
    address: { type: String },
    city: { type: String },
    postcode: { type: String },
    notes: { type: String }
  },
  items: [
    {
      productCode: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: String },
      category: { type: String },
      rangeType: { type: String },
      unitBarcode: { type: String },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  totalItems: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay Secure Gateway'
  },
  paymentStatus: {
    type: String,
    default: 'Paid'
  },
  paymentTransactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Submitted to Headquarters', 'Processing', 'Ready for Dispatch / Collection', 'Completed'],
    default: 'Submitted to Headquarters'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
