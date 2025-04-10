const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  price:       { type: Number, required: true },
  imageUrl:    { type: String },
  stock:       { type: Number, default: 1 },
  imagePublicId: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
