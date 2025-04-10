const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { address, paymentMethod } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống!' });
    }

    let totalPrice = 0;
    const orderItems = cart.items.map(item => {
      const price = item.productId.price;
      totalPrice += price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity
      };
    });

    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalPrice,
      address,
      paymentMethod
    });

    await order.save();

    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
