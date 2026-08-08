const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { getDbMode } = require('../config/db');

// In-memory cache for local products JSON to prevent repeated disk read operations
let cachedProducts = null;

const getLocalProducts = () => {
  if (cachedProducts) {
    return cachedProducts;
  }
  try {
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const rawData = fs.readFileSync(productsPath, 'utf8');
    cachedProducts = JSON.parse(rawData);
    return cachedProducts;
  } catch (error) {
    console.error(`Error reading local products: ${error.message}`);
    return [];
  }
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, rangeType, spiciness, dietary, search } = req.query;
    const dbMode = getDbMode();

    if (dbMode === 'mongodb') {
      // 1. MongoDB Query building
      let query = {};

      if (category) {
        query.category = category;
      }
      
      if (rangeType) {
        query.rangeType = rangeType;
      }

      if (spiciness) {
        query.spiciness = spiciness;
      }

      if (dietary) {
        // Assume dietary query can be array or string
        const dietaryList = Array.isArray(dietary) ? dietary : [dietary];
        query.dietary = { $all: dietaryList };
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const products = await Product.find(query);
      return res.json({ source: 'mongodb', products });
    } else {
      // 2. Local JSON Filtering
      let products = getLocalProducts();

      if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (rangeType) {
        products = products.filter(p => p.rangeType.toLowerCase() === rangeType.toLowerCase());
      }

      if (spiciness) {
        products = products.filter(p => p.spiciness.toLowerCase() === spiciness.toLowerCase());
      }

      if (dietary) {
        const dietaryList = (Array.isArray(dietary) ? dietary : [dietary]).map(d => d.toLowerCase());
        products = products.filter(p => {
          const productDietary = (p.dietary || []).map(d => d.toLowerCase());
          return dietaryList.every(d => productDietary.includes(d));
        });
      }

      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }

      return res.json({ source: 'local_json', products });
    }
  } catch (error) {
    console.error(`Error in getProducts: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving products' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbMode = getDbMode();

    if (dbMode === 'mongodb') {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json({ source: 'mongodb', product });
    } else {
      const products = getLocalProducts();
      // Since local products don't have MongoDB ObjectIds, we can match by productCode
      const product = products.find(p => p.productCode === id || p.name.replace(/\s+/g, '-').toLowerCase() === id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json({ source: 'local_json', product });
    }
  } catch (error) {
    console.error(`Error in getProductById: ${error.message}`);
    return res.status(500).json({ error: 'Server error retrieving product' });
  }
};

module.exports = {
  getProducts,
  getProductById
};
