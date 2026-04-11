const Product = require('../models/Product');
const Seller = require('../models/Seller');
const { sendLowStockAlert, sendOutOfStockAlert } = require('./emailService');

// Check stock levels and send alerts to sellers
async function checkStockLevels() {
  try {
    // Check if stock alerts are disabled
    if (process.env.DISABLE_STOCK_ALERTS === 'true') {
      console.log('[Stock Alert] Stock alerts are disabled in .env');
      return;
    }

    console.log('[Stock Alert] Running daily stock check...');
    
    // Get all sellers
    const sellers = await Seller.find({ status: 'approved' }).select('_id email fullName storeName');
    
    for (const seller of sellers) {
      // Find low stock products (1-4 items left)
      const lowStockProducts = await Product.find({
        seller: seller._id,
        status: { $regex: /^approved$/i },
        stock: { $gt: 0, $lt: 5 }
      }).select('name category price stock sold');
      
      // Find out of stock products
      const outOfStockProducts = await Product.find({
        seller: seller._id,
        status: { $regex: /^approved$/i },
        stock: 0
      }).select('name category price stock sold');
      
      // Send low stock alert if any
      if (lowStockProducts.length > 0) {
        console.log(`[Stock Alert] Sending low stock alert to ${seller.email} for ${lowStockProducts.length} products`);
        try {
          await sendLowStockAlert(seller, lowStockProducts.map(p => p.toObject()));
        } catch (emailError) {
          console.error(`[Stock Alert] Failed to send email to ${seller.email}:`, emailError.message);
        }
      }
      
      // Send out of stock alert if any
      if (outOfStockProducts.length > 0) {
        console.log(`[Stock Alert] Sending out of stock alert to ${seller.email} for ${outOfStockProducts.length} products`);
        try {
          await sendOutOfStockAlert(seller, outOfStockProducts.map(p => p.toObject()));
        } catch (emailError) {
          console.error(`[Stock Alert] Failed to send email to ${seller.email}:`, emailError.message);
        }
      }
    }
    
    console.log('[Stock Alert] Daily stock check completed');
  } catch (error) {
    console.error('[Stock Alert] Error checking stock levels:', error);
  }
}

// Schedule daily stock check (runs every 24 hours at 9 AM)
function startStockAlertScheduler() {
  // Calculate time until next 9 AM
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);
  
  // If it's already past 9 AM today, schedule for tomorrow
  if (now.getHours() >= 9) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  
  const timeUntil9AM = next9AM - now;
  
  console.log(`[Stock Alert] Scheduler started - next check at ${next9AM.toLocaleString()}`);
  
  // Run at 9 AM
  setTimeout(() => {
    checkStockLevels();
    // Then run every 24 hours
    setInterval(checkStockLevels, 24 * 60 * 60 * 1000);
  }, timeUntil9AM);
}

module.exports = {
  checkStockLevels,
  startStockAlertScheduler
};
