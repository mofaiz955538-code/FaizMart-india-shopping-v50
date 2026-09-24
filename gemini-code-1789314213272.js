const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productPrice: { type: Number, required: true },
  
  // Financial Deductions
  commissionPercent: { type: Number, default: 5 }, // 5% Admin Fee
  deliveryFee: { type: Number, default: 60 },      // ₹60 Delivery Fee
  adminCommission: { type: Number },
  sellerPayout: { type: Number },
  
  status: { type: String, enum: ['Pending', 'Packed', 'Shipped', 'Delivered'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);