const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { sendEmail } = require('../utils/emailService');

// Get seller profile
router.get('/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select('-password');
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    res.json({
      success: true,
      seller
    });
  } catch (error) {
    console.error('Get seller error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update seller profile
router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, address, city, storeName, storeDescription, profileImage } = req.body;
    
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Update fields
    if (fullName) seller.fullName = fullName;
    if (phone) seller.phone = phone;
    if (address) seller.address = address;
    if (city) seller.city = city;
    if (storeName) seller.storeName = storeName;
    if (storeDescription !== undefined) seller.storeDescription = storeDescription;
    if (profileImage) seller.profileImage = profileImage;
    
    await seller.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      seller: {
        _id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone,
        address: seller.address,
        city: seller.city,
        storeName: seller.storeName,
        storeDescription: seller.storeDescription,
        profileImage: seller.profileImage,
        status: seller.status,
        rating: seller.rating,
        totalSales: seller.totalSales,
        totalProducts: seller.totalProducts
      }
    });
  } catch (error) {
    console.error('Update seller error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get seller's products
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get seller statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    const products = await Product.find({ seller: req.params.id });
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.sold), 0);
    const totalSold = products.reduce((sum, p) => sum + p.sold, 0);
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        totalStock,
        totalRevenue,
        totalSold,
        rating: seller.rating,
        status: seller.status
      }
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all sellers (admin only)
router.get('/', async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      sellers
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update seller status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Seller status updated',
      seller
    });
  } catch (error) {
    console.error('Update seller status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get login history
router.get('/:id/login-history', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select('loginHistory');
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Return last 10 login records
    const recentLogins = seller.loginHistory.slice(-10).reverse();
    
    res.json({
      success: true,
      loginHistory: recentLogins
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Deactivate account
router.put('/:id/deactivate', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    seller.isActive = false;
    seller.deactivatedAt = new Date();
    await seller.save();
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Reactivate account
router.put('/:id/reactivate', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    seller.isActive = true;
    seller.deactivatedAt = null;
    await seller.save();
    
    res.json({
      success: true,
      message: 'Account reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete account (soft delete - mark as deleted but keep data)
router.delete('/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Soft delete - deactivate and mark status
    seller.isActive = false;
    seller.status = 'suspended';
    seller.deactivatedAt = new Date();
    await seller.save();
    
    // Also deactivate all seller's products
    await Product.updateMany(
      { seller: req.params.id },
      { $set: { isActive: false } }
    );
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Setup 2FA - Generate secret and QR code
router.post('/:id/setup-2fa', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Rebuy (${seller.email})`,
      issuer: 'Rebuy'
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    
    // Store secret temporarily (not enabled yet)
    seller.twoFactorSecret = secret.base32;
    seller.backupCodes = backupCodes;
    await seller.save();
    
    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes,
      manualEntry: secret.base32
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Verify and enable 2FA
router.post('/:id/verify-2fa', async (req, res) => {
  try {
    const { code } = req.body;
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    if (!seller.twoFactorSecret) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please setup 2FA first' 
      });
    }
    
    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: seller.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });
    
    if (verified) {
      seller.twoFactorEnabled = true;
      await seller.save();
      
      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Enable 2FA with password verification
router.put('/:id/enable-2fa', async (req, res) => {
  try {
    const { password } = req.body;
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Verify password
    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Enable 2FA
    seller.twoFactorEnabled = true;
    await seller.save();
    
    // Send confirmation email
    await sendEmail(seller.email, 'twoFactorEnabled', seller.fullName);
    
    res.json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Disable 2FA
router.put('/:id/disable-2fa', async (req, res) => {
  try {
    const { password } = req.body;
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Verify password
    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    seller.twoFactorEnabled = false;
    seller.twoFactorSecret = '';
    await seller.save();
    
    // Send notification email
    await sendEmail(seller.email, 'twoFactorDisabled', seller.fullName);
    
    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Change password
router.put('/:id/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await seller.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    seller.password = newPassword;
    await seller.save();
    
    // Send confirmation email
    await sendEmail(seller.email, 'passwordChanged', seller.fullName);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
