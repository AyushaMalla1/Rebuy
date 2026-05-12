const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const User = require('../models/User');
const { validatePaymentOptions } = require('../utils/paymentOptions');
const { validateDiscount, calculateDiscountedPrice } = require('../utils/discount');
const { logAudit } = require('../utils/auditLogger');
const { sendBundleDealAlert, sendLowStockAlert, sendOutOfStockAlert } = require('../utils/emailService');

// Advanced search endpoint
router.get('/search', async (req, res) => {
  try {
    const { 
      q, // search query
      category, 
      condition, 
      minPrice, 
      maxPrice, 
      size,
      brand,
      sort = 'relevance',
      page = 1,
      limit = 24 
    } = req.query;
    
    let query = { status: 'Approved' };
    
    // Text search across multiple fields
    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { storeName: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && category !== 'ALL') {
      query.category = category;
    }
    
    // Filter by condition
    if (condition) {
      query.condition = condition;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by size
    if (size) {
      query.size = size;
    }
    
    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    
    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { sold: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query and populate seller to check approval status
    const products = await Product.find(query)
      .populate('seller', 'status')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Filter out products from unapproved sellers
    const approvedProducts = products.filter(product => 
      product.seller && product.seller.status === 'approved'
    );
    
    // Get total count for pagination (need to count manually after filtering)
    const allProducts = await Product.find(query).populate('seller', 'status');
    const total = allProducts.filter(product => 
      product.seller && product.seller.status === 'approved'
    ).length;
    
    // Get available filters based on current search
    const categories = await Product.distinct('category', { status: 'Approved' });
    const conditions = await Product.distinct('condition', { status: 'Approved' });
    const sizes = await Product.distinct('size', { status: 'Approved' });
    const brands = await Product.distinct('brand', { status: 'Approved' });
    
    res.json({
      success: true,
      products: approvedProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        categories,
        conditions,
        sizes,
        brands: brands.filter(b => b && b !== 'Unbranded')
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Search failed', 
      error: error.message 
    });
  }
});

// Search suggestions (autocomplete)
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({ 
        success: true, 
        suggestions: {
          products: [],
          brands: [],
          categories: [],
          sellers: []
        }
      });
    }
    
    // Get product suggestions with images and check seller approval
    const productSuggestions = await Product.find({
      status: 'Approved',
      name: { $regex: q, $options: 'i' }
    })
    .populate('seller', 'status')
    .select('name category images price')
    .limit(10); // Get more to account for filtering
    
    // Filter out products from unapproved sellers
    const approvedProductSuggestions = productSuggestions
      .filter(product => product.seller && product.seller.status === 'approved')
      .slice(0, 5); // Limit to 5 after filtering
    
    // Get brand suggestions
    const brandSuggestions = await Product.distinct('brand', {
      status: 'Approved',
      brand: { $regex: q, $options: 'i' }
    });
    
    // Get category suggestions
    const categorySuggestions = await Product.distinct('category', {
      status: 'Approved',
      category: { $regex: q, $options: 'i' }
    });
    
    // Get seller/store suggestions
    const sellerSuggestions = await Seller.find({
      $or: [
        { storeName: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id storeName fullName')
    .limit(3);
    
    res.json({
      success: true,
      suggestions: {
        products: approvedProductSuggestions.map(p => ({ 
          _id: p._id,
          name: p.name, 
          category: p.category, 
          image: p.images[0] || null,
          price: p.price,
          type: 'product' 
        })),
        brands: brandSuggestions.slice(0, 3).map(b => ({ name: b, type: 'brand' })),
        categories: categorySuggestions.slice(0, 3).map(c => ({ name: c, type: 'category' })),
        sellers: sellerSuggestions.map(s => ({ 
          _id: s._id,
          id: s._id,
          name: s.fullName,
          storeName: s.storeName || s.fullName, 
          type: 'seller' 
        }))
      }
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get suggestions', 
      error: error.message 
    });
  }
});

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
    
    // Get products and populate seller to check approval status
    const products = await Product.find(query)
      .populate('seller', 'status')
      .sort(sortOption)
      .limit(parseInt(limit));
    
    // Filter out products from unapproved sellers
    const approvedProducts = products.filter(product => 
      product.seller && product.seller.status === 'approved'
    );
    
    res.json(approvedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'fullName email storeName profileImage rating totalSales totalProducts totalReviews responseTime shippingTime badges joinedDate');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate discounted price if discount is active
    const productObj = product.toObject();
    if (productObj.discount) {
      productObj.discountedPrice = calculateDiscountedPrice(productObj.price, productObj.discount);
    }
    
    // Add seller information
    if (productObj.seller) {
      productObj.sellerInfo = {
        id: productObj.seller._id,
        name: productObj.seller.fullName,
        storeName: productObj.seller.storeName,
        avatar: productObj.seller.profileImage || 'https://i.pravatar.cc/100',
        rating: productObj.seller.rating || 5.0,
        totalReviews: productObj.seller.totalReviews || 0,
        totalTransactions: productObj.seller.totalSales || 0,
        itemsForSale: productObj.seller.totalProducts || 0,
        badges: productObj.seller.badges || ['New Seller'],
        joinedDate: productObj.seller.joinedDate || productObj.seller.createdAt,
        responseTime: productObj.seller.responseTime || '1 hour',
        shippingTime: productObj.seller.shippingTime || '1-2 days'
      };
    }
    
    res.json(productObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get similar products by subcategory ONLY
router.get('/:id/similar', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let similarProducts = [];
    
    // Only find products with same subcategory (no category fallback)
    if (product.subcategory) {
      similarProducts = await Product.find({
        _id: { $ne: product._id }, // Exclude current product
        status: 'Approved',
        subcategory: product.subcategory // Match subcategory only
      })
      .populate('seller', 'status')
      .sort({ createdAt: -1 })
      .limit(4);
      
      // Filter out products from unapproved sellers
      similarProducts = similarProducts.filter(p => 
        p.seller && p.seller.status === 'approved'
      );
    }
    
    res.json({
      success: true,
      products: similarProducts,
      matchedBy: 'subcategory'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
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
    
    // Send bundle deal alert to customers if it's a bundle deal
    if (product.isBundleDeal && product.bundleDiscount > 0) {
      // Get all customer emails (you can filter by preferences later)
      User.find({ userType: { $in: ['customer', 'buyer'] } })
        .select('email')
        .limit(100) // Limit to avoid spam
        .then(customers => {
          const emails = customers.map(c => c.email).filter(Boolean);
          if (emails.length > 0) {
            sendBundleDealAlert(product.toObject(), emails).catch(err =>
              console.error('Failed to send bundle deal alerts:', err)
            );
          }
        })
        .catch(err => console.error('Error fetching customers for bundle alert:', err));
    }
    
    // Log audit
    await logAudit({
      action: 'Product Created',
      actionType: 'product',
      performedBy: sellerId,
      targetId: product._id,
      targetModel: 'Product',
      description: `Seller added new product: ${name}`,
      ipAddress: req.ip
    }).catch(console.error);

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk upload products via CSV
router.post('/bulk-upload', async (req, res) => {
  try {
    const { products, sellerId } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }
    
    // Get seller info
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(403).json({ message: 'Seller not found' });
    }
    
    const results = {
      successful: [],
      failed: []
    };
    
    for (const productData of products) {
      try {
        // Validate required fields
        if (!productData.name || !productData.price || !productData.category) {
          results.failed.push({
            row: productData,
            error: 'Missing required fields (name, price, category)'
          });
          continue;
        }
        
        // Validate payment options
        const paymentOptions = productData.paymentOptions || ['cod', 'online'];
        if (!validatePaymentOptions(paymentOptions)) {
          results.failed.push({
            row: productData,
            error: 'Invalid payment options'
          });
          continue;
        }
        
        // Create product
        const product = new Product({
          name: productData.name,
          description: productData.description || '',
          price: parseFloat(productData.price),
          category: productData.category,
          condition: productData.condition || 'New',
          size: productData.size || 'M',
          brand: productData.brand || 'Unbranded',
          stock: parseInt(productData.stock) || 1,
          images: productData.images ? productData.images.split('|') : [],
          seller: sellerId,
          sellerName: seller.fullName,
          storeName: seller.storeName,
          story: productData.story || '',
          paymentOptions: paymentOptions,
          discount: productData.discount ? {
            type: productData.discountType || 'percentage',
            value: parseFloat(productData.discountValue) || 0
          } : null
        });
        
        await product.save();
        results.successful.push(product);
        
      } catch (error) {
        results.failed.push({
          row: productData,
          error: error.message
        });
      }
    }
    
    // Update seller's total products count
    if (results.successful.length > 0) {
      seller.totalProducts = (seller.totalProducts || 0) + results.successful.length;
      await seller.save();
      
      // Log audit
      await logAudit({
        action: 'Bulk Products Created',
        actionType: 'product',
        performedBy: sellerId,
        targetId: sellerId,
        targetModel: 'Seller',
        description: `Seller bulk uploaded ${results.successful.length} products`,
        ipAddress: req.ip
      }).catch(console.error);
    }
    
    res.status(201).json({
      message: `Bulk upload completed. ${results.successful.length} products created, ${results.failed.length} failed.`,
      results
    });
    
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
    
    // Validate discount if provided and has values
    if (discount !== undefined && discount !== null && typeof discount === 'object' && Object.keys(discount).length > 0 && discount.percentage !== undefined) {
      const discountValidation = validateDiscount(discount);
      if (!discountValidation.isValid) {
        return res.status(400).json({ 
          message: 'Invalid discount configuration',
          errors: discountValidation.errors
        });
      }
    }
    
    // Update fields
    const updates = ['name', 'description', 'price', 'category', 'subcategory', 'condition', 'size', 'brand', 'stock', 'images', 'story', 'paymentOptions', 'discount', 'bundleDeal'];
    const oldStock = product.stock;
    const wasBundleDeal = product.isBundleDeal;
    
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });
    
    await product.save();
    
    // Check if bundle deal was just enabled
    if (!wasBundleDeal && product.isBundleDeal && product.bundleDiscount > 0) {
      // Send bundle deal alert to customers
      User.find({ userType: { $in: ['customer', 'buyer'] } })
        .select('email')
        .limit(100)
        .then(customers => {
          const emails = customers.map(c => c.email).filter(Boolean);
          if (emails.length > 0) {
            sendBundleDealAlert(product.toObject(), emails).catch(err =>
              console.error('Failed to send bundle deal alerts:', err)
            );
          }
        })
        .catch(err => console.error('Error fetching customers for bundle alert:', err));
    }
    
    // Check stock levels and send alerts to seller
    const newStock = product.stock;
    if (newStock !== oldStock) {
      const seller = await Seller.findById(sellerId).select('email fullName storeName');
      
      if (seller) {
        // Out of stock alert
        if (newStock === 0 && oldStock > 0) {
          sendOutOfStockAlert(seller, [product.toObject()]).catch(err =>
            console.error('Failed to send out of stock alert:', err)
          );
        }
        // Low stock alert (less than 5)
        else if (newStock > 0 && newStock < 5 && oldStock >= 5) {
          sendLowStockAlert(seller, [product.toObject()]).catch(err =>
            console.error('Failed to send low stock alert:', err)
          );
        }
      }
    }
    
    // Log audit
    await logAudit({
      action: 'Product Updated',
      actionType: 'product',
      performedBy: sellerId,
      targetId: product._id,
      targetModel: 'Product',
      description: `Seller updated product: ${product.name}`,
      ipAddress: req.ip
    }).catch(console.error);

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
    
    // Log audit
    await logAudit({
      action: 'Product Deleted',
      actionType: 'product',
      performedBy: sellerId,
      targetId: req.params.id,
      targetModel: 'Product',
      description: `Seller deleted product: ${product.name}`,
      ipAddress: req.ip
    }).catch(console.error);

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
