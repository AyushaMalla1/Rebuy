const cron = require('node-cron');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Seller = require('../models/Seller');
const { sendEmail } = require('./emailService');

/**
 * Weekly Payout Scheduler
 * Runs every Friday at 9:00 AM
 * Automatically creates payout requests for all sellers with pending earnings
 */

const MINIMUM_PAYOUT_AMOUNT = 500; // Rs. 500 minimum

async function generateWeeklyPayouts() {
  console.log('🔄 Starting weekly payout generation...');
  
  try {
    // Get all active sellers
    const sellers = await Seller.find({ 
      status: 'approved',
      isActive: true 
    });

    let totalPayoutsCreated = 0;
    let totalAmount = 0;
    const payoutSummary = [];

    for (const seller of sellers) {
      // Check if seller has payout details configured
      const hasPayoutDetails = seller.payoutDetails?.bankAccount?.accountNumber || 
                              seller.payoutDetails?.khaltiMobile || 
                              seller.payoutDetails?.esewaId;
      
      if (!hasPayoutDetails) {
        console.log(`⚠️  Skipping ${seller.fullName} - No payout details configured`);
        continue;
      }

      // Get all delivered orders for this seller that haven't been paid out
      const completedOrders = await Order.find({
        'items.seller': seller._id,
        status: 'Delivered',
        paymentStatus: 'Paid'
      });

      let sellerPendingAmount = 0;
      let sellerCommission = 0;
      const orderIds = [];

      for (const order of completedOrders) {
        // Check if this order has already been paid out
        const existingPayout = await Payout.findOne({
          orders: order._id,
          status: { $in: ['completed', 'processing', 'pending'] }
        });

        if (!existingPayout) {
          // Calculate seller's share for this order
          const sellerItems = order.items.filter(item => 
            item.seller.toString() === seller._id.toString()
          );
          
          const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
          const commission = Math.round((sellerSubtotal * (order.platformCommissionRate || 3)) / 100);
          const sellerPayout = sellerSubtotal - commission;

          sellerPendingAmount += sellerPayout;
          sellerCommission += commission;
          orderIds.push(order._id);
        }
      }

      // Only create payout if amount meets minimum threshold
      if (sellerPendingAmount >= MINIMUM_PAYOUT_AMOUNT) {
        // Create payout request
        const payout = new Payout({
          seller: seller._id,
          sellerName: seller.fullName,
          amount: sellerPendingAmount,
          platformCommission: sellerCommission,
          orders: orderIds,
          payoutMethod: seller.payoutDetails?.preferredMethod || 'bank',
          khaltiMobile: seller.payoutDetails?.khaltiMobile || '',
          bankDetails: seller.payoutDetails?.bankAccount || {},
          status: 'pending',
          adminNotes: 'Auto-generated weekly payout'
        });

        await payout.save();

        totalPayoutsCreated++;
        totalAmount += sellerPendingAmount;

        payoutSummary.push({
          seller: seller.fullName,
          storeName: seller.storeName,
          amount: sellerPendingAmount,
          orders: orderIds.length,
          method: payout.payoutMethod
        });

        // Send email notification to seller
        try {
          await sendEmail({
            to: seller.email,
            subject: 'Weekly Payout Request Generated - Rebuy',
            html: `
              <h2>Weekly Payout Request</h2>
              <p>Dear ${seller.fullName},</p>
              <p>Your weekly payout request has been automatically generated.</p>
              <p><strong>Amount:</strong> Rs. ${sellerPendingAmount.toLocaleString()}</p>
              <p><strong>Orders:</strong> ${orderIds.length}</p>
              <p><strong>Payout Method:</strong> ${payout.payoutMethod.toUpperCase()}</p>
              <p>Our admin team will process this payout within 2-3 business days.</p>
              <p>Thank you for selling on Rebuy!</p>
            `
          });
        } catch (emailError) {
          console.error(`Failed to send payout email to ${seller.email}:`, emailError);
        }

        console.log(`✅ Created payout for ${seller.fullName}: Rs. ${sellerPendingAmount}`);
      } else if (sellerPendingAmount > 0) {
        console.log(`⏳ ${seller.fullName} has Rs. ${sellerPendingAmount} (below minimum Rs. ${MINIMUM_PAYOUT_AMOUNT})`);
      }
    }

    // Send summary email to admin
    if (totalPayoutsCreated > 0) {
      try {
        const summaryHtml = `
          <h2>Weekly Payout Summary - ${new Date().toLocaleDateString()}</h2>
          <p><strong>Total Payouts Created:</strong> ${totalPayoutsCreated}</p>
          <p><strong>Total Amount:</strong> Rs. ${totalAmount.toLocaleString()}</p>
          <h3>Payout Details:</h3>
          <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th>Seller</th>
                <th>Store</th>
                <th>Amount</th>
                <th>Orders</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              ${payoutSummary.map(p => `
                <tr>
                  <td>${p.seller}</td>
                  <td>${p.storeName}</td>
                  <td>Rs. ${p.amount.toLocaleString()}</td>
                  <td>${p.orders}</td>
                  <td>${p.method.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p>Please process these payouts in the admin dashboard.</p>
        `;

        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@rebuy.com',
          subject: `Weekly Payout Report - ${totalPayoutsCreated} Payouts (Rs. ${totalAmount.toLocaleString()})`,
          html: summaryHtml
        });
      } catch (emailError) {
        console.error('Failed to send admin summary email:', emailError);
      }
    }

    console.log(`✅ Weekly payout generation complete: ${totalPayoutsCreated} payouts created, Total: Rs. ${totalAmount}`);
    
    return {
      success: true,
      payoutsCreated: totalPayoutsCreated,
      totalAmount,
      summary: payoutSummary
    };

  } catch (error) {
    console.error('❌ Error generating weekly payouts:', error);
    
    // Send error notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@rebuy.com',
        subject: 'Weekly Payout Generation Failed',
        html: `
          <h2>Weekly Payout Generation Error</h2>
          <p>The automatic weekly payout generation failed.</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Please check the system logs and process payouts manually.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send error notification:', emailError);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Initialize weekly payout scheduler
 * Runs every Friday at 9:00 AM Nepal Time
 */
function initializeWeeklyPayoutScheduler() {
  // Cron format: minute hour day-of-month month day-of-week
  // '0 9 * * 5' = Every Friday at 9:00 AM
  const schedule = '0 9 * * 5';
  
  cron.schedule(schedule, async () => {
    console.log('⏰ Weekly payout scheduler triggered');
    await generateWeeklyPayouts();
  }, {
    timezone: 'Asia/Kathmandu'
  });

  console.log('✅ Weekly payout scheduler initialized (Every Friday at 9:00 AM)');
}

// Manual trigger function for testing
async function triggerManualPayout() {
  console.log('🔧 Manual payout generation triggered');
  return await generateWeeklyPayouts();
}

module.exports = {
  initializeWeeklyPayoutScheduler,
  generateWeeklyPayouts,
  triggerManualPayout
};
