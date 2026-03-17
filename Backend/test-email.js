// Test Email Configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Verify connection
    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully!');

    // Send test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Rebuy <noreply@rebuy.com>',
      to: process.env.SMTP_USER,
      subject: 'Test Email from Rebuy',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Rebuy application.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox at:', process.env.SMTP_USER);
    
  } catch (error) {
    console.error('✗ Email test failed:');
    console.error('Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.command) console.error('Failed command:', error.command);
  }
  
  process.exit(0);
}

testEmail();
