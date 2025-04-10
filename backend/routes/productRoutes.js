const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const multer = require('multer');
const { storage } = require('../utils/cloudinary');

const upload = multer({ storage });
const cloudinary = require('cloudinary').v2;

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST product 
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
      const { name, description, category, price, stock } = req.body;
      const imageUrl = req.file.path;          
      const imagePublicId = req.file.filename;    
  
      const product = await Product.create({
        name,
        description,
        category,
        price,
        stock,
        imageUrl,
        imagePublicId,
      });
  
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

// UPDATE product
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }
  
      await product.deleteOne(); 
      res.json({ message: 'Product and image deleted.' });
  
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

module.exports = router;
