const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  },
  // Improve deliverability
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  // Force IPv4
  family: 4
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.error('SMTP Config:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS
    });
  } else {
    console.log('✅ Email service ready');
    console.log('SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
  }
});

// Email templates
const emailTemplates = {
  // Welcome email for new customers
  welcome: (userName) => ({
    subject: 'Welcome to Rebuy - Nepal\'s Thrift Fashion Marketplace! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #00bcd4; color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .welcome-box { background: white; padding: 25px; margin: 20px 0; border-radius: 10px; text-align: center; }
          .button { display: inline-block; padding: 15px 40px; background: #00bcd4; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .features { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
          .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Rebuy!</h1>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Hi ${userName}! 👋</h2>
              <p style="font-size: 18px; color: #666;">Thank you for joining Nepal's premier thrift fashion marketplace!</p>
              <p>We're excited to have you as part of our sustainable fashion community.</p>
            </div>
            
            <div class="features">
              <h3>What You Can Do on Rebuy:</h3>
              <div class="feature-item">
                <strong>🛍️ Shop Unique Fashion</strong><br>
                Discover pre-loved clothing at amazing prices
              </div>
              <div class="feature-item">
                <strong>💰 Earn Loyalty Points</strong><br>
                Get rewarded for every purchase and review
              </div>
              <div class="feature-item">
                <strong>🤖 AI Shopping Assistant</strong><br>
                Get personalized recommendations from our chatbot
              </div>
              <div class="feature-item">
                <strong>✅ Verified Quality</strong><br>
                All items verified for condition and authenticity
              </div>
              <div class="feature-item">
                <strong>🚚 Fast Delivery</strong><br>
                Quick shipping across Nepal
              </div>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>
            </center>
            
            <p style="margin-top: 30px; text-align: center; color: #666;">
              Need help? Our AI chatbot is available 24/7 to assist you!
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
            <p>Sustainable Fashion, Affordable Prices</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Welcome email for new sellers
  welcomeSeller: (sellerName) => ({
    subject: 'Welcome to Rebuy Seller Platform! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .welcome-box { background: white; padding: 25px; margin: 20px 0; border-radius: 10px; text-align: center; }
          .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .features { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
          .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .alert-box { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Rebuy Seller Platform!</h1>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Hi ${sellerName}! 👋</h2>
              <p style="font-size: 18px; color: #666;">Thank you for joining Rebuy as a seller!</p>
              <p>Your account is currently under review. We'll notify you once it's approved.</p>
            </div>
            
            <div class="alert-box">
              <p><strong>⏳ Account Status: Pending Approval</strong></p>
              <p>Our team will review your application within 24-48 hours. You'll receive an email once your account is approved.</p>
            </div>
            
            <div class="features">
              <h3>What You'll Get as a Rebuy Seller:</h3>
              <div class="feature-item">
                <strong>📊 Seller Dashboard</strong><br>
                Track sales, inventory, and performance metrics
              </div>
              <div class="feature-item">
                <strong>💰 Weekly Payouts</strong><br>
                Automatic payments via Khalti, eSewa, or Bank Transfer
              </div>
              <div class="feature-item">
                <strong>🤖 AI Sales Assistant</strong><br>
                Get insights on trending products and low-stock alerts
              </div>
              <div class="feature-item">
                <strong>📈 Analytics & Reports</strong><br>
                Detailed sales reports and customer insights
              </div>
              <div class="feature-item">
                <strong>⭐ Trust Score System</strong><br>
                Build reputation through verified transactions
              </div>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/seller/dashboard" class="button">Go to Dashboard</a>
            </center>
            
            <p style="margin-top: 30px; text-align: center; color: #666;">
              Questions? Contact our support team or use the AI chatbot!
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
            <p>Empowering Sellers, Delighting Customers</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password reset OTP email
  passwordResetOTP: (data) => ({
    subject: '🔐 Your Password Reset OTP - Rebuy',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .otp-container {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border: 3px solid #667eea;
            border-radius: 16px;
            padding: 40px 20px;
            margin: 30px 0;
            text-align: center;
          }
          .otp-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .otp-code { 
            font-size: 56px;
            font-weight: 800;
            color: #667eea;
            letter-spacing: 16px;
            font-family: 'Courier New', monospace;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.1);
            user-select: all;
            -webkit-user-select: all;
            -moz-user-select: all;
            -ms-user-select: all;
          }
          .otp-digits {
            display: inline-flex;
            gap: 8px;
            justify-content: center;
            margin: 20px 0;
          }
          .otp-digit {
            width: 60px;
            height: 70px;
            background: white;
            border: 2px solid #667eea;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            font-family: 'Courier New', monospace;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
          }
          .expiry-info {
            background: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .expiry-icon {
            font-size: 24px;
          }
          .expiry-text {
            flex: 1;
          }
          .expiry-text strong {
            color: #FF9800;
            font-size: 16px;
          }
          .expiry-text p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
          }
          .alert-box { 
            background: #FFEBEE;
            border-left: 4px solid #F44336;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
          }
          .alert-box strong {
            color: #F44336;
            font-size: 16px;
          }
          .alert-box p {
            margin: 8px 0 0 0;
            color: #666;
          }
          .security-tips { 
            background: #f9f9f9;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          .security-tips h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
          }
          .security-tips ul {
            margin: 0;
            padding-left: 20px;
            color: #666;
          }
          .security-tips li {
            margin: 8px 0;
          }
          .copy-instruction {
            text-align: center;
            color: #999;
            font-size: 13px;
            margin-top: 15px;
            font-style: italic;
          }
          .footer { 
            background: #f5f5f5;
            text-align: center; 
            padding: 30px 20px;
            color: #999;
            font-size: 13px;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer strong {
            color: #667eea;
          }
          @media only screen and (max-width: 600px) {
            .container {
              margin: 0;
              border-radius: 0;
            }
            .otp-code {
              font-size: 42px;
              letter-spacing: 12px;
            }
            .otp-digit {
              width: 45px;
              height: 55px;
              font-size: 28px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <div class="greeting">
              <strong>Hi ${data.userName},</strong>
            </div>
            <p>We received a request to reset your Rebuy account password. Use the One-Time Password (OTP) below to complete the password reset process:</p>
            
            <div class="otp-container">
              <div class="otp-label">Your One-Time Password</div>
              <div class="otp-digits">
                ${data.otp.split('').map(digit => `<div class="otp-digit">${digit}</div>`).join('')}
              </div>
              <div class="otp-code">${data.otp}</div>
              <div class="copy-instruction">👆 Click to select and copy</div>
            </div>
            
            <div class="expiry-info">
              <div class="expiry-icon">⏰</div>
              <div class="expiry-text">
                <strong>Valid for 10 minutes only</strong>
                <p>This OTP will expire at ${new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu' })} NPT</p>
              </div>
            </div>
            
            <div class="alert-box">
              <strong>⚠️ Security Notice</strong>
              <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged. Someone may have entered your email address by mistake.</p>
            </div>
            
            <div class="security-tips">
              <h3>🛡️ Security Tips</h3>
              <ul>
                <li><strong>Never share</strong> your OTP with anyone, including Rebuy staff</li>
                <li><strong>Don't forward</strong> this email to anyone</li>
                <li><strong>Check the URL</strong> - Make sure you're on the official Rebuy website</li>
                <li><strong>Use a strong password</strong> - Mix letters, numbers, and symbols</li>
                <li><strong>Enable 2FA</strong> when available for extra security</li>
              </ul>
            </div>
            
            <p style="text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              Need help? Contact our support team or chat with our AI assistant!
            </p>
          </div>
          <div class="footer">
            <p><strong>Rebuy</strong> - Nepal's Thrift Fashion Marketplace</p>
            <p>Sustainable Fashion, Affordable Prices</p>
            <p style="margin-top: 15px;">This is an automated security email. Please do not reply.</p>
            <p>© 2024 Rebuy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password changed confirmation email
  passwordChanged: (userName) => ({
    subject: 'Password Changed Successfully - Rebuy',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .success-box { background: white; padding: 25px; margin: 20px 0; border-radius: 10px; text-align: center; border-left: 4px solid #4CAF50; }
          .alert-box { background: #FFEBEE; border-left: 4px solid #F44336; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            
            <div class="success-box">
              <h2 style="color: #4CAF50; margin: 0;">🔐 Password Updated</h2>
              <p style="color: #666; margin: 10px 0;">Your password has been changed successfully.</p>
              <p style="color: #999; font-size: 14px;">Changed on: ${new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' })}</p>
            </div>
            
            <p>You can now login to your account using your new password.</p>
            
            <div class="alert-box">
              <p><strong>⚠️ Didn't make this change?</strong></p>
              <p>If you didn't change your password, your account may be compromised. Please contact our support team immediately!</p>
              <center>
                <a href="${process.env.FRONTEND_URL}/contact" class="button" style="background: #F44336;">Report Issue</a>
              </center>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
            </center>
            
            <p style="text-align: center; color: #666; margin-top: 30px;">
              For security reasons, we recommend:
            </p>
            <ul style="color: #666;">
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Enable two-factor authentication (coming soon)</li>
              <li>Change your password regularly</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
            <p>This is an automated security email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderPlaced: (order) => ({
    subject: `Order Confirmation - ${order.trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 18px; font-weight: bold; color: #4CAF50; margin-top: 15px; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${order.customerName},</p>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-NP')}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
              
              <h4>Items:</h4>
              ${order.items.map(item => `
                <div class="item">
                  <p><strong>${item.productName}</strong></p>
                  <p>Quantity: ${item.quantity} × NPR ${item.price.toLocaleString()}</p>
                  <p>Subtotal: NPR ${(item.quantity * item.price).toLocaleString()}</p>
                </div>
              `).join('')}
              
              <div class="total">
                <p>Subtotal: NPR ${order.subtotal.toLocaleString()}</p>
                <p>Shipping: NPR ${order.shippingCost.toLocaleString()}</p>
                ${order.pointsDiscount > 0 ? `<p>Points Discount: -NPR ${order.pointsDiscount.toLocaleString()}</p>` : ''}
                <p>Total: NPR ${order.total.toLocaleString()}</p>
              </div>
              
              <h4>Shipping Address:</h4>
              <p>
                ${order.shippingAddress.landmark || order.shippingAddress.address}<br>
                ${order.shippingAddress.municipality || order.shippingAddress.city}, ${order.shippingAddress.district || ''}<br>
                ${order.shippingAddress.state || ''}<br>
                Phone: ${order.customerPhone}
              </p>
              
              <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-NP')}</p>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">Track Your Order</a>
            </center>
            
            <p>You can track your order status anytime from your account dashboard.</p>
            <p>If you have any questions, feel free to contact us!</p>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderStatusUpdate: (order, newStatus) => ({
    subject: `Order ${newStatus} - ${order.trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .status-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .status { font-size: 24px; font-weight: bold; color: #2196F3; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Update</h1>
          </div>
          <div class="content">
            <p>Hi ${order.customerName},</p>
            <p>Your order status has been updated!</p>
            
            <div class="status-box">
              <p>Order Number: <strong>${order.trackingNumber}</strong></p>
              <div class="status">${newStatus}</div>
              ${newStatus === 'Shipped' ? `<p>Your order is on its way! Expected delivery: ${new Date(order.estimatedDelivery).toLocaleDateString('en-NP')}</p>` : ''}
              ${newStatus === 'Delivered' ? `<p>Your order has been delivered! We hope you love your items! 🎉</p>` : ''}
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">View Order Details</a>
            </center>
            
            ${newStatus === 'Delivered' ? `
              <p style="margin-top: 20px;">Please verify the condition of your items and let us know if everything matches the description. You'll earn bonus loyalty points for your feedback!</p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentConfirmed: (order) => ({
    subject: `Payment Confirmed - ${order.trackingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .payment-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
          .amount { font-size: 28px; font-weight: bold; color: #4CAF50; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful!</h1>
          </div>
          <div class="content">
            <p>Hi ${order.customerName},</p>
            <p>We've received your payment! Your order is now being processed.</p>
            
            <div class="payment-box">
              <p><strong>Order Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <div class="amount">NPR ${order.total.toLocaleString()}</div>
              <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString('en-NP')}</p>
              <p><strong>Status:</strong> <span style="color: #4CAF50;">Paid</span></p>
            </div>
            
            <p>Your order will be shipped soon. We'll send you another email with tracking details once it's on the way!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">View Order</a>
            </center>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  bundleDealAlert: (product, customers) => ({
    subject: `🎁 New Bundle Deal Alert - Save ${product.bundleDiscount}%!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .product-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; }
          .product-image { width: 100%; max-width: 400px; border-radius: 5px; }
          .discount-badge { background: #FF5722; color: white; padding: 10px 20px; border-radius: 25px; font-size: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
          .price { font-size: 24px; color: #4CAF50; font-weight: bold; }
          .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
          .button { display: inline-block; padding: 12px 30px; background: #FF5722; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Exclusive Bundle Deal!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>Great news! A new bundle deal is now available with amazing savings!</p>
            
            <div class="product-box">
              ${product.images && product.images[0] ? `<center><img src="${product.images[0]}" alt="${product.name}" class="product-image"></center>` : ''}
              <h2>${product.name}</h2>
              <p>${product.description}</p>
              
              <div class="discount-badge">Save ${product.bundleDiscount}%!</div>
              
              <p>
                <span class="old-price">NPR ${product.price.toLocaleString()}</span><br>
                <span class="price">NPR ${(product.price * (1 - product.bundleDiscount / 100)).toLocaleString()}</span>
              </p>
              
              <p><strong>Bundle Includes:</strong></p>
              <ul>
                ${product.bundleItems ? product.bundleItems.map(item => `<li>${item}</li>`).join('') : '<li>Multiple items</li>'}
              </ul>
              
              <p><strong>Store:</strong> ${product.storeName || 'Rebuy'}</p>
              <p><strong>Stock:</strong> ${product.stock} available</p>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/products/${product._id}" class="button">Shop Now</a>
            </center>
            
            <p>Hurry! Limited stock available. Don't miss out on this amazing deal!</p>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
            <p><a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe from promotional emails</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  lowStockAlert: (seller, products) => ({
    subject: `⚠️ Low Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''} Need Restocking`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .alert-box { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 15px 0; }
          .product-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #FF9800; }
          .stock-badge { background: #FF9800; color: white; padding: 5px 15px; border-radius: 15px; font-weight: bold; display: inline-block; }
          .button { display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${seller.fullName || seller.storeName},</p>
            
            <div class="alert-box">
              <p><strong>⚠️ Action Required:</strong> ${products.length} of your products are running low on stock and need restocking soon!</p>
            </div>
            
            <h3>Products Need Restocking:</h3>
            ${products.map(product => `
              <div class="product-item">
                <p><strong>${product.name}</strong></p>
                <p>Category: ${product.category}</p>
                <p>Price: NPR ${product.price.toLocaleString()}</p>
                <p>Current Stock: <span class="stock-badge">${product.stock} left</span></p>
                <p>Total Sold: ${product.sold || 0} units</p>
              </div>
            `).join('')}
            
            <p><strong>💡 Tip:</strong> Restocking popular items quickly helps maintain sales momentum and customer satisfaction!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/seller/dashboard" class="button">Manage Inventory</a>
            </center>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  outOfStockAlert: (seller, products) => ({
    subject: `🚨 Out of Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''} Unavailable`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F44336; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .alert-box { background: #FFEBEE; border-left: 4px solid #F44336; padding: 15px; margin: 15px 0; }
          .product-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #F44336; }
          .stock-badge { background: #F44336; color: white; padding: 5px 15px; border-radius: 15px; font-weight: bold; display: inline-block; }
          .button { display: inline-block; padding: 12px 30px; background: #F44336; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Out of Stock Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${seller.fullName || seller.storeName},</p>
            
            <div class="alert-box">
              <p><strong>🚨 Urgent:</strong> ${products.length} of your products are now out of stock! These items are no longer visible to customers.</p>
            </div>
            
            <h3>Out of Stock Products:</h3>
            ${products.map(product => `
              <div class="product-item">
                <p><strong>${product.name}</strong></p>
                <p>Category: ${product.category}</p>
                <p>Price: NPR ${product.price.toLocaleString()}</p>
                <p>Status: <span class="stock-badge">OUT OF STOCK</span></p>
                <p>Previously Sold: ${product.sold || 0} units</p>
                ${product.sold > 0 ? `<p>⭐ This was a popular item! Restock to continue sales.</p>` : ''}
              </div>
            `).join('')}
            
            <p><strong>💡 Action Required:</strong> Restock these items to make them available for customers again. Out of stock items don't appear in search results!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/seller/dashboard" class="button">Restock Now</a>
            </center>
          </div>
          <div class="footer">
            <p>© 2024 Rebuy - Nepal's Thrift Fashion Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
async function sendEmail(to, template, ...dataArgs) {
  try {
    const emailContent = emailTemplates[template](...dataArgs);
    
    const mailOptions = {
      from: `"Rebuy Nepal" <${process.env.SMTP_USER}>`, // Use actual sender email
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      // Improve deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Rebuy Notification System'
      },
      // Add text version for better spam score
      text: emailContent.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Send order confirmation email
async function sendOrderConfirmation(order) {
  return await sendEmail(order.customerEmail, 'orderPlaced', order);
}

// Send order status update email
async function sendOrderStatusUpdate(order, newStatus) {
  return await sendEmail(order.customerEmail, 'orderStatusUpdate', order, newStatus);
}

// Send payment confirmation email
async function sendPaymentConfirmation(order) {
  return await sendEmail(order.customerEmail, 'paymentConfirmed', order);
}

// Send bundle deal alert to customers
async function sendBundleDealAlert(product, customerEmails) {
  const results = [];
  for (const email of customerEmails) {
    const result = await sendEmail(email, 'bundleDealAlert', product);
    results.push({ email, ...result });
  }
  return results;
}

// Send low stock alert to seller
async function sendLowStockAlert(seller, products) {
  if (!seller.email) {
    console.error('Seller email not found');
    return { success: false, error: 'No email address' };
  }
  return await sendEmail(seller.email, 'lowStockAlert', seller, products);
}

// Send out of stock alert to seller
async function sendOutOfStockAlert(seller, products) {
  if (!seller.email) {
    console.error('Seller email not found');
    return { success: false, error: 'No email address' };
  }
  return await sendEmail(seller.email, 'outOfStockAlert', seller, products);
}

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPaymentConfirmation,
  sendBundleDealAlert,
  sendLowStockAlert,
  sendOutOfStockAlert
};
