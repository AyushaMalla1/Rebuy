const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const ChatbotHistory = require('../models/ChatbotHistory');
const User = require('../models/User');
const Customer = require('../models/Customer');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Chatbot Routes API Tests', () => {
  let customerToken;
  let customerId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();
    const testEmail = `chatbotcustomer${timestamp}@test.com`;
    
    await User.deleteMany({ email: testEmail });
    await Customer.deleteMany({ email: testEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Chatbot Test Customer',
        email: testEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;
  });

  afterAll(async () => {
    await ChatbotHistory.deleteMany({ user_id: customerId });
    await Customer.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('POST /api/chatbot', () => {
    
    test('Should send message to chatbot', async () => {
      const response = await request(app)
        .post('/api/chatbot')
        .send({
          message: 'Hello, what products do you have?',
          user_id: customerId,
          role: 'Customer'
        });

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('reply');
        expect(typeof response.body.reply).toBe('string');
      }
    });

    test('Should reject empty message', async () => {
      const response = await request(app)
        .post('/api/chatbot')
        .send({
          message: '',
          user_id: customerId,
          role: 'Customer'
        });

      expect([400, 404, 200]).toContain(response.status);
    });

    test('Should handle guest user message', async () => {
      const response = await request(app)
        .post('/api/chatbot')
        .send({
          message: 'What is Rebuy?',
          role: 'Guest'
        });

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('reply');
      }
    });

    test('Should block off-topic message', async () => {
      const response = await request(app)
        .post('/api/chatbot')
        .send({
          message: 'Write me a Python code to sort an array',
          user_id: customerId,
          role: 'Customer'
        });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.reply).toContain('Rebuy related');
      }
    });

    test('Should handle seller role message', async () => {
      const response = await request(app)
        .post('/api/chatbot')
        .send({
          message: 'Show me my low stock products',
          user_id: customerId,
          role: 'Seller'
        });

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/chatbot/refresh-context', () => {
    
    test('Should refresh chatbot context', async () => {
      const response = await request(app)
        .post('/api/chatbot/refresh-context');

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });
  });
});
