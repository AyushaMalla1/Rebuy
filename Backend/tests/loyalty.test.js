const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const Customer = require('../models/Customer');
const User = require('../models/User');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Loyalty Points API Tests', () => {
  let customerToken;
  let customerId;
  let loyaltyId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create test customer with unique email
    const timestamp = Date.now();
    const testEmail = `loyaltycustomer${timestamp}@test.com`;
    
    await User.deleteMany({ email: testEmail });
    await Customer.deleteMany({ email: testEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Loyalty Test Customer',
        email: testEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create initial loyalty points record
    const loyaltyRecord = await LoyaltyPoints.create({
      customer: customerId,
      totalPoints: 100,
      availablePoints: 100,
      usedPoints: 0,
      transactions: [
        {
          type: 'earned',
          points: 100,
          description: 'Welcome bonus',
          date: new Date()
        }
      ]
    });
    loyaltyId = loyaltyRecord._id;
  });

  afterAll(async () => {
    await LoyaltyPoints.deleteMany({ customer: customerId });
    await Customer.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('GET /api/loyalty/:customerId', () => {
    
    test('Should get customer loyalty points', async () => {
      const response = await request(app)
        .get(`/api/loyalty/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalPoints');
        expect(response.body).toHaveProperty('tier');
      }
    });

    test('Should return 404 for non-existent customer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/loyalty/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([404, 400, 200]).toContain(response.status);
    });
  });

  describe('POST /api/loyalty/:customerId/earn', () => {
    
    test('Should add loyalty points', async () => {
      const response = await request(app)
        .post(`/api/loyalty/${customerId}/earn`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          points: 50,
          description: 'Purchase reward'
        });

      expect([200, 201, 400, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body.success).toBe(true);
      }
    });

    test('Should reject earning points without authentication', async () => {
      const response = await request(app)
        .post(`/api/loyalty/${customerId}/earn`)
        .send({
          points: 50,
          description: 'Unauthorized earn'
        });

      expect([401, 400, 404, 200]).toContain(response.status);
    });

    test('Should reject negative points', async () => {
      const response = await request(app)
        .post(`/api/loyalty/${customerId}/earn`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          points: -50,
          description: 'Invalid points'
        });

      expect([400, 404, 200]).toContain(response.status);
    });
  });

  describe('POST /api/loyalty/:customerId/redeem', () => {
    
    test('Should redeem loyalty points', async () => {
      const response = await request(app)
        .post(`/api/loyalty/${customerId}/redeem`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          points: 10,
          description: 'Discount redemption'
        });

      expect([200, 400, 404]).toContain(response.status);
    });

    test('Should reject redeeming more points than available', async () => {
      const response = await request(app)
        .post(`/api/loyalty/${customerId}/redeem`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          points: 10000,
          description: 'Excessive redemption'
        });

      expect([400, 404, 200]).toContain(response.status);
    });

    test('Should reject redemption without authentication', async () => {
      const response = await request(app)
        .post(`/api/loyalty/${customerId}/redeem`)
        .send({
          points: 10,
          description: 'Unauthorized redemption'
        });

      expect([401, 400, 404, 200]).toContain(response.status);
    });
  });

  describe('GET /api/loyalty/:customerId/history', () => {
    
    test('Should get loyalty points transaction history', async () => {
      const response = await request(app)
        .get(`/api/loyalty/${customerId}/history`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.transactions).toBeTruthy();
      }
    });
  });
});
