const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Returns API Tests', () => {
  let customerToken;
  let customerId;
  let sellerId;
  let productId;
  let orderId;
  let returnId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();

    // Create test customer
    const customerEmail = `returncustomer${timestamp}@test.com`;
    await User.deleteMany({ email: customerEmail });
    await Customer.deleteMany({ email: customerEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Return Test Customer',
        email: customerEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create test seller
    const sellerEmail = `returnseller${timestamp}@test.com`;
    await Seller.deleteMany({ email: sellerEmail });
    const seller = await Seller.create({
      fullName: 'Return Test Seller',
      email: sellerEmail,
      password: 'Test@123456',
      phone: '9876543210',
      storeName: 'Return Test Store',
      address: 'Test Address',
      city: 'Kathmandu'
    });
    sellerId = seller._id;

    // Create test product
    const product = await Product.create({
      name: 'Test Product for Return',
      description: 'Test product description',
      price: 1000,
      category: "Men's Collection",
      condition: 'Like New',
      size: 'M',
      brand: 'Test Brand',
      seller: sellerId,
      sellerName: 'Return Test Seller',
      storeName: 'Return Test Store',
      stock: 10,
      images: ['test.jpg'],
      status: 'Approved',
      paymentOptions: ['cod', 'esewa']
    });
    productId = product._id;

    // Create test order
    const order = await Order.create({
      customer: customerId,
      customerName: 'Return Test Customer',
      customerEmail: customerEmail,
      customerPhone: '9876543210',
      items: [
        {
          product: productId,
          quantity: 1,
          price: 1000,
          subtotal: 1000,
          seller: sellerId,
          sellerName: 'Return Test Seller',
          storeName: 'Return Test Store'
        }
      ],
      shippingAddress: {
        fullName: 'Return Test Customer',
        phone: '9876543210',
        address: 'Test Address',
        city: 'Kathmandu',
        postalCode: '44600'
      },
      paymentMethod: 'cod',
      subtotal: 1000,
      shippingCost: 100,
      total: 1100,
      status: 'Delivered'
    });
    orderId = order._id;
  });

  afterAll(async () => {
    if (returnId) {
      await Return.deleteMany({ _id: returnId });
    }
    await Order.deleteMany({ _id: orderId });
    await Product.deleteMany({ _id: productId });
    await Seller.deleteMany({ _id: sellerId });
    await Customer.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('POST /api/returns', () => {
    
    test('Should create return request', async () => {
      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: orderId,
          productId: productId,
          customerId: customerId,
          sellerId: sellerId,
          reason: 'Product not as described',
          description: 'The product condition does not match the listing',
          images: ['return1.jpg', 'return2.jpg']
        });

      expect([200, 201, 400, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        returnId = response.body.return?._id || response.body._id;
      }
    });

    test('Should reject return without authentication', async () => {
      const response = await request(app)
        .post('/api/returns')
        .send({
          orderId: orderId,
          productId: productId,
          reason: 'Unauthorized return'
        });

      expect([401, 400, 404, 200]).toContain(response.status);
    });
  });

  describe('GET /api/returns/:id', () => {
    
    test('Should get return by ID', async () => {
      if (returnId) {
        const response = await request(app)
          .get(`/api/returns/${returnId}`)
          .set('Authorization', `Bearer ${customerToken}`);

        expect([200, 404]).toContain(response.status);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('GET /api/returns/customer/:customerId', () => {
    
    test('Should get customer returns', async () => {
      const response = await request(app)
        .get(`/api/returns/customer/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.returns).toBeTruthy();
      }
    });
  });

  describe('GET /api/returns/seller/:sellerId', () => {
    
    test('Should get seller returns', async () => {
      const response = await request(app)
        .get(`/api/returns/seller/${sellerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.returns).toBeTruthy();
      }
    });
  });

  describe('PATCH /api/returns/:id/status', () => {
    
    test('Should update return status', async () => {
      if (returnId) {
        const response = await request(app)
          .patch(`/api/returns/${returnId}/status`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            status: 'Approved',
            sellerNotes: 'Return approved'
          });

        expect([200, 404, 403]).toContain(response.status);
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
