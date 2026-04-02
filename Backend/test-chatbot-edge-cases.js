const axios = require('axios');

async function testEdgeCases() {
  console.log('🧪 Testing Chatbot Edge Cases...\n');

  const tests = [
    { message: 'do you have shoes?', role: 'Guest', expected: 'should say not available' },
    { message: 'show me accessories', role: 'Customer', expected: 'should say not available' },
    { message: 'what categories do you have?', role: 'Guest', expected: 'should mention Women\'s Collection' },
    { message: 'how much stock of olivia blazer?', role: 'Seller', expected: 'should say 2 in stock' },
    { message: 'what is your return policy?', role: 'Guest', expected: 'should mention 7 days' },
  ];

  for (const test of tests) {
    console.log(`\n📝 Question: "${test.message}"`);
    console.log(`   Expected: ${test.expected}`);
    console.log('   ⏳ Waiting...');
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: test.message,
        role: test.role,
        user_id: 'test-user-123'
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`   ✅ Response (${duration}s): ${response.data.reply}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Edge case testing complete!');
}

testEdgeCases();
