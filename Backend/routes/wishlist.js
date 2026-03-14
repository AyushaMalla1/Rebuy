const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

// Get wishlist
router.get('/:customerId', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ customer: req.params.customerId })
      .populate('items.product');

    if (!wishlist) {
      wishlist = new Wishlist({ customer: req.params.customerId, items: [] });
      await wishlist.save();
    }

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to wishlist
router.post('/:customerId/add', async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ customer: req.params.customerId });

    if (!wishlist) {
      wishlist = new Wishlist({ customer: req.params.customerId, items: [] });
    }

    const exists = wishlist.items.some(item => item.product.toString() === productId);

    if (!exists) {
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    wishlist = await wishlist.populate('items.product');

    res.json({ success: true, message: 'Added to wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from wishlist
router.delete('/:customerId/remove/:productId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ customer: req.params.customerId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await wishlist.save();
    await wishlist.populate('items.product');

    res.json({ success: true, message: 'Removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
