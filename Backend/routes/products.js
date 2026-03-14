const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Get all approved products (for landing page)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, limit = 24 } = req.query;
    
    let query = { status: 'Approved' };
    
    // Filter by category
    if (category && category !== 'ALL') {
      query.category = category;
    }
    
    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { sold: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit));
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'fullName email storeName');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (seller only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      condition,
      size,
      brand,
      stock,
      images,
      sellerId,
      story
    } = req.body;
    
    // Get seller info
    const seller = await User.findById(sellerId);
    if (!seller || seller.userType !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      condition,
      size,
      brand: brand || 'Unbranded',
      stock,
      images,
      seller: sellerId,
      sellerName: seller.fullName,
      storeName: seller.storeName,
      story: story || '',
      status: 'Approved' // Auto-approve for now, can be changed to 'Pending'
    });
    
    await product.save();
    
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (seller only - their own products)
router.put('/:id', async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if seller owns this product
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    // Update fields
    const updates = ['name', 'description', 'price', 'category', 'condition', 'size', 'brand', 'stock', 'images', 'story'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });
    
    await product.save();
    
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (seller only - their own products)
router.delete('/:id', async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if seller owns this product
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller's products
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.sellerId })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update product status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product status updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
