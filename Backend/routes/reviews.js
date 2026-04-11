const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'Approved'
    })
      .populate('customer', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit a review
router.post('/', async (req, res) => {
  try {
    const { productId, customerId, orderId, rating, title, comment, images } = req.body;

    // Check if customer has purchased the product
    let verifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        customer: customerId,
        status: 'Delivered'
      });
      verifiedPurchase = !!order;
    }

    const review = new Review({
      product: productId,
      customer: customerId,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      verifiedPurchase,
      status: 'Approved' // Auto-approve for now
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: productId, status: 'Approved' });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const product = await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviews: reviews.length,
      averageRating: avgRating,
      reviewCount: reviews.length
    });

    // Update seller rating (average of all their products' ratings)
    if (product && product.seller) {
      const Seller = require('../models/Seller');
      const sellerProducts = await Product.find({ seller: product.seller });
      const productsWithReviews = sellerProducts.filter(p => p.reviewCount > 0);
      
      if (productsWithReviews.length > 0) {
        const totalRating = productsWithReviews.reduce((sum, p) => sum + (p.averageRating || 0), 0);
        const sellerAvgRating = totalRating / productsWithReviews.length;
        const totalReviews = productsWithReviews.reduce((sum, p) => sum + (p.reviewCount || 0), 0);
        
        await Seller.findByIdAndUpdate(product.seller, {
          rating: sellerAvgRating,
          totalReviews: totalReviews
        });
      }
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark review as helpful
router.put('/:reviewId/helpful', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
