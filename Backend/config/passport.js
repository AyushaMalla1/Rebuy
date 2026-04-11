const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');

// Ensure environment variables are loaded
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only configure Google OAuth if credentials are provided
console.log('🔍 Checking Google OAuth credentials...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Missing');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-here') {
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        passReqToCallback: true // Enable access to req object
      },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile:', profile);
        const email = profile.emails[0].value;
        const userType = req.query.userType || req.session?.userType || 'customer';
        
        console.log('Google OAuth - User Type:', userType);

        // SECURITY CHECK: Verify email doesn't exist in other collections
        const existingCustomer = await User.findOne({ email });
        const existingSeller = await Seller.findOne({ email });
        const existingAdmin = await Admin.findOne({ email });

        // If trying to login as customer but email exists as seller or admin
        if (userType === 'customer') {
          if (existingSeller) {
            console.log('❌ Google OAuth blocked: Email exists as seller, not customer');
            return done(new Error('Invalid credentials'), null);
          }
          if (existingAdmin) {
            console.log('❌ Google OAuth blocked: Email exists as admin, not customer');
            return done(new Error('Invalid credentials'), null);
          }
        }

        // If trying to login as seller but email exists as customer or admin
        if (userType === 'seller') {
          if (existingCustomer) {
            console.log('❌ Google OAuth blocked: Email exists as customer, not seller');
            return done(new Error('Invalid credentials'), null);
          }
          if (existingAdmin) {
            console.log('❌ Google OAuth blocked: Email exists as admin, not seller');
            return done(new Error('Invalid credentials'), null);
          }
        }

        // If trying to login as admin but email exists as customer or seller
        if (userType === 'admin') {
          if (existingCustomer) {
            console.log('❌ Google OAuth blocked: Email exists as customer, not admin');
            return done(new Error('Invalid credentials'), null);
          }
          if (existingSeller) {
            console.log('❌ Google OAuth blocked: Email exists as seller, not admin');
            return done(new Error('Invalid credentials'), null);
          }
        }

        // Handle based on userType
        if (userType === 'seller') {
          // Check if seller already exists with Google ID
          let seller = await Seller.findOne({ googleId: profile.id });

          if (seller) {
            console.log('Existing Google seller found:', seller.email);
            return done(null, seller);
          }

          // Check if seller exists with same email
          seller = existingSeller;

          if (seller) {
            // Link Google account to existing seller
            seller.googleId = profile.id;
            seller.profileImage = profile.photos[0]?.value || seller.profileImage;
            await seller.save();
            console.log('Linked Google account to existing seller:', seller.email);
            return done(null, seller);
          }

          // Create new seller - but they need additional info (storeName, phone, address, city)
          // For now, create with minimal info and mark as incomplete
          seller = await Seller.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: email,
            profileImage: profile.photos[0]?.value || '',
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
            phone: '', // Will need to be filled later
            storeName: profile.displayName + "'s Store", // Default store name
            storeDescription: '',
            address: '', // Will need to be filled later
            city: '', // Will need to be filled later
            status: 'pending'
          });

          console.log('New Google seller created:', seller.email);
          return done(null, seller);
        } 
        else if (userType === 'admin') {
          // Check if admin already exists with Google ID
          let admin = await Admin.findOne({ googleId: profile.id });

          if (admin) {
            console.log('Existing Google admin found:', admin.email);
            return done(null, admin);
          }

          // Check if admin exists with same email
          admin = existingAdmin;

          if (admin) {
            // Link Google account to existing admin
            admin.googleId = profile.id;
            admin.profileImage = profile.photos[0]?.value || admin.profileImage;
            await admin.save();
            console.log('Linked Google account to existing admin:', admin.email);
            return done(null, admin);
          }

          // Don't allow creating new admin via Google OAuth for security
          console.log('❌ Google OAuth blocked: Cannot create new admin via Google');
          return done(new Error('Invalid credentials'), null);
        }
        else {
          // Default: Customer
          // Check if user already exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('Existing Google customer found:', user.email);
            return done(null, user);
          }

          // Check if user exists with same email
          user = existingCustomer;

          if (user) {
            // Link Google account to existing customer
            user.googleId = profile.id;
            user.profileImage = profile.photos[0]?.value || user.profileImage;
            await user.save();
            console.log('Linked Google account to existing customer:', user.email);
            return done(null, user);
          }

          // Create new customer user
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: email,
            profileImage: profile.photos[0]?.value || '',
            userType: 'customer',
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
            phone: '',
            address: '',
            city: ''
          });

          console.log('New Google customer created:', user.email);
          return done(null, user);
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

  console.log('✅ Google OAuth configured successfully');
} else {
  console.log('⚠️  Google OAuth not configured - missing credentials in .env file');
  console.log('   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login');
}

module.exports = passport;
