const mongoose = require('mongoose');
const Cart = require('./models/Cart');
require('dotenv').config();

async function clearUserCart() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear cart for user: 69cb6afa4684aee2c7d14174 (aesaamalla@gmail.com)
    const userId = '69cb6afa4684aee2c7d14174';
    
    const result = await Cart.findOneAndDelete({ customer: userId });
    
    if (result) {
      console.log(`Cleared cart for user ${userId}`);
      console.log('Cart had', result.items.length, 'items');
    } else {
      console.log(`No cart found for user ${userId}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearUserCart();
