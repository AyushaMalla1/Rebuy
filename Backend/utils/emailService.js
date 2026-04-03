const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email service ready');
  }
});

// Email templates
const emailTemplates = {
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
async function sendEmail(to, template, data) {
  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Rebuy <noreply@rebuy.com>',
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
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
  return await sendEmail(seller.email, 'lowStockAlert', { seller, products });
}

// Send out of stock alert to seller
async function sendOutOfStockAlert(seller, products) {
  if (!seller.email) {
    console.error('Seller email not found');
    return { success: false, error: 'No email address' };
  }
  return await sendEmail(seller.email, 'outOfStockAlert', { seller, products });
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
