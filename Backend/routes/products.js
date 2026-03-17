const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const { validatePaymentOptions } = require('../utils/paymentOptions');
const { validateDiscount, calculateDiscountedPrice } = require('../utils/discount');

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
    
    // Calculate discounted price if discount is active
    const productObj = product.toObject();
    if (productObj.discount) {
      productObj.discountedPrice = calculateDiscountedPrice(productObj.price, productObj.discount);
    }
    
    res.json(productObj);
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
      story,
      paymentOptions,
      discount
    } = req.body;
    
    // Validate payment options
    if (!validatePaymentOptions(paymentOptions)) {
      return res.status(400).json({ 
        message: 'Invalid payment options. Must provide 1-4 valid payment options from: cod, online, esewa, khalti, card' 
      });
    }
    
    // Validate discount if provided
    if (discount) {
      const discountValidation = validateDiscount(discount);
      if (!discountValidation.isValid) {
        return res.status(400).json({ 
          message: 'Invalid discount configuration',
          errors: discountValidation.errors
        });
      }
    }
    
    // Get seller info
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(403).json({ message: 'Seller not found' });
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
      paymentOptions,
      discount: discount || undefined,
      status: 'Approved' // Auto-approve for now, can be changed to 'Pending'
    });
    
    await product.save();
    
    // Update seller's total products count
    seller.totalProducts = (seller.totalProducts || 0) + 1;
    await seller.save();
    
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (seller only - their own products)
router.put('/:id', async (req, res) => {
  try {
    const { sellerId, paymentOptions, discount } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if seller owns this product
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    // Validate payment options if provided
    if (paymentOptions !== undefined && !validatePaymentOptions(paymentOptions)) {
      return res.status(400).json({ 
        message: 'Invalid payment options. Must provide 1-4 valid payment options from: cod, online, esewa, khalti, card' 
      });
    }
    
    // Validate discount if provided
    if (discount !== undefined && discount !== null) {
      const discountValidation = validateDiscount(discount);
      if (!discountValidation.isValid) {
        return res.status(400).json({ 
          message: 'Invalid discount configuration',
          errors: discountValidation.errors
        });
      }
    }
    
    // Update fields
    const updates = ['name', 'description', 'price', 'category', 'condition', 'size', 'brand', 'stock', 'images', 'story', 'paymentOptions', 'discount'];
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
    
    // Update seller's total products count
    const seller = await Seller.findById(sellerId);
    if (seller && seller.totalProducts > 0) {
      seller.totalProducts -= 1;
      await seller.save();
    }
    
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
