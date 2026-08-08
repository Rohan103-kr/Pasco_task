const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['retail', 'foodservice'],
  },
  rangeType: {
    type: String,
    required: true,
    enum: [
      'Cooking Sauces',
      'Cooking Pastes',
      'Pickles & Chutneys',
      'Condiments',
      'Pasta Roma Range',
      'Al Rifai Range',
      'Yellow River Range',
      'NYC Range'
    ],
  },
  size: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    default: 'N/A',
  },
  unitBarcode: {
    type: String,
    default: 'N/A',
  },
  caseBarcode: {
    type: String,
    default: 'N/A',
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    required: true,
  },
  spiciness: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very hot'],
    default: 'none',
  },
  dietary: {
    type: [String],
    default: [], // e.g. ['Vegetarian', 'Vegan', 'Gluten Free', 'Halal']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
