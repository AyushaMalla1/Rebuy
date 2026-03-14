const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get customer cart
router.get('/:customerId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.params.customerId })
      .populate('items.product', 'name price images stock seller sellerName storeName');
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart
router.post('/:customerId/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // Check product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.status !== 'Approved') {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock', 
        availableStock: product.stock 
      });
    }
    
    let cart = await Cart.findOne({ customer: req.params.customerId });
    
    if (!cart) {
      // Create new cart
      cart = new Cart({
        customer: req.params.customerId,
        items: [{ product: productId, quantity }]
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > product.stock) {
          return res.status(400).json({ 
            message: 'Cannot add more items. Stock limit reached.', 
            availableStock: product.stock,
            currentQuantity: existingItem.quantity
          });
        }
        
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }
    
    await cart.save();
    await cart.populate('items.product', 'name price images stock seller sellerName storeName');
    
    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update cart item quantity
router.patch('/:customerId/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
    const cart = await Cart.findOne({ customer: req.params.customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      // Check stock availability
      const product = await Product.findById(productId);
      if (product && quantity > product.stock) {
        return res.status(400).json({ 
          message: 'Insufficient stock', 
          availableStock: product.stock 
        });
      }
      
      item.quantity = quantity;
    }
    
    await cart.save();
    await cart.populate('items.product', 'name price images stock seller sellerName storeName');
    
    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
router.delete('/:customerId/remove/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.params.customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => 
      item.product.toString() !== req.params.productId
    );
    
    await cart.save();
    await cart.populate('items.product', 'name price images stock seller sellerName storeName');
    
    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/:customerId/clear', async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.params.customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
