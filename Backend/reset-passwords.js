const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
require('dotenv').config();

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rebuy');
    console.log('Connected to MongoDB\n');

    // Reset password for all users to 'password123'
    const newPassword = 'password123';

    console.log('=== Resetting Customer Passwords ===');
    const customers = await User.find({});
    
    for (const customer of customers) {
      customer.password = newPassword;
      await customer.save();
      console.log(`✓ Reset password for: ${customer.email}`);
    }

    console.log('\n=== Resetting Seller Passwords ===');
    const sellers = await Seller.find({});
    
    for (const seller of sellers) {
      // Update password without triggering validation for other fields
      await Seller.updateOne(
        { _id: seller._id },
        { $set: { password: await require('bcryptjs').hash(newPassword, 10) } }
      );
      console.log(`✓ Reset password for: ${seller.email} (${seller.storeName || 'No store name'})`);
    }

    console.log('\n=== PASSWORD RESET COMPLETE ===');
    console.log(`All accounts now use password: ${newPassword}`);
    console.log('\nYou can now login with any of these accounts using the password above.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

resetPasswords();
