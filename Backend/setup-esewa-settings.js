const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./models/Settings');

async function setupEsewaSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if settings exist
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings
      settings = new Settings();
      console.log('Creating new settings document...');
    } else {
      console.log('Updating existing settings...');
    }

    // Configure eSewa payment gateway
    settings.paymentGateway = {
      provider: 'esewa',
      merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
      secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
      isEnabled: true,
      testMode: true,
      esewaConfig: {
        merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
        secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
      }
    };

    await settings.save();

    console.log('✅ eSewa payment gateway configured successfully!');
    console.log('Settings:', JSON.stringify(settings.paymentGateway, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up eSewa:', error);
    process.exit(1);
  }
}

setupEsewaSettings();
