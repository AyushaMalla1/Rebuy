const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
const { startStockAlertScheduler } = require('./utils/stockAlertScheduler');
// const { initializeWeeklyPayoutScheduler } = require('./utils/weeklyPayoutScheduler');
const { initFraudDetectionScheduler } = require('./utils/fraudDetectionScheduler');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session Configuration (for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'rebuy-session-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // limit each IP to 500 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const loyaltyRoutes = require('./routes/loyalty');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const sellerRoutes = require('./routes/sellers');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const customerRoutes = require('./routes/customers');
const chatbotRoutes = require('./routes/chatbotRoutes');
const chatbotHistoryRoutes = require('./routes/chatbotHistory');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const payoutRoutes = require('./routes/payouts');
const returnRoutes = require('./routes/returns');
const announcementRoutes = require('./routes/announcements');
const supportRoutes = require('./routes/support');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/chatbot-history', chatbotHistoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/support', supportRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Rebuy API',
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Automated sweeper for abandoned eSewa orders to free up locked stock
setInterval(async () => {
  try {
    const Order = require('./models/Order');
    const Product = require('./models/Product');
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Find unverified eSewa orders older than 30 minutes
    const abandonedOrders = await Order.find({
      paymentMethod: 'esewa',
      paymentStatus: 'Pending',
      status: 'Processing',
      orderDate: { $lt: thirtyMinsAgo }
    });
    
    for (const order of abandonedOrders) {
      order.status = 'Cancelled';
      order.paymentStatus = 'Failed';
      order.customerNotes = 'Auto-cancelled due to payment abandonment';
      await order.save();
      
      // Restore the exact stock amounts
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { 
          $inc: { stock: item.quantity, sold: -item.quantity } 
        });
      }
      console.log(`Swept and restored stock for abandoned order: ${order.orderId || order._id}`);
    }
  } catch (err) {
    console.error('Abandoned order sweeper error:', err);
  }
}, 15 * 60 * 1000); // Check every 15 minutes

// Export app for testing
module.exports = app;

const PORT = process.env.PORT || 5000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start stock alert scheduler
    startStockAlertScheduler();
    
    // Weekly payout scheduler disabled - use manual trigger in admin dashboard
    // initializeWeeklyPayoutScheduler();
    
    // Start automated fraud detection scheduler (Every 6 hours)
    initFraudDetectionScheduler();
  });
}
