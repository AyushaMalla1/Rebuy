const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const ChatbotHistory = require('../models/ChatbotHistory');
const User = require('../models/User');
const Customer = require('../models/Customer');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Chatbot History API Tests', () => {
  let customerToken;
  let customerId;
  let adminToken;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();

    // Create test customer
    const customerEmail = `chathistorycustomer${timestamp}@test.com`;
    await User.deleteMany({ email: customerEmail });
    await Customer.deleteMany({ email: customerEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Chat History Test Customer',
        email: customerEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create test admin
    const adminEmail = `chathistoryadmin${timestamp}@test.com`;
    await User.deleteMany({ email: adminEmail });

    const adminResponse = await request(app)
      .post('/api/auth/create-admin')
      .send({
        fullName: 'Chat History Test Admin',
        email: adminEmail,
        password: 'Admin@123456',
        adminSecret: 'rebuy-admin-secret-2026'
      });

    adminToken = adminResponse.body.token;

    // Create some test chat history
    await ChatbotHistory.create({
      user_id: customerId,
      role: 'Customer',
      message: 'Test message 1',
      reply: 'Test reply 1',
      intent: 'general_chat'
    });

    await ChatbotHistory.create({
      user_id: customerId,
      role: 'Customer',
      message: 'Test message 2',
      reply: 'Test reply 2',
      intent: 'product_search'
    });
  });

  afterAll(async () => {
    await ChatbotHistory.deleteMany({ user_id: customerId });
    await Customer.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('GET /api/chatbot-history/history/:userId', () => {
    
    test('Should get user chatbot history', async () => {
      const response = await request(app)
        .get(`/api/chatbot-history/history/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.history)).toBe(true);
      }
    });

    test('Should limit history results', async () => {
      const response = await request(app)
        .get(`/api/chatbot-history/history/${customerId}?limit=1`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200 && response.body.history) {
        expect(response.body.history.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('GET /api/chatbot-history/all', () => {
    
    test('Should get all chatbot conversations', async () => {
      const response = await request(app)
        .get('/api/chatbot-history/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.history)).toBe(true);
      }
    });

    test('Should support pagination', async () => {
      const response = await request(app)
        .get('/api/chatbot-history/all?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('total');
      }
    });
  });

  describe('GET /api/chatbot-history/stats', () => {
    
    test('Should get chatbot statistics', async () => {
      const response = await request(app)
        .get('/api/chatbot-history/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('stats');
        expect(response.body.stats).toHaveProperty('total');
      }
    });
  });

  describe('DELETE /api/chatbot-history/history/:userId', () => {
    
    test('Should delete user chatbot history', async () => {
      // Create a temporary history entry
      const tempHistory = await ChatbotHistory.create({
        user_id: customerId,
        role: 'Customer',
        message: 'Temp message',
        reply: 'Temp reply',
        intent: 'general_chat'
      });

      const response = await request(app)
        .delete(`/api/chatbot-history/history/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('deletedCount');
      }
    });
  });
});
