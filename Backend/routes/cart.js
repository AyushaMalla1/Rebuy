const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper function to calculate discounted price
const calculateDiscountedPrice = (price, discount) => {
  if (!discount) return price;
  
  const percentage = typeof discount === 'object' ? discount.percentage : discount;
  if (!percentage || percentage <= 0) return price;
  
  return Math.round(price * (1 - percentage / 100));
};

// Get customer cart
router.get('/:customerId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.params.customerId })
      .populate({
        path: 'items.product',
        select: 'name price images stock seller sellerName storeName discount condition category'
      });
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    // Filter out items with deleted products and calculate discounted prices
    const validItems = cart.items.filter(item => item.product != null);
    
    const cartWithDiscounts = {
      ...cart.toObject(),
      items: validItems.map(item => {
        const product = item.product;
        let discountedPrice = product.price;
        
        if (product.discount) {
          discountedPrice = calculateDiscountedPrice(product.price, product.discount);
        }
        
        return {
          _id: item._id,
          quantity: item.quantity,
          addedAt: item.addedAt,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            discountedPrice: discountedPrice,
            images: product.images || [],
            stock: product.stock,
            seller: product.seller,
            sellerName: product.sellerName,
            storeName: product.storeName,
            discount: product.discount,
            condition: product.condition,
            category: product.category
          }
        };
      })
    };
    
    res.json(cartWithDiscounts);
  } catch (error) {
    console.error('Get cart error:', error);
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
    await cart.populate('items.product', 'name price images stock seller sellerName storeName discount');
    
    // Calculate discounted prices for response
    const cartWithDiscounts = {
      ...cart.toObject(),
      items: cart.items.map(item => {
        const product = item.product;
        if (product && product.discount) {
          const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
          return {
            ...item,
            product: {
              ...product,
              discountedPrice
            }
          };
        }
        return item;
      })
    };
    
    res.json({ message: 'Item added to cart', cart: cartWithDiscounts });
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
    await cart.populate('items.product', 'name price images stock seller sellerName storeName discount');
    
    // Calculate discounted prices for response
    const cartWithDiscounts = {
      ...cart.toObject(),
      items: cart.items.map(item => {
        const product = item.product;
        if (product && product.discount) {
          const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
          return {
            ...item,
            product: {
              ...product,
              discountedPrice
            }
          };
        }
        return item;
      })
    };
    
    res.json({ message: 'Cart updated', cart: cartWithDiscounts });
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
    await cart.populate('items.product', 'name price images stock seller sellerName storeName discount');
    
    // Calculate discounted prices for response
    const cartWithDiscounts = {
      ...cart.toObject(),
      items: cart.items.map(item => {
        const product = item.product;
        if (product && product.discount) {
          const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
          return {
            ...item,
            product: {
              ...product,
              discountedPrice
            }
          };
        }
        return item;
      })
    };
    
    res.json({ message: 'Item removed from cart', cart: cartWithDiscounts });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/:customerId/clear', async (req, res) => {
  try {
    // Delete the entire cart document instead of just clearing items
    const result = await Cart.findOneAndDelete({ customer: req.params.customerId });
    
    if (!result) {
      return res.json({ message: 'Cart already empty', items: [] });
    }
    
    res.json({ message: 'Cart cleared', items: [] });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get cart count
router.get('/:customerId/count', async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.params.customerId });
    
    if (!cart) {
      return res.json({ count: 0 });
    }
    
    const count = cart.items.reduce((total, item) => total + item.quantity, 0);
    res.json({ count });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
