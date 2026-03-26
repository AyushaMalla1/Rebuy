const mongoose = require('mongoose');
const Seller = require('./models/Seller');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const getSellerId = async () => {
  try {
    // Get seller by email if provided as argument
    const email = process.argv[2];
    
    let seller;
    if (email) {
      seller = await Seller.findOne({ email: email });
      if (!seller) {
        console.log(`❌ No seller found with email: ${email}`);
        console.log('Available sellers:');
        const allSellers = await Seller.find().limit(5);
        allSellers.forEach(s => {
          console.log(`   - ${s.email} (${s.fullName})`);
        });
        process.exit(1);
      }
    } else {
      // Get the first seller from database
      seller = await Seller.findOne();
      if (!seller) {
        console.log('❌ No sellers found in database');
        console.log('Please create a seller account first by signing up as a seller');
        process.exit(1);
      }
    }

    console.log('✅ Found seller:');
    console.log(`   Name: ${seller.fullName}`);
    console.log(`   Email: ${seller.email}`);
    console.log(`   Store: ${seller.storeName || 'N/A'}`);
    console.log(`   ID: ${seller._id}`);
    console.log('');
    console.log('To seed notifications, run:');
    console.log(`   node seedNotifications.js ${seller._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error getting seller:', error);
    process.exit(1);
  }
};

getSellerId();
