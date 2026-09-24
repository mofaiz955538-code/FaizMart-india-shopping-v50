const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.post('/create-order', async (req, res) => {
  try {
    const { customerId, productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product nahi mila" });

    // Calculations
    const price = product.price;
    const commissionPercent = 5; // 5% Admin Platform Fee
    const deliveryFee = 60;       // ₹60 Delivery Charge

    const adminCommission = (price * commissionPercent) / 100;
    const sellerPayout = price - adminCommission - deliveryFee;

    const newOrder = new Order({
      customerId,
      sellerId: product.sellerId,
      productId,
      productPrice: price,
      commissionPercent,
      deliveryFee,
      adminCommission,
      sellerPayout
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order safaltapurvak placed ho gaya!",
      orderDetails: {
        totalPrice: price,
        deliveryCharge: deliveryFee,
        sellerWillGet: sellerPayout,
        adminEarned: adminCommission
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;