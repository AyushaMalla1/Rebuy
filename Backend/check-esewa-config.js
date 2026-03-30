const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./models/Settings');

async function checkEsewaConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('  BACKEND_URL:', process.env.BACKEND_URL || '❌ NOT SET');
    console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
    console.log('  ESEWA_MERCHANT_ID:', process.env.ESEWA_MERCHANT_ID || '❌ NOT SET');
    console.log('  ESEWA_SECRET_KEY:', process.env.ESEWA_SECRET_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('  ESEWA_PAYMENT_URL:', process.env.ESEWA_PAYMENT_URL || '❌ NOT SET');
    console.log('');

    // Check database settings
    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('❌ No settings found in database');
      console.log('   Run: node setup-esewa-settings.js');
      process.exit(1);
    }

    console.log('📋 Database Settings:');
    console.log('  Provider:', settings.paymentGateway?.provider || '❌ NOT SET');
    console.log('  Enabled:', settings.paymentGateway?.isEnabled ? '✅ YES' : '❌ NO');
    console.log('  Test Mode:', settings.paymentGateway?.testMode ? '✅ YES' : '❌ NO');
    console.log('  Merchant ID:', settings.paymentGateway?.merchantId || '❌ NOT SET');
    console.log('  Secret Key:', settings.paymentGateway?.secretKey ? '✅ SET' : '❌ NOT SET');
    console.log('');

    // Check if everything is ready
    const backendUrlOk = process.env.BACKEND_URL && process.env.BACKEND_URL !== 'http://localhost:5000';
    const settingsOk = settings.paymentGateway?.isEnabled && settings.paymentGateway?.provider === 'esewa';

    console.log('🔍 Configuration Status:');
    
    if (backendUrlOk) {
      console.log('  ✅ BACKEND_URL is set to public URL');
    } else {
      console.log('  ⚠️  BACKEND_URL is localhost - eSewa callbacks will fail');
      console.log('     Solution: Start ngrok and update BACKEND_URL in .env');
    }

    if (settingsOk) {
      console.log('  ✅ eSewa payment gateway is enabled in database');
    } else {
      console.log('  ❌ eSewa payment gateway not properly configured');
      console.log('     Solution: Run node setup-esewa-settings.js');
    }

    console.log('');

    if (backendUrlOk && settingsOk) {
      console.log('🎉 Everything is configured correctly!');
      console.log('   You can now test eSewa payments.');
    } else {
      console.log('⚠️  Configuration incomplete. Follow the steps above.');
    }

    console.log('');
    console.log('📝 Callback URLs:');
    console.log('  Success:', `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/esewa/success`);
    console.log('  Failure:', `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/esewa/failure`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEsewaConfig();
