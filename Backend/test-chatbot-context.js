const mongoose = require('mongoose');
require('dotenv').config();

const { getEnhancedContext, forceRefreshCache } = require('./utils/chatbotContext');

async function testContext() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Force refresh cache
    console.log('🔄 Forcing cache refresh...');
    await forceRefreshCache();
    
    // Get context for guest
    console.log('\n📋 Getting context for Guest:');
    const guestContext = await getEnhancedContext('Guest', 'guest');
    console.log(guestContext);
    
    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testContext();
