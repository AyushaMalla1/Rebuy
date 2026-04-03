const Product = require('../models/Product');
const Seller = require('../models/Seller');
const { sendLowStockAlert, sendOutOfStockAlert } = require('./emailService');

// Check stock levels and send alerts to sellers
async function checkStockLevels() {
  try {
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
        await sendLowStockAlert(seller, lowStockProducts.map(p => p.toObject()));
      }
      
      // Send out of stock alert if any
      if (outOfStockProducts.length > 0) {
        console.log(`[Stock Alert] Sending out of stock alert to ${seller.email} for ${outOfStockProducts.length} products`);
        await sendOutOfStockAlert(seller, outOfStockProducts.map(p => p.toObject()));
      }
    }
    
    console.log('[Stock Alert] Daily stock check completed');
  } catch (error) {
    console.error('[Stock Alert] Error checking stock levels:', error);
  }
}

// Schedule daily stock check (runs every 24 hours at 9 AM)
function startStockAlertScheduler() {
  // Run immediately on startup
  checkStockLevels();
  
  // Then run every 24 hours
  setInterval(checkStockLevels, 24 * 60 * 60 * 1000);
  
  console.log('[Stock Alert] Scheduler started - will run daily at 9 AM');
}

module.exports = {
  checkStockLevels,
  startStockAlertScheduler
};
