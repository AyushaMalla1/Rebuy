const mongoose = require('mongoose');
const Cart = require('./models/Cart');
require('dotenv').config();

async function clearAllCarts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Cart.deleteMany({});
    console.log(`Cleared ${result.deletedCount} carts`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearAllCarts();
