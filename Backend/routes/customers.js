const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const User = require('../models/User');
const { upload } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Upload profile image
router.post('/:userId/profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/profile-images/${req.file.filename}`;

    // Update customer profile image
    let customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      customer = new Customer({
        user: req.params.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        profileImage: imageUrl
      });
    } else {
      // Delete old image file if exists
      if (customer.profileImage) {
        try {
          const oldImagePath = path.join(__dirname, '..', customer.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      customer.profileImage = imageUrl;
    }

    await customer.save();

    res.json({ 
      message: 'Profile image uploaded successfully', 
      profileImage: imageUrl 
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete profile image
router.delete('/:userId/profile-image', async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.profileImage) {
      try {
        const imagePath = path.join(__dirname, '..', customer.profileImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    customer.profileImage = '';
    await customer.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.params.userId }).populate('user', 'fullName email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    res.json(customer);
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
      customer.fullName = fullName;
      customer.email = email;
      customer.phone = phone || customer.phone;
      
      if (preferences) {
        customer.preferences = {
          ...customer.preferences,
          ...preferences
        };
      }
      
      await customer.save();
    } else {
      // Create new customer
      customer = new Customer({
        user: req.params.userId,
        fullName,
        email,
        phone: phone || '',
        preferences: preferences || {}
      });
      
      await customer.save();
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
    
    res.json(customer.addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new address
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
      customer.addresses.forEach(addr => {
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
      isDefault: isDefault || customer.addresses.length === 0
    };
    
    customer.addresses.push(newAddress);
    await customer.save();
    
    res.status(201).json(customer.addresses);
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
    
    const address = customer.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      customer.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false;
        }
      });
    }
    
    // Update address fields
    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.state = state || address.state;
    address.district = district || address.district;
    address.municipality = municipality || address.municipality;
    address.city = city || address.city;
    address.landmark = landmark || address.landmark;
    address.deliveryType = deliveryType || address.deliveryType;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
    
    await customer.save();
    
    res.json(customer.addresses);
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
    
    const address = customer.addresses.id(req.params.addressId);
    
    if (!address) {
      console.log('Address not found');
      return res.status(404).json({ message: 'Address not found' });
    }
    
    const wasDefault = address.isDefault;
    
    // Use pull instead of remove for better compatibility
    customer.addresses.pull(req.params.addressId);
    
    // If deleted address was default, set first address as default
    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true;
    }
    
    await customer.save();
    
    console.log('Address deleted successfully');
    res.json(customer.addresses);
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
    
    const address = customer.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Unset all defaults
    customer.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    
    // Set this address as default
    address.isDefault = true;
    
    await customer.save();
    
    res.json(customer.addresses);
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
      customer.preferences.notifications = {
        ...customer.preferences.notifications,
        ...notifications
      };
    }
    
    if (language) {
      customer.preferences.language = language;
    }
    
    if (currency) {
      customer.preferences.currency = currency;
    }
    
    await customer.save();
    
    res.json(customer.preferences);
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
    
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customer.accountStatus = status;
    await customer.save();
    
    // Also update User model
    await User.findByIdAndUpdate(req.params.userId, {
      isActive: status === 'active',
      deactivatedAt: status === 'deactivated' ? new Date() : null
    });
    
    res.json({ message: 'Account status updated', status: customer.accountStatus });
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enable/disable 2FA
router.patch('/:userId/2fa', async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const customer = await Customer.findOne({ user: req.params.userId });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customer.twoFactorEnabled = enabled;
    if (enabled) {
      customer.twoFactorEnabledDate = new Date();
    }
    
    await customer.save();
    
    // Also update User model
    await User.findByIdAndUpdate(req.params.userId, {
      twoFactorEnabled: enabled
    });
    
    res.json({ message: '2FA updated', twoFactorEnabled: customer.twoFactorEnabled });
  } catch (error) {
    console.error('Error updating 2FA:', error);
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
    
    customer.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      device,
      location
    });
    
    customer.lastLogin = new Date();
    
    // Keep only last 10 login entries
    if (customer.loginHistory.length > 10) {
      customer.loginHistory = customer.loginHistory.slice(-10);
    }
    
    await customer.save();
    
    res.json(customer.loginHistory);
  } catch (error) {
    console.error('Error adding login history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
