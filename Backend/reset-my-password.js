const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
require('dotenv').config();

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rebuy');
    console.log('Connected to MongoDB');

    const email = 'ayushamalla09@gmail.com';
    const newPassword = 'password123'; // Change this to your desired password

    console.log('\nResetting password for:', email);

    // Try to find in User collection
    let user = await User.findOne({ email });
    
    if (user) {
      user.password = newPassword;
      await user.save();
      console.log('✅ Password reset successfully for customer account!');
      console.log('\nYou can now login with:');
      console.log('Email:', email);
      console.log('Password:', newPassword);
      console.log('User Type: Customer');
    } else {
      // Try Seller collection
      user = await Seller.findOne({ email });
      if (user) {
        user.password = newPassword;
        await user.save();
        console.log('✅ Password reset successfully for seller account!');
        console.log('\nYou can now login with:');
        console.log('Email:', email);
        console.log('Password:', newPassword);
        console.log('User Type: Seller');
      } else {
        console.log('❌ User not found with email:', email);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

resetPassword();
