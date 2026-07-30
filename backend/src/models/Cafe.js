const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['aesthetic', 'coworking', 'outdoor', 'rooftop', 'traditional', 'cozy'],
    required: true 
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  priceRange: { 
    type: String, 
    enum: ['$', '$$', '$$$'],
    default: '$$'
  },
  facilities: [String],
  openHours: { type: String },
  image: { type: String },
  mapsLink: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  // Detail fields
  menu: [String],
  priceInfo: { type: String },
  suitableFor: [String],
  favoriteSpot: { type: String },
  tips: { type: String },
  about: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Cafe', cafeSchema);
