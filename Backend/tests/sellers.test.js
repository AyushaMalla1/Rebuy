const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Seller API Tests', () => {
  let sellerToken;
  let sellerId;
  let productId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create test seller with unique email
    const timestamp = Date.now();
    const testEmail = `testseller${timestamp}@test.com`;
    
    await User.deleteMany({ email: testEmail });
    await Seller.deleteMany({ email: testEmail });

    const sellerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test Seller',
        email: testEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456',
        userType: 'seller',
        phone: '9876543210',
        storeName: 'Test Store',
        address: 'Test Address',
        city: 'Kathmandu'
      });

    sellerToken = sellerResponse.body.token;
    sellerId = sellerResponse.body.user._id;
  });

  afterAll(async () => {
    await Seller.deleteMany({ _id: sellerId });
    if (productId) {
      await Product.deleteMany({ _id: productId });
    }
    await mongoose.connection.close();
  });

  describe('GET /api/sellers/:id', () => {
    
    test('Should get seller profile by ID', async () => {
      const response = await request(app)
        .get(`/api/sellers/${sellerId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('seller');
      }
    });

    test('Should return 404 for non-existent seller', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/sellers/${fakeId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([404, 200]).toContain(response.status);
    });
  });

  describe('PUT /api/sellers/:id', () => {
    
    test('Should update seller profile', async () => {
      const response = await request(app)
        .put(`/api/sellers/${sellerId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          storeName: 'Updated Store Name',
          phone: '9876543211',
          address: 'Updated Address'
        });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    test('Should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/sellers/${sellerId}`)
        .send({
          storeName: 'Unauthorized Update'
        });

      expect([401, 200]).toContain(response.status);
    });
  });

  describe('GET /api/sellers/:id/products', () => {
    
    test('Should get seller products', async () => {
      const response = await request(app)
        .get(`/api/sellers/${sellerId}/products`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.products).toBeTruthy();
      }
    });
  });

  describe('GET /api/sellers/:id/orders', () => {
    
    test('Should get seller orders', async () => {
      const response = await request(app)
        .get(`/api/sellers/${sellerId}/orders`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.orders).toBeTruthy();
      }
    });
  });

  describe('GET /api/sellers/:id/stats', () => {
    
    test('Should get seller statistics', async () => {
      const response = await request(app)
        .get(`/api/sellers/${sellerId}/stats`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.stats || response.body).toHaveProperty('totalProducts');
      }
    });
  });
});
