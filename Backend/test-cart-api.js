const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const Product = require('./models/Product');
require('dotenv').config();

async function testCartAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get a sample user ID from your database
    const carts = await Cart.find().limit(1);
    
    if (carts.length === 0) {
      console.log('No carts found in database');
      process.exit(0);
    }
    
    const cart = carts[0];
    console.log('\n=== Cart Document ===');
    console.log('Customer ID:', cart.customer);
    console.log('Items count:', cart.items.length);
    
    // Populate the cart
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images stock seller sellerName storeName discount'
      });
    
    console.log('\n=== Populated Cart ===');
    populatedCart.items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  Product ID:', item.product?._id);
      console.log('  Product Name:', item.product?.name);
      console.log('  Price:', item.product?.price);
      console.log('  Images:', item.product?.images);
      console.log('  Stock:', item.product?.stock);
      console.log('  Quantity:', item.quantity);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCartAPI();
