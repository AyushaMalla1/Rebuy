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
    subject: 'Welcome to Rebuy!',
    html: `
      <p>Dear ${userName},</p>
      <p><strong>Welcome to Rebuy!</strong></p>
      <p>Explore collections from multiple thrift stores, discover unique pieces, and start browsing today to give fashion a second life.</p>
      <p>Warmly,<br>Team Rebuy<br><em>Your Thrift Marketplace</em></p>
    `
  }),

  welcomeSeller: (userName) => ({
    subject: 'Welcome to Rebuy!',
    html: `
      <p>Dear ${userName},</p>
      <p><strong>Welcome to Rebuy!</strong></p>
      <p>You're now part of a marketplace where every item has a story and every seller shapes the journey. Showcase your unique pieces, connect with conscious shoppers, and give fashion a second life.</p>
      <p>Start listing today — let your style find its next home.</p>
      <p>With appreciation,<br>Team Rebuy<br><em>Where Style Meets Sustainability</em></p>
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
  }),

  twoFactorEnabled: (userName) => ({
    subject: 'Two-Factor Authentication Enabled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00bcd4;">Two-Factor Authentication Enabled</h2>
        <p>Dear ${userName},</p>
        <p>Two-factor authentication has been successfully enabled on your Rebuy account.</p>
        <p>Your account now has an additional layer of security. You'll need to verify your identity when logging in from new devices.</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0369a1;"><strong>Security Tip:</strong> If you didn't enable this feature, please contact our support team immediately.</p>
        </div>
        <p>Thank you for keeping your account secure!</p>
        <p>Best regards,<br>Team Rebuy<br><em>Your Thrift Marketplace</em></p>
      </div>
    `
  }),

  twoFactorDisabled: (userName) => ({
    subject: 'Two-Factor Authentication Disabled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Two-Factor Authentication Disabled</h2>
        <p>Dear ${userName},</p>
        <p>Two-factor authentication has been disabled on your Rebuy account.</p>
        <p>Your account security level has been reduced. We recommend keeping 2FA enabled for better protection.</p>
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>Security Warning:</strong> If you didn't disable this feature, please secure your account immediately and contact our support team.</p>
        </div>
        <p>You can re-enable two-factor authentication anytime from your account settings.</p>
        <p>Best regards,<br>Team Rebuy<br><em>Your Thrift Marketplace</em></p>
      </div>
    `
  }),

  passwordChanged: (userName) => ({
    subject: 'Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00bcd4;">Password Changed Successfully</h2>
        <p>Dear ${userName},</p>
        <p>Your password has been successfully changed on your Rebuy account.</p>
        <p>If you made this change, you can safely ignore this email. Your account is secure.</p>
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>Security Alert:</strong> If you did NOT make this change, please contact our support team immediately and secure your account.</p>
        </div>
        <p>For your security, we recommend:</p>
        <ul style="color: #64748b; line-height: 1.8;">
          <li>Using a strong, unique password</li>
          <li>Enabling two-factor authentication</li>
          <li>Never sharing your password with anyone</li>
        </ul>
        <p>Best regards,<br>Team Rebuy<br><em>Your Thrift Marketplace</em></p>
      </div>
    `
  }),

  passwordResetOTP: (data) => ({
    subject: 'Password Reset OTP - Rebuy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00bcd4; margin: 0;">Rebuy</h1>
          <p style="color: #64748b; margin: 5px 0;">Your Thrift Marketplace</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Password Reset Request</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 0;">Your One-Time Password</p>
        </div>

        <p style="color: #334155; font-size: 16px;">Dear ${data.userName},</p>
        <p style="color: #64748b; line-height: 1.6;">We received a request to reset your password. Use the OTP below to proceed with resetting your password:</p>
        
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
          <div style="font-size: 36px; font-weight: bold; color: #00bcd4; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${data.otp}
          </div>
          <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 13px;">This code will expire in 10 minutes</p>
        </div>

        <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 4px; margin: 25px 0;">
          <p style="margin: 0; color: #e65100; font-size: 14px;">
            <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Rebuy staff will never ask for your OTP.
          </p>
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #334155; font-weight: 600;">Didn't request this?</p>
          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged. 
            For security concerns, contact our support team immediately.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">Best regards,</p>
          <p style="color: #334155; font-weight: 600; margin: 5px 0;">Team Rebuy</p>
          <p style="color: #94a3b8; font-size: 13px; font-style: italic; margin: 0;">Where Style Meets Sustainability</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
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
