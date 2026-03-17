const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const productsRouter = require('./products');

// Mock the models
jest.mock('../models/Product');
jest.mock('../models/Seller');

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

describe('Products API - Payment Options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/products - Create Product with Payment Options', () => {
    const validProductData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 1000,
      category: 'Men',
      condition: 'New',
      size: 'M',
      brand: 'TestBrand',
      stock: 10,
      images: ['image1.jpg'],
      sellerId: new mongoose.Types.ObjectId().toString(),
      story: 'Test story'
    };

    const mockSeller = {
      _id: new mongoose.Types.ObjectId(),
      fullName: 'Test Seller',
      storeName: 'Test Store',
      totalProducts: 0,
      save: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
      Seller.findById = jest.fn().mockResolvedValue(mockSeller);
    });

    test('should create product with valid single payment option', async () => {
      const mockProduct = { ...validProductData, paymentOptions: ['cod'], save: jest.fn() };
      Product.mockImplementation(() => mockProduct);

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: ['cod'] });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Product created successfully');
    });

    test('should create product with multiple valid payment options', async () => {
      const mockProduct = { ...validProductData, paymentOptions: ['cod', 'esewa', 'khalti'], save: jest.fn() };
      Product.mockImplementation(() => mockProduct);

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: ['cod', 'esewa', 'khalti'] });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Product created successfully');
    });

    test('should create product with all four payment options', async () => {
      const mockProduct = { ...validProductData, paymentOptions: ['cod', 'esewa', 'khalti', 'card'], save: jest.fn() };
      Product.mockImplementation(() => mockProduct);

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: ['cod', 'esewa', 'khalti', 'card'] });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Product created successfully');
    });

    test('should reject product with empty payment options array', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should reject product with more than 4 payment options', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: ['cod', 'online', 'esewa', 'khalti', 'card'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should reject product with invalid payment option', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: ['invalid_option'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should reject product with duplicate payment options', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: ['cod', 'cod'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should reject product without payment options', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(validProductData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should reject product with null payment options', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, paymentOptions: null });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });
  });

  describe('PUT /api/products/:id - Update Product with Payment Options', () => {
    const productId = new mongoose.Types.ObjectId().toString();
    const sellerId = new mongoose.Types.ObjectId().toString();

    const mockProduct = {
      _id: productId,
      name: 'Test Product',
      seller: sellerId,
      paymentOptions: ['cod'],
      save: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
      Product.findById = jest.fn().mockResolvedValue(mockProduct);
    });

    test('should update product with valid payment options', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, paymentOptions: ['cod', 'esewa'] });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product updated successfully');
    });

    test('should reject update with invalid payment options', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, paymentOptions: ['invalid'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should reject update with empty payment options array', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, paymentOptions: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid payment options');
    });

    test('should allow update without changing payment options', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product updated successfully');
    });
  });
});

