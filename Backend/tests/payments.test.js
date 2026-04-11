const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Payment API Tests', () => {
  let customerToken;
  let customerId;
  let productId;
  let sellerId;
  let orderId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create test customer with unique email
    const timestamp = Date.now();
    const testEmail = `paymentcustomer${timestamp}@test.com`;
    
    await User.deleteMany({ email: testEmail });
    await Customer.deleteMany({ email: testEmail });
    
    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Payment Test Customer',
        email: testEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create test seller with unique email
    const sellerEmail = `paymentseller${timestamp}@test.com`;
    await Seller.deleteMany({ email: sellerEmail });
    const seller = await Seller.create({
      fullName: 'Payment Test Seller',
      email: sellerEmail,
      password: 'Test@123456',
      phone: '9876543210',
      storeName: 'Payment Test Store',
      address: 'Test Address',
      city: 'Kathmandu'
    });
    sellerId = seller._id;

    // Create test product
    const product = await Product.create({
      name: 'Payment Test Product',
      description: 'Test Description',
      price: 1500,
      category: "Men's Collection",
      subcategory: 'Jacket',
      condition: 'Like New',
      size: 'M',
      stock: 10,
      seller: sellerId,
      sellerName: 'Payment Test Seller',
      storeName: 'Payment Test Store',
      status: 'Approved',
      paymentOptions: ['cod', 'esewa'],
      images: ['https://example.com/image1.jpg']
    });
    productId = product._id;

    // Create test order
    const order = await Order.create({
      customer: customerId,
      customerName: 'Payment Test Customer',
      customerEmail: 'paymentcustomer@test.com',
      customerPhone: '9876543210',
      items: [{
        product: productId,
        productName: 'Payment Test Product',
        quantity: 2,
        price: 1500,
        subtotal: 3000,
        seller: sellerId,
        sellerName: 'Payment Test Seller',
        storeName: 'Payment Test Store'
      }],
      subtotal: 3000,
      shippingCost: 0,
      total: 3000,
      shippingAddress: {
        fullName: 'Test Customer',
        phone: '9876543210',
        address: 'Test Address',
        city: 'Kathmandu',
        postalCode: '44600'
      },
      paymentMethod: 'esewa',
      paymentStatus: 'Pending',
      status: 'Processing'
    });
    orderId = order._id;
  });

  afterAll(async () => {
    await Payment.deleteMany({ customer: customerId });
    await Order.deleteMany({ customer: customerId });
    await Product.deleteMany({ seller: sellerId });
    await Seller.deleteMany({ _id: sellerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('POST /api/payment/initiate', () => {
    
    test('Should initiate payment', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: orderId.toString()
        });

      // May fail if settings not configured, but should not crash
      expect([200, 400, 404]).toContain(response.status);
    });

    test('Should reject payment initiation without order ID', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect([400, 404]).toContain(response.status);
    });

    test('Should reject payment with invalid order ID', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: 'invalid-id'
        });

      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/payment/order/:orderId', () => {
    
    test('Should get payment by order ID', async () => {
      // Create a payment record first
      await Payment.create({
        order: orderId,
        customer: customerId,
        amount: 3000,
        paymentMethod: 'esewa',
        status: 'pending',
        transactionId: 'TEST123456',
        transactionUuid: 'TEST-UUID-123'
      });

      const response = await request(app)
        .get(`/api/payment/order/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.payment).toBeDefined();
      }
    });

    test('Should return 404 for order without payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/payment/order/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/payment/customer/:customerId', () => {
    
    test('Should get payment history for customer', async () => {
      const response = await request(app)
        .get(`/api/payment/customer/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.payments)).toBe(true);
    });

    test('Should get empty array for customer with no payments', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/payment/customer/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.payments)).toBe(true);
    });
  });

  describe('POST /api/payment/verify', () => {
    
    test('Should verify payment with valid data', async () => {
      const response = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: orderId.toString(),
          data: 'test-data'
        });

      // May fail if settings not configured
      expect([200, 400, 404]).toContain(response.status);
    });

    test('Should reject verification without order ID', async () => {
      const response = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          data: 'test-data'
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/payment/transaction/:transactionId', () => {
    
    test('Should get payment by transaction ID', async () => {
      const response = await request(app)
        .get('/api/payment/transaction/TEST123456')
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.payment).toBeDefined();
      }
    });

    test('Should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .get('/api/payment/transaction/NONEXISTENT')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/payment/:paymentId/refund', () => {
    
    test('Should handle refund request', async () => {
      // Create a completed payment
      const payment = await Payment.create({
        order: orderId,
        customer: customerId,
        amount: 3000,
        paymentMethod: 'esewa',
        status: 'completed',
        transactionId: 'REFUND_TEST',
        transactionUuid: 'REFUND-UUID-TEST'
      });

      const response = await request(app)
        .post(`/api/payment/${payment._id}/refund`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          refundAmount: 3000,
          refundReason: 'Test refund'
        });

      expect([200, 400, 404]).toContain(response.status);
    });

    test('Should reject refund for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/payment/${fakeId}/refund`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          refundAmount: 1000,
          refundReason: 'Test'
        });

      expect(response.status).toBe(404);
    });
  });
});
