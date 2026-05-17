const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');
const { sendEmail } = require('../utils/emailService');
const { logAudit } = require('../utils/auditLogger');
const passport = require('../config/passport');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Create Admin Account (One-time setup)
router.post('/create-admin', async (req, res) => {
  try {
    const { fullName, email, password, adminSecret } = req.body;

    // Validate admin secret key (set this in your .env file)
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'rebuy-admin-secret-2026';
    
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin secret key'
      });
    }

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered as admin'
      });
    }

    // Create admin user
    const admin = await Admin.create({
      fullName,
      email,
      password,
      isActive: true
    });

    console.log('✅ Admin account created:', email);

    // Generate token
    const token = generateToken(admin._id);

    // Log audit
    await logAudit({
      action: 'Admin Account Created',
      actionType: 'auth',
      performedBy: admin._id,
      targetId: admin._id,
      targetModel: 'Admin',
      description: 'New admin account created via API',
      ipAddress: req.ip
    }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        _id: admin._id,
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        userType: 'admin'
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, userType, phone, storeName, storeDescription, address, city } = req.body;

    console.log('Signup attempt:', { fullName, email, userType, storeName });

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 8) {
      console.log('Password too short');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }

    // Handle Seller Registration
    if (userType === 'seller') {
      console.log('Processing seller registration...');
      
      // Validate seller-specific fields
      if (!storeName || !phone || !address || !city) {
        console.log('Missing seller information:', { storeName, phone, address, city });
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all seller information (store name, phone, address, city)' 
        });
      }

      // Check if seller email already exists
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        console.log('Email already registered as seller');
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered as seller' 
        });
      }

      // Create new seller
      console.log('Creating new seller...');
      const seller = await Seller.create({
        fullName,
        email,
        password,
        phone,
        storeName,
        storeDescription: storeDescription || '',
        address,
        city
      });

      console.log('Seller created successfully:', seller._id);

      // Send welcome email
      try {
        await sendEmail(seller.email, 'welcomeSeller', seller.fullName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      // Generate token
      const token = generateToken(seller._id);

      // Log audit
      await logAudit({
        action: 'Seller Registered',
        actionType: 'auth',
        performedBy: seller._id,
        targetId: seller._id,
        targetModel: 'Seller',
        description: 'New seller account registered',
        ipAddress: req.ip
      }).catch(console.error);

      return res.status(201).json({
        success: true,
        message: 'Seller account created successfully',
        token,
        user: {
          _id: seller._id,
          id: seller._id,
          fullName: seller.fullName,
          email: seller.email,
          userType: 'seller',
          phone: seller.phone,
          storeName: seller.storeName,
          storeDescription: seller.storeDescription,
          address: seller.address,
          city: seller.city,
          status: seller.status
        }
      });
    }

    // Handle Customer Registration
    console.log('Processing customer registration...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already registered');
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new user
    const userData = {
      fullName,
      email,
      password,
      userType: 'customer',
      phone: phone || '',
      address: address || '',
      city: city || ''
    };

    const user = await User.create(userData);
    console.log('User created successfully:', user._id);

    // Create Customer profile for the user
    const Customer = require('../models/Addresses');
    const customer = await Customer.create({
      user: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      addresses: [],
      preferences: {
        newsletter: true,
        orderUpdates: true,
        promotions: false
      }
    });
    console.log('Customer profile created:', customer._id);

    // Send welcome email
    try {
      await sendEmail(user.email, 'welcome', user.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    // Log audit
    await logAudit({
      action: 'User Registered',
      actionType: 'auth',
      performedBy: user._id,
      targetId: user._id,
      targetModel: 'User',
      description: 'New user account registered',
      ipAddress: req.ip
    }).catch(console.error);

    const userResponse = {
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      phone: user.phone,
      address: user.address,
      city: user.city
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    console.log('Login attempt:', { email, userType, passwordLength: password?.length });

    // Validation
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // If userType is seller, check Seller collection
    if (userType === 'seller') {
      const seller = await Seller.findOne({ email });
      if (!seller) {
        console.log('Seller not found:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Check password
      const isPasswordValid = await seller.comparePassword(password);
      console.log('Seller password valid:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Generate token
      const token = generateToken(seller._id);

      // Log audit
      await logAudit({
        action: 'Seller Login',
        actionType: 'auth',
        performedBy: seller._id,
        targetId: seller._id,
        targetModel: 'Seller',
        description: 'Seller logged in successfully',
        ipAddress: req.ip
      }).catch(console.error);

      console.log('Seller login successful:', email);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: seller._id,
          id: seller._id,
          fullName: seller.fullName,
          email: seller.email,
          userType: 'seller',
          phone: seller.phone,
          storeName: seller.storeName,
          storeDescription: seller.storeDescription,
          address: seller.address,
          city: seller.city,
          status: seller.status
        }
      });
    }

    // Otherwise, check User collection for customers and admins
    // If userType is admin, check Admin collection
    if (userType === 'admin') {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        console.log('Admin not found:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Check password
      const isPasswordValid = await admin.comparePassword(password);
      console.log('Admin password valid:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate token
      const token = generateToken(admin._id);

      // Log audit
      await logAudit({
        action: 'Admin Login',
        actionType: 'auth',
        performedBy: admin._id,
        targetId: admin._id,
        targetModel: 'Admin',
        description: 'Admin logged in successfully',
        ipAddress: req.ip
      }).catch(console.error);

      console.log('Admin login successful:', email);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: admin._id,
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          userType: 'admin',
          phone: admin.phone,
          profileImage: admin.profileImage
        }
      });
    }

    // Check User collection for customers
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('User password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Record login history
    try {
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
      
      // Add login history entry
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({
        timestamp: new Date(),
        ipAddress,
        userAgent,
        location: 'Nepal' // You can integrate IP geolocation service for accurate location
      });
      
      // Keep only last 10 login entries
      if (user.loginHistory.length > 10) {
        user.loginHistory = user.loginHistory.slice(-10);
      }
      
      await user.save();
    } catch (historyError) {
      console.error('Error saving login history:', historyError);
      // Don't fail login if history save fails
    }

    // Log audit
    await logAudit({
      action: 'User Login',
      actionType: 'auth',
      performedBy: user._id,
      targetId: user._id,
      targetModel: 'User',
      description: 'Customer logged in successfully',
      ipAddress: req.ip
    }).catch(console.error);

    console.log('Customer login successful:', email);

    const userResponse = {
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      userType: 'customer',
      phone: user.phone,
      address: user.address,
      city: user.city,
      profileImage: user.profileImage || ''
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

// Forgot Password Route - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check in User model
    let user = await User.findOne({ email });
    let Model = User;

    // If not found in User, check in Seller model
    if (!user) {
      user = await Seller.findOne({ email });
      Model = Seller;
    }

    // If not found in Seller, check in Admin model
    if (!user) {
      user = await Admin.findOne({ email });
      Model = Admin;
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive an OTP to reset your password.' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save OTP to database
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    try {
      await sendEmail(user.email, 'passwordResetOTP', { userName: user.fullName, otp });
      console.log(`Password reset OTP sent to: ${email}`);
      console.log(`OTP (for development): ${otp}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.json({ 
      success: true,
      message: 'OTP has been sent to your email. Please check your inbox.',
      email: email // Send email back so frontend can use it
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('=== OTP Verification Debug ===');
    console.log('Email:', email);
    console.log('OTP received:', otp);
    console.log('OTP type:', typeof otp);

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }

    // Find user in User, Seller, or Admin model
    let user = await User.findOne({ email });

    if (!user) {
      user = await Seller.findOne({ email });
    }

    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('User found:', user.email);
    console.log('Stored OTP:', user.resetPasswordOTP);
    console.log('Stored OTP type:', typeof user.resetPasswordOTP);
    console.log('OTP Expiry:', user.resetPasswordOTPExpiry);
    console.log('Current time:', new Date());
    console.log('Is expired?', new Date() > user.resetPasswordOTPExpiry);

    // Check if OTP exists
    if (!user.resetPasswordOTP) {
      console.log('No OTP found in database');
      return res.status(400).json({ 
        success: false,
        message: 'No OTP found. Please request a new one.' 
      });
    }

    // Check if OTP has expired
    if (new Date() > user.resetPasswordOTPExpiry) {
      console.log('OTP has expired');
      return res.status(400).json({ 
        success: false,
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Verify OTP - compare as strings
    const storedOTP = String(user.resetPasswordOTP);
    const receivedOTP = String(otp);
    
    console.log('Comparing OTPs:');
    console.log('Stored (string):', storedOTP);
    console.log('Received (string):', receivedOTP);
    console.log('Match?', storedOTP === receivedOTP);

    if (storedOTP !== receivedOTP) {
      console.log('OTP mismatch!');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP. Please try again.' 
      });
    }

    console.log('✅ OTP verified successfully!');

    // OTP is valid
    res.json({ 
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      email: email
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
});

// Reset Password Route (after OTP verification)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Passwords do not match' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 8 characters' 
      });
    }

    // Find user in User, Seller, or Admin model
    let user = await User.findOne({ email });
    let Model = User;
    let modelName = 'User';

    if (!user) {
      user = await Seller.findOne({ email });
      Model = Seller;
      modelName = 'Seller';
    }

    if (!user) {
      user = await Admin.findOne({ email });
      Model = Admin;
      modelName = 'Admin';
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify OTP one more time
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP' 
      });
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Update password (it will be hashed by the pre-save hook in the model)
    user.password = newPassword;
    
    // Clear OTP fields
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpiry = null;
    
    await user.save();

    // Log audit
    await logAudit({
      action: 'Password Reset',
      actionType: 'auth',
      performedBy: user._id,
      targetId: user._id,
      targetModel: modelName,
      description: 'Password reset via OTP',
      ipAddress: req.ip
    }).catch(console.error);

    // Send password changed confirmation email
    try {
      await sendEmail(user.email, 'passwordChanged', user.fullName);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the password reset if email fails
    }

    res.json({ 
      success: true,
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
});

// Change Password Route (for logged-in users)
router.put('/change-password/:userId', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();
    
    // Log audit
    await logAudit({
      action: 'Password Changed',
      actionType: 'auth',
      performedBy: user._id,
      targetId: user._id,
      targetModel: 'User',
      description: 'User changed password manually',
      ipAddress: req.ip
    }).catch(console.error);

    // Send confirmation email
    try {
      await sendEmail(user.email, 'passwordChanged', user.fullName);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the password change if email fails
    }
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

module.exports = router;


// Google OAuth Routes
router.get('/google',
  (req, res, next) => {
    // Store userType in session for callback
    const userType = req.query.userType || 'customer';
    req.session = req.session || {};
    req.session.userType = userType;
    console.log('Google OAuth initiated for userType:', userType);
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      // Check if authentication failed
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
      }

      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Determine user type and model
      let userType = 'customer';
      let modelName = 'User';
      
      if (req.user.storeName !== undefined) {
        userType = 'seller';
        modelName = 'Seller';
      } else if (req.user.constructor.modelName === 'Admin') {
        userType = 'admin';
        modelName = 'Admin';
      }

      // Log audit
      logAudit({
        action: `Google OAuth Login (${userType})`,
        actionType: 'auth',
        performedBy: req.user._id,
        targetId: req.user._id,
        targetModel: modelName,
        description: `${userType.charAt(0).toUpperCase() + userType.slice(1)} logged in via Google OAuth`,
        ipAddress: req.ip
      }).catch(console.error);

      // Build user response object
      const userResponse = {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        userType: userType,
        profileImage: req.user.profileImage
      };

      // Add type-specific fields
      if (userType === 'seller') {
        userResponse.phone = req.user.phone;
        userResponse.storeName = req.user.storeName;
        userResponse.storeDescription = req.user.storeDescription;
        userResponse.address = req.user.address;
        userResponse.city = req.user.city;
        userResponse.status = req.user.status;
      } else if (userType === 'customer') {
        userResponse.phone = req.user.phone;
        userResponse.address = req.user.address;
        userResponse.city = req.user.city;
      } else if (userType === 'admin') {
        userResponse.phone = req.user.phone;
      }

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);
