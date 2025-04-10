const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

module.exports = router;
