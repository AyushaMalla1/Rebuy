const mongoose = require('mongoose');
require('dotenv').config();

const LoyaltyPoints = require('./models/LoyaltyPoints');
const Customer = require('./models/Customer');
const User = require('./models/User');

async function cleanupOrphanedData() {
  try {
    // Connect to PRODUCTION database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database');

    console.log('\n🧹 Cleaning up orphaned data...\n');

    // Get all valid customer IDs
    const validCustomerIds = await Customer.find({}).distinct('_id');
    const validUserIds = await User.find({}).distinct('_id');
    const allValidIds = [...validCustomerIds, ...validUserIds];

    console.log(`Found ${validCustomerIds.length} valid customers and ${validUserIds.length} valid users`);

    // Delete loyalty points with null or invalid customer references
    const orphanedLoyalty = await LoyaltyPoints.deleteMany({
      $or: [
        { customer: null },
        { customer: { $exists: false } },
        { customer: { $nin: allValidIds } }
      ]
    });

    console.log(`✅ Deleted ${orphanedLoyalty.deletedCount} orphaned loyalty points records`);

    console.log('\n✅ Cleanup completed successfully!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanupOrphanedData();
