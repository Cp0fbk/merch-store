const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// get all orders
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'username email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update status
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Error status.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found.' });

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
