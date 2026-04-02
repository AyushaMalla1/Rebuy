const mongoose = require('mongoose');
require('dotenv').config();

const Seller = require('./models/Seller');

async function checkSellers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const sellers = await Seller.find({}).select('fullName email storeName status');
    
    console.log(`📊 Total sellers in Seller collection: ${sellers.length}\n`);
    
    if (sellers.length > 0) {
      console.log('Sellers:');
      sellers.forEach(s => {
        console.log(`- ${s.fullName} (${s.storeName})`);
        console.log(`  Email: ${s.email}`);
        console.log(`  Status: ${s.status}`);
        console.log('');
      });

      // Count by status
      const byStatus = await Seller.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('By Status:');
      byStatus.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    } else {
      console.log('⚠️  No sellers found in Seller collection!');
      console.log('Sellers might be stored differently in your database.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkSellers();
