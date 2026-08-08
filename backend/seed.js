const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB, getDbMode } = require('./config/db');
const Product = require('./models/Product');

dotenv.config();

const seedData = async () => {
  console.log('🌱 Starting database seeding...');
  
  // Read products from products.json
  const productsPath = path.join(__dirname, 'data', 'products.json');
  let products;
  try {
    const rawData = fs.readFileSync(productsPath, 'utf8');
    products = JSON.parse(rawData);
  } catch (error) {
    console.error(`❌ Failed to read seed file: ${error.message}`);
    process.exit(1);
  }

  // Attempt database connection
  const connected = await connectDB();
  const dbMode = getDbMode();

  if (connected && dbMode === 'mongodb') {
    try {
      console.log('🧹 Wiping existing products collection...');
      await Product.deleteMany({});
      
      console.log(`📤 Inserting ${products.length} products into MongoDB...`);
      await Product.insertMany(products);
      
      console.log('✅ MongoDB Database seeded successfully!');
      process.exit(0);
    } catch (error) {
      console.error(`❌ Seeding failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  MongoDB not connected. Seeding is only applicable to MongoDB.');
    console.log('\x1b[32m%s\x1b[0m', 'ℹ️  Local JSON dataset is already populated at backend/data/products.json. No action needed.');
    process.exit(0);
  }
};

seedData();
