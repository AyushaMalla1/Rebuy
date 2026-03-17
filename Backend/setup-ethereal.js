// Setup Ethereal Email for testing
const nodemailer = require('nodemailer');

async function setupEthereal() {
  console.log('Creating Ethereal test account...');
  
  try {
    // Create a test account
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('\n✓ Ethereal test account created!');
    console.log('\nAdd these to your Backend/.env file:\n');
    console.log(`SMTP_HOST=${testAccount.smtp.host}`);
    console.log(`SMTP_PORT=${testAccount.smtp.port}`);
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`\nTo view emails, go to: https://ethereal.email/messages`);
    console.log(`Login with: ${testAccount.user} / ${testAccount.pass}`);
    
  } catch (error) {
    console.error('Error creating Ethereal account:', error);
  }
}

setupEthereal();
