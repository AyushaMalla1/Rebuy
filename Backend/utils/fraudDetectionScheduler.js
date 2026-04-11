const cron = require('node-cron');
const fraudDetection = require('./fraudDetection');

/**
 * Automated Fraud Detection Scheduler
 * Runs fraud detection scans automatically at scheduled intervals
 */

let isRunning = false;

// Run fraud detection scan
async function runScheduledScan() {
  if (isRunning) {
    console.log('⏭️ Fraud detection scan already running, skipping...');
    return;
  }

  try {
    isRunning = true;
    console.log('🔍 [AUTOMATED] Starting scheduled fraud detection scan...');
    
    const startTime = Date.now();
    const alerts = await fraudDetection.detectAllFraud();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    const stats = await fraudDetection.getFraudStats();
    
    console.log(`✅ [AUTOMATED] Fraud detection scan completed in ${duration}s`);
    console.log(`📊 Found ${alerts.length} new suspicious activities`);
    console.log(`📈 Current stats: ${stats.high} high, ${stats.medium} medium, ${stats.low} low risk alerts`);
    
    // Log high-severity alerts
    const highAlerts = alerts.filter(a => a.severity === 'high');
    if (highAlerts.length > 0) {
      console.log('⚠️ HIGH PRIORITY ALERTS:');
      highAlerts.forEach(alert => {
        console.log(`   - ${alert.title}: ${alert.description}`);
      });
      
      // Send notifications to admins for high-severity alerts
      await notifyAdminsOfHighRiskAlerts(highAlerts);
    }
    
  } catch (error) {
    console.error('❌ [AUTOMATED] Error in scheduled fraud detection:', error);
  } finally {
    isRunning = false;
  }
}

// Notify admins of high-risk fraud alerts
async function notifyAdminsOfHighRiskAlerts(alerts) {
  try {
    const Admin = require('../models/Admin');
    const Notification = require('../models/Notification');
    
    // Get all admins
    const admins = await Admin.find({ isActive: true });
    
    if (admins.length === 0) return;
    
    // Create notification for each admin
    for (const admin of admins) {
      const notification = new Notification({
        recipient: admin._id,
        recipientModel: 'Admin',
        type: 'system',
        title: `⚠️ ${alerts.length} High-Risk Fraud Alert${alerts.length > 1 ? 's' : ''} Detected`,
        message: `Automated fraud detection found ${alerts.length} high-severity suspicious activities. Please review immediately.`,
        priority: 'high',
        isRead: false
      });
      
      await notification.save();
    }
    
    console.log(`📧 Sent fraud alert notifications to ${admins.length} admin(s)`);
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
}

// Initialize fraud detection scheduler
function initFraudDetectionScheduler() {
  console.log('🛡️ Initializing Automated Fraud Detection Scheduler...');
  
  // Run every 6 hours (at 00:00, 06:00, 12:00, 18:00)
  // Cron format: minute hour day month weekday
  const schedule = '0 */6 * * *'; // Every 6 hours
  
  cron.schedule(schedule, async () => {
    await runScheduledScan();
  });
  
  console.log('✅ Fraud Detection Scheduler initialized');
  console.log('📅 Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00)');
  
  // Run initial scan after 1 minute of server start
  setTimeout(async () => {
    console.log('🔍 Running initial fraud detection scan...');
    await runScheduledScan();
  }, 60000); // 1 minute delay
}

// Manual trigger for testing
async function triggerManualScan() {
  console.log('🔍 [MANUAL] Triggering fraud detection scan...');
  await runScheduledScan();
}

module.exports = {
  initFraudDetectionScheduler,
  triggerManualScan,
  runScheduledScan
};
