const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB, getDbMode } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const tastingRoutes = require('./routes/tastingRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for dev convenience with React hot-reloads
}));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tastings', tastingRoutes);

// Health check and db mode check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    dbMode: getDbMode(),
    message: getDbMode() === 'mongodb' 
      ? 'Connected to MongoDB Atlas / Local database.' 
      : 'Running in Local JSON fallback mode. All features are fully functional.'
  });
});

// Start server
const startServer = async () => {
  // Attempt DB connection
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', `🚀 Pasco Foods Backend API Server running on port ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `📊 System Mode: [${getDbMode().toUpperCase()}]`);
  });
};

startServer();
