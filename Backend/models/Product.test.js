const mongoose = require('mongoose');
const Product = require('./Product');

describe('Product Model', () => {
  describe('Payment Options Validation', () => {
    it('should accept valid payment options array with 1 option', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod']
      });
      
      const error = product.validateSync();
      expect(error).toBeUndefined();
    });

    it('should accept valid payment options array with 4 options', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod', 'esewa', 'khalti', 'card']
      });
      
      const error = product.validateSync();
      expect(error).toBeUndefined();
    });

    it('should reject empty payment options array', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: []
      });
      
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.paymentOptions).toBeDefined();
    });

    it('should reject more than 4 payment options', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod', 'esewa', 'khalti', 'card', 'online']
      });
      
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.paymentOptions).toBeDefined();
    });

    it('should reject invalid payment option', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['invalid_option']
      });
      
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['paymentOptions.0']).toBeDefined();
    });
  });

  describe('Discount Validation', () => {
    it('should accept valid discount configuration', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod'],
        discount: {
          percentage: 20,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          active: true
        }
      });
      
      const error = product.validateSync();
      expect(error).toBeUndefined();
    });

    it('should reject discount percentage below 0', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod'],
        discount: {
          percentage: -10,
          active: true
        }
      });
      
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['discount.percentage']).toBeDefined();
    });

    it('should reject discount percentage above 100', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod'],
        discount: {
          percentage: 150,
          active: true
        }
      });
      
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['discount.percentage']).toBeDefined();
    });

    it('should reject discount with start date after end date', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod'],
        discount: {
          percentage: 20,
          startDate: new Date('2024-12-31'),
          endDate: new Date('2024-01-01'),
          active: true
        }
      });
      
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['discount.startDate']).toBeDefined();
    });
  });

  describe('Status and Approval Fields', () => {
    it('should default status to Pending', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod']
      });
      
      expect(product.status).toBe('Pending');
    });

    it('should accept approval fields', () => {
      const adminId = new mongoose.Types.ObjectId();
      const approvalDate = new Date();
      
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod'],
        status: 'Approved',
        approvedBy: adminId,
        approvedAt: approvalDate,
        adminNotes: 'Looks good'
      });
      
      const error = product.validateSync();
      expect(error).toBeUndefined();
      expect(product.approvedBy).toEqual(adminId);
      expect(product.approvedAt).toEqual(approvalDate);
      expect(product.adminNotes).toBe('Looks good');
    });

    it('should accept rejection fields', () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'Men',
        condition: 'New',
        size: 'M',
        stock: 5,
        images: ['test.jpg'],
        seller: new mongoose.Types.ObjectId(),
        sellerName: 'Test Seller',
        storeName: 'Test Store',
        paymentOptions: ['cod'],
        status: 'Rejected',
        rejectionReason: 'Images do not match description'
      });
      
      const error = product.validateSync();
      expect(error).toBeUndefined();
      expect(product.rejectionReason).toBe('Images do not match description');
    });
  });
});
