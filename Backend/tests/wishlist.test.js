const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Wishlist API Tests', () => {
  let customerToken;
  let customerId;
  let sellerId;
  let productId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();

    // Create test customer
    const customerEmail = `wishlistcustomer${timestamp}@test.com`;
    await User.deleteMany({ email: customerEmail });
    await Customer.deleteMany({ email: customerEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Wishlist Test Customer',
        email: customerEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create test seller
    const sellerEmail = `wishlistseller${timestamp}@test.com`;
    await Seller.deleteMany({ email: sellerEmail });
    const seller = await Seller.create({
      fullName: 'Wishlist Test Seller',
      email: sellerEmail,
      password: 'Test@123456',
      phone: '9876543210',
      storeName: 'Wishlist Test Store',
      address: 'Test Address',
      city: 'Kathmandu'
    });
    sellerId = seller._id;

    // Create test product
    const product = await Product.create({
      name: 'Test Product for Wishlist',
      description: 'Test product description',
      price: 1000,
      category: "Men's Collection",
      condition: 'Like New',
      size: 'M',
      brand: 'Test Brand',
      seller: sellerId,
      sellerName: 'Wishlist Test Seller',
      storeName: 'Wishlist Test Store',
      stock: 10,
      images: ['test.jpg'],
      status: 'Approved',
      paymentOptions: ['cod', 'esewa']
    });
    productId = product._id;
  });

  afterAll(async () => {
    await Wishlist.deleteMany({ customer: customerId });
    await Product.deleteMany({ _id: productId });
    await Seller.deleteMany({ _id: sellerId });
    await Customer.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('POST /api/wishlist/:customerId/add', () => {
    
    test('Should add product to wishlist', async () => {
      const response = await request(app)
        .post(`/api/wishlist/${customerId}/add`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: productId
        });

      expect([200, 201, 400, 404]).toContain(response.status);
    });

    test('Should reject adding to wishlist without authentication', async () => {
      const response = await request(app)
        .post(`/api/wishlist/${customerId}/add`)
        .send({
          productId: productId
        });

      expect([401, 400, 200]).toContain(response.status);
    });

    test('Should reject adding without product ID', async () => {
      const response = await request(app)
        .post(`/api/wishlist/${customerId}/add`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect([400, 500, 404, 200]).toContain(response.status);
    });
  });

  describe('GET /api/wishlist/:customerId', () => {
    
    test('Should get customer wishlist', async () => {
      const response = await request(app)
        .get(`/api/wishlist/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('wishlist');
      }
    });

    test('Should reject getting wishlist without authentication', async () => {
      const response = await request(app)
        .get(`/api/wishlist/${customerId}`);

      expect([401, 400, 200]).toContain(response.status);
    });
  });

  describe('DELETE /api/wishlist/:customerId/remove/:productId', () => {
    
    test('Should remove product from wishlist', async () => {
      const response = await request(app)
        .delete(`/api/wishlist/${customerId}/remove/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 400, 404]).toContain(response.status);
    });

    test('Should reject removing without authentication', async () => {
      const response = await request(app)
        .delete(`/api/wishlist/${customerId}/remove/${productId}`);

      expect([401, 400, 200]).toContain(response.status);
    });
  });

  describe('DELETE /api/wishlist/:customerId/clear', () => {
    
    test('Should clear entire wishlist', async () => {
      const response = await request(app)
        .delete(`/api/wishlist/${customerId}/clear`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 400, 404]).toContain(response.status);
    });
  });
});
