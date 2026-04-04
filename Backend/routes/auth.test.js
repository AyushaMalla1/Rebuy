const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the User model
jest.mock('../models/User');
const User = require('../models/User');

const app = express();
app.use(express.json());

// Simple auth routes for testing
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'customer'
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

describe('Authentication API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.userId).toBe('user123');
    });

    it('should reject registration with existing email', async () => {
      User.findOne.mockResolvedValue({
        _id: 'existing123',
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should default role to customer if not provided', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'customer' })
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      User.findOne.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'customer'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject login with non-existent email', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      
      User.findOne.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'customer'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
