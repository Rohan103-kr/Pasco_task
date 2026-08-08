const mongoose = require('mongoose');

let isConnected = false;
let dbMode = 'local'; // 'mongodb' or 'local'

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pasco-foods';
  
  if (!process.env.MONGODB_URI) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  No MONGODB_URI found in env. Attempting local MongoDB connection...');
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s to trigger fallback quickly if not running
    });
    
    isConnected = true;
    dbMode = 'mongodb';
    console.log('\x1b[32m%s\x1b[0m', `✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    dbMode = 'local';
    console.error('\x1b[31m%s\x1b[0m', `❌ MongoDB connection failed: ${error.message}`);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Running in LOCAL JSON mode. Data changes will be managed in-memory/via local files.');
    return false;
  }
};

const getDbMode = () => dbMode;

module.exports = { connectDB, getDbMode };
