const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Payment Settings
  esewaEnabled: {
    type: Boolean,
    default: true
  },
  khaltiEnabled: {
    type: Boolean,
    default: true
  },
  codEnabled: {
    type: Boolean,
    default: true
  },
  
  // Platform Fees
  platformFeePercentage: {
    type: Number,
    default: 3,
    min: 0,
    max: 100
  },
  
  // Email Settings
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  
  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'System is under maintenance. Please check back later.'
  },
  
  // Fraud Detection Settings
  fraudDetectionEnabled: {
    type: Boolean,
    default: true
  },
  fraudScoreThreshold: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  
  // Stock Alert Settings
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  
  // Return Policy
  returnWindowDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 30
  },
  
  // Loyalty Points
  loyaltyPointsEnabled: {
    type: Boolean,
    default: true
  },
  pointsPerRupee: {
    type: Number,
    default: 1,
    min: 0
  },
  
  // Seller Settings
  autoApproveProducts: {
    type: Boolean,
    default: false
  },
  
  // Last Updated
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
