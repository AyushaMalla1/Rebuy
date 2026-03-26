const mongoose = require('mongoose');
require('dotenv').config();

const Customer = require('./models/Customer');

async function testDeleteAddress() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a customer with addresses
    const customer = await Customer.findOne({ 'addresses.0': { $exists: true } });
    
    if (!customer) {
      console.log('No customer with addresses found');
      return;
    }

    console.log('Customer found:', customer.user);
    console.log('Addresses:', customer.addresses.length);
    
    if (customer.addresses.length > 0) {
      const addressId = customer.addresses[0]._id;
      console.log('First address ID:', addressId);
      console.log('Address details:', customer.addresses[0]);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDeleteAddress();
