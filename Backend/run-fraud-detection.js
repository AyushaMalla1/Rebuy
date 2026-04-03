const mongoose = require('mongoose');
require('dotenv').config();

const { runFraudDetection } = require('./utils/fraudDetection');
const FraudAlert = require('./models/FraudAlert');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear demo alerts first
    const demoCount = await FraudAlert.countDocuments();
    if (demoCount > 0) {
      await FraudAlert.deleteMany({});
      console.log(`🗑️  Cleared ${demoCount} existing alerts\n`);
    }

    // Run fraud detection on real data
    const alerts = await runFraudDetection();

    // Show results
    console.log('\n📊 Fraud Detection Results:');
    console.log(`   Total alerts created: ${alerts.length}`);
    
    if (alerts.length > 0) {
      console.log('\n📋 Breakdown:');
      const byType = {
        suspicious_order: alerts.filter(a => a.type === 'suspicious_order').length,
        multiple_accounts: alerts.filter(a => a.type === 'multiple_accounts').length,
        fake_review: alerts.filter(a => a.type === 'fake_review').length,
        payment_fraud: alerts.filter(a => a.type === 'payment_fraud').length
      };
      
      console.log(`   Suspicious Orders: ${byType.suspicious_order}`);
      console.log(`   Multiple Accounts: ${byType.multiple_accounts}`);
      console.log(`   Fake Reviews: ${byType.fake_review}`);
      console.log(`   Payment Fraud: ${byType.payment_fraud}`);
      
      console.log('\n🎯 Risk Levels:');
      console.log(`   High: ${alerts.filter(a => a.riskLevel === 'high').length}`);
      console.log(`   Medium: ${alerts.filter(a => a.riskLevel === 'medium').length}`);
      console.log(`   Low: ${alerts.filter(a => a.riskLevel === 'low').length}`);
    } else {
      console.log('\n✅ No suspicious activity detected in your data');
      console.log('   Your platform is clean!');
    }

    console.log('\n🔄 Refresh your Admin Dashboard to see the alerts');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

main();
