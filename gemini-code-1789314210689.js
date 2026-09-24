const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

module.exports = mongoose.model('Product', ProductSchema);