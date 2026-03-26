const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
require('dotenv').config();

async function checkUserPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rebuy');
    console.log('Connected to MongoDB\n');

    const email = 'ayushamalla09@gmail.com';
    
    console.log('Checking user:', email);
    console.log('='.repeat(50));

    // Check User collection
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('\n✅ User found in Customer collection');
      console.log('Email:', user.email);
      console.log('Full Name:', user.fullName);
      console.log('User Type:', user.userType);
      console.log('Created:', user.createdAt);
      console.log('Password Hash:', user.password.substring(0, 20) + '...');
      
      // Test different passwords
      const passwords = ['password123', 'Password123', 'test1234', 'Test1234'];
      
      console.log('\n--- Testing Passwords ---');
      for (const pwd of passwords) {
        const isValid = await user.comparePassword(pwd);
        console.log(`Password "${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      }
      
      // Check if there are any OTP fields
      if (user.resetPasswordOTP) {
        console.log('\n⚠️  Active OTP found:', user.resetPasswordOTP);
        console.log('OTP Expiry:', user.resetPasswordOTPExpiry);
      }
      
    } else {
      console.log('\n❌ User NOT found in Customer collection');
      
      // Check Seller collection
      const seller = await Seller.findOne({ email });
      if (seller) {
        console.log('\n✅ User found in Seller collection instead');
        console.log('Email:', seller.email);
        console.log('Store Name:', seller.storeName);
        console.log('Status:', seller.status);
      } else {
        console.log('❌ User NOT found in Seller collection either');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n' + '='.repeat(50));
    console.log('Database connection closed');
  }
}

checkUserPassword();
