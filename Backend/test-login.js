const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rebuy');
    console.log('Connected to MongoDB');

    // Test credentials
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    console.log('\n--- Testing Customer Login ---');
    const customer = await User.findOne({ email: testEmail });
    if (customer) {
      console.log('Customer found:', customer.email);
      const isValid = await customer.comparePassword(testPassword);
      console.log('Password valid:', isValid);
    } else {
      console.log('Customer not found. Creating test customer...');
      const newCustomer = await User.create({
        fullName: 'Test Customer',
        email: testEmail,
        password: testPassword,
        userType: 'customer'
      });
      console.log('Test customer created:', newCustomer.email);
      console.log('You can now login with:');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
    }

    console.log('\n--- Testing Seller Login ---');
    const sellerEmail = 'seller@example.com';
    const seller = await Seller.findOne({ email: sellerEmail });
    if (seller) {
      console.log('Seller found:', seller.email);
      const isValid = await seller.comparePassword(testPassword);
      console.log('Password valid:', isValid);
    } else {
      console.log('Seller not found. Creating test seller...');
      const newSeller = await Seller.create({
        fullName: 'Test Seller',
        email: sellerEmail,
        password: testPassword,
        phone: '1234567890',
        storeName: 'Test Store',
        storeDescription: 'A test store',
        address: '123 Test St',
        city: 'Test City',
        status: 'approved'
      });
      console.log('Test seller created:', newSeller.email);
      console.log('You can now login with:');
      console.log('Email:', sellerEmail);
      console.log('Password:', testPassword);
    }

    console.log('\n--- All Users ---');
    const allUsers = await User.find({});
    console.log('Total customers:', allUsers.length);
    allUsers.forEach(u => console.log(`- ${u.email} (${u.userType})`));

    console.log('\n--- All Sellers ---');
    const allSellers = await Seller.find({});
    console.log('Total sellers:', allSellers.length);
    allSellers.forEach(s => console.log(`- ${s.email} (${s.storeName}) - Status: ${s.status}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testLogin();