describe('Products API - Discount Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/products - Create Product with Discount', () => {
    const validProductData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 1000,
      category: 'Men',
      condition: 'New',
      size: 'M',
      brand: 'TestBrand',
      stock: 10,
      images: ['image1.jpg'],
      sellerId: new mongoose.Types.ObjectId().toString(),
      story: 'Test story',
      paymentOptions: ['cod']
    };

    const mockSeller = {
      _id: new mongoose.Types.ObjectId(),
      fullName: 'Test Seller',
      storeName: 'Test Store',
      totalProducts: 0,
      save: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
      Seller.findById = jest.fn().mockResolvedValue(mockSeller);
    });

    test('should create product with valid discount configuration', async () => {
      const validDiscount = {
        percentage: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const mockProduct = { 
        ...validProductData, 
        discount: validDiscount,
        save: jest.fn().mockResolvedValue(true)
      };
      Product.mockImplementation(() => mockProduct);

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: validDiscount });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Product created successfully');
    });

    test('should create product without discount', async () => {
      const mockProduct = { 
        ...validProductData,
        save: jest.fn().mockResolvedValue(true)
      };
      Product.mockImplementation(() => mockProduct);

      const response = await request(app)
        .post('/api/products')
        .send(validProductData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Product created successfully');
    });

    test('should reject product with discount percentage below 0', async () => {
      const invalidDiscount = {
        percentage: -10,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
      expect(response.body.errors).toContain('Discount percentage must be between 0 and 100');
    });

    test('should reject product with discount percentage above 100', async () => {
      const invalidDiscount = {
        percentage: 150,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
      expect(response.body.errors).toContain('Discount percentage must be between 0 and 100');
    });

    test('should reject product with start date after end date', async () => {
      const invalidDiscount = {
        percentage: 20,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
        active: true
      };

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
      expect(response.body.errors).toContain('Start date must be before end date');
    });

    test('should reject product with missing discount start date', async () => {
      const invalidDiscount = {
        percentage: 20,
        endDate: new Date('2024-12-31'),
        active: true
      };

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
      expect(response.body.errors).toContain('Discount start date is required');
    });

    test('should reject product with missing discount end date', async () => {
      const invalidDiscount = {
        percentage: 20,
        startDate: new Date('2024-01-01'),
        active: true
      };

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
      expect(response.body.errors).toContain('Discount end date is required');
    });

    test('should reject product with non-boolean active flag', async () => {
      const invalidDiscount = {
        percentage: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: 'yes'
      };

      const response = await request(app)
        .post('/api/products')
        .send({ ...validProductData, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
      expect(response.body.errors).toContain('Discount active flag must be a boolean');
    });
  });

  describe('PUT /api/products/:id - Update Product with Discount', () => {
    const productId = new mongoose.Types.ObjectId().toString();
    const sellerId = new mongoose.Types.ObjectId().toString();

    const mockProduct = {
      _id: productId,
      name: 'Test Product',
      price: 1000,
      seller: sellerId,
      paymentOptions: ['cod'],
      save: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
      Product.findById = jest.fn().mockResolvedValue(mockProduct);
    });

    test('should update product with valid discount', async () => {
      const validDiscount = {
        percentage: 15,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, discount: validDiscount });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product updated successfully');
    });

    test('should reject update with invalid discount percentage', async () => {
      const invalidDiscount = {
        percentage: 200,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
    });

    test('should reject update with invalid discount dates', async () => {
      const invalidDiscount = {
        percentage: 20,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
        active: true
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, discount: invalidDiscount });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount configuration');
    });

    test('should allow update without changing discount', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ sellerId, name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product updated successfully');
    });
  });

  describe('GET /api/products/:id - Get Product with Discounted Price', () => {
    const productId = new mongoose.Types.ObjectId().toString();

    test('should return product with discounted price when discount is active', async () => {
      const mockProduct = {
        _id: productId,
        name: 'Test Product',
        price: 1000,
        discount: {
          percentage: 20,
          startDate: new Date(Date.now() - 86400000), // Yesterday
          endDate: new Date(Date.now() + 86400000), // Tomorrow
          active: true
        },
        toObject: function() { return { ...this }; },
        populate: jest.fn().mockReturnThis()
      };

      Product.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct)
      });

      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBe(800); // 1000 - 20% = 800
    });

    test('should return product with original price when discount is inactive', async () => {
      const mockProduct = {
        _id: productId,
        name: 'Test Product',
        price: 1000,
        discount: {
          percentage: 20,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          active: false
        },
        toObject: function() { return { ...this }; },
        populate: jest.fn().mockReturnThis()
      };

      Product.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct)
      });

      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBe(1000); // Original price
    });

    test('should return product without discounted price when no discount exists', async () => {
      const mockProduct = {
        _id: productId,
        name: 'Test Product',
        price: 1000,
        toObject: function() { return { ...this }; },
        populate: jest.fn().mockReturnThis()
      };

      Product.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct)
      });

      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBeUndefined();
    });
  });
});
