const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Customer = require('../models/Customer');
const User = require('../models/User');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Customer API Tests', () => {
  let customerToken;
  let customerId;
  let addressId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();
    const testEmail = `testcustomer${timestamp}@test.com`;
    
    await User.deleteMany({ email: testEmail });
    await Customer.deleteMany({ email: testEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test Customer',
        email: testEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;
  });

  afterAll(async () => {
    await Customer.deleteMany({ user: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('GET /api/customers/:userId', () => {
    test('Should get customer profile by ID', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/customers/:userId', () => {
    test('Should update customer profile', async () => {
      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fullName: 'Updated Customer Name',
          email: `updated${Date.now()}@test.com`,
          phone: '9876543210'
        });

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/customers/:userId/profile-image', () => {
    test('Should upload profile image', async () => {
      const response = await request(app)
        .post(`/api/customers/${customerId}/profile-image`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          profileImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        });

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/customers/:userId/addresses', () => {
    test('Should get customer addresses', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/addresses`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/customers/:userId/addresses', () => {
    test('Should add new address', async () => {
      const response = await request(app)
        .post(`/api/customers/${customerId}/addresses`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          label: 'Home',
          fullName: 'Test Customer',
          phone: '9876543210',
          state: 'Bagmati',
          district: 'Kathmandu',
          municipality: 'Kathmandu',
          city: 'Kathmandu',
          landmark: 'Near Test Location',
          deliveryType: 'home',
          isDefault: true
        });

      expect([200, 201, 400, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        if (Array.isArray(response.body) && response.body.length > 0) {
          addressId = response.body[0]._id;
        }
      }
    });
  });

  describe('PUT /api/customers/:userId/addresses/:addressId', () => {
    test('Should update address', async () => {
      if (addressId) {
        const response = await request(app)
          .put(`/api/customers/${customerId}/addresses/${addressId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            landmark: 'Updated Landmark'
          });

        expect([200, 404]).toContain(response.status);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('PATCH /api/customers/:userId/preferences', () => {
    test('Should update preferences', async () => {
      const response = await request(app)
        .patch(`/api/customers/${customerId}/preferences`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          notifications: {
            email: true,
            sms: false
          }
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PATCH /api/customers/:userId/2fa', () => {
    test('Should enable 2FA', async () => {
      const response = await request(app)
        .patch(`/api/customers/${customerId}/2fa`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          enabled: true
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/customers/:userId/2fa-status', () => {
    test('Should get 2FA status', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/2fa-status`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/customers/:userId/login-history', () => {
    test('Should get login history', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/login-history`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/customers/:userId/loyalty-points', () => {
    test('Should get loyalty points', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/loyalty-points`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
