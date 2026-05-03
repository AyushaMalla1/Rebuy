const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    default: 'Home'
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  municipality: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  landmark: {
    type: String,
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['home', 'office'],
    default: 'home'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  addresses: [addressSchema],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'NPR'
    }
  },
  accountStatus: {
    type: String,
    enum: ['active', 'deactivated', 'suspended'],
    default: 'active'
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorEnabledDate: {
    type: Date
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    device: String,
    location: String
  }],
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure only one default address
customerSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the last one as default
      this.addresses.forEach((addr, index) => {
        if (index < this.addresses.length - 1) {
          addr.isDefault = false;
        }
      });
    } else if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      // Set first address as default if none is set
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
