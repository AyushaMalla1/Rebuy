const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Cart API Tests', () => {
  let customerToken;
  let customerId;
  let productId;
  let sellerId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create test customer with unique email
    const timestamp = Date.now();
    const testEmail = `cartcustomer${timestamp}@test.com`;
    
    await User.deleteMany({ email: testEmail });
    await Customer.deleteMany({ email: testEmail });
    
    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Cart Test Customer',
        email: testEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create test seller with unique email
    const sellerEmail = `cartseller${timestamp}@test.com`;
    await Seller.deleteMany({ email: sellerEmail });
    const seller = await Seller.create({
      fullName: 'Cart Test Seller',
      email: sellerEmail,
      password: 'Test@123456',
      phone: '9876543210',
      storeName: 'Cart Test Store',
      address: 'Test Address',
      city: 'Kathmandu'
    });
    sellerId = seller._id;

    // Create test product
    const product = await Product.create({
      name: 'Cart Test Product',
      description: 'Test Description',
      price: 1500,
      category: "Men's Collection",
      subcategory: 'Jacket',
      condition: 'Like New',
      size: 'M',
      stock: 10,
      seller: sellerId,
      sellerName: 'Cart Test Seller',
      storeName: 'Cart Test Store',
      status: 'Approved',
      paymentOptions: ['cod', 'esewa'],
      images: ['https://example.com/image1.jpg']
    });
    productId = product._id;
  });

  afterAll(async () => {
    await Cart.deleteMany({ user: customerId });
    await Product.deleteMany({ seller: sellerId });
    await Seller.deleteMany({ _id: sellerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('POST /api/cart/:customerId/add', () => {
    
    test('Should add product to cart', async () => {
      const response = await request(app)
        .post(`/api/cart/${customerId}/add`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.cart).toBeDefined();
    });

    test('Should reject adding without product ID', async () => {
      const response = await request(app)
        .post(`/api/cart/${customerId}/add`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          quantity: 1
        });

      expect(response.status).toBe(400);
    });

    test('Should reject adding with invalid product ID', async () => {
      const response = await request(app)
        .post(`/api/cart/${customerId}/add`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 'invalid-id',
          quantity: 1
        });

      expect(response.status).toBe(500); // Returns 500 for invalid ObjectId
    });

    test('Should reject adding with zero quantity', async () => {
      const response = await request(app)
        .post(`/api/cart/${customerId}/add`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 0
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cart/:customerId', () => {
    
    test('Should get user cart', async () => {
      const response = await request(app)
        .get(`/api/cart/${customerId}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    test('Should get empty cart for new user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/cart/${fakeId}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
    });
  });

  describe('PATCH /api/cart/:customerId/update', () => {
    
    test('Should update cart item quantity', async () => {
      const response = await request(app)
        .patch(`/api/cart/${customerId}/update`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 3
        });

      expect(response.status).toBe(200);
    });

    test('Should reject update without product ID', async () => {
      const response = await request(app)
        .patch(`/api/cart/${customerId}/update`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          quantity: 5
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/cart/:customerId/remove/:productId', () => {
    
    test('Should remove item from cart', async () => {
      const response = await request(app)
        .delete(`/api/cart/${customerId}/remove/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
    });

    test('Should return 404 for non-existent cart', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/cart/${fakeId}/remove/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
