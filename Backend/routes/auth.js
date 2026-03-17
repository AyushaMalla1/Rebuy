const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');
const { sendEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

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

    // Send welcome email
    try {
      await sendEmail(user.email, 'welcome', user.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate token
    const token = generateToken(user._id);

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

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // If userType is seller, check Seller collection
    if (userType === 'seller') {
      const seller = await Seller.findOne({ email });
      if (!seller) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Check password
      const isPasswordValid = await seller.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Generate token
      const token = generateToken(seller._id);

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

    // Otherwise, check User collection for customers
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

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

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check in User model
    let user = await User.findOne({ email });
    let userType = 'buyer';

    // If not found in User, check in Seller model
    if (!user) {
      user = await Seller.findOne({ email });
      userType = 'seller';
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    // Generate a simple reset token (in production, use crypto and store in DB with expiry)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // In a real application, you would:
    // 1. Store the reset token in the database with an expiry time
    // 2. Send an email with a link containing the token
    // 3. Create a reset password page that validates the token
    
    // For now, we'll just return a success message
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token (for development): ${resetToken}`);
    console.log(`User type: ${userType}`);

    res.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.',
      // In development, include the token (remove in production)
      devToken: resetToken,
      devEmail: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password Route (for when user clicks the email link)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Find user in User or Seller model
    let user = await User.findOne({ email });
    let Model = User;

    if (!user) {
      user = await Seller.findOne({ email });
      Model = Seller;
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (it will be hashed by the pre-save hook in the model)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
