require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

async function testOTPEmail() {
  console.log('Testing OTP email sending...');
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Host:', process.env.SMTP_HOST);
  
  const testEmail = 'ayushamalla09@gmail.com';
  const testOTP = '123456';
  const testUserName = 'Test User';
  
  try {
    const result = await sendEmail(testEmail, 'passwordResetOTP', {
      userName: testUserName,
      otp: testOTP
    });
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Check your inbox:', testEmail);
    } else {
      console.log('❌ Email failed to send');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

testOTPEmail();
