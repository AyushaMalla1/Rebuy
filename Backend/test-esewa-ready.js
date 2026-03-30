const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./models/Settings');

async function testEsewaReady() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Checking eSewa Configuration:\n');

    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('  BACKEND_URL:', process.env.BACKEND_URL);
    console.log('  ESEWA_MERCHANT_ID:', process.env.ESEWA_MERCHANT_ID);
    console.log('  ESEWA_SECRET_KEY:', process.env.ESEWA_SECRET_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('  ESEWA_PAYMENT_URL:', process.env.ESEWA_PAYMENT_URL);
    console.log('');

    // Check if using ngrok
    const isUsingNgrok = process.env.BACKEND_URL && process.env.BACKEND_URL.includes('ngrok');
    if (isUsingNgrok) {
      console.log('✅ Using ngrok URL - eSewa callbacks will work!');
    } else {
      console.log('⚠️  Not using ngrok - eSewa callbacks will fail on localhost');
    }
    console.log('');

    // Check database settings
    const settings = await Settings.findOne();
    if (settings && settings.paymentGateway) {
      console.log('📋 Database Settings:');
      console.log('  Provider:', settings.paymentGateway.provider);
      console.log('  Enabled:', settings.paymentGateway.isEnabled ? '✅ YES' : '❌ NO');
      console.log('  Test Mode:', settings.paymentGateway.testMode ? '✅ YES' : '❌ NO');
      console.log('');
    }

    // Show callback URLs
    console.log('🔗 eSewa Callback URLs:');
    console.log('  Success:', `${process.env.BACKEND_URL}/api/payment/esewa/success`);
    console.log('  Failure:', `${process.env.BACKEND_URL}/api/payment/esewa/failure`);
    console.log('');

    // Final status
    const allGood = isUsingNgrok && 
                    settings?.paymentGateway?.isEnabled && 
                    settings?.paymentGateway?.provider === 'esewa';

    if (allGood) {
      console.log('🎉 Everything is ready! eSewa payment will work.');
      console.log('');
      console.log('📝 To test:');
      console.log('  1. Make sure ngrok is running (keep that terminal open)');
      console.log('  2. Make sure backend server is running with updated .env');
      console.log('  3. Go to checkout and select eSewa payment');
      console.log('  4. Complete payment on eSewa test page');
      console.log('  5. You will be redirected back automatically!');
    } else {
      console.log('⚠️  Configuration incomplete. Check the issues above.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testEsewaReady();
