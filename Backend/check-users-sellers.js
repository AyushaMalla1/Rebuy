const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const allUsers = await User.find({}).select('fullName email userType role sellerStatus').limit(20);
    
    console.log(`📊 Total users: ${allUsers.length}\n`);
    
    console.log('All Users:');
    allUsers.forEach(u => {
      console.log(`- ${u.fullName} (${u.email})`);
      console.log(`  userType: ${u.userType}`);
      console.log(`  role: ${u.role}`);
      console.log(`  sellerStatus: ${u.sellerStatus}`);
      console.log('');
    });

    // Count by userType
    const byUserType = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📋 By userType:');
    byUserType.forEach(t => console.log(`  ${t._id}: ${t.count}`));

    // Count sellers by status
    const sellers = await User.find({ userType: 'seller' }).select('fullName sellerStatus');
    console.log(`\n🏪 Sellers (${sellers.length} total):`);
    sellers.forEach(s => {
      console.log(`  - ${s.fullName}: ${s.sellerStatus || 'No status'}`);
    });

    // Count by sellerStatus
    const bySellerStatus = await User.aggregate([
      { $match: { userType: 'seller' } },
      { $group: { _id: '$sellerStatus', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Sellers by status:');
    bySellerStatus.forEach(s => console.log(`  ${s._id || 'null'}: ${s.count}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();
