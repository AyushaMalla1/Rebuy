const axios = require('axios');

async function testChatbot() {
  console.log('🤖 Testing Chatbot API...\n');

  const testQuestions = [
    { message: 'hi', role: 'Guest' },
    { message: 'what products do you have?', role: 'Guest' },
    { message: 'show me blazers', role: 'Customer' },
    { message: 'what is the price of olivia blazer?', role: 'Guest' },
  ];

  for (const test of testQuestions) {
    console.log(`\n📝 Question (${test.role}): "${test.message}"`);
    console.log('⏳ Waiting for response...');
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: test.message,
        role: test.role,
        user_id: 'test-user-123'
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Response (${duration}s): ${response.data.reply}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Test complete!');
}

testChatbot();
