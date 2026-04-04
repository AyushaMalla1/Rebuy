const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const User = require('../models/User');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const { upload, cloudinary } = require('../config/cloudinary');

// Middleware to extract user ID from token
const extractUserId = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.id;
    } else if (req.headers['x-user-id']) {
      req.userId = req.headers['x-user-id'];
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    next();
  }
};

// Upload profile image - accepts base64 or URL
router.post('/:userId/profile-image', async (req, res) => {
  try {
    console.log('Profile image upload request received for user:', req.params.userId);
    
    const { profileImage } = req.body;
    
    if (!profileImage) {
      console.error('No profileImage in request body');
      return res.status(400).json({ message: 'No image data provided' });
    }

    console.log('Image data received (first 50 chars):', profileImage.substring(0, 50));

    // Update user profile image
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      console.error('User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.email);
    
    user.profileImage = profileImage;
    await user.save();
    
    console.log('Profile image updated successfully');

    res.json({ 
      message: 'Profile image uploaded successfully', 
      profileImage: profileImage 
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete profile image
router.delete('/:userId/profile-image', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`rebuy-products/${publicId}`);
      } catch (err) {
        console.error('Error deleting image from cloudinary:', err);
      }
    }

    user.profileImage = '';
    await user.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get login history
router.get('/:userId/login-history', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('loginHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return last 10 login activities, sorted by most recent
    const loginHistory = user.loginHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    res.json({ success: true, loginHistory });
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer profile (authenticated route)you know what 
router.get('/profile', extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const customer = await Customer.findOne({ user: userId }).populate('user', 'fullName email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    res.json({ customer });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.params.userId }).populate('user', 'fullName email profileImage');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    // Add profileImage from user to customer object
    const customerData = customer.toObject();
    if (customer.user && customer.user.profileImage) {
      customerData.profileImage = customer.user.profileImage;
    }
    
    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update customer profile
router.put('/:userId', async (req, res) => {
  try {
    const { fullName, email, phone, preferences } = req.body;
    
    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }
    
    // Check if customer exists
    let customer = await Customer.findOne({ user: req.params.userId });
    
    if (customer) {
      // Update existing customer
      Customer.fullName = fullName;
      Customer.email = email;
      Customer.phone = phone || Customer.phone;
      
      if (preferences) {
        Customer.preferences = {
          ...Customer.preferences,
          ...preferences
        };
      }
      
      await Customer.save();
    } else {
      // Create new customer
      customer = new Customer({
        user: req.params.userId,
        fullName,
        email,
        phone: phone || '',
        preferences: preferences || {}
      });
      
      await Customer.save();
    }
    
    // Also update User model
    await User.findByIdAndUpdate(req.params.userId, {
      fullName,
      email,
      phone: phone || ''
    });
    
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all addresses for a customer
router.get('/:userId/addresses', async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(Customer.addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new address (authenticated route)
router.post('/addresses', extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { label, fullName, phone, state, district, municipality, landmark, isDefault } = req.body;
    
    // Validate required fields
    if (!fullName || !phone || !state || !district || !municipality || !landmark) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    
    let customer = await Customer.findOne({ user: userId });
    
    if (!customer) {
      // Create customer if doesn't exist
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      customer = new Customer({
        user: userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        addresses: []
      });
    }
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      Customer.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    // Add new address
    const newAddress = {
      label: label || 'Home',
      fullName,
      phone,
      state,
      district,
      municipality,
      city: municipality, // Use municipality as city for compatibility
      landmark,
      deliveryType: label?.toLowerCase() === 'office' ? 'office' : 'home',
      isDefault: isDefault || Customer.addresses.length === 0
    };
    
    Customer.addresses.push(newAddress);
    await Customer.save();
    
    res.status(201).json({ addresses: Customer.addresses });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new address by user ID
router.post('/:userId/addresses', async (req, res) => {
  try {
    const { label, fullName, phone, state, district, municipality, city, landmark, deliveryType, isDefault } = req.body;
    
    // Validate required fields
    if (!fullName || !phone || !state || !district || !municipality || !city || !landmark) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    
    let customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      // Create customer if doesn't exist
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      customer = new Customer({
        user: req.params.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        addresses: []
      });
    }
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      Customer.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    // Add new address
    const newAddress = {
      label: label || deliveryType,
      fullName,
      phone,
      state,
      district,
      municipality,
      city,
      landmark,
      deliveryType: deliveryType || 'home',
      isDefault: isDefault || Customer.addresses.length === 0
    };
    
    Customer.addresses.push(newAddress);
    await Customer.save();
    
    res.status(201).json(Customer.addresses);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update address
router.put('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const { label, fullName, phone, state, district, municipality, city, landmark, deliveryType, isDefault } = req.body;
    
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const address = Customer.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      Customer.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false;
        }
      });
    }
    
    // Update address fields
    Customer.label = label || Customer.label;
    Customer.fullName = fullName || Customer.fullName;
    Customer.phone = phone || Customer.phone;
    Customer.state = state || Customer.state;
    Customer.district = district || Customer.district;
    Customer.municipality = municipality || Customer.municipality;
    Customer.city = city || Customer.city;
    Customer.landmark = landmark || Customer.landmark;
    Customer.deliveryType = deliveryType || Customer.deliveryType;
    Customer.isDefault = isDefault !== undefined ? isDefault : Customer.isDefault;
    
    await Customer.save();
    
    res.json(Customer.addresses);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete address
router.delete('/:userId/addresses/:addressId', async (req, res) => {
  try {
    console.log('Delete address request - userId:', req.params.userId, 'addressId:', req.params.addressId);
    
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      console.log('Customer not found');
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const address = Customer.addresses.id(req.params.addressId);
    
    if (!address) {
      console.log('Address not found');
      return res.status(404).json({ message: 'Address not found' });
    }
    
    const wasDefault = Customer.isDefault;
    
    // Use pull instead of remove for better compatibility
    Customer.addresses.pull(req.params.addressId);
    
    // If deleted address was default, set first address as default
    if (wasDefault && Customer.addresses.length > 0) {
      Customer.addresses[0].isDefault = true;
    }
    
    await Customer.save();
    
    console.log('Address deleted successfully');
    res.json(Customer.addresses);
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set default address
router.patch('/:userId/addresses/:addressId/default', async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const address = Customer.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Unset all defaults
    Customer.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    
    // Set this address as default
    Customer.isDefault = true;
    
    await Customer.save();
    
    res.json(Customer.addresses);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update preferences
router.patch('/:userId/preferences', async (req, res) => {
  try {
    const { notifications, language, currency } = req.body;
    
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    if (notifications) {
      Customer.preferences.notifications = {
        ...Customer.preferences.notifications,
        ...notifications
      };
    }
    
    if (language) {
      Customer.preferences.language = language;
    }
    
    if (currency) {
      Customer.preferences.currency = currency;
    }
    
    await Customer.save();
    
    res.json(Customer.preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update account status
router.patch('/:userId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'deactivated', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Check if it's a customer or seller
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update User model
    await User.findByIdAndUpdate(req.params.userId, {
      isActive: status === 'active',
      deactivatedAt: status === 'deactivated' ? new Date() : null
    });
    
    // Try to update Customer if exists
    const customer = await Customer.findOne({ user: req.params.userId });
    if (customer) {
      Customer.accountStatus = status;
      await Customer.save();
    }
    
    // Try to update Seller if exists
    const Seller = require('../models/Seller');
    const seller = await Seller.findById(req.params.userId);
    if (seller) {
      seller.isActive = status === 'active';
      seller.deactivatedAt = status === 'deactivated' ? new Date() : null;
      await seller.save();
    }
    
    res.json({ message: 'Account status updated', status });
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enable/disable 2FA
// Enable/Disable 2FA
router.patch('/:userId/2fa', async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.twoFactorEnabled = enabled;
    
    // If enabling 2FA, generate a secret (in production, use speakeasy or similar)
    if (enabled) {
      user.twoFactorSecret = Math.random().toString(36).substring(2, 15);
    } else {
      user.twoFactorSecret = '';
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: enabled ? '2FA enabled successfully' : '2FA disabled successfully',
      twoFactorEnabled: user.twoFactorEnabled 
    });
  } catch (error) {
    console.error('Error updating 2FA:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get 2FA status
router.get('/:userId/2fa-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('twoFactorEnabled');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      twoFactorEnabled: user.twoFactorEnabled || false 
    });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add login history entry
router.post('/:userId/login-history', async (req, res) => {
  try {
    const { ipAddress, device, location } = req.body;
    
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    Customer.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      device,
      location
    });
    
    Customer.lastLogin = new Date();
    
    // Keep only last 10 login entries
    if (Customer.loginHistory.length > 10) {
      Customer.loginHistory = Customer.loginHistory.slice(-10);
    }
    
    await Customer.save();
    
    res.json(Customer.loginHistory);
  } catch (error) {
    console.error('Error adding login history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enable/Disable 2FA
router.patch('/:userId/2fa', async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.twoFactorEnabled = enabled;
    
    // If enabling 2FA, generate a secret (in production, use speakeasy or similar)
    if (enabled) {
      user.twoFactorSecret = Math.random().toString(36).substring(2, 15);
    } else {
      user.twoFactorSecret = '';
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: enabled ? '2FA enabled successfully' : '2FA disabled successfully',
      twoFactorEnabled: user.twoFactorEnabled 
    });
  } catch (error) {
    console.error('Error updating 2FA:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get 2FA status
router.get('/:userId/2fa-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('twoFactorEnabled');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      twoFactorEnabled: user.twoFactorEnabled || false 
    });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deactivate account
router.patch('/:userId/deactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Account deactivated successfully. You can reactivate by logging in again.' 
    });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reactivate account
router.patch('/:userId/reactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Account reactivated successfully' 
    });
  } catch (error) {
    console.error('Error reactivating account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete account (soft delete - mark for deletion)
router.delete('/:userId/account', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Mark account for deletion (30 days grace period)
    user.isActive = false;
    user.deactivatedAt = new Date();
    // In production, you'd set a deletionScheduledDate and have a cron job to actually delete
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Account scheduled for deletion. You have 30 days to cancel by logging in.' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


// Get customer loyalty points
router.get('/:userId/loyalty-points', async (req, res) => {
  try {
    let loyaltyAccount = await LoyaltyPoints.findOne({ customer: req.params.userId });
    
    if (!loyaltyAccount) {
      // Create new account with welcome bonus
      loyaltyAccount = new LoyaltyPoints({
        customer: req.params.userId,
        totalPoints: 0,
        pointsHistory: []
      });
      await loyaltyAccount.save();
    }
    
    res.json({
      totalPoints: loyaltyAccount.totalPoints,
      tier: loyaltyAccount.tier,
      pointsHistory: loyaltyAccount.pointsHistory
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ message: 'Error fetching loyalty points' });
  }
});
