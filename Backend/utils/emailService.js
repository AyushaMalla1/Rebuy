// Email Service Configuration
// Install: npm install nodemailer

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Rebuy Thrift Shop!',
    html: `
      <h1>Welcome ${userName}!</h1>
      <p>Thank you for joining Rebuy. You've earned 500 welcome bonus points!</p>
      <p>Start shopping sustainable fashion today.</p>
    `
  }),

  orderConfirmation: (order) => ({
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Your order #${order._id} has been confirmed.</p>
      <p>Total: Rs. ${order.total.toLocaleString()}</p>
      <p>Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
      <p>Tracking Number: ${order.trackingNumber}</p>
    `
  }),

  orderShipped: (order) => ({
    subject: `Your Order Has Shipped - ${order._id}`,
    html: `
      <h1>Order Shipped!</h1>
      <p>Your order #${order._id} is on its way.</p>
      <p>Tracking Number: ${order.trackingNumber}</p>
      <p>Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
    `
  }),

  orderDelivered: (order) => ({
    subject: `Order Delivered - ${order._id}`,
    html: `
      <h1>Order Delivered!</h1>
      <p>Your order #${order._id} has been delivered.</p>
      <p>Please verify the condition to earn 50 bonus points!</p>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, data) => {
  try {
    const template = emailTemplates[templateName](data);
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@rebuy.com',
      to,
      subject: template.subject,
      html: template.html
    });

    console.log(`Email sent to ${to}: ${template.subject}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, emailTemplates };
