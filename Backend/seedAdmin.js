const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rebuy');
    
    const adminEmail = 'admin@rebuy.com';
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      admin = new User({
        fullName: 'System Admin',
        email: adminEmail,
        password: 'adminpassword123', // Will be hashed by the User schema pre-save hook
        userType: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('✅ Created new Admin account');
    } else {
      admin.userType = 'admin';
      admin.password = 'adminpassword123';
      await admin.save();
      console.log('✅ Updated existing Admin account');
    }
    
    console.log('Admin Email: admin@rebuy.com');
    console.log('Admin Password: adminpassword123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
