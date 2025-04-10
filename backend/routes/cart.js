const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/authMiddleware');

// GET current user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    res.json(cart || { userId: req.user.id, items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD/UPDATE item to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// REMOVE item from cart
router.delete('/items/:productId', verifyToken, async (req, res) => {
    try {
      const productId = req.params.productId;
      const cart = await Cart.findOne({ userId: req.user.id });
  
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
  
      cart.items = cart.items.filter(item => !item.productId.equals(productId));
      await cart.save();
  
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// CLEAR cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DECREASE quantity of a product in cart
router.patch('/decrease/:id', verifyToken, async (req, res) => {
    try {
      const productId = req.params.id;
      const cart = await Cart.findOne({ userId: req.user.id });
  
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
  
      const item = cart.items.find(item => item.productId.toString() === productId);
  
      if (!item) return res.status(404).json({ message: 'Product not found in cart' });
  
      item.quantity -= 1;
  
      if (item.quantity <= 0) {
        cart.items = cart.items.filter(i => i.productId.toString() !== productId);
      }
  
      await cart.save();
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

  // increase/:productId
router.patch('/increase/:productId', verifyToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const cart = await Cart.findOne({ userId: req.user.id });
  
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
  
      const item = cart.items.find(item => item.productId.toString() === productId);
  
      if (!item) return res.status(404).json({ message: 'Product not found in cart' });
  
      item.quantity += 1;
  
      await cart.save();
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
