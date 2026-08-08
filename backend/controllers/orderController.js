const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');

const ordersJsonPath = path.join(__dirname, '../data/orders.json');

// Helper to append to local orders.json backup file
const saveToLocalOrdersJson = (orderData) => {
  try {
    let orders = [];
    if (fs.existsSync(ordersJsonPath)) {
      const data = fs.readFileSync(ordersJsonPath, 'utf8');
      orders = JSON.parse(data);
    }
    orders.unshift(orderData);
    fs.writeFileSync(ordersJsonPath, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving to local orders.json:', err.message);
  }
};

// @desc    Submit new purchase order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, paymentStatus, paymentTransactionId, totalAmount } = req.body;

    if (!customer || !customer.name || !customer.email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid customer contact details and at least one order item.'
      });
    }

    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const orderNumber = `PASCO-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      orderNumber,
      customer,
      items,
      totalItems,
      totalAmount: totalAmount || 0,
      paymentMethod: paymentMethod || 'Razorpay Secure Gateway',
      paymentStatus: paymentStatus || 'Paid via Razorpay',
      paymentTransactionId: paymentTransactionId || `pay_rzp_${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'Submitted to Headquarters',
      createdAt: new Date().toISOString()
    };

    let savedOrder = null;

    try {
      const order = new Order(orderData);
      savedOrder = await order.save();
    } catch (dbErr) {
      console.log('MongoDB inactive or failed to save order, using local JSON fallback:', dbErr.message);
    }

    saveToLocalOrdersJson(orderData);

    return res.status(201).json({
      success: true,
      message: 'Order successfully submitted to Pasco Foods Limited Headquarters!',
      order: savedOrder || orderData
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing purchase order.',
      error: error.message
    });
  }
};

// @desc    Get all purchase orders
// @route   GET /api/orders
// @access  Public
const getOrders = async (req, res) => {
  try {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        return res.status(200).json({
          success: true,
          count: orders.length,
          orders
        });
      }
    } catch (dbErr) {
      console.log('MongoDB query failed, falling back to orders.json');
    }

    if (fs.existsSync(ordersJsonPath)) {
      const data = fs.readFileSync(ordersJsonPath, 'utf8');
      const orders = JSON.parse(data);
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders
      });
    }

    return res.status(200).json({
      success: true,
      count: 0,
      orders: []
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders.'
    });
  }
};

module.exports = {
  createOrder,
  getOrders
};
