const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Authentication API Tests', () => {
  
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.close();
  });

  describe('POST /api/auth/signup', () => {
    
    beforeEach(async () => {
      // Clean up test users before each test
      await User.deleteMany({ email: /test.*@test\.com/ });
      await Customer.deleteMany({ email: /test.*@test\.com/ });
    });

    test('Should create a new customer account', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test Customer',
          email: 'testcustomer@test.com',
          password: 'Test@123456',
          confirmPassword: 'Test@123456'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('testcustomer@test.com');
      expect(response.body.user.userType).toBe('customer');
    });

    test('Should reject signup with mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@test.com',
          password: 'Test@123456',
          confirmPassword: 'Different@123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('do not match');
    });

    test('Should reject signup with short password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@test.com',
          password: 'short',
          confirmPassword: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('8 characters');
    });

    test('Should reject duplicate email registration', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'duplicate@test.com',
          password: 'Test@123456',
          confirmPassword: 'Test@123456'
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User 2',
          email: 'duplicate@test.com',
          password: 'Test@123456',
          confirmPassword: 'Test@123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    
    beforeAll(async () => {
      // Create test user for login tests
      await User.deleteMany({ email: 'logintest@test.com' });
      await User.create({
        fullName: 'Login Test User',
        email: 'logintest@test.com',
        password: 'Test@123456',
        userType: 'customer'
      });
    });

    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'Test@123456',
          userType: 'customer'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('logintest@test.com');
    });

    test('Should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'WrongPassword123',
          userType: 'customer'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('Should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test@123456',
          userType: 'customer'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Should reject login without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Test@123456',
          userType: 'customer'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/create-admin', () => {
    
    beforeEach(async () => {
      await Admin.deleteMany({ email: /testadmin.*@test\.com/ });
    });

    test('Should create admin with valid secret', async () => {
      // Use timestamp to ensure uniqueness
      const timestamp = Date.now();
      const uniqueEmail = `testadmin${timestamp}@test.com`;
      
      const response = await request(app)
        .post('/api/auth/create-admin')
        .send({
          fullName: 'Test Admin',
          email: uniqueEmail,
          password: 'Admin@123456',
          adminSecret: 'rebuy-admin-secret-2026'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.userType).toBe('admin');
      
      // Clean up
      await Admin.deleteMany({ email: uniqueEmail });
    });

    test('Should reject admin creation with invalid secret', async () => {
      const response = await request(app)
        .post('/api/auth/create-admin')
        .send({
          fullName: 'Test Admin',
          email: 'testadmin2@test.com',
          password: 'Admin@123456',
          adminSecret: 'wrong-secret'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid admin secret');
    });
  });
});
