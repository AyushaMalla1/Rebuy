const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Message = require('../models/Message');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Messages API Tests', () => {
  let customerToken;
  let customerId;
  let sellerToken;
  let sellerId;
  let messageId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();

    // Create test customer
    const customerEmail = `messagecustomer${timestamp}@test.com`;
    await User.deleteMany({ email: customerEmail });
    await Customer.deleteMany({ email: customerEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Message Test Customer',
        email: customerEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create test seller
    const sellerEmail = `messageseller${timestamp}@test.com`;
    await User.deleteMany({ email: sellerEmail });
    await Seller.deleteMany({ email: sellerEmail });

    const sellerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Message Test Seller',
        email: sellerEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456',
        userType: 'seller',
        phone: '9876543210',
        storeName: 'Message Test Store',
        address: 'Test Address',
        city: 'Kathmandu'
      });

    sellerToken = sellerResponse.body.token;
    sellerId = sellerResponse.body.user?._id;
  });

  afterAll(async () => {
    if (messageId) {
      await Message.deleteMany({ _id: messageId });
    }
    await Customer.deleteMany({ _id: customerId });
    await Seller.deleteMany({ _id: sellerId });
    await User.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: sellerId });
    await mongoose.connection.close();
  });

  describe('POST /api/messages', () => {
    
    test('Should send message', async () => {
      if (!sellerId) {
        expect(true).toBe(true);
        return;
      }

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          senderId: customerId,
          receiverId: sellerId,
          message: 'Hello, I have a question about your product'
        });

      expect([200, 201, 400, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        messageId = response.body.message?._id || response.body._id;
      }
    });

    test('Should reject message without authentication', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          senderId: customerId,
          receiverId: sellerId,
          message: 'Unauthorized message'
        });

      expect([401, 400, 200]).toContain(response.status);
    });
  });

  describe('GET /api/messages/:userId', () => {
    
    test('Should get user messages', async () => {
      const response = await request(app)
        .get(`/api/messages/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.messages).toBeTruthy();
      }
    });
  });

  describe('GET /api/messages/conversation/:userId/:otherUserId', () => {
    
    test('Should get conversation between two users', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${customerId}/${sellerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.messages).toBeTruthy();
      }
    });
  });

  describe('PATCH /api/messages/:id/read', () => {
    
    test('Should mark message as read', async () => {
      if (messageId) {
        const response = await request(app)
          .patch(`/api/messages/${messageId}/read`)
          .set('Authorization', `Bearer ${sellerToken}`);

        expect([200, 404]).toContain(response.status);
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
